import { IoJust, IoConstraintOperator } from './qIo';

export enum ValueType {
  undef,
  num,
  str,
  bool,
  error,
  boolNum,  // As an expression request type
  // 'if' tests for non 0 numeric expressions as well as boolead
}

export const valueTypeToStrJS = (type: ValueType): string => {
  switch (type) {
    case ValueType.undef: return 'undefined';
    case ValueType.num: return 'number';
    case ValueType.str: return 'string';
    case ValueType.bool: return 'boolean';
    default: return 'error';
  }
};

export const dbDataTypeToStrJS = (dbType: string): string => {
  const valueType = dbTypeToValueType(dbType);
  return valueTypeToStrJS(valueType);
};

export const valueTypeToXStr = (type: ValueType): string => {
  switch (type) {
    case ValueType.undef: return 'TYPE_UNDEF';
    case ValueType.num: return 'TYPE_NUM';
    case ValueType.str: return 'TYPE_STR';
    case ValueType.bool: return 'TYPE_BOOL';
    default: return 'TYPE_ERR';
  }
};

export const valueTypeToStr = (type: ValueType): string => {
  switch (type) {
    case ValueType.undef: return 'TYPE_UNDEF';
    case ValueType.num: return 'TYPE_NUM';
    case ValueType.str: return 'TYPE_STR';
    case ValueType.bool: return 'TYPE_BOOL';
    default: return 'TYPE_ERR';
  }
};

export const strToValueType = (str: string): ValueType => {
  switch (str) {
    case undefined: return ValueType.error;
    case 'TYPE_UNDEF': return ValueType.undef;
    case 'TYPE_NUM': return ValueType.num;
    case 'TYPE_STR': return ValueType.str;
    case 'TYPE_BOOL': return ValueType.bool;
    default: return ValueType.error;
  }
};

export type Val = number | string | boolean;

export type Value = {
  type: ValueType;
  val: number | string | boolean;
};

export const dbTypeToValueType = (dbType: string): ValueType => {
  if (
    dbType.includes('int') ||
    dbType.includes('bigint') ||
    dbType.includes('DdecEC') ||
    dbType.includes('float') ||
    dbType.includes('double') ||
    dbType.includes('real')
  ) {
    // for later
    // const isUnsigned = typeInfo.includes('UNSIGNED');
    return ValueType.num;
  }
  if (
    dbType.includes('char') ||
    dbType.includes('binary') ||
    dbType.includes('blob') ||
    dbType.includes('text') ||
    dbType.includes('enum') ||
    dbType.includes('set')
  ) {
  return ValueType.str;
  }
  if (
    dbType.includes('bit')
  ) {
  return ValueType.bool;
  }
  return ValueType.undef;
};

export const valueToDbgStr = (value: Value): string => {
  switch (value.type) {
    case ValueType.undef: return 'undef';
    case ValueType.num: return value.val.toString();
    case ValueType.str: return `'${value.val}'`;
    case ValueType.bool: return value.val === 0 ? 'false' : 'true';
    case ValueType.error: return 'error';
    default: return 'unknown type';
  }
};

export const valueToStr = (value: Value): string => {
  switch (value?.type) {
    case ValueType.num: return `${value.val as number}`;
    case ValueType.str: return `${value.val as string}`;
    case ValueType.bool: return `${value.val as boolean}`;
    case ValueType.error: return `ERROR`;
    default: return 'error'; // Lower case to differentiate from ERROR
  }
};

export const strToIoStr = (str: string, tp: ValueType): string => {
  switch (tp) {
    case ValueType.num: return str;
    case ValueType.str: return `'${str}'`;
    case ValueType.bool: return `${str === 'true' ? '1' : '0'}`;
  }
  return '';
};

export enum DbDataType {
  undef,
  int,
  double,
  bool,
  varchar,
  date,
  datetime,
}

export const dbDataTypeToStr = (dbType: DbDataType, len: number): string => {
  switch (dbType) {
    case DbDataType.int: return 'int';
    case DbDataType.double: return 'double';
    case DbDataType.bool: return 'boolean';
    case DbDataType.varchar: return `varchar(${len})`;
    case DbDataType.date: return 'date';
    case DbDataType.datetime: return 'datetime';
    case DbDataType.undef: return 'default';
    default: return '';
  }
};

export const valueTypeToDbStr = (type: ValueType, len: number): string => {
  let dbType = DbDataType.undef;
  switch (type) {
    case ValueType.num:
      dbType = DbDataType.double;
      break;
    case ValueType.str:
      dbType = DbDataType.varchar;
      break;
    case ValueType.bool:
      dbType = DbDataType.bool;
      break;
    // case ValueType.date:
    //   dbType = DbDataType.date;
    //   break;
    // case ValueType.datetime:
    //   dbType = DbDataType.datetime;
    //   break;
  }
  return dbDataTypeToStr(dbType, len);
};

export const valueTypeToDefaultDbStr = (type: ValueType): string =>
  valueTypeToDbStr(type, 80);

export enum Just {
  default,
  left,
  center,
  right,
}

export const justToIoStr = (just: Just): string => {
  switch (just) {
    case Just.left: return 'JUST_LEFT';
    case Just.center: return 'JUST_CENTER';
    case Just.right: return 'JUST_RIGHT';
    case Just.default: return 'JUST_DEFAULT';
    default: return '';
  }
};

export const ioStrToJust = (just: IoJust): Just => {
  switch (just) {
    case 'JUST_LEFT': return Just.left;
    case 'JUST_CENTER': return Just.center;
    case 'JUST_RIGHT': return Just.right;
    case 'JUST_DEFAULT': return Just.default;
    default: return Just.default;
  }
};

export enum CompareOp {
  undef,
  eq,
  ne,
  lt,
  le,
  gt,
  ge,
  in,
}

export const compareOpToStr = (op: CompareOp): string => {
  switch (op) {
    case CompareOp.eq: return '=';
    case CompareOp.ne: return '<>';
    case CompareOp.lt: return '<';
    case CompareOp.le: return '<=';
    case CompareOp.gt: return '>';
    case CompareOp.ge: return '>=';
    case CompareOp.in: return 'in';
    default: return '';
  }
};

export const compareOpToIoStr = (op: CompareOp): string => {
  if (op === CompareOp.ne) {
    return `!=`;
  }
  return compareOpToStr(op);
};

export const strToCompareOp = (str: string): CompareOp => {
  switch (str) {
    case '=': return CompareOp.eq;
    case '<>': return CompareOp.ne;
    case '<': return CompareOp.lt;
    case '<=': return CompareOp.le;
    case '>': return CompareOp.gt;
    case '>=': return CompareOp.ge;
    case 'in': return CompareOp.in;
  }
  return CompareOp.undef;
};

export const ioStrToCompareOp = (str: string): CompareOp => {
  if (str === '!=') {
    return CompareOp.ne;
  }
  return strToCompareOp(str);
};

export enum AggregateOp {
  undef,
  avg,
  count,
  max,
  min,
  stdDevPop,
  stdDevSamp,
  sum,
  varPop,
  varSamp,
}

export enum AggCode {
  placeHolder,
  breakCume,
}

export type AggSupportInfo = {
  code: AggCode;
  valueColumnIx: number;
  ix: number; // self index in computedDef array
};

// These strings have to be matched by entries in compute engine dictionary
export const aggSupportCodeToStr = (code: AggCode): string => {
  switch (code) {
    case AggCode.breakCume: return '_breakCume_';
    default: return '';
  }
};

export class FormatInfo {
  constructor(
    public currencySymbol = '',
    public hasCommas= false,
    public decimalPoint = -1,
    public decimalsZeroCount = 0,
    public decimalsPoundCount = 0,
    public zeroCount = 0,
  ) {}
}

export type Code = number | Val;

export type CodeSeg = {
  formats: FormatInfo[];
  formatCount: number;
  code: Code[];
};

export enum AggType {
  none,
  support,
  agg,
}

export type CodeUnit = CodeSeg & {
  dependentOn: number[];  // data columns negative - computed positive
  source: string;
  type: ValueType;
  aggSupportIx: number;
  reversePass: boolean;
  aggType: AggType;
  isReady: boolean;
  ix: number; // dataEng.compColumnDefs[ ix ]
};

export type NumSortRec = {
  num: number;
  ix: number;
};

export type StrSortRec = {
  str: number;
  ix: number;
};
