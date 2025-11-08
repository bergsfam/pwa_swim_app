import { FormEvent, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { db } from '../db/dexie';
import { useDexieLiveQuery } from '../lib/hooks';
import type { Swimmer } from '../lib/types';

const blank: Omit<Swimmer, 'id'> = {
  firstName: '',
  lastName: '',
  gradYear: undefined,
  group: 'Varsity',
  active: true
};

const Swimmers = () => {
  const swimmers = useDexieLiveQuery(() => db.swimmers.toArray(), []);
  const [form, setForm] = useState(blank);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.firstName || !form.lastName) return;
    const swimmer: Swimmer = { id: uuid(), ...form };
    await db.swimmers.add(swimmer);
    setForm(blank);
  };

  const toggleActive = async (swimmer: Swimmer) => {
    await db.swimmers.update(swimmer.id, { active: !swimmer.active });
  };

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Add Swimmer</h2>
        <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded bg-slate-900 px-3 py-2"
              placeholder="First name"
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
            />
            <input
              className="rounded bg-slate-900 px-3 py-2"
              placeholder="Last name"
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded bg-slate-900 px-3 py-2"
              placeholder="Graduation year"
              value={form.gradYear ?? ''}
              onChange={(event) =>
                setForm({ ...form, gradYear: event.target.value ? Number(event.target.value) : undefined })
              }
            />
            <input
              className="rounded bg-slate-900 px-3 py-2"
              placeholder="Group"
              value={form.group ?? ''}
              onChange={(event) => setForm({ ...form, group: event.target.value })}
            />
          </div>
          <button className="rounded bg-accent px-3 py-2 text-sm font-semibold text-slate-900">
            Save Swimmer
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Roster</h2>
        <div className="mt-3 space-y-2">
          {(swimmers ?? []).map((swimmer) => (
            <div
              key={swimmer.id}
              className="flex items-center justify-between rounded border border-slate-800 px-4 py-3"
            >
              <div>
                <div className="text-sm font-semibold">
                  {swimmer.firstName} {swimmer.lastName}
                </div>
                <div className="text-xs text-slate-400">
                  {swimmer.group ?? '—'} • Class of {swimmer.gradYear ?? '—'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(swimmer)}
                className={`rounded px-3 py-1 text-xs ${
                  swimmer.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {swimmer.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Swimmers;
