import { FormEvent, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { db } from '../db/dexie';
import { useDexieLiveQuery } from '../lib/hooks';
import type { Course, Meet, Season } from '../lib/types';

const Meets = () => {
  const meets = useDexieLiveQuery(() => db.meets.orderBy('date').reverse().toArray(), []);
  const seasons = useDexieLiveQuery(() => db.seasons.toArray(), []);
  const [form, setForm] = useState<Omit<Meet, 'id'>>({
    name: '',
    date: new Date().toISOString().substring(0, 10),
    location: '',
    course: 'SCY',
    seasonId: ''
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.seasonId) return;
    await db.meets.add({ ...form, id: uuid() });
    setForm({ ...form, name: '', location: '' });
  };

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Add Meet</h2>
        <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
          <input
            className="rounded bg-slate-900 px-3 py-2"
            placeholder="Meet name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            className="rounded bg-slate-900 px-3 py-2"
            type="date"
            value={form.date.substring(0, 10)}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
          />
          <input
            className="rounded bg-slate-900 px-3 py-2"
            placeholder="Location"
            value={form.location ?? ''}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
          />
          <select
            className="rounded bg-slate-900 px-3 py-2"
            value={form.course}
            onChange={(event) => setForm({ ...form, course: event.target.value as Course })}
          >
            <option value="SCY">SCY</option>
            <option value="SCM">SCM</option>
            <option value="LCM">LCM</option>
          </select>
          <select
            className="rounded bg-slate-900 px-3 py-2"
            value={form.seasonId}
            onChange={(event) => setForm({ ...form, seasonId: event.target.value })}
          >
            <option value="">Assign Season</option>
            {(seasons ?? []).map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
          <button className="rounded bg-accent px-3 py-2 text-sm font-semibold text-slate-900">
            Save Meet
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Meets</h2>
        <div className="mt-3 space-y-2">
          {(meets ?? []).map((meet) => (
            <div key={meet.id} className="rounded border border-slate-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{meet.name}</h3>
                  <p className="text-xs text-slate-400">
                    {new Date(meet.date).toLocaleDateString()} • {meet.location ?? '—'} • {meet.course}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Meets;
