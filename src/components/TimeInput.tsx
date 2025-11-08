import { useEffect, useState } from 'react';
import { parseTimeStr } from '../lib/time';

interface TimeInputProps {
  label: string;
  valueMs: number | null;
  onChange: (valueMs: number | null) => void;
}

export const TimeInput = ({ label, valueMs, onChange }: TimeInputProps) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (valueMs != null) {
      setValue((valueMs / 1000).toFixed(2));
    }
  }, [valueMs]);

  const handleBlur = () => {
    if (!value) {
      onChange(null);
      setError(null);
      return;
    }

    try {
      const parsed = parseTimeStr(value);
      onChange(parsed);
      setValue(value.trim());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      <input
        className="rounded bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={handleBlur}
        placeholder="mm:ss.hh"
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
};

export default TimeInput;
