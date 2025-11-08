import { formatMs } from '../lib/time';
import type { Course, EventDef, IndividualResult, Meet } from '../lib/types';
import { convertTimeMs } from '../lib/conversions';
import PBChip from './PBChip';
import SBChip from './SBChip';
import ConvertedBadge from './ConvertedBadge';

interface ResultTableProps {
  results: IndividualResult[];
  meets: Record<string, Meet>;
  events: Record<string, EventDef>;
  personalBests: Set<string>;
  seasonBests: Set<string>;
  showConversions?: boolean;
  targetCourse?: Course;
}

const ResultTable = ({
  results,
  meets,
  events,
  personalBests,
  seasonBests,
  showConversions = false,
  targetCourse = 'SCY'
}: ResultTableProps) => {
  if (results.length === 0) {
    return <p className="text-sm text-slate-400">No swims recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-900/70 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Meet</th>
            <th className="px-4 py-2">Event</th>
            <th className="px-4 py-2">Time</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900">
          {results.map((result) => {
            const meet = meets[result.meetId];
            const event = events[result.eventDefId];
            const pb = personalBests.has(result.id);
            const sb = seasonBests.has(result.id);
            const converted =
              showConversions && meet && meet.course !== targetCourse && event
                ? convertTimeMs(result.timeMs, meet.course, targetCourse, event)
                : null;
            return (
              <tr key={result.id} className="hover:bg-slate-900/40">
                <td className="px-4 py-2 text-xs text-slate-400">
                  {meet ? new Date(meet.date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2">
                  <div className="text-sm font-medium text-slate-100">{meet?.name ?? 'Unknown Meet'}</div>
                  <div className="text-xs text-slate-400">{meet?.course}</div>
                </td>
                <td className="px-4 py-2 text-sm text-slate-100">{event?.label ?? '—'}</td>
                <td className="px-4 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{formatMs(result.timeMs)}</span>
                    {pb && <PBChip />}
                    {sb && <SBChip />}
                    {converted && (
                      <ConvertedBadge note={`${targetCourse} ${formatMs(converted.ms)}`} />
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-xs text-slate-300">{result.status}</td>
                <td className="px-4 py-2 text-xs text-slate-400">{result.notes ?? ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
