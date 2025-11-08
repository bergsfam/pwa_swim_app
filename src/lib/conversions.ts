import type { Course, EventDef } from './types';

const conversionFactors: Record<Course, Record<Course, number>> = {
  SCY: { SCY: 1, SCM: 1.11, LCM: 1.11 * 1.02 },
  SCM: { SCY: 0.9, SCM: 1, LCM: 1.02 },
  LCM: { SCY: 0.88, SCM: 0.98, LCM: 1 }
};

export const convertTimeMs = (
  ms: number,
  from: Course,
  to: Course,
  event: EventDef
): { ms: number; note: string } => {
  if (from === to) {
    return { ms, note: 'No conversion needed' };
  }

  const factor = conversionFactors[from][to];
  const converted = Math.round(ms * factor);
  return {
    ms: converted,
    note: `${event.label} converted ${from}→${to} x${factor.toFixed(3)}`
  };
};
