import { FormEvent, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { db } from '../db/dexie';
import { useDexieLiveQuery } from '../lib/hooks';
import { formatMs } from '../lib/time';
import type { EventDef, RecordRow } from '../lib/types';

const Records = () => {
  const records = useDexieLiveQuery(() => db.records.toArray(), []);
  const events = useDexieLiveQuery(() => db.events.toArray(), []);
  const meets = useDexieLiveQuery(() => db.meets.toArray(), []);
  const swimmers = useDexieLiveQuery(() => db.swimmers.toArray(), []);

  const [form, setForm] = useState<Omit<RecordRow, 'id'>>({
    eventDefId: '',
    isRelay: false,
    holderSwimmerIds: [],
    holderRelaySwimmerIds: [],
    timeMs: 0,
    meetId: '',
    date: new Date().toISOString()
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.eventDefId || !form.timeMs) return;
    await db.records.put({ ...form, id: uuid() });
    setForm({ ...form, holderSwimmerIds: [], holderRelaySwimmerIds: [] });
  };

  const eventLookup = Object.fromEntries((events ?? []).map((event) => [event.id, event]));
  const swimmerLookup = Object.fromEntries((swimmers ?? []).map((swimmer) => [swimmer.id, swimmer]));

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Add Record</h2>
        <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
          <select
            className="rounded bg-slate-900 px-3 py-2"
            value={form.eventDefId}
            onChange={(event) => {
              const eventId = event.target.value;
              const isRelay = events?.find((item) => item.id === eventId)?.isRelay ?? false;
              setForm({ ...form, eventDefId: eventId, isRelay });
            }}
          >
            <option value="">Select Event</option>
            {(events ?? []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.label}
              </option>
            ))}
          </select>
          <input
            className="rounded bg-slate-900 px-3 py-2"
            placeholder="Time (mm:ss.hh)"
            onBlur={(event) => {
              const value = event.target.value;
              if (!value) return;
              const [minutes, seconds] = value.split(':');
              const secs = seconds ? parseFloat(seconds) : parseFloat(minutes);
              const mins = seconds ? parseInt(minutes, 10) : 0;
              const ms = Math.round((mins * 60 + secs) * 1000);
              setForm({ ...form, timeMs: ms });
            }}
          />
          <input
            className="rounded bg-slate-900 px-3 py-2"
            type="date"
            value={form.date.substring(0, 10)}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
          />
          <select
            className="rounded bg-slate-900 px-3 py-2"
            value={form.meetId ?? ''}
            onChange={(event) => setForm({ ...form, meetId: event.target.value })}
          >
            <option value="">Meet (optional)</option>
            {(meets ?? []).map((meet) => (
              <option key={meet.id} value={meet.id}>
                {meet.name}
              </option>
            ))}
          </select>
          {!form.isRelay ? (
            <select
              multiple
              className="rounded bg-slate-900 px-3 py-2"
              value={form.holderSwimmerIds as string[]}
              onChange={(event) =>
                setForm({ ...form, holderSwimmerIds: Array.from(event.target.selectedOptions).map((option) => option.value) })
              }
            >
              {(swimmers ?? []).map((swimmer) => (
                <option key={swimmer.id} value={swimmer.id}>
                  {swimmer.firstName} {swimmer.lastName}
                </option>
              ))}
            </select>
          ) : (
            <select
              multiple
              className="rounded bg-slate-900 px-3 py-2"
              value={form.holderRelaySwimmerIds as string[]}
              onChange={(event) =>
                setForm({
                  ...form,
                  holderRelaySwimmerIds: Array.from(event.target.selectedOptions).map((option) => option.value)
                })
              }
            >
              {(swimmers ?? []).map((swimmer) => (
                <option key={swimmer.id} value={swimmer.id}>
                  {swimmer.firstName} {swimmer.lastName}
                </option>
              ))}
            </select>
          )}
          <button className="rounded bg-accent px-3 py-2 text-sm font-semibold text-slate-900">
            Save Record
          </button>
        </form>
      </section>

      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Individual Records</h2>
        <div className="mt-3 space-y-2 text-sm">
          {(records ?? [])
            .filter((record) => !record.isRelay)
            .map((record) => (
              <div key={record.id} className="rounded border border-slate-800 px-3 py-2">
                <div className="font-semibold">{eventLookup[record.eventDefId]?.label ?? record.eventDefId}</div>
                <div className="text-xs text-slate-400">
                  {formatMs(record.timeMs)} • {record.date}
                </div>
                <div className="text-xs text-slate-400">
                  {(record.holderSwimmerIds ?? []).map((id) => swimmerLookup[id]?.lastName ?? id).join(', ')}
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Relay Records</h2>
        <div className="mt-3 space-y-2 text-sm">
          {(records ?? [])
            .filter((record) => record.isRelay)
            .map((record) => (
              <div key={record.id} className="rounded border border-slate-800 px-3 py-2">
                <div className="font-semibold">{eventLookup[record.eventDefId]?.label ?? record.eventDefId}</div>
                <div className="text-xs text-slate-400">
                  {formatMs(record.timeMs)} • {record.date}
                </div>
                <div className="text-xs text-slate-400">
                  {(record.holderRelaySwimmerIds ?? [])
                    .map((id) => swimmerLookup[id]?.lastName ?? id)
                    .join(', ')}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Records;
