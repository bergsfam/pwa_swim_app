# Granville Swim Tracker

Granville Swim Tracker is a mobile-first progressive web app for managing a high school swim team without a backend. The app works offline via IndexedDB (Dexie) and supports CSV/JSON import-export for manual syncing between devices.

## Features

- Meet entry forms for individual and relay results with PB/SB detection and split validation.
- Swimmer detail pages showing personal bests, season bests, history tables, and mini trend charts.
- Team records tracking for individual and relay events.
- Roster, meets, and events management.
- CSV export for roster and results, plus full JSON backup/restore.
- Offline-first PWA with installable experience using Vite + React + TypeScript.
- Tailwind-based responsive UI optimized for on-deck entry.
- Vitest unit tests covering time parsing, best time utilities, and relay helpers.

## Getting Started

```bash
npm install
npm run dev
```

The development server runs at <http://localhost:5173>. The PWA can be installed from the browser once served over HTTPS.

### Testing

```bash
npm test
```

### Building

```bash
npm run build
```

This creates a production build in `dist/` and generates the service worker and manifest assets.

## Import / Export Formats

- **Roster CSV:** `first_name,last_name,grad_year,group`
- **Results CSV:** `meet,date,course,swimmer,stroke,distance,time,status,splits,notes`
- **Relay CSV (future):** matches the individual format with leg columns; relay management is available in-app.
- **JSON Backup:** full IndexedDB export that can be restored from Settings.

## Tailwind Utility Tips

The UI relies on Tailwind classes defined in `tailwind.config.js`. Styles are applied via className strings within components; no additional CSS frameworks are required.

## PWA

Vite's PWA plugin registers a service worker (`registerSW` in `main.tsx`) and generates `manifest.webmanifest`. Icons live under `public/icons/`.

## License

MIT
