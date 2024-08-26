import { OnDestroy } from '@angular/core';
import { ElementRef, Injectable } from '@angular/core';
import { DbEngService } from '../api/db-eng.service';
import { DataEngService, DataColumnDef, ComputedColumnDef, Integrity, Uuid,
  WorkData, DisplayChangeSource,
} from '../api/data-eng.service';
import { UiCoreData } from '../ui/types';
import { ContextService } from '../core/context.service';
import { Point } from '@angular/cdk/drag-drop';
import { Table, ForeignKey } from '../types/db';
import { UiRequestColumn, UiRequestMgr } from '../ui/ui-request';
import { UiCoreService } from '../ui/ui-core.service';
import { UiTable, UiTableMgr, UiTableClick } from '../ui/ui-table';
import { UiJoin, UiJoinMgr } from '../ui/ui-join';
import { QueryTable, QueryJoin, QueryConstraint, QueryRequestColumn,
  QueryWorkColumn, QDoc, QueryStructIntegrityItem,
} from '../types/query';
import { QDocService } from '../api/qdoc.service';
import { QueryCoreService } from '../core/query-core.service';
import { CompareOp, dbTypeToValueType } from '../types/compute';
import * as Modal from '../services/modal.service';
import { logModalResults } from '../../constants';
import { TransCoreService } from '../core/trans-core.service';



// 45678911234567892123456789312345678941234567895123456789612345678971234567898

@Injectable({
  providedIn: 'root'
})
export class QueryService implements OnDestroy {
  uc: UiCoreData;

  constructor(
    private dbEng: DbEngService,
    public dataEng: DataEngService,
    public g: ContextService,
    public core: UiCoreService,
    public qc: QueryCoreService,
    public qd: QDocService,
    public tc: TransCoreService,
    public modal: Modal.ModalService,
  ) {
    console.log('----------------------------- Query Service');
    g.tableData = new UiCoreData();
    g.tableData.dbgName = 'TableData';

    this.uc = g.tableData;
    core.xe = this.uc;
    this.uc.core = core;
    core.initCallbacks();

    qc.joinMgr = new UiJoinMgr(this.uc, 1, dbEng);
    qc.tableMgr = new UiTableMgr(this.uc, 2, qc.joinMgr);
    qc.joinMgr.tableMgr = qc.tableMgr;
    qc.requestMgr = new UiRequestMgr(this.uc, 3, qc.tableMgr);
    qc.tableMgr.requestMgr = qc.requestMgr;

    // Register managers
    this.core.registerMgr(qc.joinMgr);
    this.core.registerMgr(qc.tableMgr);
    this.core.registerMgr(qc.requestMgr);

    this.uc.id = 'DrawQuery';
   }

   ngOnDestroy(): void {
    // console.log('QueryService Destroyed ****************************');
  }

  // Actions

  public initialize(canvas: ElementRef, scrollWrapper: ElementRef): void {
    this.core.initialize(canvas, scrollWrapper);
  }

  public okToRemoveUiTable(): boolean {
    const qc = this.qc;
    const tableIx = qc.tableMgr.currItem.ix;
    let isOk = true;
    const colArr = [];
    const requestColumnEnd = qc.requestMgr.items.length - 1;
    for (let colIx = 1; colIx < requestColumnEnd; colIx++) {
      const rCol = qc.requestMgr.getColumn(colIx);
      if (rCol.sourceTableIx === tableIx) {
        colArr.push(colIx);
      }
    }
    if (colArr.length > 0) {
      for (const colIx of colArr) {
        if (this.getRequestColumnDependencies(colIx).length > 0) {
          isOk = false;
          break;
        }
      }
    }
    if (!isOk) {
      this.modal.alert({
        title: 'Table cannot be deleted',
        message: 'Remove dependent computed column(s) first',
        okButton: 'OK',
      }).then(res => {
        if (logModalResults) {
          console.log('Modal results', res);
        }
      });
    }
    return isOk;
  }

  public removeUiTable(): void {
    const qc = this.qc;
    const tableIx = qc.tableMgr.currItem.ix;
    for (let i = qc.joinMgr.items.length; 0 < i--;) {
      const join = qc.joinMgr.getJoin(i);
      if (join.uiTblIx1 === tableIx || join.uiTblIx2 === tableIx) {
        qc.joinMgr.items.splice(i, 1);
      } else {
        if (join.uiTblIx1 > tableIx) {
          join.uiTblIx1 -= 1;
        }
        if (join.uiTblIx2 > tableIx) {
          join.uiTblIx2 -= 1;
        }
      }
    }
    qc.joinMgr.items.forEach((j, i) => { j.ix = i; });
    for (let i = qc.joinMgr.manualJoins.length; 0 < i--;) {
      const join = qc.joinMgr.manualJoins[i];
      if (join.uiTblIx1 === tableIx || join.uiTblIx2 === tableIx) {
        qc.joinMgr.manualJoins.splice(i, 1);
      } else {
        if (join.uiTblIx1 > tableIx) {
          join.uiTblIx1 -= 1;
        }
        if (join.uiTblIx2 > tableIx) {
          join.uiTblIx2 -= 1;
        }
      }
    }
    for (let i = qc.joinMgr.fKeys.length; 0 < i--;) {
      const join = qc.joinMgr.fKeys[i];
      const tableName = qc.tableMgr.currTable().table.tableName;
      if (join.tableName === tableName ||
        join.refTableName === tableName) {
          qc.joinMgr.fKeys.splice(i, 1);
      }
    }
    for (let i = qc.requestMgr.items.length; 0 < i--;) {
      const rCol = qc.requestMgr.getColumn(i);
      const deleteList: string[] = [];
      if (rCol.sourceTableIx === tableIx) {
        deleteList.push(this.getSourceFromRequestColumn(rCol));
        qc.requestMgr.items.splice(i, 1);
        qc.requestMgr.isDirty = true;
      } else if (rCol.sourceTableIx > tableIx) {
        rCol.sourceTableIx -= 1;
      }
      if (deleteList.length > 0) {
        deleteList.forEach(d => {
          this.dataEng.removeDataColumn(d);
        });
      }
    }
    qc.requestMgr.items.forEach((c, i) => { c.ix = i; });
    qc.tableMgr.currItem = undefined;
    qc.tableMgr.items.splice(tableIx, 1);
    const pos = qc.tableMgr.itemOrder.findIndex(e => e === tableIx);
    qc.tableMgr.itemOrder.splice(pos, 1);
    for (let i = qc.tableMgr.items.length; tableIx < i--;) {
      qc.tableMgr.items[i].ix = i;
      if (qc.tableMgr.itemOrder[i] > tableIx) {
        qc.tableMgr.itemOrder[i] -= 1;
      }
    }
    qc.tableMgr.isDirty = true;
    this.dataEng.workDisplayUpdate();
    this.core.draw();
  }

  public okToRemoveUiJoin(): boolean {
    // the foreign keys are the first joins, and
    // they cannot be removed
    return this.qc.joinMgr.currItem.ix >= this.qc.joinMgr.fKeys.length;
  }

  public removeUiJoin(): void {
    const qc = this.qc;
    qc.joinMgr.items.splice(qc.joinMgr.currItem.ix, 1);
    qc.joinMgr.isDirty = true;
    this.core.draw();
  }

  public getRequestColumnDependencies(
    ix: number
  ): number[] {           // array returning computed columns indexes
    const de = this.dataEng;
    if (de.dataColumnDefs.length > 0) {
      const rCol = this.qc.requestMgr.getColumn(ix);
      const dix = de.dataColumnDefs.findIndex(dCol =>
        dCol.displayName === rCol.name);
      if (dix > -1) {
        return de.checkForDependencies(-dix - 1);
      }
    }
    return[];
  }

  public okToRemoveUiRequestColumn(
    rCol: UiRequestColumn
  ): boolean {             // true if ok to remove - false otherwise
    const colIx = rCol.ix;
    let isOk = true;
    if (colIx > 0) {
      // remove one column
      isOk = this.getRequestColumnDependencies(rCol.ix).length === 0;
    } else {
      // remove whole query
      const requestColumnEnd = this.qc.requestMgr.items.length - 1;
      for (let rcIx = 1; rcIx < requestColumnEnd; rcIx++) {
        if (this.getRequestColumnDependencies(rcIx).length > 0) {
          isOk = false;
          break;
        }
      }
    }
    if (!isOk) {
      let title = colIx > 0 ? 'Query column' : 'Query';
      title += ' cannot be deleted';
      const message = 'Remove dependent computed column(s) first';
      this.modal.alert({
        title,
        message,
        okButton: 'OK',
      }).then(res => {
        if (logModalResults) {
          console.log('Modal results', res);
        }
      });
    }
    return isOk;
  }

  public getSourceFromRequestColumn(rCol: UiRequestColumn): string {
    const table = this.qc.tableMgr.getTable(rCol.sourceTableIx);
    return `${table.dbTblSource}.${
      table.table.columns[rCol.sourceColumnIx].columnName}`;
  }

  public removeOneUiRequestColumn(rCol: UiRequestColumn): void {
    const qc = this.qc;
    const colIx = rCol.ix;
    if (colIx > 0) {
      // remove one column
      const dbTblColSource = this.getSourceFromRequestColumn(rCol);
      this.dataEng.removeDataColumn(dbTblColSource);
      qc.requestMgr.items.splice(colIx, 1);
      qc.requestMgr.reindex(colIx);
    }
  }

  public removeUiRequestColumn(rCol: UiRequestColumn): void {
    const qc = this.qc;
    const colIx = rCol.ix;
    if (colIx > 0) {
      // remove one column
      this.removeOneUiRequestColumn(rCol);
    } else {
      // remove whole query
      for (let i = qc.requestMgr.items.length - 1; 1 < i--;) {
        const col = qc.requestMgr.getColumn(i);
        this.removeOneUiRequestColumn(col);
      }
      qc.requestMgr.items.splice(1, qc.requestMgr.items.length - 2);
      qc.requestMgr.items[1].ix = 1;
      qc.requestMgr.currItem = undefined;
    }
    qc.requestMgr.isDirty = true;
    this.dataEng.workDisplayUpdate();
    this.core.draw();
  }

  public async deleteQuery(): Promise<void> {
    await this.qd.deleteQDoc(this.qc.currQuery);
    this.qd.clearQuery();
    this.qd.newQDoc(true);
    this.qc.clearQDirty();
  }

  public addUiTable(
    leftTop: Point,
    table: Table,
    tableName?: string,
  ): UiTable {
    const nativeScroll =
      this.core.xe.scrollWrapper.nativeElement as HTMLElement;
    leftTop.x += nativeScroll.scrollLeft;
    leftTop.y += nativeScroll.scrollTop;
    const uiTable = new UiTable(this.qc.tableMgr, leftTop, tableName, table);
    this.core.clearCurrentItem();
    this.qc.tableMgr.currItem = uiTable;
    this.core.draw();
    return uiTable;
  }

  // public addRequestColumn(
  //   displayName: string,
  //   pos: number,
  //   sourceTableIx: number,
  //   sourceColumnIx: number,
  //   seqNum: number,
  //   uuid: number,
  // ): UiRequestColumn {
  //   return this.qdoc.addRequestColumn(
  //     displayName,
  //     pos,
  //     sourceTableIx,
  //     sourceColumnIx,
  //     seqNum,
  //     uuid,
  //   );
  // }

  public onResize(): void {
    this.qc.tableMgr.vecUpdateExtent();
    this.qc.tableMgr.vecDraw();
  }

  // Load create methods

  public createTable(qt: QueryTable): UiTable {
    const leftTop = { x: qt.rect.x, y: qt.rect.y } as Point;
    const table = this.dbEng.map.get(qt.dbTblSource);
    // console.log('LOAD-TABLE', qt.dbTblSource, table);
    const uiTable =
      new UiTable(this.qc.tableMgr, leftTop, qt.displayName, table);
    uiTable.rect.width = qt.rect.width;
    uiTable.rect.height = qt.rect.height;
    return uiTable;
  }

  public createJoin(qj: QueryJoin): UiJoin {
    const qc = this.qc;
    const tableMgr = qc.tableMgr;
    const [ db1, tbl1, col1 ] = qj.dbTblColSource1.split('.');
    const dt1 = db1 + '.' + tbl1;
    const tix1 = tableMgr.getTables().findIndex(
      e => e.dbTblSource === dt1);
    const cix1 = tableMgr.getTable(tix1).table.columns
      .findIndex(e => e.columnName === col1);

    const [ db2, tbl2, col2 ] = qj.dbTblColSource2.split('.');
    const dt2 = db2 + '.' + tbl2;
    const tix2 = tableMgr.getTables().findIndex(
      e => e.dbTblSource === dt2);
    const cix2 = tableMgr.getTable(tix2).table.columns
      .findIndex(e => e.columnName === col2);
    return new UiJoin(
      qc.joinMgr, tix1, cix1, tix2, cix2, CompareOp.eq, qj.isAuto);
  }

  public createConstraint(qc: QueryConstraint): void {
    const [ db, tbl, col ] = qc.sourceColumn.split('.');
    const dt = db + '.' + tbl;
    const tix = this.qc.tableMgr.getTables().findIndex(
      e => e.dbTblSource === dt);
    const uiTable = this.qc.tableMgr.getTable(tix);
    const cix = uiTable.table.columns.findIndex(e => e.columnName === col);
    const tCol = uiTable.table.columns[cix];
    tCol.constraint = {
      tableName: uiTable.table.tableName,
      columnName: tCol.columnName,
      compareOp: qc.operator,
      valuesStr: qc.values.join(', '),
      tp: dbTypeToValueType(tCol.type),
    };
    this.core.draw();
  }

  public createRequestColumn(
    qdoc: QDoc,
    qrc: QueryRequestColumn,
  ): UiRequestColumn {
    const qc = this.qc;
    const [ db, tbl, col ] = qrc.dbTblColSource.split('.');
    const dt = db + '.' + tbl;
    const tix = qc.tableMgr.getTables().findIndex(
      e => e.dbTblSource === dt);
    const cix = qc.tableMgr.getTable(tix).table.columns
      .findIndex(e => e.columnName === col);
    const rc =
      new UiRequestColumn(
        qc.requestMgr,
        qrc.displayName,
        -1,
        tix,
        cix,
        qrc.seqNum,
        qrc.uuid,
      );
    rc.format = qrc.format;
    return rc;
  }

  public createWorkColumn(
    qwc: QueryWorkColumn,
    ix: number,
    qdoc: QDoc,
  ): void {
    const qc = this.qc;
    const qe = this.dataEng;
    if (qwc.isComputed) {
      if (qwc.source === '_groupByEnd_') {
        // console.log('CREATE WORK GROUPBY');
        const groupArr = [];
        for (let i = 0; i < ix; i++) {
          groupArr.push(qdoc.workColumns[i].name);
        }
        qe.setGroupByFromArr(groupArr);
        qe.compColumnDefs[0].just = qwc.just;
      } else {
        // console.log('CREATE WORK COMPUTED', qwc.source);
        const wcc = this.dataEng.addComputedColumnWithSource(
          qwc.name, !qwc.isHidden, qwc.source, true, qwc.uuid);
        wcc.uuid = qwc.uuid;
        wcc.isVisible = !qwc.isHidden;
        wcc.doNotOutput = qwc.notOut;
        wcc.just = qwc.just;
        wcc.type = qwc.computedType;
        wcc.dbType = qwc.dbType;
        wcc.aggSibling = qwc.aggSibling;
        wcc.changeDate = qwc.changeDate;
      }
    } else {
      const [ db, tbl, col ] = qwc.source.split('.');
      const dt = db + '.' + tbl;
      const tix = qc.tableMgr.getTables().findIndex(
        e => e.dbTblSource === dt);
      const qTbl = qc.tableMgr.getTable(tix);
      const cix = qTbl.table.columns.findIndex(e => e.columnName === col);
      const rCol =  qc.requestMgr.getColumn(
        qc.requestMgr.findIxFromUuid(qwc.uuid));
      const wdc = qe.addDataColumn(
        qwc.name,
        col,
        dt,
        qTbl.table.columns[cix].type,
        rCol.integrityCode,
        qwc.uuid,
      );
      wdc.uuid = qwc.uuid;
      wdc.isVisible = !qwc.isHidden;
      wdc.doNotOutput = qwc.notOut;
      wdc.just = qwc.just;
      wdc.dbType = qwc.dbType;
      wdc.aggSibling = qwc.aggSibling;
      wdc.changeDate = qwc.changeDate;
      wdc.fixDate = qwc.fixDate;

      // console.log('CREATE WORK COLUMN', qwc.source, wdc);
    }
  }

  // public updateOneDataColIntegrityPrim(
  //   name: string,
  //   changeDate: string,
  //   fixDate: string,
  // ): string {
  //   return changeDate > fixDate
  //     ? `'${name}' has been redefined`
  //     : '';
  // }

  // public updateOneDataColIntegrity(
  //   qdoc: QDoc,
  //   dCol: DataColumnDef,
  //   integrityErrors: string[],
  // ): Integrity {
  //   const integrityItem = qdoc.integrityItems.find(ii =>
  //     dCol.dbTblColSource === ii.dbTblColSource);
  //   if (!integrityItem) {
  //     return Integrity.ok;
  //   }
  //   const errorMessage = this.updateOneDataColIntegrityPrim(
  //     dCol.displayName, integrityItem.changeDate, dCol.fixDate);
  //   // const changeDate = new Date(integrityItem.changeDate);
  //   // const fixDate = new Date(dCol.fixDate);
  //   const integrityCode = errorMessage
  //     ? Integrity.error
  //     : Integrity.ok;
  //   dCol.integrityCode = integrityCode;
  //   if (integrityCode !== Integrity.ok
  //     && this.tc.execTrans === this.tc.mainTrans) {
  //     const rCol = this.qc.requestMgr.getColumns().find(
  //       rc => rc.uuid === dCol.uuid);
  //     rCol.integrityCode = integrityCode;
  //   }
  //   if (integrityErrors && integrityCode !== Integrity.ok) {
  //     integrityErrors.push(errorMessage);
  //   }
  //   return integrityCode;
  // }

  public updateOneDataColIntegrity(
    qdoc: QDoc,
    dCol: DataColumnDef,
    integrityErrors: string[],
  ): Integrity {
    const integrityItem = qdoc.integrityItems.find(ii =>
      dCol.dbTblColSource === ii.dbTblColSource);
    if (!integrityItem) {
      return Integrity.ok;
    }
    const changeDate = new Date(integrityItem.changeDate);
    const fixDate = new Date(dCol.fixDate);
    const integrityCode = changeDate > fixDate
      ? Integrity.error
      : Integrity.ok;
    dCol.integrityCode = integrityCode;
    if (integrityCode !== Integrity.ok
      && !this.tc.execTrans) {
      const rCol = this.qc.requestMgr.getColumns().find(
        rc => rc.uuid === dCol.uuid);
      rCol.integrityCode = integrityCode;
    }
    if (integrityErrors && integrityCode !== Integrity.ok) {
      integrityErrors.push(`'${dCol.displayName}' has been redefined`);
    }
    return integrityCode;
  }

  public updateDataColumnsIntegrity(
    qdoc: QDoc,
    integrityErrors: string[],
  ): boolean {          // false: ok - true: integrity error
    let docHasIntegrityError = false;
    this.dataEng.dataColumnDefs.forEach(dCol => {
      const iError =
        this.updateOneDataColIntegrity(qdoc, dCol, integrityErrors);
      if (iError) {
        docHasIntegrityError = true;
      }
    });
    return docHasIntegrityError;
  }

  public updateQDocIntegrity(
    qdoc: QDoc,
    integrityErrors: string[],
  ): boolean {          // false: ok - true: integrity error
    const docHasIntegrityError =
      this.updateDataColumnsIntegrity(qdoc, integrityErrors);
    if (!integrityErrors) {
      // we only update computed columns if this is a normal
      // edit session, not if it is a transformer execute
      this.dataEng.updateComputedColumnsIntegrity();
    }
    return docHasIntegrityError;
  }

  public buildDisplayedColumns(qdoc: QDoc): void {
    const qe = this.dataEng;
    qe.rowMasterUuids = qdoc.params.displayedColumns;
    qe.workDisplayInitFixedUuids();
    qe.groupEnd = qe.getGroupByIndexes().length;
  }

  public async buildQDocument(
    qdoc: QDoc,
    skipIntegrity: boolean,
  ): Promise<void> {
    const qe = this.dataEng;
    if (qdoc.queryTables.length > 0) {
      const db = qdoc.queryTables[0].dbTblSource.split('.')[0];
      await this.dbEng.setCurrentDatabase(db);
      // TODO: could this be optimized?
      await this.dbEng.loadAllTables();

      qdoc.queryTables.forEach(e => this.createTable(e));
      qdoc.queryJoins.forEach(e => {
        if (!e.isAuto) {
          this.createJoin(e);
        }});
      this.qc.joinMgr.addAutoJoins();
      qdoc.queryConstraints.forEach(e => this.createConstraint(e));
      qdoc.requestColumns.forEach(e => this.createRequestColumn(qdoc, e));
      qdoc.workColumns.forEach((e, i) => this.createWorkColumn(e, i, qdoc));

      // update params

      qe.sortIndexes = qdoc.params.sortIndexes;
      qe.sortDirections = qdoc.params.sortDirections;

      this.qc.uuidGen = qdoc.params.uuidGen;
      this.qc.requestMgr.seqNumGen = qdoc.params.rcSeqNumGen;

      if (!skipIntegrity) {
        this.updateDataColumnsIntegrity(qdoc, undefined);
      }

      qe.initializeComputedColumns();
      this.buildDisplayedColumns(qdoc);
      const dcs = DisplayChangeSource.query;
      qe.setDisplayChangeSource(dcs);
      qe.workDisplayUpdate();
      // console.log('AFTER BUILD DOCUMENT', this.qdoc.currDoc);
      // console.log('AFTER BUILD DOCUMENT2', qe.compColumnDefs);
      this.core.draw();
    }

  }

  // public setQeDisplayChangeSource(
  //   source: DisplayChangeSource = DisplayChangeSource.query,
  // ): void {
  //   this.dataEng.setDisplayChangeSource(source);
  // }

}

