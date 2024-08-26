import { XRect } from './shared';

import { IoTransItemKind } from './tIo';
import { ApiIoTrans } from './tIo';
import { ApiTransSourceIn, ApiTransSourceOut } from './ts';
import { QDoc } from './query';
import { RunCode } from './trans';

import { Filter } from '../filters/filter';

export const DATA_IN = 'dataIn';
export const DATA_OUT = 'dataOut';
export const VERIFY = 'verify';
export const TRANSPARAMS = 'transParams';


export const DONT_ERASE_TEMPS = '_dont_erase_';
export const SKIP = '_skip_';

export const IN_ARROW = '_in_arrow_';
export const SAME_AS_SOURCE = '_same_as_source_';

export const DONT_ERASE_TEMPS_PRETTY = `Don't erase temporary tables`;
export const IN_ARROW_PRETTY = 'From in-arrow';
export const SAME_AS_SOURCE_PRETTY = 'Same as source';

export enum FilterRequest {
  paramsGetDefalt,
  paramsToModal,
  paramsFromModal,
  readParams,
  writePrams,
  editData,
}

export enum FilterParamType {
  undef = 'undef',
  button = 'button',
  num = 'num',
  str = 'str',
  date = 'date',
  bool = 'bool',
  tableName = 'tableName',
  numDropdown = 'numberDropdown',
  strDropdown = 'strDropdown',
  datePicker = 'datePicker',
  tablePicker = 'tablePicker',
  displayList = 'displayList',  // display only
}

export enum FilterTablePicker {
  undef = '',
  no = 'no',
  // all = 'all',
  allIn = 'allIn',
  // allOut = 'allOut',
  tables = 'tables',
  tablesIn = 'tablesIn',
  queries = 'queries',
  transformers = 'transformers',
  tablesAndQueries = 'tableAndQueries',
}

export type FilterParam = {
  displayName: string;
  name: string;
  tp: FilterParamType;
  value: any;
  placeholder: string | string[];
};

export type RunFilterParam = {
  fp: FilterParam;
  error: string;
};

type FilterCoreDef = {
  name: string;
  itemIx: number;
  dfltDisplayName: string;
  displayName: string;
  inputDbTableLabel: string;
  inputDbTable: string;
  inputDbTablePicker: FilterTablePicker;
  outputDbTableLabel: string;
  outputDbTable: string;
  hideIsTemporary: boolean;
  isTemporary: boolean;
  canInheritErrors: boolean;
  changeDate: string;
  fixDate: string;
};

export type FilterDef = {
  fc: FilterCoreDef;
  params: FilterParam[];
};

export type RunFilterDef = {
  fc: FilterCoreDef;
  rParams: RunFilterParam[];
};

// A wrapper of FilterDef for tdoc
export type FilterRef = {
  def: FilterDef;
};

export type FilterReturn = FilterDef | RunFilterDef | undefined;

export type FilterFunc = (
  te: any,
  request: FilterRequest,
  data: any,
) => Promise<[RunCode, FilterReturn]>;

// export type FilterHandler = {
//   displayName: string;
//   name: string;
//   func: FilterFunc;
// };

export type FilterSpec = {
  displayName: string;
  name: string;
  handler: Filter;
};

export const filterFormValue = (
  value: any,
  tp: FilterParamType,
): string => {
  switch (tp) {
    case FilterParamType.undef: return undefined;
    case FilterParamType.numDropdown:
    case FilterParamType.num: return ( value as number ).toString();
    case FilterParamType.strDropdown:
    case FilterParamType.str: return `"${value}"`;
    case FilterParamType.tableName: return `"${value}"`;
    case FilterParamType.tablePicker: return `"${value}"`;
    case FilterParamType.bool:
      return value as boolean ? 'true' : 'false';
    default: return 'unknown type';
  }
};

// export const filterFormValue = (
//   value: any,
//   tp: FilterParamType,
// ): string => {
//   switch (tp) {
//     case FilterParamType.undefined: return undefined;
//     case FilterParamType.number: return ( value as number ).toString();
//     case FilterParamType.string: return `"${value}"`;
//     case FilterParamType.boolean:
//       return value;
//     default: return 'unknown type';
//   }
// };
