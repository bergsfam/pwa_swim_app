import { useMemo } from 'react';
import { formatMs, parseTimeStr, sumSplits, almostEqual } from '../lib/time';

interface SplitEditorProps {
  splits: number[];
  totalMs: number | null;
  onChange: (splits: number[]) => void;
}

const parse = (value: string): number | null => {
  if (!value) return null;
  try {
    return parseTimeStr(value);
  } catch (err) {
    return null;
  }
};

export const SplitEditor = ({ splits, totalMs, onChange }: SplitEditorProps) => {
  const delta = useMemo(() => {
    if (totalMs == null) return 0;
    return sumSplits(splits) - totalMs;
  }, [splits, totalMs]);

  return (
    <div className="rounded border border-slate-700 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Splits</h3>
        <button
          type="button"
          onClick={() => onChange([...splits, 0])}
          className="text-xs rounded bg-accent/20 px-2 py-1 text-accent"
        >
          + Add Split
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {splits.map((split, index) => (
          <input
            key={index}
            className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-sm"
            defaultValue={split ? formatMs(split) : ''}
            placeholder={`Split ${index + 1}`}
            onBlur={(event) => {
              const next = [...splits];
              const parsed = parse(event.target.value);
              if (parsed != null) {
                next[index] = parsed;
              }
              onChange(next.filter((value) => value > 0));
            }}
          />
        ))}
      </div>
      {totalMs != null && splits.length > 0 && (
        <p className={`mt-2 text-xs ${almostEqual(sumSplits(splits), totalMs) ? 'text-green-400' : 'text-yellow-400'}`}>
          Sum {formatMs(sumSplits(splits))} vs total {formatMs(totalMs)} → {delta > 0 ? '+' : ''}
          {formatMs(Math.abs(delta))}
        </p>
      )}
    </div>
  );
};

export default SplitEditor;
