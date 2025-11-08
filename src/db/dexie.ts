import Dexie, { Table } from 'dexie';
import type {
  AuditLogEntry,
  EventDef,
  IndividualResult,
  Meet,
  RecordRow,
  RelayResult,
  Season,
  SettingRow,
  Swimmer
} from '../lib/types';

export class SwimDB extends Dexie {
  seasons!: Table<Season, string>;
  swimmers!: Table<Swimmer, string>;
  meets!: Table<Meet, string>;
  events!: Table<EventDef, string>;
  individualResults!: Table<IndividualResult, string>;
  relayResults!: Table<RelayResult, string>;
  records!: Table<RecordRow, string>;
  settings!: Table<SettingRow, string>;
  auditLog!: Table<AuditLogEntry, string>;

  constructor() {
    super('granvilleSwimTracker');

    this.version(1).stores({
      seasons: '&id, active',
      swimmers: '&id, lastName, active',
      meets: '&id, seasonId, date',
      events: '&id, stroke, isRelay',
      individualResults:
        '&id, swimmerId, eventDefId, meetId, status, createdAt, updatedAt',
      relayResults: '&id, eventDefId, meetId, teamLabel',
      records: '&id, eventDefId, isRelay',
      settings: '&id, key',
      auditLog: '&id, entityType, entityId, timestamp'
    });

    this.version(2)
      .stores({
        individualResults:
          '&id, swimmerId, eventDefId, meetId, status, createdAt, updatedAt, timeMs',
        relayResults: '&id, eventDefId, meetId, teamLabel, timeMs'
      })
      .upgrade((tx) => {
        return tx
          .table('individualResults')
          .toCollection()
          .modify((result: IndividualResult) => {
            result.updatedAt = result.updatedAt || new Date().toISOString();
          });
      });
  }
}

export const db = new SwimDB();
