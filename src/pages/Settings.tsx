import { ChangeEvent, useRef, useState } from 'react';
import { exportDB, importDB } from 'dexie-export-import';
import { v4 as uuid } from 'uuid';
import { db } from '../db/dexie';
import { useDexieLiveQuery } from '../lib/hooks';
import { formatMs } from '../lib/time';

const downloadText = (filename: string, contents: string) => {
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const Settings = () => {
  const settings = useDexieLiveQuery(() => db.settings.toArray(), []);
  const teamName = settings?.find((row) => row.key === 'teamName')?.value as string | undefined;
  const conversionsEnabled = Boolean(
    settings?.find((row) => row.key === 'courseConversions')?.value ?? true
  );
  const [nameDraft, setNameDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveTeamName = async () => {
    if (!nameDraft) return;
    const row =
      settings?.find((item) => item.key === 'teamName') ??
      (await db.settings.where('key').equals('teamName').first());
    if (row) {
      await db.settings.update(row.id, { value: nameDraft });
    } else {
      await db.settings.add({ id: uuid(), key: 'teamName', value: nameDraft });
    }
    setNameDraft('');
  };

  const toggleConversions = async () => {
    const row =
      settings?.find((item) => item.key === 'courseConversions') ??
      (await db.settings.where('key').equals('courseConversions').first());
    if (row) {
      await db.settings.update(row.id, { value: !conversionsEnabled });
    } else {
      await db.settings.add({ id: uuid(), key: 'courseConversions', value: !conversionsEnabled });
    }
  };

  const exportRoster = async () => {
    const swimmers = await db.swimmers.toArray();
    const lines = ['first_name,last_name,grad_year,group'];
    swimmers.forEach((swimmer) => {
      lines.push(
        `${swimmer.firstName},${swimmer.lastName},${swimmer.gradYear ?? ''},${swimmer.group ?? ''}`
      );
    });
    downloadText('roster.csv', lines.join('\n'));
  };

  const exportResults = async () => {
    const results = await db.individualResults.toArray();
    const meets = await db.meets.toArray();
    const events = await db.events.toArray();
    const swimmers = await db.swimmers.toArray();
    const meetLookup = Object.fromEntries(meets.map((meet) => [meet.id, meet]));
    const eventLookup = Object.fromEntries(events.map((event) => [event.id, event]));
    const swimmerLookup = Object.fromEntries(swimmers.map((swimmer) => [swimmer.id, swimmer]));
    const header = 'meet,date,course,swimmer,stroke,distance,time,status,splits,notes';
    const lines = [header];
    results.forEach((result) => {
      const meet = meetLookup[result.meetId];
      const event = eventLookup[result.eventDefId];
      const swimmer = swimmerLookup[result.swimmerId];
      const splits = (result.splitsMs ?? []).map((split) => formatMs(split)).join('|');
      lines.push(
        [
          meet?.name ?? '',
          meet ? new Date(meet.date).toISOString().split('T')[0] : '',
          meet?.course ?? '',
          swimmer ? `${swimmer.firstName} ${swimmer.lastName}` : '',
          event?.stroke ?? '',
          event?.distanceYards ?? '',
          formatMs(result.timeMs),
          result.status,
          splits,
          result.notes ?? ''
        ].join(',')
      );
    });
    downloadText('results.csv', lines.join('\n'));
  };

  const exportJSON = async () => {
    const blob = await exportDB(db);
    downloadBlob('backup.json', blob);
  };

  const importJSON = async (file: File) => {
    await importDB(file);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith('.json')) {
      await importJSON(file);
    }
    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      const rows = text.split(/\r?\n/).slice(1);
      for (const row of rows) {
        if (!row.trim()) continue;
        const [first, last, grad, group] = row.split(',');
        await db.swimmers.add({
          id: uuid(),
          firstName: first,
          lastName: last,
          gradYear: grad ? Number(grad) : undefined,
          group,
          active: true
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Team Name</h2>
        <p className="text-sm text-slate-400">Current: {teamName ?? 'Granville Swim Tracker'}</p>
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded bg-slate-900 px-3 py-2"
            placeholder="Team Name"
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
          />
          <button className="rounded bg-accent px-3 py-2 text-sm font-semibold text-slate-900" onClick={saveTeamName}>
            Save
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Course Conversions</h3>
            <p className="text-xs text-slate-400">Show converted target times (SCY) alongside official marks.</p>
          </div>
          <button
            className={`rounded px-3 py-2 text-xs font-semibold ${
              conversionsEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
            }`}
            onClick={toggleConversions}
          >
            {conversionsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </section>

      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Data Export</h2>
        <div className="mt-3 flex flex-col gap-2">
          <button className="rounded bg-slate-900 px-3 py-2 text-left text-sm" onClick={exportRoster}>
            Export Roster CSV
          </button>
          <button className="rounded bg-slate-900 px-3 py-2 text-left text-sm" onClick={exportResults}>
            Export Results CSV
          </button>
          <button className="rounded bg-slate-900 px-3 py-2 text-left text-sm" onClick={exportJSON}>
            Export JSON Backup
          </button>
        </div>
      </section>

      <section className="rounded border border-slate-800 p-4">
        <h2 className="text-lg font-semibold">Import</h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          className="rounded bg-slate-900 px-3 py-2"
          onChange={handleFileUpload}
        />
      </section>
    </div>
  );
};

export default Settings;
