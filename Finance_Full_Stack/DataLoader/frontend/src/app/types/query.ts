import { XRect } from './shared';
// import { IoConstraintOperator, IoJoinOperator } from './io';
// import { IoQueryItemKind, IoJust } from './io';
import { ValueType, CompareOp, Just } from './compute';
import { ApiIoQuery } from './qIo';
import { ApiDataIntegrity, ApiStructIntegrity } from './integrity';
import { TransItemType } from './trans';
import { Uuid } from '../api/data-eng.service';

export enum AggSibling {
  active = -998,
  inactive = -999,
}

// export type SourceTable = SourceItem & {
//   columns: SourceItem[];
// };

// export type SourceDatabase = SourceItem & {
//   tables: SourceTable[];
// };

export type QueryTable = {
  displayName: string;
  dbTblSource: string;
  rect: XRect;
};

export type QueryJoin = {
  dbTblColSource1: string;
  dbTblColSource2: string;
  operator: CompareOp; // for now eq
  isAuto: boolean;
};

export type QueryConstraint = {
  // db.table.field.
  // if only field -> computed select field (Having clause)
  sourceColumn: string;
  operator: CompareOp;
  values: string[];
};

export type QueryRequestColumn = {
  displayName: string;
  dbTblColSource: string;
  format: string;
  seqNum: number;
  uuid: Uuid;
};

export type QueryWorkColumn = {
  name: string; // the name the column is referenced by
  uuid: number;
  source: string; // code or name in select statement;
  isComputed: boolean;
  isHidden: boolean;
  notOut: boolean;
  just: Just;
  computedType: ValueType;
  dbType: string;
  aggSibling: AggSibling;
  changeDate: string;
  fixDate: string;
};

export type QueryParams = {
  displayedColumns: number[];
  sortIndexes: number[];
  sortDirections: number[];
  uuidGen: number;
  rcSeqNumGen: number;
};

export type QueryStructIntegrityItem = {
  dbTblColSource: string;
  changeDate: string;
  type: string;
  oldType: string;
  ok: boolean;
};

// export type QueryIntegrityParam = {
//   outOfSyncDate: string;
// };

export type QDoc = {
  id: number;
  ttype: TransItemType;
  diId: number;
  siId: number;
  dbQueryName: string;
  okDate: string;
  oldDbQueryName: string;
  openedWithError: boolean;
  outputIsTemporary: boolean;
  params: QueryParams;

  queryTables: QueryTable[];
  queryJoins: QueryJoin[];
  queryConstraints: QueryConstraint[];
  requestColumns: QueryRequestColumn[];
  workColumns: QueryWorkColumn[];
  integrityItems: QueryStructIntegrityItem[];

  // list of child item ids to reuse when writing back to db
  itemIds: number[];
  diItemIds: number[];
  siItemIds: number[];

  creator: string;
  modifier: string;
  created: string;
  modified: string;

  apiIoQuery: ApiIoQuery;
  apiDi: ApiDataIntegrity;
  apiSi: ApiStructIntegrity;

  apiIoIx: number;
};
