import { XRect } from './shared';

import { IoTransItemKind } from './tIo';
import { ApiIoTrans } from './tIo';
import { ApiTransSourceIn, ApiTransSourceOut } from './ts';
import { QDoc } from './query';
import { FilterDef } from './filter';
import { Integrity } from '../api/data-eng.service';

export enum RunCode {
  success,
  error,
  successRunIsDone,
  errorForceStop,
  errorContinue,
  // add specific errors below
  fileDoesNotExist,
  errorReading,
}

export type TransItemType = 'T' | 'Q' | 'F' | 'H';

// export type TransItemKind =
//   'transQuery' |
//   'transFilter' |
//   'transTrans' |
//   'arrow' |
//   'filter';

export type TransItem = {
  displayName: string;
  dbItemName: string;
  itemKind: IoTransItemKind;
  itemIx: number;
  rect: XRect;
  changeDate: string;
  fixDate: string;
};

// Added indexes because the same filter, query, or transformer
// may be used several times
export type TransArrow = {
  fromDbItemName: string;
  toDbItemName: string;
  fromIx: number;
  toIx: number;
};

// export type Filter = {
//   filterName: string;
// };

export type TransIntegrityItem = {
  dbItemName: string;
  changeDate: string;
  ok: boolean;
};

export type TDoc = {
  id: number;
  ttype: TransItemType;
  tsiId: number;
  tsoId: number;
  dbTransName: string;
  okDate: string;
  oldDbTransName: string;
  openedWithError: boolean;

  transItems: TransItem[];
  arrows: TransArrow[];
  filters: FilterDef[];

  integrityItems: TransIntegrityItem[];

  // list of child item ids to reuse when writing back to db
  itemIds: number[];
  tsiItemIds: number[];
  tsoItemIds: number[];

  creator: string;
  modifier: string;
  created: string;
  modified: string;

  apiIoTrans: ApiIoTrans;
  apiTsi: ApiTransSourceIn;
  apiTso: ApiTransSourceOut;

  apiIoIx: number;

  // Runtime support
  execItems: ExecItem[];
  execOrder: number[];
  // endPoints: number[];
  dataOuts: number[];
  integrityErrors: string[];
  propagateErrors: PropagateError[];

  selfExec: ExecItem;
};

export type XDoc = TDoc | QDoc | FilterDef | undefined;

// export type ExParameter = {
//   name: string;
//   value: string;
// };

// For transformer execution

export type ExecItem = {
  ttype: TransItemType;
  dbItemName: string;
  itemIx: number;
  xdoc: XDoc;
  dependsOn: number[];
  inputDbTableName: string;
  outputDbTableName: string;
  errorCode: RunCode;
  integrityCode: Integrity;
  canInheritErrors: boolean;
  integrityErrors: string[];
};

export type ReportItem = {
  dbTableName: string;
  status: string;
  rowCount: number;
  writtenAt: string;
  duration: number;
  hasError: boolean;
};

export type ErrorItem = {
  transPath: string;
  transItemName: string;
  transItemParent: string;
  dbTableName: string;
  time: string;
  error: string;
};

export type PropagateError = {
  sourceIx: number;
  message: string;
};
