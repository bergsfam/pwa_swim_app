import { v4 as uuid } from 'uuid';
import { db } from './dexie';
import type {
  Course,
  EventDef,
  Meet,
  Season,
  Swimmer
} from '../lib/types';

const defaultEvents: Array<Omit<EventDef, 'id'>> = [
  { label: '50 Free', distanceYards: 50, stroke: 'Free', isRelay: false },
  { label: '100 Free', distanceYards: 100, stroke: 'Free', isRelay: false },
  { label: '200 Free', distanceYards: 200, stroke: 'Free', isRelay: false },
  { label: '500 Free', distanceYards: 500, stroke: 'Free', isRelay: false },
  { label: '100 Back', distanceYards: 100, stroke: 'Back', isRelay: false },
  { label: '200 Back', distanceYards: 200, stroke: 'Back', isRelay: false },
  { label: '100 Breast', distanceYards: 100, stroke: 'Breast', isRelay: false },
  { label: '200 Breast', distanceYards: 200, stroke: 'Breast', isRelay: false },
  { label: '100 Fly', distanceYards: 100, stroke: 'Fly', isRelay: false },
  { label: '200 Fly', distanceYards: 200, stroke: 'Fly', isRelay: false },
  { label: '200 IM', distanceYards: 200, stroke: 'IM', isRelay: false },
  { label: '200 Free Relay', distanceYards: 200, stroke: 'Free', isRelay: true },
  { label: '400 Free Relay', distanceYards: 400, stroke: 'Free', isRelay: true },
  { label: '200 Medley Relay', distanceYards: 200, stroke: 'IM', isRelay: true }
];

const swimmers: Array<Omit<Swimmer, 'id'>> = [
  { firstName: 'Avery', lastName: 'Johnson', gradYear: 2025, group: 'Varsity', active: true },
  { firstName: 'Blake', lastName: 'Nguyen', gradYear: 2026, group: 'Varsity', active: true },
  { firstName: 'Chris', lastName: 'Patel', gradYear: 2027, group: 'JV', active: true },
  { firstName: 'Devon', lastName: 'Smith', gradYear: 2025, group: 'Varsity', active: true },
  { firstName: 'Emerson', lastName: 'Lee', gradYear: 2026, group: 'JV', active: true }
];

const meets: Array<Omit<Meet, 'id'>> = [
  {
    name: 'Granville vs. Rivals',
    date: new Date().toISOString(),
    location: 'Granville HS',
    course: 'SCY',
    seasonId: ''
  },
  {
    name: 'Granville Invitational',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Granville HS',
    course: 'SCY',
    seasonId: ''
  }
];

const createSeason = (): Season => ({
  id: uuid(),
  name: `${new Date().getFullYear()}-${new Date().getFullYear() + 1} Season`,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  active: true
});

export const seedDatabase = async (): Promise<void> => {
  const seasonCount = await db.seasons.count();
  if (seasonCount > 0) {
    return;
  }

  const season = createSeason();
  const seasonId = season.id;

  const seasonMeets = meets.map((meet) => ({ ...meet, id: uuid(), seasonId }));
  const seasonSwimmers = swimmers.map((swimmer) => ({ ...swimmer, id: uuid() }));
  const seasonEvents = defaultEvents.map((event) => ({ ...event, id: uuid() }));

  await db.transaction('rw', db.seasons, db.meets, db.swimmers, db.events, async () => {
    await db.seasons.add(season);
    await db.meets.bulkAdd(seasonMeets);
    await db.swimmers.bulkAdd(seasonSwimmers);
    await db.events.bulkAdd(seasonEvents);
  });

  await db.settings.put({ id: uuid(), key: 'teamName', value: 'Granville Swim Tracker' });
  await db.settings.put({ id: uuid(), key: 'courseConversions', value: true });
  await db.settings.put({ id: uuid(), key: 'activeSeasonId', value: seasonId });
};
