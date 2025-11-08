import { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Swimmers from './pages/Swimmers';
import SwimmerDetail from './pages/SwimmerDetail';
import Meets from './pages/Meets';
import Events from './pages/Events';
import Records from './pages/Records';
import Settings from './pages/Settings';
import { seedDatabase } from './db/seed';
import { db } from './db/dexie';
import type { SettingRow } from './lib/types';
import { useDexieLiveQuery } from './lib/hooks';

const App = () => {
  const [ready, setReady] = useState(false);
  const settings = useDexieLiveQuery(async () => db.settings.toArray(), []);

  useEffect(() => {
    seedDatabase().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <p>Loading Granville Swim Tracker…</p>
      </div>
    );
  }

  const teamName = settings?.find((row: SettingRow) => row.key === 'teamName')?.value as
    | string
    | undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">{teamName ?? 'Granville Swim Tracker'}</h1>
          <nav className="flex gap-3 text-sm">
            {[
              { to: '/', label: 'Meet Entry' },
              { to: '/swimmers', label: 'Swimmers' },
              { to: '/meets', label: 'Meets' },
              { to: '/events', label: 'Events' },
              { to: '/records', label: 'Records' },
              { to: '/settings', label: 'Settings' }
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded px-2 py-1 ${isActive ? 'bg-accent/20 text-accent' : 'text-slate-300'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/swimmers" element={<Swimmers />} />
          <Route path="/swimmers/:id" element={<SwimmerDetail />} />
          <Route path="/meets" element={<Meets />} />
          <Route path="/events" element={<Events />} />
          <Route path="/records" element={<Records />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
