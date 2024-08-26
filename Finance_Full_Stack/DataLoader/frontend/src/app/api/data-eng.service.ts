import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { MatSortable, SortDirection } from '@angular/material/sort';
import { RepoService } from './repo.service';
import { DbEngService } from './db-eng.service';
import { UiRequestColumn } from '../ui/ui-request';
import { UiTable } from '../ui/ui-table';
import { UiJoin } from '../ui/ui-join';
import { DbColumn, Table, TableWrapper } from '../types/db';
import { Value, ValueType, Val, dbTypeToValueType } from '../types/compute';
import { CodeUnit, AggType } from '../types/compute';
import { columnDefIsNullAllowed, QuerySave, WriteMode } from '../types/db';
import { Just } from '../types/compute';
import { strToIoStr, compareOpToIoStr, CompareOp } from '../types/compute';
import { AggCode, AggSupportInfo } from '../types/compute';
import { valueToStr } from '../types/compute';
import { ComputeService } from '../code/compute.service';
import { QueryCoreService } from '../core/query-core.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Point } from '@angular/cdk/drag-drop';
import { IN_ARROW, SAME_AS_SOURCE, IN_ARROW_PRETTY,
  SAME_AS_SOURCE_PRETTY, SKIP,
} from '../types/filter';
import { nowString } from '../utils/date';
import { AggSibling } from '../types/query';
import { singleAgg } from '../code/compute.service';
import { RunCode } from '../types/trans';
import { requestColumn0 } from '../ui/constants';
import { moveArrayItems } from '../utils/array';
import { codeDebug } from '../../constants';


// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export enum WorkData {
  rowNum = '#',
  groupBy = 'groupBy',
  groupByEnd = 'groupByEnd',
}
// export const WorkData.rowNum = '#';
// export const WorkData.groupByEnd = 'groupByEnd';
// export const WorkData.groupBy = 'groupBy';

export enum WorkDataCode  {
  groupByEnd = -1001,
}
// export const WorkDataCode.groupByEnd = -1001;

// const WORK_rowMasterFixedDelta = 2; // rowNum + groupBy
// const WORK_rowMasterAfterGroupEnd = 3;
// const WORK_groupMasterFixedDelta = 2; // groupBy


const groupByPos = 1;

export const UUID_START = 1000;

export enum Uuid {
  skip = -2,
  generate = -1,
  rowNum = UUID_START + 0,
  groupBy = UUID_START + 1,
  groupByEnd = UUID_START + 2,
  init = UUID_START + 3,
}

export enum DisplayChangeSource {
  query = 'query',                // Query Screen
  work = 'work',                  // Data Screen
  groupDisplay = 'groupDisplay',  // Data Screen in group display mode
}

const aggSiblingsArePermanent = true;

const NUM_NULL = 0;
const BOOL_NULL = false;
const STR_NULL = '';

const dataUrl = `api/query`;

const showWrittenRows = false;
const showListCommand = true;

const sw = '`';   // string wrapper in table definition SQL

export type WorkColumn = {
  displayName: string;
  uuid: Uuid;
  v: number;
  ix: number;
  displayIx: number;
  groupDisplayIx: number;
};

export type WorkSpace = {
  columns: WorkColumn[];
};

export type ColumnDef = {
  displayName: string;
  uuid: number;
  type: ValueType;
  just: Just;
  displayedIx: number;
  isVisible: boolean;
  doNotOutput: boolean;
  changeDate: string; // Date for change that requires downstreem adjustments
  integrityCode: Integrity;
  dbType: string;
  aggSibling: number;
  sortDirection: number;
  isComputed: boolean;
  ix: number;
};

export enum Integrity {
  ok = 0,
  error = 1,
  errorDownstreamOfChange = 2,
  errorMask = 7,
  warning = 4,
  downstreamOfError = 8,
  warningMask = 12,
  hidden = 16,
  downstremChangesNecessary = 32,
  upstremChangesFixed = 64,
  hiddenMask = 112,
}

export type DataColumnDef = ColumnDef & {
  sourceName: string;
  dbTblColSource: string;
  hasNulls: boolean;
  maxLength: number;
  fixDate: string; // Date for adjustments to an upstream change
};

export type ComputedColumnDef = ColumnDef & {
  codeUnit: CodeUnit;
  isAggSibling: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class DataEngService {
  // Required fields
  public isLoading = false;

  // rowMasterNames and rowFixedNames are permanet versions of
  // displayNames and fixedColumns;
  public rowMasterUuids: number[] = [];
  public rowMasterNames: string[] = [];
  public rowMasterIndexes: number[] = [];
  public rowFixedUuids: number[] = [];
  public rowFixedNames: string[] = [];
  public rowFixedIndexes: number[] = [];

  public groupMasterUuids: string[] = [];
  public groupMasterNames: string[] = [];
  public groupMasterIndexes: number[] = [];
  public groupFixedNames: string[] = [];
  public groupFixedIndexes: number[] = [];

  public currMasterNames: string[];
  public currMasterIndexes: number[];
  public currFixedNames: string[];
  public currFixedIndexes: number[];

  public displayChangeSource: DisplayChangeSource;

  // public displayedColumns: string[] = [];
  // public displayedIndexes: number[] = [];
  // public fixedColumns: string[] = [];
  // public fixedIndexes: number[] = [];

  // public bupDataNames: string[] = [];
  // public bupCompNames: string[] = [];

  public isGroupDisplay = false;
  public groupEnd = -1;
  public dataDate: string;

  // should this be removed?
  public dataSpace = {
    columns: [],
  };

  public dataColumnDefs: DataColumnDef[] = [];
  public compColumnDefs: ComputedColumnDef[] = [];
  public firstAggSiblingIx = -1;

  public dataRows: any[];
  public sortDataRows: number[] = [];
  public computedColumns: any[] = [];

  public groupRows: number[] = [];
  public sortGroupRows: number[] = [];

  public isUnsorted: boolean;

  public aggSupport: AggSupportInfo[] = [];

  public sortIndexes: number[] = [];
  public sortDirections: number[] = [];

  // Sticky table UI support
  // public bupDisplayedColumns: string[];
  // public bupIndexNames: number[];
  // public bupDisplayIndex: number[] = [];
  public currSortable: MatSortable;
  public currPageSize = 0;

  // public dataColumnsRearranged = false;
  // public computedColumnsRearranged = false;

  public listRows: any[];

  public aggSiblingsArePermanent = aggSiblingsArePermanent;

  private executionOrder: number[] = [];

  // Not constructor injected to avoid circular reference
  private computeEng: ComputeService;
  private codeDebug: boolean;

  constructor(
    public repo: RepoService,
    public db: DbEngService,
    public qc: QueryCoreService,
  ) {
  }

  // Not constructor injected to avoid circular reference
  public hookupComputeEng(eng: ComputeService, cdDebug: boolean): void {
    this.computeEng = eng;
    this.codeDebug = cdDebug;
  }

  public initArrays(): void {
    this.addComputedColumn(WorkData.groupBy, false);
    // this.sortIndexes.push(0);
    // this.sortDirections.push(0);
  }


  // Table Data Access Methods 2345678941234567895123456789612345678971234567898

  // return 0 - not found
  // return > 0 found data column
  // reiturn < 0 found computed column
  public findColumn(columnName: string): number {
    const dc = this.dataColumnDefs.find(c => c.displayName === columnName);
    // const dc = this.dataColumnDefs.find(c =>
    // {
    //   console.log('++++++++++++++', c.displayName, columnName);
    //   return c.displayName === columnName;
    // });
    if (dc) {
      return dc.ix + 1;
    }
    const cc = this.compColumnDefs.find(c => c.displayName === columnName);
    // const cc = this.compColumnDefs.find(c =>
    // {
    //   console.log('--------------', c.displayName, columnName);
    //   return c.displayName === columnName;
    // });
    if (cc) {
      return -(cc.ix + 1);
    }
    return 0;
  }

  // Combined type < 0 computed, > 0 data
  public getColumnType(combinedIx: number): ValueType {
    // console.log('getColumnType ix', combinedIx);
    if (combinedIx > 0) {
      return this.dataColumnDefs[combinedIx - 1].type;
    }
    return this.compColumnDefs[-combinedIx - 1].type;
  }

  public getDataColumnValOnly(columnIx: number, rowNm: number): Val {
    const colDef = this.dataColumnDefs[columnIx];
    const name = colDef.sourceName;
    return this.dataRows[rowNm][name];
  }

  public getComputedColumnValOnly(columnIx: number, rowNm: number): Val {
    const value = this.computedColumns[columnIx][rowNm];
    return value.val;
  }

  public getDataColumnValue(
    columnIx: number, rowNm: number, arr: Value[]): void {
    const colDef = this.dataColumnDefs[columnIx];
    const name = colDef.sourceName;
    arr.push({ type: colDef.type, val: this.dataRows[rowNm][name] });
  }

  public getComputedColumnValue(
    columnIx: number, rowNm: number, arr: Value[]): void {
    const value = this.computedColumns[columnIx][rowNm];
    arr.push({ type: value.type, val: value.val });
  }

  public getColumnInfo(columnCd: number): ColumnDef {
    if (columnCd < 0) {
      return this.compColumnDefs[-columnCd - 1] as ColumnDef;
    }
    return this.dataColumnDefs[columnCd] as ColumnDef;
  }

  // Table Sort Methods 56789312345678941234567895123456789612345678971234567898

  public sortValues = (a: number, b: number): number => {
    const aRowNm = this.sortDataRows[a];
    const bRowNm = this.sortDataRows[b];
    let aVal: any;
    let bVal: any;
    for (let i = 0; i < this.sortIndexes.length; i++) {
      const v = this.currMasterIndexes[this.sortIndexes[i]];
      if (v === WorkDataCode.groupByEnd) {
        return 0;
      }
      aVal = v < 0
        ? this.getComputedColumnValOnly(-v - 1, aRowNm)
        : this.getDataColumnValOnly(v, aRowNm);
      bVal = v < 0
        ? this.getComputedColumnValOnly(-v - 1, bRowNm)
        : this.getDataColumnValOnly(v, bRowNm);
      if (aVal < bVal) {
        return this.sortDirections[i] < 0 ? 1 : -1;
      }
      if (aVal > bVal) {
        return this.sortDirections[i] < 0 ? -1 : 1;
      }
    }
    return 0;
  };

  public sort(): void {
    // console.log('SORTING', ...this.sortIndexes, 'DIR',
    //   ...this.sortDirections);
    // for (let i = 0; i < this.sortDataRows.length; i++) {
    //   const v = this.sortDataRows[i];
    //   console.log(i, v, this.dataRows[v]);
    // }
    // console.log('sorting', this.sortIndexes,
    // 'directions', this.sortDirections);
    this.sortDataRows.sort(this.sortValues);
    // console.log('SORTED', ...this.sortDataRows);
    // for (let i = 0; i < this.sortDataRows.length; i++) {
    //   const v = this.sortDataRows[i];
    //   console.log(i, v, this.dataRows[v]);
    // }
    // console.log('SORT ARRAY', ...this.sortDataRows);
  }

  public dataSort(): void {
    this.sortDataRows = Array.from(Array(this.dataRows.length).keys());
    this.sort();
    if (this.hasGroupBy()) {
      this.recalculateGroupByCodes();
      this.calculateGroupRows();
    }
  }

  public getSortDirection(columnCd: number): number {
    return this.getColumnInfo(columnCd).sortDirection;
  }

  public setSortDirection(columnCd: number, direction: number): void {
    this.getColumnInfo(columnCd).sortDirection = direction;
  }

  public sortDirectionToNum(direction: SortDirection): number {
    return direction === 'desc'
      ? -1
      : direction === 'asc'
        ? 1
        : 0;
  }

  public sortDirectionFromNum(numDirection: number): SortDirection {
    return numDirection === 1
      ? 'asc'
      : numDirection === -1
        ? 'desc'
        : '';
  }

  // Work Column Methods 6789312345678941234567895123456789612345678971234567898

  public newWorkColumn(displayName: string, uuid: Uuid): WorkColumn {
    const column = {
      displayName,
      uuid,
      v: -1000,
      ix: -1,
      displayIx: -1,
      groupDisplayIx: -1,
    } as WorkColumn;
    return column;
  }

  public addWorkColumn(
    displayName: string,
    uuid: Uuid,
    v: number,
  ): WorkColumn {
    const column = this.newWorkColumn(displayName, uuid);
    column.v = v;
    column.ix = this.dataSpace.columns.length;
    column.displayIx = this.dataSpace.columns.length;
    this.dataSpace.columns.push(column);
    return column;
  }

  public deleteOneWorkColumn(ix: number): void {
    const deleted = this.dataSpace.columns.splice(ix, 1)[0];
    for (let i = this.dataSpace.columns.length; 0 < i--;) {
      const remaining = this.dataSpace.columns[i];
      if (remaining.displayIx > deleted.displayIx) {
        remaining.displayIx -= 1;
      }
      remaining.ix = i;
    }
  }

  public deleteWorkColumns(list: number[]): void {
    list.sort((a, b) => a - b);
    for (let i = list.length; 0 < i--;) {
      this.deleteOneWorkColumn(this.dataSpace.columns[list[i]]);
    }
  }

  // Computed Column Methods 312345678941234567895123456789612345678971234567898

  public newComputedColumn(
    name: string
  ): ComputedColumnDef {
    const computed = {
      displayName: name,
      type: ValueType.undef,
      just: Just.default,
      codeUnit: {
        source: undefined,
        formats: undefined,
        formatCount: undefined,
        code: undefined,
        dependentOn: undefined,
        type: ValueType.undef,
        aggSupportIx: -1,
        reversePass: false,
        aggType: AggType.none,
        isReady: false,
        ix: this.compColumnDefs.length,
      } as CodeUnit,
      isVisible: false,
      doNotOutput: false,
      displayedIx: -1,
      changeDate: '',
      integrityCode: Integrity.ok,
      dbType: 'defalut',
      aggSibling: AggSibling.active,
      sortDirection: 0,
      isComputed: true,
      ix: -1,
    } as ComputedColumnDef;
    return computed;
  }

  public addComputedColumn(
    name: string,
    isVisible: boolean,
    uuid: number = -1,
  ): ComputedColumnDef {
    const computed = this.newComputedColumn(name);
    if (name === WorkData.groupBy) {
      computed.uuid = Uuid.groupBy;
    } else if (name === WorkData.groupByEnd) {
      computed.uuid = Uuid.groupByEnd;
    } else {
      computed.uuid = uuid === Uuid.skip ? Uuid.skip :
      uuid === Uuid.generate ? this.qc.uuidGen++ : uuid;
    }
    computed.codeUnit.aggSupportIx = -1;
    computed.isVisible = isVisible;
    computed.ix = this.compColumnDefs.length;
    this.compColumnDefs.push(computed);

    if (isVisible) {
      computed.displayedIx = this.rowFixedNames.length;
      this.rowFixedIndexes.push(-this.compColumnDefs.length);
      this.rowFixedUuids.push(computed.uuid);
      this.rowFixedNames.push(name);
      this.rowFixedIndexes.push(-this.compColumnDefs.length);
      this.rowMasterUuids.push(computed.uuid);
      this.rowMasterNames.push(name);
      this.rowMasterIndexes.push(-this.compColumnDefs.length);
      // this.fixedColumns.push(name);
      // this.fixedIndexes.push(-this.compColumnDefs.length);
      // this.displayedColumns.push(name);
      // this.displayedIndexes.push(-this.compColumnDefs.length);
    }
    return computed;
  }

  public addComputedColumnWithSource(
    name: string,
    isVisible: boolean,
    source: string,
    skipCompile: boolean = false,
    uuid: number = -1,
  ): ComputedColumnDef {
    const computed = this.addComputedColumn(name, isVisible, uuid);
    computed.codeUnit.source = source;
    if (!skipCompile) {
      computed.type = this.computeEng.compileCode(
        computed.codeUnit, this.dummyErrorDisplayFunc);
      computed.type = computed.codeUnit.type;
    }
    computed.codeUnit.isReady = true;
    return computed;
  }

  public removeComputedColumn(computedIx: number): void {
    const cCol = this.compColumnDefs[computedIx];
    const uuid = cCol.uuid;
    if (this.currSortable?.id === cCol.displayName) {
      this.currSortable = undefined;
    }
    const aggSupportIx = this.findAggSupportByIx(computedIx);
    if (aggSupportIx > -1) {
      this.removeAggSupport(aggSupportIx);
    }
    // const displayIndex = this.displayedColumns.indexOf(name);
    // this.displayedColumns.splice(displayIndex, 1);
    // this.displayedIndexes.splice(displayIndex - 1, 1);
    // const columnIndex = this.fixedColumns.indexOf(name);
    // this.fixedColumns.splice(columnIndex, 1);
    // this.fixedIndexes.splice(columnIndex, 1);
    const masterIndex = this.rowMasterUuids.indexOf(uuid);
    this.rowMasterUuids.splice(masterIndex, 1);
    this.rowMasterNames.splice(masterIndex, 1);
    this.rowMasterIndexes.splice(masterIndex - 1, 1);
    const fixedIndex = this.rowFixedUuids.indexOf(uuid);
    this.rowFixedUuids.splice(fixedIndex, 1);
    this.rowFixedNames.splice(fixedIndex, 1);
    this.rowFixedIndexes.splice(fixedIndex, 1);
    this.compColumnDefs.splice(computedIx, 1);
    this.compColumnDefs.forEach((e, i) => {
      e.codeUnit.code = undefined;
      e.ix = i;
      e.codeUnit.ix = i;
    });
    // Adjust execution order
    for (let i = this.executionOrder.length; 0 < i--;) {
      if (this.executionOrder[i] > computedIx) {
        this.executionOrder[i] -= 1;
      }
    }
    this.executionOrder.splice(computedIx, 1);
    this.computedColumns = [];
    this.compColumnDefs.forEach((e, i) => this.compileOneComputedColumn(i));
    this.calculateComputed();
    this.qc.setRequestDirty();
    // console.log('DONE REMOVING');
    // console.log('Displayed', this.displayedColumns);
  }

  public hasGroupBy(): boolean {
    return !!this.compColumnDefs[0].codeUnit.source;
  }

  public clearGroupBy(): void {
    this.compColumnDefs[0].codeUnit.source = undefined;
    this.compColumnDefs[0].isVisible = false;
  }

  public getGroupByColumns(): string[] {
    const cu = this.compColumnDefs[0].codeUnit;
    const offset = this.codeDebug ? 2 : 1;
    const columns = [];
    if (cu.code) {
      const columnCount = cu.code[offset];
      for (let i = 0; i < columnCount; i++) {
        const colIx = cu.code[offset + i + 1] as number;
        const colName = colIx < 0
          ? this.compColumnDefs[-colIx - 1].displayName
          : this.dataColumnDefs[colIx].displayName;
        columns.push(colName);
      }
      // console.log('COLUMNS', ...columns);
    }
    return columns;
  }

  public getGroupByIndexes(): number[] {
    const cu = this.compColumnDefs[0].codeUnit;
    const indexes = [];
    if (cu && cu.code && cu.code.length > 2) {
      const offset = this.codeDebug ? 2 : 1;
      const columnCount = cu.code[offset];

      for (let i = 0; i < columnCount; i++) {
        const colIx = cu.code[offset + i + 1] as number;
        indexes.push(colIx);
      }
    }
    return indexes;
  }

  public setGroupByFromArr(columns: string[]): void {
    let codeStr = 'groupBy(';
    for (const [i, v] of columns.entries()) {
      if (i > 0) {
        codeStr += ', ';
      }
      codeStr += `"${v}"`;
    }
    codeStr += ')';
    const cCol = this.compColumnDefs[0];
    cCol.codeUnit.source = codeStr;
    cCol.codeUnit.isReady = true;
    cCol.isVisible = true;
    cCol.codeUnit.code = undefined;
    if (this.dataRows?.length > 0) {
      this.calculateComputed();
    }
  }

  // public setGroupBy(...columns: string[]): void {
  //   this.setGroupByFromArr(columns);
  // }

  public addComputedColumnDependency(
    columnIx: number,   // index of column to update
    parentIx: number,   // index of column dependent on
                        // data col -> ix negative
  ): boolean {          // true - circular dependency. false = ok
    const colDef = this.compColumnDefs[columnIx];
    if (this.addParentDependency(
      columnIx, colDef.codeUnit.dependentOn, parentIx)) {
      // circular reference
      return true;
    }
    return false;
  }

  // Data Columns have negative ix (-dCol.ix - 1)
  public checkForDependencies(ix: number): number[] {
    const matchArr = [];
    for (let i = 0; i < this.compColumnDefs.length; i++) {
      const cDef = this.compColumnDefs[i];
      if (cDef.codeUnit.dependentOn) {
        for (let j = cDef.codeUnit.dependentOn.length; 0 < j--;) {
          if (cDef.codeUnit.dependentOn[j] === ix) {
            matchArr.push(i);
            break;
          }
        }
      }
    }
    return matchArr;
  }

  public findAggSupport = (
    valIx: number, funcCode: AggCode): number => {
    for (const [i, support] of this.aggSupport.entries()) {
      if (support && support.valueColumnIx === valIx
        && support.code === funcCode) {
        return i;
      }
    }
    return -1;
  };

  public findAggSupportByIx = (computeIx: number): number => {
    for (const [i, support] of this.aggSupport.entries()) {
      if (support && support.ix === computeIx) {
        return i;
      }
    }
    return -1;
  };

  public addAggSupport = (
    valIx: number, funcCode: AggCode, ix: number,
  ): number => {
    const support = this.setAggSupport(valIx, funcCode, ix);
    for (let i = 0; i < this.aggSupport.length; i++) {
      if (!this.aggSupport[i]) {
        this.aggSupport[i] = support;
        return i;
      }
    }
    const j = this.aggSupport.length;
    this.aggSupport.push(support);
    return j;
  };

  public removeAggSupport = (ix: number): void => {
    this.aggSupport[ix] = undefined;
  };

  public calulateExecutionOrder(): void {
    this.executionOrder = [];
    const start = this.hasGroupBy() ? 1 : 0;
    for (let i = start; i < this.compColumnDefs.length; i++) {
      if (!this.compColumnDefs[i].codeUnit.dependentOn ||
        this.compColumnDefs[i].codeUnit.dependentOn.length === 0 ||
        this.compColumnDefs[i].codeUnit.dependentOn.every(e => e < 0)) {
        // No dependencies
        this.executionOrder.push(i);
      }
    }
    while (this.executionOrder.length < this.compColumnDefs.length - start) {
      for (let i = start; i < this.compColumnDefs.length; i++) {
        let skip = false;
        for (let j = this.executionOrder.length; 0 < j--;) {
          if (this.executionOrder[j] === i) {
            skip = true;
            break;
          }
        }
        if (!skip) {
          const arr = this.compColumnDefs[i].codeUnit.dependentOn;
          if (arr.every(p => this.executionOrder.includes(p) || p < 0)) {
            this.executionOrder.push(i);
          }
        }
      }
    }
  }

  public checkAllocatedComputeSpace(): void {
    this.firstAggSiblingIx = -1;
    this.compColumnDefs.forEach(c => {
      if (!c.isAggSibling) {
        if (c.ix >= this.computedColumns.length) {
          this.computedColumns.push([]);
        }
      } else if (this.firstAggSiblingIx > -1) {
        this.firstAggSiblingIx = c.ix;
      }
    });
    const end = this.firstAggSiblingIx > -1
      ? this.firstAggSiblingIx
      : this.computedColumns.length;
    this.computedColumns.slice(0, end).forEach((_, ix) =>
      this.checkAllocationSizeForOneColumn(ix));
  }

  public checkAllocatedAggSiblingSpace(): void {
    if (this.firstAggSiblingIx > -1) {
      this.compColumnDefs.slice(this.firstAggSiblingIx).forEach(c => {
        if (c.ix >= this.computedColumns.length) {
          this.computedColumns.push([]);
        }
        this.checkAllocationSizeForOneColumn(c.ix);
      });
    }
  }


  public initializeComputedColumns(): void {
    this.compileOneComputedColumn(0);
    const end = this.firstAggSiblingIx > -1
      ? this.firstAggSiblingIx
      : this.compColumnDefs.length;
    this.executionOrder = Array.from(Array(end).keys());
    // compile code to understand dependencies
    for (const ix of this.executionOrder) {
      this.compileOneComputedColumn(ix);
    }
    this.calulateExecutionOrder();
    // console.log('EXECUTE ORDER LENGTH', this.executionOrder.length,
    // ...this.executionOrder
    // );
    this.updateComputedColumnsIntegrity();
  }

  public initializeAggSiblingColumns(): void {
    if (this.firstAggSiblingIx > -1) {
      for (let ix = this.firstAggSiblingIx;
        ix < this.compColumnDefs.length; ix++) {
          this.compileOneComputedColumn(ix);
      }
    }
  }

  // Called after a computed column has been changed and recompiled.
  // Recalculates execution order and recalculates all colums
  // dependent on the changed column.
  public updateComputedColumn(columnIx: number): void {
    this.calulateExecutionOrder();
    this.checkAllocatedComputeSpace();
    for (let i = 0; i < this.executionOrder.length; i++) {
      if (this.executionOrder[i] === columnIx) {
        this.calculateOneComputedColumn(i);
        for (let j = i + 1; j < this.executionOrder.length; j++) {
          if (this.compColumnDefs[i].codeUnit.dependentOn
            .includes(columnIx)) {
            this.calculateOneComputedColumn(j);
          }
        }
      }
    }
  }

  public calculateComputed(): void {
    if (!this.dataRows || this.dataRows.length === 0) {
      // No data
      return;
    }
    if (this.compColumnDefs.length < 2
      && this.compColumnDefs[0].isVisible === false) {
      // No computed column
      return;
    }
    this.initializeComputedColumns();
    this.checkAllocatedComputeSpace();
    // group by rows compiled here, executed later
    for (let i = 0; i < this.executionOrder.length; i++) {
      if (codeDebug) {
        console.log('EXECUTE COLUMN', i);
      }
      const columnIx = this.executionOrder[i];
      this.calculateOneComputedColumn(columnIx);
    }
    if (this.isUnsorted && this.sortIndexes.length > 0) {
      this.sort();
    }
  }

  public recalculateGroupByCodes(): void {
    this.calculateOneComputedColumn(0);
  }

  public calculateAggSiblings(): void {
    this.recalculateGroupByCodes();
    if (this.hasGroupBy()) {
      this.calculateGroupRows();
    }
    this.firstAggSiblingIx = this.compColumnDefs.findIndex(
      c => c.isAggSibling);
    if (this.firstAggSiblingIx > -1
      && (this.aggSiblingsArePermanent || this.isGroupDisplay)) {
      this.initializeAggSiblingColumns();
      this.checkAllocatedAggSiblingSpace();
      for (let ix = this.firstAggSiblingIx;
        ix < this.compColumnDefs.length; ix++) {
        const dCol = this.compColumnDefs[ix];
        if (!dCol.codeUnit.reversePass) {
          if (codeDebug) {
            console.log('EXECUTE COLUMN', ix);
          }
          this.calculateOneComputedColumn(ix);
        }
      }
      // the reverse pass comes last
      for (let ix = this.firstAggSiblingIx;
        ix < this.compColumnDefs.length; ix++) {
        const dCol = this.compColumnDefs[ix];
        if (dCol.codeUnit.reversePass) {
          if (codeDebug) {
            console.log('EXECUTE COLUMN', ix);
          }
          this.calculateOneComputedColumn(ix);
        }
      }
    }
  }

  public buildAggSiblings(): void {
    this.removeAllAggSiblings();
    // go through all columns not inside the group by
    this.rowMasterIndexes.slice(this.groupEnd + 1).forEach(v => {
      if (v < 0) {
        const cCol = this.compColumnDefs[-v - 1];
        if (cCol.type === ValueType.num
          && cCol.aggSibling !== AggSibling.inactive) {
          if (!cCol.isAggSibling) {
            this.addComputedAggSibling(cCol);
          }
        }
      } else {
        const dCol = this.dataColumnDefs[v];
        if (dCol.type === ValueType.num
          && dCol.aggSibling !== AggSibling.inactive) {
          if (this.aggSiblingsArePermanent || this.isGroupDisplay) {
            this.addDataAggSibling(dCol);
          }
        }
      }
    });
    this.calculateAggSiblings();
    // this.showComputed();
  }

  public calculateGroupRows(): void {
    if (!this.dataRows || this.dataRows.length === 0) {
      return;
    }
    this.groupRows = [];
    let groupCount = 0;
    let oldGroupVal: any;
    const stk: Value[] = [];
    for (let i = 0; i < this.dataRows.length; i++) {
      this.getComputedColumnValue(0, this.sortDataRows[i], stk);
      const groupVal = stk.pop();
      const num = groupVal.val as number;
      if (oldGroupVal !== num) {
        oldGroupVal = num;
        this.groupRows.push(this.sortDataRows[i]);
        groupCount += 1;
      }
    }
    this.sortGroupRows = Array.from(Array(this.groupRows.length).keys());
  }

  public updateComputedColumnsIntegrity(): void {
    this.compColumnDefs.forEach(cCol =>
      cCol.integrityCode = Integrity.ok);
    const iErrors = [];
    this.dataColumnDefs.forEach(dCol => {
      if (dCol.integrityCode !== Integrity.ok) {
        iErrors.push(-dCol.ix - 1);
      }
    });
    if (iErrors.length > 0) {
      iErrors.forEach(errIx => {
        this.compColumnDefs.forEach(cCol => {
          if (cCol.codeUnit.dependentOn) {
            const fx = cCol.codeUnit.dependentOn.findIndex(d => d === errIx);
            if (fx > -1) {
              cCol.integrityCode = Integrity.warning;
            }
          }
        });
      });
    }
  }

  public addDataColumn(
    displayName: string,
    sourceName: string,
    sourceDbTable: string,
    dbType: string,
    integrityCode: Integrity,
    uuid: number,
  ): DataColumnDef {
    const columnDef = {
      displayName,
      uuid,
      sourceName,
      dbTblColSource: `${sourceDbTable}.${sourceName}`,
      type: dbTypeToValueType(dbType),
      hasNulls: false,
      just: Just.default,
      displayedIx: -1,
      isVisible: true,
      doNotOutput: false,
      changeDate: '',
      integrityCode,
      fixDate: '',
      dbType,
      aggSibling: AggSibling.active,
      sortDirection: 0,
      isComputed: false,
      ix: this.dataColumnDefs.length,
    } as DataColumnDef;
    this.dataColumnDefs.push(columnDef);
    return columnDef;
  }

  public addDataAggSibling(dCol: DataColumnDef): void {
    let aCol: ComputedColumnDef;
    if (singleAgg) {
      aCol = this.addComputedColumnWithSource(
        `agg_${dCol.displayName}`,
        false,
        `_breakCume_("${dCol.displayName}")`,
        false,
        Uuid.skip,
      );
      aCol.codeUnit.reversePass = true;
    } else {
      aCol = this.addComputedColumnWithSource(
        `sup_${dCol.displayName}`,
        false,
        `agg("${dCol.displayName}")`,
        false,
        Uuid.skip,
      );
    }
    aCol.isAggSibling = true;
    dCol.aggSibling = aCol.ix;
  }

  public addComputedAggSibling(cCol: ComputedColumnDef): void {
    let aCol: ComputedColumnDef;
    if (singleAgg) {
      aCol = this.addComputedColumnWithSource(
        `agg_${cCol.displayName}`,
        false,
        `_breakCume_("${cCol.displayName}")`,
        false,
        Uuid.skip,
      );
      aCol.codeUnit.reversePass = true;
    } else {
      aCol = this.addComputedColumnWithSource(
        `sup_${cCol.displayName}`,
        false,
        `agg("${cCol.displayName}")`,
        false,
        Uuid.skip,
      );
    }
    aCol.isAggSibling = true;
    cCol.aggSibling = aCol.ix;
  }

  public removeAllAggSiblings(): void {
    const firstSiblingIx = this.compColumnDefs.findIndex(c => c.isAggSibling);
    if (firstSiblingIx > -1) {
      this.compColumnDefs.splice(firstSiblingIx);
    }
    this.firstAggSiblingIx = -1;
    // The below code breaks table display below the columns edit modal.
    // this.dataColumnDefs.forEach(d => {
    //   if (d.aggSibling !== AggSibling.inactive) {
    //     d.aggSibling = AggSibling.active;
    //   }
    // });
    // this.compColumnDefs.forEach(c => {
    //   if (c.aggSibling !== AggSibling.inactive) {
    //     c.aggSibling = AggSibling.active;
    //   }
    // });
  }

  // If successful, returns old attay position (ix).
  // Otherwise, returns -1.
  public removeDataColumn(dbTblColSource: string): number {
    const ix = this.dataColumnDefs.findIndex(
      dc => dbTblColSource === dc.dbTblColSource);
    if (ix > -1) {
      this.dataColumnDefs = this.dataColumnDefs.splice(ix, 1);
      this.dataColumnDefs.forEach((dc, i) => dc.ix = i);
      this.forceRecompile();
    }
    return -1;
  }

  // Syncs the Data Table Space data (this.DataColumnDef & this.CompColumnDef)
  // with the Query Space data (requestMgr, tableMgr & joinMgr)

  // Queries are driven by the request line and all data column creation
  // and deletion is specified in the Query screen.

  // On the other hand, the data display logic (and the saving of it)
  // assumes stability of dataColumnDefs and compColumnDefs

  // This function syncs all these data sctructures

  // The logic is that the oldest request column is the first
  // dataColumnDefs item and so on.

  public syncDataspaceWithQueryDef(): void {
    const rMgr = this.qc.requestMgr;
    const tblMgr = this.qc.tableMgr;
    const columnCount = rMgr.items.length - 2;
    // keep[ix] === 1 -> keep, === 0 -> delete
    const keep = new Array(columnCount).fill(0);
    const rCols = rMgr.getColumns().slice(1, -1).map(rc => rc);
    rCols.sort((a, b) => a.seqNum < b.seqNum ? -1 : 1);
    // for (let colIx = 0; colIx < columnCount; colIx++) {
    //   const rCol = rMgr.getColumn(colIx + 1);
    rCols.forEach(rCol => {
      const uiTable = tblMgr.getTable(rCol.sourceTableIx);
      const dbCol = uiTable.table.columns[rCol.sourceColumnIx];
      const name = rCol.name;
      const uuid = rCol.uuid;

      // all rCols comme from this.dataColumnDefs
      const dcIx = this.dataColumnDefs.findIndex(
        dc => dc.uuid === rCol.uuid);
      if (dcIx === -1) {
        const dataPos = this.dataColumnDefs.length;
        const columnDef = this.addDataColumn(
          name,
          dbCol.columnName,
          uiTable.dbTblSource,
          dbCol.type,
          rCol.integrityCode,
          rCol.uuid,
        );
        // because of possible unexecucted deletions dataPos could be
        // large. (If so, it will be kept automatically.)
        if (dataPos < keep.length) {
          // mark as keep
          keep[dataPos] = 1;
        }

        const vcStr = 'varchar(';
        const vcPos = dbCol.type.indexOf(vcStr);
        const numPos = vcPos < 0 ? -1 : vcPos + vcStr.length;
        columnDef.maxLength = numPos < 0 ? 0 :
          parseInt(dbCol.type.substr(numPos, 10), 10);
        columnDef.hasNulls = columnDefIsNullAllowed(dbCol);
        this.addWorkColumn(name, uuid, dataPos);
      } else {
        keep[dcIx] = 1;
        const dCol = this.dataColumnDefs[dcIx];
        let wCol = this.matchWorkColumnToDataDef(dCol.ix, dCol.uuid);
        if (!wCol) {
          wCol = this.addWorkColumn(name, uuid, dCol.ix);
        }
        // update both names
        dCol.displayName = name;
        wCol.displayName = name;
      }
    });
    const workColumnsToDelete = [];
    for (let i = keep.length; 0 < i--;) {
      // have to go backwards through array so deletes don't change ix-es
      if (keep[i] === 0) {
        const workColumn = this.matchWorkColumnToDataDef(
          i, this.dataColumnDefs[i].uuid);
        if (workColumn) {
          workColumnsToDelete.push(workColumn.ix);
        }
        // console.log('SYNC Delete', i, this.dataColumnDefs[i].displayName);
        for (let j = this.dataColumnDefs.length; i < j--;) {
          this.dataColumnDefs[j].ix -= 1;
        }
        this.dataColumnDefs.splice(i, 1);
      }
    }

    if (workColumnsToDelete.length > 0) {
      this.deleteWorkColumns(workColumnsToDelete);
      this.forceRecompile();
    }
  }

  public forceRecompile(): void {
    this.compColumnDefs.forEach(e => {
      e.codeUnit.code = undefined;
    });
  }

  // Backend Access Methods 9312345678941234567895123456789612345678971234567898

  public async getList(tableIx: number, columnIx: number): Promise<void> {
    const tblMgr = this.qc.tableMgr;
    const cvTbl = tblMgr.getTable(tableIx);
    const cDef = cvTbl.table.columns[columnIx];
    const request = `SELECT DISTINCT ${cDef.columnName} from ${
      cvTbl.table.tableName}`;
    if (showListCommand) {
      console.log(request);
    }
    const url = dataUrl + '/list';

    // Use xcreate to be able to paass complex parameters.
    // No create will happen on the database.
    const requestReturn = await this.repo.xcreate(url, { request });
    if (!requestReturn.hasError) {
      this.listRows = requestReturn.data;
    }
  }

  // Data Load Methods 456789312345678941234567895123456789612345678971234567898

  public async getData(
    tableWrapper?: TableWrapper,
  ): Promise<void> {
    if (!tableWrapper) {
      this.syncDataspaceWithQueryDef();
    }
    this.isUnsorted = true;
    const mgr = this.qc.requestMgr;
    const tblMgr = this.qc.tableMgr;
    const joinMgr = this.qc.joinMgr;
    let request = 'SELECT ';
    const cols = mgr.getColumns().slice(1, -1).map(rc => rc);
    cols.sort((a, b) => a.seqNum < b.seqNum ? -1 : 1);
    cols.forEach((rCol, colIx) => {
      if (colIx > 0) {
        request += ', ';
      }
      request += this.tblAlias(rCol.sourceTableIx);
      const uiTable = tblMgr.getTable(rCol.sourceTableIx);
      const tCol = uiTable.table.columns[rCol.sourceColumnIx];
      request += '.' + tCol.columnName;
      if (tCol.type.includes('bit')) {
        // Force MySql cast to int (prevents server crash)
        request += '+0';
      }
      // if (tCol.columnName !== rCol.name) {
      //   request += ` AS '${rCol.name}'`;
      // }
    });
    request += ' FROM ';
    // verify that tables have columns in select clause or are joined
    // to other tables
    const fromChk = [];
    tblMgr.items.forEach(e => fromChk.push(false));
    mgr.items.forEach((e: UiRequestColumn) => {
      fromChk[e.sourceTableIx] = true;
    });
    joinMgr.items.forEach((e: UiJoin) => {
      fromChk[e.uiTblIx1] = true;
      fromChk[e.uiTblIx2] = true;
    });
    // From tables
    let tableOut = 0;
    for (let tblIx = 0; tblIx < tblMgr.items.length; tblIx++) {
      if (fromChk[tblIx]) {
        const cvTbl = tblMgr.getTable(tblIx);
        if (tableOut > 0) {
          request += ', ';
        }
        request += cvTbl.table.tableName + ' ' + this.tblAlias(tblIx);
        tableOut += 1;
      }
    }
    // Joins
    let whereCount = 0;
    for (const cvJoin of joinMgr.items as UiJoin[]) {
      const cvTbl1 = tblMgr.getTable(cvJoin.uiTblIx1);
      const cvTbl2 = tblMgr.getTable(cvJoin.uiTblIx2);
      // use where joins
      const codeWord =  whereCount > 0 ? 'AND' : 'WHERE';
      request += ` ${codeWord} ${this.tblAlias(cvTbl1.ix)}.${
        cvTbl1.table.columns[cvJoin.colIx1].columnName} = `;
      request += `${this.tblAlias(cvTbl2.ix)}.${
        cvTbl2.table.columns[cvJoin.colIx2].columnName}`;
      whereCount += 1;
    }
    // where constraints
    for (let tblIx = 0; tblIx < tblMgr.items.length; tblIx++) {
      const uiTable = tblMgr.getTable(tblIx);
      for (const tCol of uiTable.table.columns) {
        if (!tCol.constraint) {
          continue;
        }
        request += whereCount > 0 ? ' AND ' : ' WHERE ';
        whereCount += 1;
        request += this.tblAlias(tblIx);
        const constr = tCol.constraint;
        request += `.${tCol.columnName} ${compareOpToIoStr(constr.compareOp)} `;
        if (constr.compareOp === CompareOp.in) {
          const itemArr = constr.valuesStr.split(',');
          const ia = itemArr.map(item => item.trim());
          request += '(';
          for (let i = 0; i < ia.length; i++) {
            if (i > 0) {
              request += ', ';
            }
            request += strToIoStr(ia[i], constr.tp);
          }
          request += ')';
        } else {
          request += strToIoStr(constr.valuesStr, constr.tp);
        }
      }
    }
    // TODO: having constraits and aggregate fucntions
    request += ';';
    // console.log('SQL', request);
    // TODO: as a default, don't execute query of 'nothing' changed
    const requestReturn = await this.repo.xcreate(dataUrl, { request });
    if (!requestReturn.hasError) {
      if (tableWrapper) {
        tableWrapper.table = requestReturn.data;
        return;
      }
      this.dataDate = nowString();
      this.dataRows = requestReturn.data;
      this.sortDataRows = [];
      this.dataRows.forEach((e, i) => this.sortDataRows.push(i));
      this.calculateComputed();
      this.workDisplayUpdate();
    }
  }

  public workDisplayUpdate(): void {
    if (this.displayChangeSource !== DisplayChangeSource.work) {
      const [addCols, lostCols] = this.workDisplayCalcDiffs();
      this.workDisplayRebuildMaster(addCols, lostCols);
    }
    this.workDisplayRebuildFixed();
    this.workDisplayRebuildGroups();
    this.workDisplayUpdateCurr();
  }

  public workDisplayRebuildMaster(
    addCols: Uuid[],
    lostCols: Uuid[],
  ): void {
    const hasGroupBy = this.hasGroupBy();
    // build new rowMasterUuids
    if (this.rowMasterUuids.length === 0) {
      this.rowMasterUuids.push(Uuid.rowNum);
      if (hasGroupBy) {
        this.rowMasterUuids.push(Uuid.groupBy);
        this.rowMasterUuids.push(Uuid.groupByEnd);
      }
    } else {
      // remove lost columns from master
      lostCols.forEach(l => {
        const pos = this.rowMasterUuids.findIndex(m => m === l);
        if (pos !== -1) {
          this.rowMasterUuids.splice(pos, 1);
        }
      });
      if (!hasGroupBy) {
        // the groupBy column is not tracked by rowFidexUuids so it
        // will not be included in lostCols.
        // It needs to be removed sparately
        const gb = this.rowMasterUuids.findIndex(u => u === Uuid.groupBy);
        if (gb !== -1) {
          this.rowMasterUuids.splice(gb, 1);
        }
      }
    }

    if (this.displayChangeSource === DisplayChangeSource.groupDisplay) {
      // No new data or computed columns, only rearrangements.
      // The logic here: if a group column has been moved, all (hidden)
      // row columns between it and the prior group column will be moved
      // with it.
      let nextIx: number;
      this.groupMasterIndexes.forEach(gi => {

      });
      for (let ix = this.qc.requestMgr.items.length - 1; 1 < ix--;) {
        const rCol = this.qc.requestMgr.getColumn(ix);
        const col = this.uiRequestColumnToColumnDef(rCol);
        const uuid = col.uuid;
        const addIx = addCols.findIndex(ac => ac === uuid);
        if (addIx > -1) {
          addCols.splice(addIx, 1);
          if (nextIx) {
            // insert before nextIx
            this.rowMasterUuids.splice(nextIx, 0, uuid);
          } else {
            // insert at end
            this.rowMasterUuids.push(uuid);
          }
        }
        nextIx = this.rowMasterUuids.findIndex(u => u === uuid);
      }
    } else if (this.displayChangeSource === DisplayChangeSource.query) {
      let nextIx: number;
      for (let ix = this.qc.requestMgr.items.length - 1; 1 < ix--;) {
        const rCol = this.qc.requestMgr.getColumn(ix);
        const col = this.uiRequestColumnToColumnDef(rCol);
        const uuid = col.uuid;
        const addIx = addCols.findIndex(ac => ac === uuid);
        if (addIx > -1) {
          addCols.splice(addIx, 1);
          if (nextIx) {
            // insert before nextIx unless nextIx is in groupBy
            if (nextIx < this.groupEnd + 2 /* rowNum & groupBy */) {
              this.rowMasterUuids.splice(
                this.groupEnd + 3, // rowNum, groupBy, & groupByEnd
                0,
                uuid,
              );
            } else {
              this.rowMasterUuids.splice(nextIx, 0, uuid);
            }
          } else {
            // insert at end
            this.rowMasterUuids.push(uuid);
          }
        }
        nextIx = this.rowMasterUuids.findIndex(u => u === uuid);
      }
    }

    if (hasGroupBy) {
      if (this.rowMasterUuids[groupByPos] !== Uuid.groupBy) {
        this.rowMasterUuids.splice(groupByPos, 0, Uuid.groupBy);
        this.rowMasterUuids.splice(groupByPos + 1, 0, Uuid.groupByEnd);
        const d = 2;  // rownNum + groupBy
        const groupByColumns = this.getGroupByIndexes();
        this.groupEnd = groupByColumns.length;
        groupByColumns.forEach((v, ix) => {
          const uuid = v < 0
            ? this.compColumnDefs[-v - 1].uuid
            : this.dataColumnDefs[v].uuid;
          this.rowMasterUuids.forEach((w, jx) => {
            if (w === uuid) {
              moveItemInArray(this.rowMasterUuids, jx, d + ix);
            }
          });
        });
      }
    }

    // update dependent rowMasterArrays
    this.rowMasterNames = [];
    this.rowMasterIndexes = [];
    this.rowMasterUuids.forEach(u => {
      let name: string;
      let v: number;
      let skip = false;
      if (u === Uuid.rowNum) {
        name = WorkData.rowNum;
        skip = true;
      } else if (u === Uuid.groupBy) {
        name = WorkData.groupBy;
        skip = true;
      } else if (u === Uuid.groupByEnd) {
        name = WorkData.groupByEnd;
        v = WorkDataCode.groupByEnd;
      } else {
        const col = this.uuidToColumnDef(u);
        name = col.displayName;
        v = col.isComputed ? - col.ix - 1 : col.ix;
      }
      this.rowMasterNames.push(name);
      if (!skip) {
        this.rowMasterIndexes.push(v);
      }
    });
  }

  public workDisplayInitFixedUuids(): void {
    this.rowFixedUuids = [];
    if (this.hasGroupBy()) {
      this.rowFixedUuids.push(Uuid.groupByEnd);
    }
    this.dataColumnDefs.forEach(v => {
      if (v.isVisible) {
        this.rowFixedUuids.push(v.uuid);
      }
    });
    this.compColumnDefs.forEach(v => {
      if (v.isVisible && v.uuid !== Uuid.groupBy) {
        this.rowFixedUuids.push(v.uuid);
      }
    });
  }

  public workDisplayGroupToRowSkipCount(rowIx: number): number {
    let delta = 0;
    for (let pos = rowIx; 0 < pos--;) {
      const v = this.rowMasterIndexes[pos];
      const col = this.getColumnInfo(this.rowMasterIndexes[pos]);
      if (col.aggSibling > AggSibling.inactive
        && col.type === ValueType.num) {
        break;
      }
      delta += 1;
    }
    return delta;
  }

  public workDisplayGroupToRowIx(groupIx: number): number {
    const u = this.groupMasterIndexes[groupIx];
    const uuid = u === WorkDataCode.groupByEnd
      ? Uuid.groupByEnd
      : this.getColumnInfo(u).uuid;
    for (let ix = 0; ix < this.rowMasterIndexes.length; ix++) {
      const v = this.rowMasterIndexes[ix];
      if (v === WorkDataCode.groupByEnd) {
        if (uuid === Uuid.groupByEnd) {
          return ix;
        }
      } else {
        const col = this.getColumnInfo(v);
        if (col.uuid === uuid) {
          return ix;
        }
      }
    }
    console.log('workDisplayGroupToRowIx: NOT FOUND');
    return -1;
  }

  public workDisplayRowToGroupIx(rowIx: number): number {
    const u = this.rowMasterIndexes[rowIx];
    const uuid = u === WorkDataCode.groupByEnd
      ? Uuid.groupByEnd
      : this.getColumnInfo(u).uuid;
    for (let ix = 0; ix < this.groupMasterIndexes.length; ix++) {
      const v = this.groupMasterIndexes[ix];
      if (v === WorkDataCode.groupByEnd) {
        if (uuid === Uuid.groupByEnd) {
          return ix;
        }
      } else {
        const col = this.getColumnInfo(v);
        if (col.uuid === uuid) {
          return ix;
        }
      }
    }
    console.log('workDisplayRowToGroupIx: NOT FOUND');
    return -1;
  }

  public workDisplayMoveColumn(
    from: number,
    to: number,
    newGroupEnd: number = -1,
  ): void {
    const gd = 1; // groupBy
    if (this.isGroupDisplay && newGroupEnd === -1) {
      const rd = 2; // rowNum & groupBy
      let count: number;
      let fromIx = this.workDisplayGroupToRowIx(from);
      const toIx = this.workDisplayGroupToRowIx(to);
      if (from === 1 /* 0 + groupBy -> first */) {
        count = 1;
      } else {
        const delta = 1 + this.workDisplayGroupToRowSkipCount(fromIx);
        count = delta;
        fromIx -= count - 1;
      }
      moveArrayItems(this.rowMasterUuids, fromIx + rd, toIx + rd, count);
      moveArrayItems(this.rowMasterNames, fromIx + rd, toIx + rd, count);
      moveArrayItems(this.rowMasterIndexes, fromIx, toIx, count);

      moveItemInArray(this.groupMasterUuids, from + gd, to + gd);
      moveItemInArray(this.groupMasterNames, from + gd, to + gd);
      moveItemInArray(this.groupMasterIndexes, from, to);
    } else {
      let rd = 1; // rowNum
      if (this.hasGroupBy()) {
        rd = 2; // rowNum & groupBy
        if (newGroupEnd !== -1) {
          // copy groupby from row to group
          moveItemInArray(this.rowMasterUuids, from + rd, to + rd);
          moveItemInArray(this.rowMasterNames, from + rd, to + rd);
          moveItemInArray(this.rowMasterIndexes, from, to);

          this.groupEnd += to <= newGroupEnd ? 1 : -1;
          this.workDisplayRebuildGroups();
        } else {
          const fromIx = this.workDisplayRowToGroupIx(from);
          const toIx = this.workDisplayRowToGroupIx(to);
          moveItemInArray(this.groupMasterUuids, fromIx + gd, toIx + gd);
          moveItemInArray(this.groupMasterNames, fromIx + gd, toIx + gd);
          moveItemInArray(this.groupMasterIndexes, fromIx, toIx);

          moveItemInArray(this.rowMasterUuids, from + rd, to + rd);
          moveItemInArray(this.rowMasterNames, from + rd, to + rd);
          moveItemInArray(this.rowMasterIndexes, from, to);
        }
      } else {
        moveItemInArray(this.rowMasterUuids, from + rd, to + rd);
        moveItemInArray(this.rowMasterNames, from + rd, to + rd);
        moveItemInArray(this.rowMasterIndexes, from, to);
      }
    }
    // this.showDisplayIndexes('XXX');
  }

  public workDisplayUpdateCurr(): void {
    if (this.isGroupDisplay) {
      this.currMasterNames = this.groupMasterNames;
      this.currMasterIndexes = this.groupMasterIndexes;
      this.currFixedNames = this.groupFixedNames;
      this.currFixedIndexes = this.groupFixedIndexes;
    } else {
      this.currMasterNames = this.rowMasterNames;
      this.currMasterIndexes = this.rowMasterIndexes;
      this.currFixedNames = this.rowFixedNames;
      this.currFixedIndexes = this.rowFixedIndexes;
    }
  }

  public uiRequestColumnToColumnDef(rCol: UiRequestColumn): ColumnDef {
    return this.nameToColumnDef(rCol.name);
  }

  public uuidToColumnDef(uuid: number): ColumnDef {
    let col: ColumnDef = this.dataColumnDefs.find(dc =>
      dc.uuid === uuid) as ColumnDef;
    if (!col) {
      col = this.compColumnDefs.find(dc => dc.uuid === uuid) as ColumnDef;
    }
    return col;
  }

  public nameToColumnDef(displyName: string): ColumnDef {
    let col: ColumnDef = this.dataColumnDefs.find(dc =>
      dc.displayName === displyName) as ColumnDef;
    if (!col) {
      col = this.compColumnDefs.find(dc =>
        dc.displayName === displyName) as ColumnDef;
    }
    return col;
  }

  // switches the display between normal diplay ('row display') and
  // group display.
  public adjustDisplayData(): void {
    // if (this.isGroupDisplay) {
    //   this.sortGroupRows = Array.from(Array(this.groupRows.length).keys());
    // }
  }

  // updates the displayedIx field of columns in the data screen
  // to match the current display indexes
  public syncDisplayData(): void {
    this.groupEnd = 0;
    this.dataColumnDefs.forEach(e => e.displayedIx = -1);
    this.compColumnDefs.forEach(e => e.displayedIx = -1);
    // this. showDisplayIntexes();
    const displayedIndexes = this.isGroupDisplay
      ? this.groupMasterIndexes
      : this.rowMasterIndexes;
    for (const[i, v] of displayedIndexes.entries()) {
      if (v > -1000) {
        if (v < 0) {
          this.compColumnDefs[-v - 1].displayedIx = i;
        } else {
          this.dataColumnDefs[v].displayedIx = i;
        }
      } else if (v === WorkDataCode.groupByEnd) {
        this.groupEnd = i;
      }
    }
  }

  public setDisplayChangeSource(
    source: DisplayChangeSource = DisplayChangeSource.query,
  ): void {
    this.displayChangeSource = source;
  }

  public async writeData(
    dbOutputTable: string = '',
    // identifies the id of the index of the source table
    // if this in -1 a default index column will be added to the output table
    primaryIndexColumn: number = -1,
  ): Promise<number> {
    if (dbOutputTable) {
      dbOutputTable = this.checkDbTableName(dbOutputTable);
    }
    const querySave: QuerySave = {
      writeMode: 'write' as WriteMode,
      deleteSql: '',
      createSql: [] as string[],
      saveSql: undefined as string[],
      dbOutputTable: dbOutputTable
        ? dbOutputTable
        : this.qc.currQuery.dbQueryName,
      primaryIndexColumn,
    };
    this.writeCreateSql(querySave);
    let inRows = this.sortDataRows;
    if (this.isGroupDisplay) {
      // this.sortGroupRows = [];
      // this.groupRows.forEach(
      //   (e, i) => this.sortGroupRows.push(i));
      inRows = this.groupRows;
    }
    const outRows: string[] = [];
    const [db, tbl] = querySave.dbOutputTable.split('.');
    let outStr = `INSERT INTO ${sw}${db}${sw}.${sw}${tbl}${sw} (`;
    let outCount = 0;
    const displayedIndexes = this.isGroupDisplay
      ? this.groupMasterIndexes
      : this.rowMasterIndexes;
    for (const [j, v] of displayedIndexes.entries()) {
      if (v === WorkDataCode.groupByEnd) {
        continue;
      }
      const col: ColumnDef =  v < 0
        ? this.compColumnDefs[-v - 1]
        : this.dataColumnDefs[v];
      if (col.doNotOutput) {
        continue;
      }
      const name = col.displayName;
      outStr += `${outCount > 0 ? ',' : ''}\`${name}\``;
      outCount += 1;
    }
    outStr += ') VALUES';
    outRows.push(outStr);

    outCount = 0;
    for (const [i, rowNm] of inRows.entries()) {
      outStr = i > 0 ? ',(' : '(';
      outCount = 0;
      for (const [j, v] of displayedIndexes.entries()) {
        if (v === WorkDataCode.groupByEnd) {
          continue;
        }
        let valueStr: string;
        let type: ValueType;
        if (v < 0) {
          const compIx = -v - 1;
          const cDef = this.compColumnDefs[compIx];
          if (cDef.doNotOutput) {
            continue;
          }
          const cu = cDef.codeUnit;
          const value = this.computedColumns[compIx][rowNm];
          type = value.type;
          valueStr = valueToStr(value);
        } else {
          const dDef = this.dataColumnDefs[v];
          if (dDef.doNotOutput) {
            continue;
          }
          const name = dDef.sourceName;
          valueStr = `${this.dataRows[rowNm][name]}`;
          type = dDef.type;
        }
        outStr += `${outCount > 0 ? ',' : ''}${strToIoStr(valueStr, type)}`;
        outCount += 1;
      }
      outStr += ')';
      outRows.push(outStr);
    }
    if (outRows.length === 0) {
      console.log('No Data');
      return 0;
    }
    outRows[outRows.length - 1] += ';';
    if (showWrittenRows) {
      for (const [i, v] of outRows.entries()) {
        console.log('OUT', i, v);
      }
    }
    querySave.saveSql = outRows;
    const url = dataUrl + '/write';
    await this.repo.xcreate(url, querySave);

    return outRows.length;
  }

  public async readTable(table: Table): Promise<void> {
    const qc = this.qc;
    const leftTop = { x: 10, y: 10 } as Point;
    const uiTable =
      new UiTable(qc.tableMgr, leftTop, table.tableName, table);
    uiTable.rect.width = 100;
    uiTable.rect.height = 100;
    // let ixCol = -1;
    table.columns.forEach((c, ix) => {
      const rCol = new UiRequestColumn(
        qc.requestMgr, c.columnName, -1, 0, ix, -2, Uuid.generate);
      this.addDataColumn(
        c.columnName,
        c.columnName,
        table.dbTableName,
        c.type,
        Integrity.ok,
        rCol.uuid,
      );
    });
    await this.getData();
  }

  public async readSupportTable(table: Table): Promise<any[]> {
    const qc = this.qc;
    const leftTop = { x: 10, y: 10 } as Point;
    const uiTable =
      new UiTable(qc.tableMgr, leftTop, table.tableName, table);
    uiTable.rect.width = 100;
    uiTable.rect.height = 100;
    // let ixCol = -1;
    table.columns.forEach((c, ix) => {
      const rCol = new UiRequestColumn(
        qc.requestMgr, c.columnName, -1, 0, ix, -2, Uuid.generate);
    });
    const tableWrapper = { table: undefined };
    await this.getData(tableWrapper);
    return tableWrapper.table;
  }

  public verifyUniqueColumnName = (name: string): string => {
    let versionIx = 0;
    [name, versionIx] = this.undupColumnName(name, versionIx);
    return versionIx === 0 ? name : `${name}_${versionIx}`;
  };

  public checkDbTableName(dbTableName: string): string {
    if (!dbTableName) {
      return '';
    }
    if (dbTableName === IN_ARROW
      || dbTableName === SAME_AS_SOURCE
      || dbTableName === SKIP
      || dbTableName === IN_ARROW_PRETTY
      || dbTableName === SAME_AS_SOURCE_PRETTY
    ) {
      return dbTableName;
    }
    const names = dbTableName.split('.');
    if (!names[1]) {
      // no database given
      dbTableName = `${this.db.currDatabase}.${dbTableName}`;
    }
    return dbTableName;
  }

  public initDataEngForNewQDoc(): void {
    this.qc.initUuidGen();

    this.rowMasterUuids = [];
    this.rowMasterNames = [];
    this.rowMasterIndexes = [];
    this.rowFixedUuids = [];
    this.rowFixedNames = [];
    this.rowFixedIndexes = [];

    this.groupMasterNames = [];
    this.groupMasterIndexes = [];
    this.groupFixedNames = [];
    this.groupFixedIndexes = [];

    // this.displayedColumns = [];
    // this.displayedIndexes = [];
    // this.fixedColumns = [];
    // this.fixedIndexes = [];

    this.sortIndexes = [];
    this.sortDirections = [];

    // this.bupDisplayedColumns = undefined;
    // this.bupIndexNames = undefined;
    // this.bupDisplayIndex = undefined;

    this.currSortable = undefined;
    this.currPageSize = 0;

    // this.dataColumnsRearranged = false;
    // this.computedColumnsRearranged = false;

    this.listRows = undefined;

    this.initDataEngineData();
  }

  public initDataEngineData(): void {
    this.dataColumnDefs = [];
    this.compColumnDefs = [];
    this.dataSpace.columns = [];

    this.executionOrder = [];
    this.aggSupport = [];

    // this.bupDataNames = [];
    // this.bupCompNames = [];

    this.isGroupDisplay = false;
    this.groupEnd = -1;
    this.dataDate = '';

    this.dataRows = [];
    this.computedColumns = [];

    this.initArrays();
  }

  public showDataColumns(label: string = ''): void {
    const xx = this.dataColumnDefs.map(d => d.displayName);
    if (label) {
      console.log('----------------', label);
    }
    console.log('dataCols:', ...xx);
  }

  public showDisplayIndexes(label: string = ''): void {
    // this.showDataColumns(label);
    console.log('----------------', label);
    console.log('rowMasterUuids', ...this.rowMasterUuids);
    console.log('rowMasterNames', ...this.rowMasterNames);
    console.log('rowMasterIndexes', ...this.rowMasterIndexes);
    console.log('rowFixedUuids', ...this.rowFixedUuids);
    console.log('rowFixedNames', ...this.rowFixedNames);
    console.log('rowFixedIndexes', ...this.rowFixedIndexes);
    console.log('groupMasterNames', ...this.groupMasterNames);
    console.log('groupMasterIndexes', ...this.groupMasterIndexes);
    console.log('groupFixedNames', ...this.groupFixedNames);
    console.log('groupFixedIndexes', ...this.groupFixedIndexes);
  }

  public showComputed(label: string = ''): void {
    console.log('---------------- computed', label);
    this.compColumnDefs.slice(1).forEach(c => {
      console.log(c.displayName, c.codeUnit.source);
    });
  }

  public getFixedIndex(columnIx: number): number {
    const fixedIndexes = this.isGroupDisplay
      ? this.groupFixedIndexes
      : this.rowFixedIndexes;
    return fixedIndexes[columnIx];
  }

  public getFixedNameArr(): string[] {
    const fixedNames = this.isGroupDisplay
      ? this.groupFixedNames
      : this.rowFixedNames;
    return fixedNames;
  }

  public getMasterNameArr(): string[] {
    const masterNames = this.isGroupDisplay
      ? this.groupMasterNames
      : this.rowMasterNames;
    return masterNames;
  }

// private functions

  private addParentDependency(
    columnIx: number,     // ix of column to update
    parents: number[],    // current dependency list
    newParentIx: number,  // new parent to add to list
  ): boolean {            // true - circular dependency. false = ok
    if (newParentIx === columnIx) {
      // circular reference
      return true;
    }
    let found = false;
    for (let i = parents.length; 0 < i--;) {
      if (parents[i] === newParentIx) {
        // dependdency already exists
        found = true;
        break;
      }
    }
    if (!found) {
      parents.push(newParentIx);
      if (newParentIx > -1) {
        const parentDef = this.compColumnDefs[newParentIx];
        if (!parentDef.codeUnit.dependentOn) {
          parentDef.codeUnit.dependentOn = [];
        }
        for (let i = parentDef.codeUnit.dependentOn.length; 0 < i--;) {
          const parentIx = parentDef.codeUnit.dependentOn[i];
          if (this.addParentDependency(columnIx, parents, parentIx)) {
            // circular reference
            return true;
          }
        }
      }
    }
    return false;
  }

  private checkAllocationSizeForOneColumn(ix: number): void {
    if (this.computedColumns[ix].length !== this.dataRows.length) {
      const column = [];
      this.computedColumns[ix] = column;
      for (let r = this.dataRows.length; 0 < r--;) {
        column.push({ type: ValueType.undef, val: 0 } as Value);
      }
    }
  }

  private setAggSupport(
    valIx: number,
    funcCode: AggCode,
    ix: number
  ): AggSupportInfo {
      return {
      code: funcCode,
      valueColumnIx: valIx,
      ix,
    } as AggSupportInfo;
  };

  private dummyErrorDisplayFunc =
    (errMsg: string, parseStr: string, parsePos: number): void => {
  };

  private compileOneComputedColumn(ix: number): void {
    const computeDef = this.compColumnDefs[ix];
    if (!computeDef.codeUnit.code) {
      if (codeDebug) {
        console.log('COMPILE ******************', computeDef.ix,
          'type', computeDef.codeUnit.type, computeDef.type);
      }
      computeDef.type = this.computeEng.compileCode(
        computeDef.codeUnit, this.dummyErrorDisplayFunc);
      if (codeDebug) {
        console.log(
          'COMPILE END t1 t2', computeDef.codeUnit.type, computeDef.type);
        console.log('CU', computeDef.codeUnit);
      }
    }
  }

  // Calculates one column of computed values
  // Should not be called from the outside
  private calculateOneComputedColumn(columnIx: number): void {
    const cDef = this.compColumnDefs[columnIx];
    const cu = cDef.codeUnit;
    if (cu.reversePass) {
      for (let rowNm = this.dataRows.length; 0 < rowNm--;) {
        const sortedRowNm = this.sortDataRows[rowNm];
        this.computeEng.execute(
          cu, rowNm, this.computedColumns[columnIx][sortedRowNm]);
      }
    } else {
      for (let rowNm = 0; rowNm < this.dataRows.length; rowNm++) {
        const sortedRowNm = this.sortDataRows[rowNm];
        this.computeEng.execute(
          cu, rowNm, this.computedColumns[columnIx][sortedRowNm]);
      }
    }
  }

  private matchWorkColumnToDataDef(
    ix: number,
    uuid: Uuid,
  ): WorkColumn {
    const workColumn = this.dataSpace.columns.find(e => e.uuid === uuid);
    if (workColumn) {
      // this test doesn't work when column added in the beginning
      // if (workColumn.displayName !== displayName) {
      //   console.log('ERROR: bad workspace sync');
      //   console.log(workColumn.displayName, displayName);
      //   console.log(...this.dataSpace.columns, ix, displayName);
      // }
      return workColumn;
    }
    return undefined;
  }

  private tblAlias(tableIx: number): string {
    return String.fromCharCode(tableIx + 'a'.charCodeAt(0));
  }

  private workDisplayCalcDiffs(): [Uuid[], Uuid[]] {
    const uuids: number[] = [];
    if (this.hasGroupBy()) {
      uuids.push(Uuid.groupBy);
      uuids.push(Uuid.groupByEnd);
    }
    this.dataColumnDefs.forEach(v => {
      if (v.isVisible) {
        uuids.push(v.uuid);
      }
    });
    this.compColumnDefs.forEach(v => {
      if (v.isVisible && v.uuid !== Uuid.groupBy) {
        uuids.push(v.uuid);
      }
    });
    // addCols are uuids - rowFixedMaster
    const addCols: number[] = [];
    uuids.forEach((v, ix) => {
      const foundIx = this.rowFixedUuids.findIndex(u => u === v);
      if (foundIx === -1) {
        addCols.push(v);
      }
    });
    // lastCols are fowFixedMaster - uuids
    const lostCols: number[] = [];
    this.rowFixedUuids.forEach((v, ix) => {
      const foundIx = uuids.findIndex(u => u === v);
      if (foundIx === -1) {
        lostCols.push(v);
      }
    });
    return [addCols, lostCols];
  }

  private workDisplayRebuildFixed(): void {

    this.workDisplayInitFixedUuids();
    this.rowFixedNames = [];
    this.rowFixedIndexes = [];
    this.rowFixedUuids.forEach(u => {
      const col = this.uuidToColumnDef(u);
      let name: string;
      let v: number;
      if (u === Uuid.groupByEnd) {
        name = WorkData.groupByEnd;
        v = WorkDataCode.groupByEnd;
      } else {
        name = col.displayName;
        v = col.isComputed ? - col.ix - 1 : col.ix;
      }
      this.rowFixedNames.push(name);
      this.rowFixedIndexes.push(v);
    });
  }

  private workDisplayRebuildGroups(): void {
    // Calculate group display
    // duuplicate up to groupend
    // only add numeric columns that are add

    // build before group end parts of arrays
    this.groupFixedNames = [WorkData.groupByEnd];
    this.groupFixedNames.push(...this.rowMasterNames.slice(
      2, this.groupEnd + 2));
    this.groupFixedIndexes = [WorkDataCode.groupByEnd];
    this.groupFixedIndexes.push(...this.rowMasterIndexes.slice(
      0, this.groupEnd));
    this.groupMasterNames = this.rowMasterNames.slice(
      1, this.groupEnd + 3 /* rowNum, groupBy, & groupByEnd */);
    this.groupMasterIndexes = this.rowMasterIndexes.slice(0, this.groupEnd + 1);
    // add the after group end items
    this.rowMasterIndexes.slice(this.groupEnd + 1).forEach(v => {
      let aggSibling: AggSibling;
      let type: ValueType;
      let displayName: string;
      // console.log('workDisplayRebuildGroups v', v);
      if (v !== WorkDataCode.groupByEnd) {
        if (v < 0) {

          const cCol = this.compColumnDefs[-v - 1];
          aggSibling = cCol.aggSibling;
          type = cCol.type;
          displayName = cCol.displayName;
        } else {
          const dCol = this.dataColumnDefs[v];
          aggSibling = dCol.aggSibling;
          type = dCol.type;
          displayName = dCol.displayName;
        }
        if (aggSibling > AggSibling.inactive && type === ValueType.num) {
          this.groupFixedNames.push(displayName);
          this.groupFixedIndexes.push(v);
          this.groupMasterNames.push(displayName);
          this.groupMasterIndexes.push(v);
        }
      }
    });
  }

  private writeCreateSql(querySave: QuerySave): void {
    const outRows: string[] = [];
    const [db, tbl] = querySave.dbOutputTable.split('.');
    querySave.deleteSql =
      `DROP TABLE IF EXISTS ${sw}${db}${sw}.${sw}${tbl}${sw};`;
    let outStr;
    outStr = `CREATE TABLE ${sw}${db}${sw}.${sw}${tbl}${sw} (`;
    outRows.push(outStr);
    const ixCol = querySave.primaryIndexColumn;
    if (ixCol > -1) {
      const ixName = this.rowMasterNames[ixCol + 1];
      outStr = `\`${ixName}\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY`;
    } else {
      outStr = `id INT NOT NULL AUTO_INCREMENT PRIMARY KEY`;
    }
    outRows.push(outStr);
    let columnCount = 0;
    for (const [i, v] of this.rowMasterIndexes.entries()) {
      if (v === WorkDataCode.groupByEnd || i === ixCol) {
        continue;
      }
      let name: string;
      let typeStr;
      if (v < 0) {
        const cDef = this.compColumnDefs[-v - 1];
        if (cDef.doNotOutput) {
          continue;
        }
        name = cDef.displayName;
        if (cDef.type === ValueType.str) {
          typeStr = 'VARCHAR(250) NOT NULL';
        } else if (cDef.type === ValueType.num) {
          typeStr = 'DOUBLE NOT NULL';
          // typeStr = 'INT NOT NULL';
          // } if (cDef.type === ValueType.date) {
        } else if (cDef.type === ValueType.bool) {
          typeStr = 'TINYINT NOT NULL';
        }
      } else {
        const dDef = this.dataColumnDefs[v];
        if (dDef.doNotOutput) {
          continue;
        }
        name = dDef.displayName;
        if (dDef.type === ValueType.str) {
          const len = dDef.maxLength > 0 ? dDef.maxLength : 250;
          typeStr = `VARCHAR(${len}) NOT NULL`;
        } else if (dDef.type === ValueType.num) {
          typeStr = 'INT NOT NULL';
          // } if (cDef.type === ValueType.date) {
        } else if (dDef.type === ValueType.bool) {
          typeStr = 'TINYINT NOT NULL';
        }
      }
      outStr = `,${sw}${name}${sw} ${typeStr}`;
      outRows.push(outStr);
      columnCount += 1;
    }

    if (columnCount === 0) {
      console.log('No Columns');
      return;
    }
    outRows[outRows.length - 1] += ');';
    if (showWrittenRows) {
      for (const [i, v] of outRows.entries()) {
        console.log('CREATE', i, v);
      }
    }

    querySave.createSql = outRows;
  }

  private undupColumnName(
    name: string,
    versionIx: number,
  ): [string, number] {
    const vname = versionIx > 0 ? `${name}_${versionIx}` : name;
    if (vname === 'id'
      || this.dataColumnDefs.some(dc => dc.displayName === vname)
      || this.compColumnDefs.some(cc => cc.displayName === vname)
      || ( this.qc.requestMgr.items as UiRequestColumn[] ).some(
        rc => rc.name === vname)) {
      versionIx = versionIx === 0 ? 2 : versionIx + 1;
      [name, versionIx] = this.undupColumnName(name, versionIx);
      }
    return [name, versionIx];
  }

}
