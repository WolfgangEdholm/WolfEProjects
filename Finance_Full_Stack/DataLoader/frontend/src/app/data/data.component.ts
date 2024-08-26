import { Component, OnInit, OnDestroy, AfterViewInit, NgZone,
  ViewChild, ElementRef, ViewChildren, QueryList, ChangeDetectorRef,
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { CssService } from '../ui-engine/ui-css.service';
import { DataEngService, ColumnDef, Integrity } from '../api/data-eng.service';
import { Subscription, throwError } from 'rxjs';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSort, MatSortable, MatSortHeader, Sort, SortDirection
} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

import { MatDialog } from '@angular/material/dialog';
import { WDataModalComponent, WDataModalSpec
} from '../modals/wdata/wdata-modal.component';
import { WCompModalComponent, WCompModalSpec
} from '../modals/wcomp/wcomp-modal.component';
import * as Modal from '../services/modal.service';
import { Just, valueToStr, ValueType } from '../types/compute';
import { DataModalComponent, QueryEditSpec
} from '../modals/data/data-modal.component';
import { AggType } from '../types/compute';
import { QDocService } from '../api/qdoc.service';
import { WorkData, WorkDataCode } from '../api/data-eng.service';
import { ContextService } from '../core/context.service';
import { QueryCoreService } from '../core/query-core.service';
import { QueryService } from '../cmd/query.service';
import { moveArrayItems } from '../utils/array';
import { DEFAULT_BREAKPOINTS } from '@angular/flex-layout';


const MODAL_TOP = '160px';

const NO_SELECTION = -999;

enum Selections {
  none,
  dataColumn,
  computedColumn,
  headerCell,
  controlButton,
}

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit, AfterViewInit, OnDestroy {

  // @ViewChild(MatSort, {static: false}) sort: MatSort;
  // @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChildren(MatSort) sortQuery: QueryList<ElementRef>;

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

  sortActive: string;
  sortDirection: SortDirection;

  dataSource = new MatTableDataSource();
  // groupEnd = 0;

  help: string;

  selectedColCd = NO_SELECTION;
  selectedColIx = NO_SELECTION;

  removeIsDisabled = false;
  editIsDisabled = false;
  saveIsDisabled = true;
  saveDataIsDisabled = false;

  tableIsReady = false;

  // for Template
  // eslint-disable-next-line @typescript-eslint/naming-convention
  NO_SELECTION = NO_SELECTION;

  groupByEnd = WorkData.groupByEnd;

  private subscriptions = new Subscription();

  constructor(
    // private zone: NgZone,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private dialog: Modal.ModalService,
    private matDialog: MatDialog,
    public qd: QDocService,
    public dataEng: DataEngService,
    public qc: QueryCoreService,
    public qs: QueryService,
    public css: CssService,
    public g: ContextService,
  ) {
    console.log('----------------------------- Data Screen');
  }

  public async ngOnInit(): Promise<void> {
    this.g.setAppSection('Query Data');

    await this.buildTable();

    // console.log('QUERY-------------------', this.dataSource.data);

    this.setupDisplayData();
  }

  public async buildTable(): Promise<void> {
    const de = this.dataEng;
    this.tableIsReady = false;
    await de.getData();
    if (de.hasGroupBy()) {
      de.buildAggSiblings();
    }
    this.tableIsReady = true;
  }

  public ngAfterViewInit(): void {
    // This construct calls setupSort after data is loaded the first time
    this.subscriptions.add(this.sortQuery.changes.subscribe(_ => {
      this.setupSort();
    }));
    // This construct calls setupSort if already exists and won't
    // be called later
    if (this.sortQuery.first) {
      this.setupSort();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // this.checkForRearangedColumns();
    const de = this.dataEng;
    // Next two statements guarantee that sort is reset on reentry
    // de.fixedColumns = undefined;
    // de.bupDisplayedColumns = de.displayedColumns;

    // de.bupDataNames = de.dataColumnDefs.map(e => e.displayName);
    // de.bupCompNames = de.compColumnDefs.map(e => e.displayName);

    // de.bupIndexNames = de.fixedIndexes;
    // de.bupDisplayIndex = de.displayedIndexes;
    // de.displayedColumns = [];
    // de.fixedIndexes = [];
    // de.currPageSize = this.paginator.pageSize;
  }

  public isSortingDisabled(c: number): boolean {
    const de = this.dataEng;
    // const fixedIndexes = de.isGroupDisplay
    //   ? this.dataEng.groupFixedIndexes
    //   : this.dataEng.rowFixedIndexes;
    // return fixedIndexes[c] === WorkDataCode.groupByEnd;
    return de.currFixedIndexes[c] === WorkDataCode.groupByEnd;
  }

  public isDraggingDisabled(c: number): boolean {
    const de = this.dataEng;
    if (!de.isGroupDisplay) {
      return false;
    }
    // const fixedIndexes = de.isGroupDisplay
    //   ? this.dataEng.groupFixedIndexes
    //   : this.dataEng.rowFixedIndexes;
    // return fixedIndexes[c] === WorkDataCode.groupByEnd;
    return de.currFixedIndexes[c] === WorkDataCode.groupByEnd;
  }

  public onSelectColumn(c: number): void {
    const de = this.dataEng;
    let selection: Selections = Selections.none;
    if (!(de.hasGroupBy() && c === 0 /* groupEnd */)
      && c !== NO_SELECTION) {
      if (c !== WorkDataCode.groupByEnd && c !== NO_SELECTION) {
        // const fixedIndexes = de.isGroupDisplay
        //   ? de.groupFixedIndexes
        //   : de.rowFixedIndexes;
        // const colIx = fixedIndexes[c];
        const colIx = de.currFixedIndexes[c];
        this.selectedColCd = (colIx < -998) ? NO_SELECTION : c;
        this.selectedColIx = colIx;
        selection = (colIx === NO_SELECTION
          ? Selections.none
          : (this.selectedColIx < 0
            ? Selections.computedColumn
            : Selections.dataColumn));
      }
    }
    this.statusUpdater(selection);
  }

  public onToQuery(): void {
    const queryUrl = `/query`;
    this.router.navigate( [ queryUrl ] );
  }

  public editQuery(): void {
    this.queryEditModal();
  }

  public statusUpdater = (selection: Selections): void => {
    // console.log('DATA COMPONENTS UPDATER');
  };

  public onEdit(): void {
    if (this.selectedColCd > NO_SELECTION) {
      this.editColumn(this.selectedColCd);
    }
  }

  public onSaveQuery(event: MouseEvent): void {
    console.log('SAVE shift =', event.shiftKey);
    this.qd.uxSaveQDoc(event.shiftKey);
    this.qc.clearQDirty();
  }

  public async onSaveData(event: MouseEvent): Promise<void> {
    console.log('SAVEData shift =', event.shiftKey);
    await this.dataEng.writeData();
    if (this.qc.currQuery.id > 0) {
      // We are writing data of an existing query
      await this.qd.updateDataIntegrity(this.qc.currQuery);
    }
  }

  public async drop(event: CdkDragDrop<string[]>): Promise<void> {
    const from = event.previousIndex; // add first column
    const to = event.currentIndex;
    if (from === to) {
      return;
    }
    const de = this.dataEng;
    // const masterIndexes = de.isGroupDisplay
    //   ? this.dataEng.groupMasterIndexes
    //   : this.dataEng.rowMasterIndexes;
    const hasGroupBy = de.hasGroupBy();
    const groupByIndexes = hasGroupBy ? de.getGroupByIndexes() : [];
    const d = de.isGroupDisplay
      ? 1 // groupBy
      : hasGroupBy
        ? 2   // rowNum & groupBy
        : 1;  // rowNum
    let dropOK = true;
    const movingGE = from === de.groupEnd;
    if (movingGE && from < to) {
      console.log('MOVING GROUPEND OUT', from, to);
      for (let i = from + 1; i <= to; i++) {
        const ix = de.currMasterIndexes[i];
        if (ix < 0) {
          const cDef = de.compColumnDefs[-ix - 1];
          if (cDef.codeUnit.aggType === AggType.agg) {
            await this.badDrop();
            dropOK = false;
          }
        }
      }
    } else {
      if (to <= de.groupEnd) {
        // moved into groupby area
        const moveIx = de.currMasterIndexes[from];
        if (moveIx < 0 && moveIx !== WorkDataCode.groupByEnd) {
          const cDef = de.compColumnDefs[-moveIx - 1];
          if (cDef.codeUnit.aggType === AggType.agg) {
            await this.badDrop();
            dropOK = false;
          }
        }
      }
    }
    if (dropOK) {
      if (movingGE) {
        // console.log('0000', from, '->', to);
        if (from < to) {
          // move columns into groupBy
          const count = to - from;
          const start = de.groupEnd + 1;
          for (let ix = 0; ix < count; ix++) {
            const loopFrom = start + ix;
            const loopTo = loopFrom - 1;
            // console.log('A Loop', loopFrom, '->', loopTo);
            de.workDisplayMoveColumn(loopFrom, loopTo, to);
          }
        } else {
          // move columns out of groupBy
          const count = from - to;
          const start = de.groupEnd;
          for (let ix = 0; ix < count; ix++) {
            const loopTo = start - ix;
            const loopFrom = loopTo - 1;
            // console.log('B Loop start ix from to',
            //   start, ix, loopFrom, '->', loopTo);
            de.workDisplayMoveColumn(loopFrom, loopTo, to);
          }
        }
      } else {
        de.workDisplayMoveColumn(from, to);
      }

      de.syncDisplayData();
      if (hasGroupBy) {
        const groups = de.rowMasterNames.slice(2, de.groupEnd + 2).map(e => e);
        de.setGroupByFromArr(groups);
        de.buildAggSiblings();
        let sortLen = de.sortIndexes.length;
        for (let i = 0;
          de.currMasterIndexes[i] !== WorkDataCode.groupByEnd; i++) {
          sortLen -= 1;
          if (de.currMasterIndexes[i] !== groupByIndexes[i]) {
            sortLen = 0;
            // Update Sort
            de.sortIndexes = [];
            de.sortDirections = [];
            for (let j = 0;
              de.currMasterIndexes[j] !== WorkDataCode.groupByEnd; j++) {
              de.sortIndexes.push(de.currMasterIndexes[j]);
              de.sortDirections.push(1);
            }
            this.dataSort();
          }
        }
        while (sortLen > 0) {
          de.sortIndexes.pop();
          sortLen -= 1;
        }
      }
    }
    console.log('SORTINDEXES', de.sortIndexes);
    de.showDisplayIndexes('AFTER');
  }

  public rowNum(displayRow: number): number {
    return !this.paginator ? 0 : (this.paginator.pageIndex === 0
      ? displayRow + 1 : 1 + displayRow +
      this.paginator.pageIndex * this.paginator.pageSize);
  }

  public groupNum(displayRow: number): string {
    const de = this.dataEng;
    const rowNm = de.isGroupDisplay
      ? de.groupRows[displayRow]
      : de.sortDataRows[displayRow];
    const value = de.computedColumns[0][rowNm];
    return valueToStr(value);
  }

  public addGroupBy(): void {
    const de = this.dataEng;
    de.setGroupByFromArr([]);
    de.workDisplayUpdate();
    de.buildAggSiblings();
  }

  public toggleGroupView(): void {

    this.dataEng.isGroupDisplay = !this.dataEng.isGroupDisplay;
    this.setupDisplayData();
  }

  public addComputed(): void {
    this.columnModal(NO_SELECTION);
  }

  // expects columnIx to match the fixedColumns / fixedIndexes arrays
  public async editColumn(columnIx: number): Promise<void> {
    // this.dataEng.showDisplayIndexes();
    this.selectedColIx = columnIx;
    await this.columnModal(columnIx);
    this.selectedColCd = NO_SELECTION;
  }

  public async queryEditModal(): Promise<void> {
    const de = this.dataEng;
    const originalSortIndexes = de.getGroupByIndexes();
    const width = '600px';
    // const fixedNames = de.isGroupDisplay
    //   ? de.groupFixedNames
    //   : de.rowFixedNames;
    const allVisibleColumns = de.currFixedNames.filter(
      c => c !== WorkData.groupByEnd);
    const currGroupByColumns = de.getGroupByColumns();
    const hasGroupBy = de.hasGroupBy();
    // const allHideableColumns = Array.from(allVisibleColumns);
    const allHideableColumns = [];
    allHideableColumns.push(...allVisibleColumns);
    const hiddenColumns = [];
    const groupByColumns = [];
    if (hasGroupBy && de.groupEnd > 0) {
      // Group by columns can be hidden
      groupByColumns.push(...allHideableColumns.slice(
        0, de.groupEnd));
      allHideableColumns.splice(0, de.groupEnd);
    }
    de.dataColumnDefs.forEach(dc => {
      if (!allHideableColumns.includes(dc.displayName)
        && !groupByColumns.includes(dc.displayName)) {
        allHideableColumns.push(dc.displayName);
        if (!dc.isVisible) {
          hiddenColumns.push(dc.displayName);
        }
      }
    });
    de.compColumnDefs.slice(1).forEach(cc => {
      if (!allHideableColumns.includes(cc.displayName)
        && !groupByColumns.includes(cc.displayName)) {
        if (!cc.isAggSibling) {
          allHideableColumns.push(cc.displayName);
          if (!cc.isVisible) {
            hiddenColumns.push(cc.displayName);
          }
        }
      }
    });

    const modalRef = this.matDialog.open(DataModalComponent, {
      maxWidth: window.innerWidth + 'px',
      maxHeight: window.innerHeight + 'px',
      width,
      position: { top: MODAL_TOP, left: '', bottom: '', right: '' },
      disableClose: true,
      data: {
        hasGroupBy: de.hasGroupBy(),
        groupByColumns: currGroupByColumns,
        allVisibleColumns,
        hiddenColumns,
        allHideableColumns,
      } as QueryEditSpec,
    });
    lastValueFrom(modalRef.afterClosed()).then(result => {
      if (result.code === Modal.ReturnCode.ok) {
        this.setupDisplayData();
        de.buildAggSiblings();
        if (de.hasGroupBy()) {
          de.sortIndexes = de.getGroupByIndexes();
          if (originalSortIndexes.length !== de.sortIndexes.length ||
            de.sortIndexes.every((e, ix) => e !== originalSortIndexes[ix])) {
            this.dataSort();
          }
        }
      }
    });
  }

  public async columnModal(columnIx: number): Promise<void> {
    const de = this.dataEng;
    de.removeAllAggSiblings();
    let isNew = false;
    let colIx = columnIx;
    const name = '';
    let workIx: number;
    if (colIx === NO_SELECTION) {
      console.log('ADD COMPUTED');
      isNew = true;
      colIx = de.compColumnDefs.length;
      de.addComputedColumn(`Computed${colIx + 1}`, true);
      workIx = -colIx - 1;
    } else {
      // const fixedIndexes = de.isGroupDisplay
      //   ? de.groupFixedIndexes
      //   : de.rowFixedIndexes;
      // workIx = fixedIndexes[columnIx];
      workIx = de.currFixedIndexes[columnIx];
      colIx = workIx < 0 ? -workIx - 1 : workIx;
    }
    if (workIx < 0) {
      await this.wcompModal(isNew, colIx);
    } else {
      await this.wdataModal(colIx, '50rem');
    }
    if (de.hasGroupBy()) {
      de.buildAggSiblings();
    }
  }

  public cellValue(displayRow: number, columnIx: number): string {
    if (!this.tableIsReady) {
      return '';
    }
    const de = this.dataEng;
    const rowNm = de.isGroupDisplay
      ? de.groupRows[displayRow]
      : displayRow;
    const v = de.getFixedIndex(columnIx);
    if (de.isGroupDisplay && columnIx > de.groupEnd) {
      // display aggregate
      const aggIx = (v < 0)
        ? de.compColumnDefs[-v - 1].aggSibling
        : de.dataColumnDefs[v].aggSibling;
      const value = de.computedColumns[aggIx][rowNm];
      return valueToStr(value);
    }
    if (v < 0) {
      if (v === WorkDataCode.groupByEnd) {
        return '';
      }
      const compIx = -v - 1;

      const cu = de.compColumnDefs[compIx].codeUnit;
      if (cu.isReady) {
        const value = de.computedColumns[compIx][rowNm];
        return valueToStr(value);
      }
      return '';
    }
    const dDef = de.dataColumnDefs[v];
    const name = dDef.sourceName;
    return `${de.dataRows[rowNm][name]}`;
  }

  // Table cell formatting

  public headerClass(columnIx: number): any {
    const v = this.dataEng.getFixedIndex(columnIx);
    if (v === WorkDataCode.groupByEnd) {
      return 'group-by-end right-class';
    }
    const classes = { };
    const integrityCode = this.integrityCode(columnIx);
    if (integrityCode === Integrity.error) {
      classes['error-color'] = true;
    } else if (integrityCode === Integrity.warning) {
      classes['warning-color'] = true;
    }
    if (this.isDataColumnInGroup(columnIx)) {
      classes['group-color'] = true;
    }
    return classes;
  }

  public cellClass(columnIx: number): any {
    const v = this.dataEng.getFixedIndex(columnIx);
    if (v === WorkDataCode.groupByEnd) {
      return 'group-by-end';
    }
    let classesStr = '';
    if (this.isDataColumnInGroup(columnIx)) {
      classesStr += 'group-color ';
    }
    const just = v < 0
      ? this.dataEng.compColumnDefs[-v - 1].just
      : this.dataEng.dataColumnDefs[v].just;
    if (just === Just.default) {
      classesStr += this.cellIsNumber(columnIx)
      ? 'right-class'
      : 'left-class';
    } else {
      classesStr += just === Just.right ? 'right-class'
        : just === Just.center ? 'center-class'
          : 'left-class';
    }
    return classesStr;
  }

  // dataIsCurrency(dataColumnIx: number): boolean {
  //   return this.dataEng.dataColumnDefs[dataColumnIx].type === ValueType.num;
  // }

  public cellIsNumber(columnIx: number): boolean {
    const v = this.dataEng.getFixedIndex(columnIx);
    if (v === WorkDataCode.groupByEnd) {
      return false;
    }
    const type = v < 0
      ? this.dataEng.compColumnDefs[-v - 1].type
      : this.dataEng.dataColumnDefs[v].type;
    return type === ValueType.num;
  }

  public title(columnIx: number): string {
    const v = this.dataEng.getFixedIndex(columnIx);
    if (v === WorkDataCode.groupByEnd) {
      return ')';
    }
    const col = this.dataEng.getColumnInfo(v);
    const name = col.doNotOutput ? `(${col.displayName})` : col.displayName;
    return name;
  }

  public sortIsDisabled(): boolean {
    return !!this.dataEng.isGroupDisplay;
  }

  public sortChange(event: Sort): void {
    const de = this.dataEng;
    if (de.isGroupDisplay) {
      return;   // try to remove
    }
    console.log('SORTCHANGE', event);

    de.currSortable = {
      disableClear: false,
      id: event.active,
      start: event.direction === '' ? 'asc' :  event.direction,
    };
  }

  public updateDataSource(): void {
    const de = this.dataEng;
    if (de.isGroupDisplay) {
      this.dataSource.data = de.sortGroupRows;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = de.sortDataRows;
      this.dataSource.paginator = this.paginator;
    }
  }

  public dataSort(): void {
    const de = this.dataEng;
    de.dataSort();
    this.updateDataSource();
  }

  public sortClick(event: MouseEvent): void {
    let uiUpdateNeeded = false;
    const de = this.dataEng;
    if (de.isGroupDisplay) {
      return;
    }
    const isShiftDown = event.shiftKey;
    const extra = de.hasGroupBy() ? 2 : 1;
    let colNm = de.rowMasterNames.indexOf(de.currSortable.id) - extra;
    const colV = de.rowMasterIndexes[colNm];
    if (de.hasGroupBy() && colNm > de.groupEnd) {
      colNm -= 1;
    }
    let direction = de.currSortable.start === 'desc' ? -1 :
    de.currSortable.start === 'asc' ? 1 : 0;
    const currDirection = de.getSortDirection(colV);
    if (currDirection !== 0 && direction === currDirection) {
      direction = currDirection === 1 ? -1 : 1;
      uiUpdateNeeded = true;
    }

    if (isShiftDown) {
      // extend current sort
      // is column in current sort?
      const existingIx = de.sortIndexes.findIndex(v => v === colV);
      if (existingIx !== -1) {
        de.sortDirections[existingIx] = direction;
      } else {
        de.sortIndexes.push(colNm);
        de.sortDirections.push(direction);
      }
    } else {
      // start new sort
      // clear current sort
      // clear sort items past group by
      const baseSize = de.groupEnd;
      de.sortIndexes.slice(baseSize).forEach(i => {
        de.setSortDirection(de.currFixedIndexes[i], 0);
      });
      de.sortIndexes.splice(baseSize);
      de.sortDirections.splice(baseSize);
      // set sort
      if (de.hasGroupBy()) {
        const existingIx = de.sortIndexes.findIndex(v => v === colV);
        if (existingIx !== -1) {
          de.sortDirections[existingIx] = direction;
        } else {
          de.sortIndexes.push(colNm);
          de.sortDirections.push(direction);
        }
      } else {
        de.sortIndexes.push(colNm);
        de.sortDirections.push(direction);
      }
    }
    de.setSortDirection(colV, direction);
    this.sortActive = de.getColumnInfo(colV).displayName;
    this.sortDirection = de.sortDirectionFromNum(de.getSortDirection(colV));
    if (uiUpdateNeeded) {
      const ms: MatSortable = {
        id: this.sortActive,
        start: this.sortDirection || 'asc',
        disableClear: false,
     };
      this.setSort(ms);
    }
    this.dataSort();
    // console.log('SORT', ...this.dataSource.data);
  }

  // Private methods

  private setupDisplayData(): void {
    const de = this.dataEng;
    de.adjustDisplayData();
    this.updateDataSource();
    de.syncDisplayData();
    de.workDisplayUpdateCurr();
  }

  private async badDrop(): Promise<void> {
    this.dialog.message('Cannot Group By Aggregate Function Column')
      .then(res => {
        console.log('Dialog results', res);
      });
  }

  private async wdataModal(
    colIx: number,
    width: string,
  ): Promise<void> {
    const de = this.dataEng;
    // Remove edited column
    // const columnName = de.dataColumnDefs[colIx].displayName;
    // const columns = de.fixedColumns.filter(c => c !== columnName);

    const modalRef = this.matDialog.open(WDataModalComponent, {
      maxWidth: window.innerWidth + 'px',
      maxHeight: window.innerHeight + 'px',
      width,
      position: { top: MODAL_TOP, left: '', bottom: '', right: '' },
      disableClose: true,
      data: {
        // columns,
        // dbType: de.compColumnDefs[colIx].dbType,
        ix: colIx,
      } as WDataModalSpec,
    });
    lastValueFrom(modalRef.afterClosed()).then(result => {
      if (result.code === Modal.ReturnCode.other) {
        // de.removeDataColumn(colIx);
      } else if (result.code === Modal.ReturnCode.ok) {
        // edit
      }
    });
  }

  private async wcompModal(
    isNew: boolean,
    colIx: number,
  ): Promise<void> {
    const de = this.dataEng;
    // Remove edited column
    const columnName = de.compColumnDefs[colIx].displayName;
    // const fixedNames = de.isGroupDisplay
    //   ? de.groupFixedNames
    //   : de.rowFixedNames;
    // const columns = fixedNames.filter(c => c !== columnName);
    const columns = de.currFixedNames.filter(c => c !== columnName);

    const modalRef = this.matDialog.open(WCompModalComponent, {
      maxWidth: window.innerWidth + 'px',
      maxHeight: window.innerHeight + 'px',
      position: { top: MODAL_TOP, left: '', bottom: '', right: '' },
      disableClose: true,
      panelClass: 'x-mat-container',
      data: {
        name: columnName,
        codeUnit: de.compColumnDefs[colIx].codeUnit,
        columns,
        isNewColumn: isNew,
        dbType: de.compColumnDefs[colIx].dbType,
        ix: colIx,
      } as WCompModalSpec,
    });
    await lastValueFrom(modalRef.afterClosed()).then(result => {
      if (result.code === Modal.ReturnCode.other) {
        de.removeComputedColumn(colIx);
      } else if (result.code === Modal.ReturnCode.ok) {
        if (isNew) {
          // new
        } else {
          // edit
        }

      }
    });
  }

  private integrityCode(columnIx: number): number {
    const de = this.dataEng;
    const v = de.rowFixedIndexes[columnIx];
    if (v >= 0) {
      return de.dataColumnDefs[v].integrityCode;
    } else {
      return de.compColumnDefs[-v - 1].integrityCode;
    }
    return 0;
  }

  private isDataColumnInGroup(columnIx: number): boolean {
    const de = this.dataEng;
    const v = de.getFixedIndex(columnIx);
    if (v === WorkDataCode.groupByEnd) {
      return true;
    }
    const displayedIx = v < 0
      ? de.compColumnDefs[-v - 1]?.displayedIx
      : de.dataColumnDefs[v]?.displayedIx;
    return displayedIx < de.groupEnd;
  }

  private setupSort(): void {
    const de = this.dataEng;
    // if (de.bupDisplayedColumns?.length > 0) {
    //   this.matchColumns();
    // }
    this.dataSource.paginator = this.paginator;
    // put before sort code so re-sort updates page size UI
    if (de.currPageSize > 0) {
      this.dataSource.paginator.pageSize = de.currPageSize;
    }
    this.dataSource.sort = this.sort;
    if (de.currSortable) {
      this.setSort(de.currSortable);
    }
    this.cdRef.detectChanges();
  }

  private setSort(ms: MatSortable): void {
    const start = ms.start || 'asc';
    const matSort = this.dataSource.sort;
    const toState = 'active';
    const disableClear = false;

    // reset state so that start is the first sort direction that you will see
    matSort.sort({ id: null, start, disableClear });
    matSort.sort(ms);

    // hack
    // eslint-disable-next-line no-underscore-dangle
    (matSort.sortables.get(ms.id) as MatSortHeader).
      _setAnimationTransitionState({ toState });
  }

}
