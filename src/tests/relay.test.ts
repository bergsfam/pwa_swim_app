import { describe, expect, it } from 'vitest';
import { buildLeadOffResult, getMedleyStrokeForOrder, validateRelay } from '../lib/relay';
import type { EventDef, RelayLeg, RelayResult } from '../lib/types';

const medleyEvent: EventDef = {
  id: 'relay-medley',
  distanceYards: 200,
  stroke: 'IM',
  isRelay: true,
  label: '200 Medley Relay'
};

const freeEvent: EventDef = {
  id: 'relay-free',
  distanceYards: 200,
  stroke: 'Free',
  isRelay: true,
  label: '200 Free Relay'
};

const legs: RelayLeg[] = [
  { order: 1, swimmerId: 's1', splitMs: 25000 },
  { order: 2, swimmerId: 's2', splitMs: 24000 },
  { order: 3, swimmerId: 's3', splitMs: 23000 },
  { order: 4, swimmerId: 's4', splitMs: 22000 }
];

describe('relay utilities', () => {
  it('maps medley strokes by order', () => {
    expect(getMedleyStrokeForOrder(1)).toBe('Back');
    expect(getMedleyStrokeForOrder(4)).toBe('Free');
  });

  it('validates relay leg uniqueness', () => {
    expect(validateRelay(freeEvent, legs).ok).toBe(true);
    const invalid = [...legs.slice(0, 3), { ...legs[3], swimmerId: 's1' }];
    expect(validateRelay(freeEvent, invalid).ok).toBe(false);
  });

  it('creates lead-off result for free relay', () => {
    const relay: RelayResult = {
      id: 'relay1',
      meetId: 'meet1',
      eventDefId: freeEvent.id,
      teamLabel: 'A',
      timeMs: 94000,
      status: 'OK',
      notes: '',
      legs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const leadOff = buildLeadOffResult(relay, freeEvent, relay.meetId, 'OK', (distance, stroke) => {
      if (distance === 50 && stroke === 'Free') {
        return 'event-50-free';
      }
      return undefined;
    });

    expect(leadOff.eventDefId).toBe('event-50-free');
    expect(leadOff.timeMs).toBe(25000);
  });
});
