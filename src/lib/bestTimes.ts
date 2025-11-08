import type { ID, IndividualResult } from './types';

const filterOK = (results: IndividualResult[]): IndividualResult[] =>
  results.filter((result) => result.status === 'OK');

export const getPersonalBest = (
  results: IndividualResult[],
  eventDefId: ID
): number | undefined => {
  return filterOK(results)
    .filter((result) => result.eventDefId === eventDefId)
    .sort((a, b) => a.timeMs - b.timeMs)[0]?.timeMs;
};

export const getSeasonBest = (
  results: IndividualResult[],
  eventDefId: ID,
  seasonId: ID,
  meetSeasonLookup: Record<ID, ID>
): number | undefined => {
  return filterOK(results)
    .filter(
      (result) =>
        result.eventDefId === eventDefId && meetSeasonLookup[result.meetId] === seasonId
    )
    .sort((a, b) => a.timeMs - b.timeMs)[0]?.timeMs;
};
