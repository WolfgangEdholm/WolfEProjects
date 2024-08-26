// Data types to support reading database info such as
// 'show databases' 'show tables' etc.
// import { IoJoinOperator, IoConstraintOperator } from './io';
import { CompareOp, ValueType } from './compute';

export type Database = {
  databaseName: string;
};

export type ApiColumnDef = {
  columnName: string;
  type: string;
  null: string;
  key: string;
  default: string;
  extra: string;
};

export type ForeignKey = {
  tableName: string;
  columnName: string;
  refTableName: string;
  refColumnName: string;
};

// Should be moved?
export type Constraint = {
  tableName: string;
  columnName: string;
  compareOp: CompareOp;
  valuesStr: string;
  tp: ValueType;
};

export type DbColumn = ApiColumnDef & {
  constraint: Constraint;
  hasDataSourceInfo: boolean;
};

export const columnDefIsNullAllowed = (columnDef: DbColumn): boolean =>
  columnDef.null === 'YES';

export type ApiTable = {
  tableName: string;
  columns: DbColumn[];
};

export type Table = ApiTable & {
  dbTableName: string;
  isOpen: boolean;
  hasDataSourceInfo: boolean;
};

export type QueryRequest = {
  request: string;
};

export type WriteMode =
  'write' | 'append' ;

export type QuerySave = {
  writeMode: WriteMode;
  deleteSql: string;
  createSql: string[];
  saveSql: string[];
  dbOutputTable: string;
  primaryIndexColumn: number;
};

export type TableWrapper = {
  table: any[];
};
