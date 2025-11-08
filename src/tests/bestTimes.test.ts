import { describe, expect, it } from 'vitest';
import { getPersonalBest, getSeasonBest } from '../lib/bestTimes';
import type { IndividualResult } from '../lib/types';

const makeResult = (overrides: Partial<IndividualResult>): IndividualResult => ({
  id: overrides.id ?? 'r1',
  swimmerId: overrides.swimmerId ?? 's1',
  meetId: overrides.meetId ?? 'm1',
  eventDefId: overrides.eventDefId ?? 'e1',
  timeMs: overrides.timeMs ?? 60000,
  status: overrides.status ?? 'OK',
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  splitsMs: overrides.splitsMs,
  notes: overrides.notes,
  heat: overrides.heat,
  lane: overrides.lane
});

describe('best times', () => {
  const results = [
    makeResult({ id: '1', timeMs: 61000 }),
    makeResult({ id: '2', timeMs: 60000 }),
    makeResult({ id: '3', timeMs: 60500, status: 'DQ' })
  ];

  it('gets personal best', () => {
    expect(getPersonalBest(results, 'e1')).toBe(60000);
  });

  it('gets season best using meet lookup', () => {
    const lookup = { m1: 'seasonA', m2: 'seasonB' } as Record<string, string>;
    const seasonResults = [
      makeResult({ id: '4', timeMs: 59000, meetId: 'm2' }),
      makeResult({ id: '5', timeMs: 58500, meetId: 'm1' })
    ];
    const combined = [...results, ...seasonResults];
    expect(getSeasonBest(combined, 'e1', 'seasonB', lookup)).toBe(59000);
  });
});
