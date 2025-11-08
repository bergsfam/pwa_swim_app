import { v4 as uuid } from 'uuid';
import type {
  EventDef,
  ID,
  IndividualResult,
  RelayLeg,
  RelayResult,
  ResultStatus,
  Stroke
} from './types';

const medleyOrder: Record<RelayLeg['order'], Stroke> = {
  1: 'Back',
  2: 'Breast',
  3: 'Fly',
  4: 'Free'
};

export const getMedleyStrokeForOrder = (order: RelayLeg['order']): Stroke => medleyOrder[order];

export const validateRelay = (
  event: EventDef,
  legs: RelayLeg[]
): { ok: boolean; message?: string } => {
  if (!event.isRelay) {
    return { ok: false, message: 'Selected event is not a relay' };
  }

  if (legs.length !== 4) {
    return { ok: false, message: 'Relay must have 4 legs' };
  }

  const swimmerIds = new Set(legs.map((leg) => leg.swimmerId));
  if (swimmerIds.size !== 4) {
    return { ok: false, message: 'Each relay leg must have a unique swimmer' };
  }

  if (event.stroke === 'IM') {
    for (const leg of legs) {
      if (!medleyOrder[leg.order]) {
        return { ok: false, message: 'Invalid medley relay order' };
      }
    }
  }

  return { ok: true };
};

export const buildLeadOffResult = (
  relay: RelayResult,
  event: EventDef,
  meetId: ID,
  status: ResultStatus,
  findIndividualEventId: (distance: number, stroke: Stroke) => ID | undefined
): IndividualResult => {
  const lead = relay.legs.find((leg) => leg.order === 1);
  if (!lead) {
    throw new Error('Relay missing lead-off leg');
  }

  const legDistance = event.distanceYards / 4;
  const legStroke = event.stroke === 'IM' ? getMedleyStrokeForOrder(1) : event.stroke;
  const individualEventId = findIndividualEventId(legDistance, legStroke);
  if (!individualEventId) {
    throw new Error('No matching individual event for lead-off leg');
  }

  return {
    id: uuid(),
    swimmerId: lead.swimmerId,
    meetId,
    eventDefId: individualEventId,
    timeMs: lead.splitMs,
    status,
    splitsMs: [lead.splitMs],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: `Lead-off from ${event.label}`
  };
};
