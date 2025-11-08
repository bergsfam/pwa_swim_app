import { FormEvent, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { db } from '../db/dexie';
import { useDexieLiveQuery } from '../lib/hooks';
import type { EventDef, Stroke } from '../lib/types';

const strokes: Stroke[] = ['Free', 'Back', 'Breast', 'Fly', 'IM'];

const Events = () => {
  const events = useDexieLiveQuery(() => db.events.toArray(), []);
  const [form, setForm] = useState<Omit<EventDef, 'id'>>({
    label: '',
    distanceYards: 50,
    stroke: 'Free',
    isRelay: false
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.label) return;
    await db.events.add({ ...form, id: uuid() });
    setForm({ ...form, label: '' });
  };

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Add Event</h2>
        <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
          <input
            className="rounded bg-slate-900 px-3 py-2"
            placeholder="Label (e.g. 100 Back)"
            value={form.label}
            onChange={(event) => setForm({ ...form, label: event.target.value })}
          />
          <input
            className="rounded bg-slate-900 px-3 py-2"
            type="number"
            value={form.distanceYards}
            onChange={(event) => setForm({ ...form, distanceYards: Number(event.target.value) })}
          />
          <select
            className="rounded bg-slate-900 px-3 py-2"
            value={form.stroke}
            onChange={(event) => setForm({ ...form, stroke: event.target.value as Stroke })}
          >
            {strokes.map((stroke) => (
              <option key={stroke} value={stroke}>
                {stroke}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isRelay}
              onChange={(event) => setForm({ ...form, isRelay: event.target.checked })}
            />
            Relay Event
          </label>
          <button className="rounded bg-accent px-3 py-2 text-sm font-semibold text-slate-900">
            Save Event
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Catalog</h2>
        <div className="mt-3 space-y-2">
          {(events ?? []).map((event) => (
            <div key={event.id} className="rounded border border-slate-800 px-3 py-2 text-sm">
              <div className="font-semibold">{event.label}</div>
              <div className="text-xs text-slate-400">
                {event.distanceYards}y {event.stroke} • {event.isRelay ? 'Relay' : 'Individual'}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Events;
