import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../db/dexie';
import { useDexieLiveQuery } from '../lib/hooks';
import { formatMs } from '../lib/time';
import { getPersonalBest, getSeasonBest } from '../lib/bestTimes';
import ResultTable from '../components/ResultTable';
import MiniTrendChart from '../components/MiniTrendChart';
import type { EventDef, IndividualResult, Meet } from '../lib/types';

const SwimmerDetail = () => {
  const params = useParams();
  const swimmerId = params.id ?? '';
  const swimmer = useDexieLiveQuery(() => db.swimmers.get(swimmerId), [swimmerId]);
  const results = useDexieLiveQuery(
    () => db.individualResults.where('swimmerId').equals(swimmerId).toArray(),
    [swimmerId]
  );
  const meets = useDexieLiveQuery(() => db.meets.toArray(), []);
  const events = useDexieLiveQuery(() => db.events.toArray(), []);
  const settings = useDexieLiveQuery(() => db.settings.toArray(), []);

  const activeSeasonId = settings?.find((row) => row.key === 'activeSeasonId')?.value as string | undefined;
  const conversionsEnabled = Boolean(
    settings?.find((row) => row.key === 'courseConversions')?.value ?? true
  );

  const meetLookup = useMemo(() => {
    const map: Record<string, Meet> = {};
    (meets ?? []).forEach((meet) => {
      map[meet.id] = meet;
    });
    return map;
  }, [meets]);

  const eventLookup = useMemo(() => {
    const map: Record<string, EventDef> = {};
    (events ?? []).forEach((event) => {
      map[event.id] = event;
    });
    return map;
  }, [events]);

  const meetSeasonLookup = useMemo(() => {
    const map: Record<string, string> = {};
    (meets ?? []).forEach((meet) => {
      map[meet.id] = meet.seasonId;
    });
    return map;
  }, [meets]);

  const groupedByEvent = useMemo(() => {
    const groups: Record<string, IndividualResult[]> = {};
    (results ?? []).forEach((result) => {
      groups[result.eventDefId] = groups[result.eventDefId] || [];
      groups[result.eventDefId].push(result);
    });
    return groups;
  }, [results]);

  const personalBestByEvent = useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(groupedByEvent).forEach(([eventId, swims]) => {
      const pb = getPersonalBest(swims, eventId);
      if (pb != null) {
        map[eventId] = pb;
      }
    });
    return map;
  }, [groupedByEvent]);

  const seasonBestByEvent = useMemo(() => {
    const map: Record<string, number> = {};
    if (!activeSeasonId) return map;
    Object.entries(groupedByEvent).forEach(([eventId, swims]) => {
      const sb = getSeasonBest(swims, eventId, activeSeasonId, meetSeasonLookup);
      if (sb != null) {
        map[eventId] = sb;
      }
    });
    return map;
  }, [groupedByEvent, activeSeasonId, meetSeasonLookup]);

  const bestTimes = Object.entries(personalBestByEvent)
    .map(([eventId, time]) => ({
      event: eventLookup[eventId]?.label ?? eventId,
      time
    }))
    .sort((a, b) => a.event.localeCompare(b.event));

  return (
    <div className="space-y-6">
      <Link to="/swimmers" className="text-xs text-slate-400">← Back to roster</Link>
      <div>
        <h1 className="text-2xl font-semibold">
          {swimmer ? `${swimmer.firstName} ${swimmer.lastName}` : 'Swimmer'}
        </h1>
        {swimmer?.gradYear && (
          <p className="text-sm text-slate-400">Class of {swimmer.gradYear}</p>
        )}
      </div>

      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Best Times</h2>
        <div className="mt-3 grid gap-2 text-sm">
          {bestTimes.length === 0 && <p className="text-slate-400">No swims yet.</p>}
          {bestTimes.map((item) => (
            <div key={item.event} className="flex items-center justify-between">
              <span>{item.event}</span>
              <span className="font-semibold">{formatMs(item.time)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Season Bests</h2>
        <div className="mt-3 grid gap-2 text-sm">
          {Object.keys(seasonBestByEvent).length === 0 && (
            <p className="text-slate-400">No season bests tracked.</p>
          )}
          {Object.entries(seasonBestByEvent).map(([eventId, time]) => (
            <div key={eventId} className="flex items-center justify-between">
              <span>{eventLookup[eventId]?.label ?? eventId}</span>
              <span className="font-semibold">{formatMs(time)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Season Swims</h2>
        <ResultTable
          results={(results ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
          meets={meetLookup}
          events={eventLookup}
          personalBests={new Set(
            (results ?? [])
              .filter((result) => personalBestByEvent[result.eventDefId] === result.timeMs)
              .map((result) => result.id)
          )}
          seasonBests={new Set(
            (results ?? [])
              .filter((result) => seasonBestByEvent[result.eventDefId] === result.timeMs)
              .map((result) => result.id)
          )}
          showConversions={conversionsEnabled}
        />
      </section>

      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Progress</h2>
        {Object.entries(groupedByEvent).map(([eventId, swims]) => (
          <div key={eventId} className="mb-4">
            <h3 className="text-sm font-semibold">{eventLookup[eventId]?.label ?? eventId}</h3>
            <MiniTrendChart
              labels={swims
                .slice()
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                .map((swim) =>
                  new Date(meetLookup[swim.meetId]?.date ?? swim.createdAt).toLocaleDateString()
                )}
              data={swims
                .slice()
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                .map((swim) => swim.timeMs)}
            />
          </div>
        ))}
      </section>
    </div>
  );
};

export default SwimmerDetail;
