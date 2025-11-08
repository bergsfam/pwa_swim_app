import { useMemo, useState } from 'react';
import type { Swimmer } from '../lib/types';

interface SwimmerPickerProps {
  swimmers: Swimmer[];
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
}

export const SwimmerPicker = ({ swimmers, value, onChange, label }: SwimmerPickerProps) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return swimmers;
    return swimmers.filter((swimmer) =>
      `${swimmer.firstName} ${swimmer.lastName}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [swimmers, query]);

  return (
    <div className="flex flex-col gap-1 text-sm">
      {label && <span className="font-semibold">{label}</span>}
      <input
        className="rounded bg-slate-900 border border-slate-700 px-3 py-2"
        placeholder="Search swimmer"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="max-h-40 overflow-y-auto rounded border border-slate-700">
        {filtered.map((swimmer) => {
          const id = swimmer.id;
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`block w-full text-left px-3 py-2 text-sm ${
                selected ? 'bg-accent/30 text-accent' : 'hover:bg-slate-800'
              }`}
            >
              {swimmer.firstName} {swimmer.lastName}
              {swimmer.gradYear ? <span className="ml-2 text-xs opacity-70">{swimmer.gradYear}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SwimmerPicker;
