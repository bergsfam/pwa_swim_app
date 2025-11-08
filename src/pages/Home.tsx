import { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import TimeInput from '../components/TimeInput';
import SplitEditor from '../components/SplitEditor';
import SwimmerPicker from '../components/SwimmerPicker';
import { db } from '../db/dexie';
import { useDexieLiveQuery } from '../lib/hooks';
import { almostEqual, sumSplits } from '../lib/time';
import { getPersonalBest, getSeasonBest } from '../lib/bestTimes';
import type { IndividualResult, RelayLeg, RelayResult, ResultStatus, Swimmer } from '../lib/types';
import { buildLeadOffResult, validateRelay } from '../lib/relay';

const Home = () => {
  const [entryType, setEntryType] = useState<'individual' | 'relay'>('individual');
  const [selectedMeet, setSelectedMeet] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedSwimmer, setSelectedSwimmer] = useState<string | null>(null);
  const [timeMs, setTimeMs] = useState<number | null>(null);
  const [status, setStatus] = useState<ResultStatus>('OK');
  const [notes, setNotes] = useState('');
  const [splits, setSplits] = useState<number[]>([]);
  const [relayLegs, setRelayLegs] = useState<RelayLeg[]>([
    { order: 1, swimmerId: '', splitMs: 0 },
    { order: 2, swimmerId: '', splitMs: 0 },
    { order: 3, swimmerId: '', splitMs: 0 },
    { order: 4, swimmerId: '', splitMs: 0 }
  ]);
  const [teamLabel, setTeamLabel] = useState('A');
  const [leadOff, setLeadOff] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const swimmers = useDexieLiveQuery(() => db.swimmers.toArray(), []);
  const meets = useDexieLiveQuery(() => db.meets.orderBy('date').reverse().toArray(), []);
  const events = useDexieLiveQuery(() => db.events.toArray(), []);
  const individualResults = useDexieLiveQuery(() => db.individualResults.toArray(), []);
  const settings = useDexieLiveQuery(() => db.settings.toArray(), []);

  const activeSeasonId = settings?.find((row) => row.key === 'activeSeasonId')?.value as string | undefined;

  const meetSeasonLookup = useMemo(() => {
    const map: Record<string, string> = {};
    (meets ?? []).forEach((meet) => {
      map[meet.id] = meet.seasonId;
    });
    return map;
  }, [meets]);

  const handleSaveIndividual = async () => {
    if (!selectedMeet || !selectedEvent || !selectedSwimmer || timeMs == null) {
      setMessage('Please complete meet, event, swimmer, and time.');
      return;
    }

    if (splits.length > 0 && !almostEqual(sumSplits(splits), timeMs)) {
      setMessage('Splits differ from total by more than 0.15s. Save anyway.');
    }

    const now = new Date().toISOString();
    const result: IndividualResult = {
      id: uuid(),
      swimmerId: selectedSwimmer,
      meetId: selectedMeet,
      eventDefId: selectedEvent,
      timeMs,
      splitsMs: splits.length > 0 ? splits : undefined,
      status,
      notes,
      createdAt: now,
      updatedAt: now
    };

    await db.transaction('rw', db.individualResults, db.auditLog, async () => {
      await db.individualResults.add(result);
      await db.auditLog.add({
        id: uuid(),
        entityType: 'individualResult',
        entityId: result.id,
        timestamp: now,
        action: 'create',
        payload: result
      });
    });

    const prior = (individualResults ?? []).filter(
      (item) => item.swimmerId === selectedSwimmer && item.eventDefId === selectedEvent
    );
    const pb = getPersonalBest([...prior, result], selectedEvent);
    const sb = activeSeasonId
      ? getSeasonBest([...prior, result], selectedEvent, activeSeasonId, meetSeasonLookup)
      : undefined;

    setMessage(
      `Saved swim.${pb === result.timeMs ? ' New PB!' : ''}${
        sb === result.timeMs ? ' New SB!' : ''
      }`
    );
    setTimeMs(null);
    setSplits([]);
  };

  const handleSaveRelay = async () => {
    if (!selectedMeet || !selectedEvent || timeMs == null) {
      setMessage('Meet, event, and total time required.');
      return;
    }

    const event = events?.find((item) => item.id === selectedEvent);
    if (!event) {
      setMessage('Event not found.');
      return;
    }

    const validation = validateRelay(event, relayLegs);
    if (!validation.ok) {
      setMessage(validation.message ?? 'Relay validation failed.');
      return;
    }

    const relay: RelayResult = {
      id: uuid(),
      meetId: selectedMeet,
      eventDefId: selectedEvent,
      teamLabel,
      timeMs,
      status,
      notes,
      legs: relayLegs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.transaction('rw', db.relayResults, db.auditLog, db.individualResults, async () => {
      await db.relayResults.add(relay);
      await db.auditLog.add({
        id: uuid(),
        entityType: 'relayResult',
        entityId: relay.id,
        timestamp: new Date().toISOString(),
        action: 'create',
        payload: relay
      });

      if (leadOff) {
        try {
          const leadResult = buildLeadOffResult(
            relay,
            event,
            selectedMeet,
            status,
            (distance, stroke) =>
              events?.find((item) => !item.isRelay && item.distanceYards === distance && item.stroke === stroke)?.id
          );
          await db.individualResults.add(leadResult);
        } catch (error) {
          console.error(error);
          setMessage('Relay saved, but lead-off not recorded: ' + (error as Error).message);
        }
      }
    });

    setMessage('Relay saved!');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['individual', 'relay'] as const).map((type) => (
          <button
            key={type}
            type="button"
            className={`rounded px-3 py-2 text-sm ${
              entryType === type ? 'bg-accent/20 text-accent' : 'bg-slate-900 text-slate-300'
            }`}
            onClick={() => setEntryType(type)}
          >
            {type === 'individual' ? 'Individual Entry' : 'Relay Entry'}
          </button>
        ))}
      </div>

      <div className="grid gap-4 rounded border border-slate-800 p-4">
        <div className="grid gap-2">
          <label className="text-sm font-semibold">Meet</label>
          <select
            className="rounded bg-slate-900 px-3 py-2"
            value={selectedMeet}
            onChange={(event) => setSelectedMeet(event.target.value)}
          >
            <option value="">Select Meet</option>
            {(meets ?? []).map((meet) => (
              <option key={meet.id} value={meet.id}>
                {meet.name} ({new Date(meet.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold">Event</label>
          <select
            className="rounded bg-slate-900 px-3 py-2"
            value={selectedEvent}
            onChange={(event) => setSelectedEvent(event.target.value)}
          >
            <option value="">Select Event</option>
            {(events ?? [])
              .filter((event) => (entryType === 'relay' ? event.isRelay : !event.isRelay))
              .map((event) => (
                <option key={event.id} value={event.id}>
                  {event.label}
                </option>
              ))}
          </select>
        </div>

        {entryType === 'individual' ? (
          <>
            <SwimmerPicker
              swimmers={((swimmers ?? []) as Swimmer[]).filter((swimmer) => swimmer.active)}
              value={selectedSwimmer}
              onChange={setSelectedSwimmer}
              label="Swimmer"
            />
            <TimeInput label="Total Time" valueMs={timeMs} onChange={setTimeMs} />
            <SplitEditor splits={splits} totalMs={timeMs} onChange={setSplits} />
          </>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">
                Team Label
                <input
                  className="mt-1 w-full rounded bg-slate-900 px-3 py-2"
                  value={teamLabel}
                  onChange={(event) => setTeamLabel(event.target.value)}
                />
              </label>
              <label className="text-sm font-semibold">
                Lead-off counts?
                <input
                  type="checkbox"
                  className="ml-2"
                  checked={leadOff}
                  onChange={(event) => setLeadOff(event.target.checked)}
                />
              </label>
            </div>
            <TimeInput label="Total Time" valueMs={timeMs} onChange={setTimeMs} />
            <div className="grid gap-3">
              {relayLegs.map((leg, index) => (
                <div key={leg.order} className="rounded border border-slate-800 p-3">
                  <h4 className="text-sm font-semibold">Leg {leg.order}</h4>
                  <SwimmerPicker
                    swimmers={((swimmers ?? []) as Swimmer[]).filter((swimmer) => swimmer.active)}
                    value={leg.swimmerId || null}
                    onChange={(id) => {
                      const next = [...relayLegs];
                      next[index] = { ...leg, swimmerId: id ?? '' };
                      setRelayLegs(next);
                    }}
                  />
                  <TimeInput
                    label="Split"
                    valueMs={leg.splitMs || null}
                    onChange={(value) => {
                      const next = [...relayLegs];
                      next[index] = { ...leg, splitMs: value ?? 0 };
                      setRelayLegs(next);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <label className="text-sm font-semibold">Status</label>
          <select
            className="rounded bg-slate-900 px-3 py-2"
            value={status}
            onChange={(event) => setStatus(event.target.value as ResultStatus)}
          >
            <option value="OK">OK</option>
            <option value="DQ">DQ</option>
            <option value="DNS">DNS</option>
            <option value="Exhibition">Exhibition</option>
          </select>
        </div>

        <label className="text-sm font-semibold">
          Notes
          <textarea
            className="mt-1 min-h-[80px] w-full rounded bg-slate-900 px-3 py-2"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <button
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-slate-900"
          onClick={entryType === 'individual' ? handleSaveIndividual : handleSaveRelay}
        >
          Save Result
        </button>
        {message && <p className="text-sm text-slate-300">{message}</p>}
      </div>
    </div>
  );
};

export default Home;
