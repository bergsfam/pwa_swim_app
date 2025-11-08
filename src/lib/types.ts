export type ID = string;

export type Course = 'SCY' | 'SCM' | 'LCM';
export type Stroke = 'Free' | 'Back' | 'Breast' | 'Fly' | 'IM';

export interface Season {
  id: ID;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface Swimmer {
  id: ID;
  firstName: string;
  lastName: string;
  gradYear?: number;
  group?: 'Varsity' | 'JV' | string;
  active: boolean;
}

export interface Meet {
  id: ID;
  name: string;
  date: string;
  location?: string;
  course: Course;
  seasonId: ID;
}

export interface EventDef {
  id: ID;
  distanceYards: number;
  stroke: Stroke;
  isRelay: boolean;
  label: string;
}

export type ResultStatus = 'OK' | 'DQ' | 'DNS' | 'Exhibition';

export interface IndividualResult {
  id: ID;
  swimmerId: ID;
  meetId: ID;
  eventDefId: ID;
  heat?: number;
  lane?: number;
  timeMs: number;
  splitsMs?: number[];
  status: ResultStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RelayLeg {
  order: 1 | 2 | 3 | 4;
  swimmerId: ID;
  splitMs: number;
}

export interface RelayResult {
  id: ID;
  meetId: ID;
  eventDefId: ID;
  teamLabel: 'A' | 'B' | 'C' | string;
  timeMs: number;
  status: ResultStatus;
  notes?: string;
  legs: RelayLeg[];
  createdAt: string;
  updatedAt: string;
}

export interface RecordRow {
  id: ID;
  eventDefId: ID;
  isRelay: boolean;
  holderSwimmerIds?: ID[];
  holderRelaySwimmerIds?: ID[];
  timeMs: number;
  meetId?: ID;
  date: string;
}

export interface SettingRow {
  id: ID;
  key: string;
  value: unknown;
}

export interface AuditLogEntry {
  id: ID;
  entityType: 'individualResult' | 'relayResult';
  entityId: ID;
  timestamp: string;
  action: 'create' | 'update';
  payload: unknown;
}
