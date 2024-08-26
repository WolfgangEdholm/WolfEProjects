
import * as UI from './constants';
import { UiCoreData, UiiInfo, UimInfo } from './types';
import { UiItem, UiItemMgr} from './ui-item';
import { ForeignKey } from '../types/db';
import { CompareOp } from '../types/compute';
import { UiTable, UiTableMgr } from './ui-table';
import { DbEngService } from '../api/db-eng.service';

const arrowJoinWidth = 2;
const joinSelectedLineWidth = 4;

const joinClickHitWidth = 6;

const firstJoinSegment = 10;

type UiJoinDef = {
  x1: number;
  y1: number;
  left1: boolean;
  x2: number;
  y2: number;
  left2: boolean;
};

export class UiJoinMgr extends UiItemMgr {
  public manualJoins: UiJoin[] = [];
  public fKeys: ForeignKey[] = [];
  public tableMgr: UiTableMgr;
  public eng: DbEngService;

  constructor(
    uc: UiCoreData,
    plane: number,
    eng: DbEngService,
  ) {
    super(uc, plane);
    this.eng = eng;
    this.firstPartCode = UI.firstJoinCode;
    this.lastPartCode = UI.lastJoinCode;
  }

  public getJoin = (ix: number): UiJoin =>
    this.items[ix] as UiJoin;

  public currJoin = (): UiJoin =>
    this.currItem as UiJoin;

  public getJoins = (): UiJoin[] =>
    this.items as UiJoin[];


  public draw = (): void => {
    for (let i = this.items.length; 0 < i--;) {
      this.getJoin(i).draw(i === this.currItem?.ix);
    }
  };

  public onMouseDown = (
    x: number, y: number, currItem: UimInfo): UiiInfo => {
    const cvJoin = this.xyToJoin(x, y);
    let draw = false;
    const clickInfo = { item: undefined, partIx: -1 };
    if (cvJoin) {
      clickInfo.item = cvJoin;
      draw = currItem.mgr !== this || cvJoin !== currItem.item;
      this.currItem = cvJoin;
    } else {
      if (currItem.mgr === this) {
        draw = true;
      }
    }
    if (draw) {
      this.vecDraw();
    }
    return clickInfo;
  };

  public setCursor = (x: number, y: number): UiiInfo => {
    const uiiInfo = { item: undefined, partIx: -1 };
    const cvJoin = this.xyToJoin(x, y);
    if (cvJoin) {
      uiiInfo.item = cvJoin;
      this.tableMgr.uc.canvas.nativeElement.style.cursor = 'crosshair';
    }
    return uiiInfo;
  };

  public changeHappened = () => {
    // this.fKeys = [];
    // // console.log('changeHappened');
    // // select all foreign key relationship for the current tables
    // for (const uiTable of this.tableMgr.getTables()) {
    //   const fKeys = this.eng.selectForeignKeys(uiTable.table);
    //   console.log(uiTable.table.tableName, 'fKeys', fKeys);
    //   for (const fKey of fKeys) {
    //     const hit = this.tableMgr.items.filter(
    //       (it: UiTable) => it.table.tableName === fKey.refTableName);
    //     if (hit.length > 0) {
    //       this.fKeys.push(fKey);
    //     }
    //   }
    // }
    // this.items = [];
    // for (const fKey of this.fKeys) {
    //   const table1 = this.tableMgr.tableNameToTable(fKey.tableName);
    //   const table2 = this.tableMgr.tableNameToTable(fKey.refTableName);
    //   // Ignore lint error. UiJoin instals itself into the mgr.
    //   const xx = new UiJoin(
    //     this,
    //     table1.ix,
    //     table1.columnNameToIx(fKey.columnName),
    //     table2.ix,
    //     table2.columnNameToIx(fKey.refColumnName),
    //     CompareOp.eq,
    //     true,
    //   );
    // }
    // let ix = this.items.length;
    // for (const cvJoin of this.manualJoins) {
    //   this.items.push(cvJoin);
    //   cvJoin.ix = ix++;
    // }
    this.addAutoJoins();
  };

  public addAutoJoins = () => {
    this.fKeys = [];
    // select all foreign key relationship for the current tables
    for (const uiTable of this.tableMgr.getTables()) {
      const fKeys = this.eng.selectForeignKeys(uiTable.table);
      for (const fKey of fKeys) {
        const hit = this.tableMgr.items.filter((uit: UiTable) =>
          uit.table.tableName === fKey.refTableName);
        if (hit.length > 0) {
          this.fKeys.push(fKey);
        }
      }
    }
    this.items = [];
    for (const fKey of this.fKeys) {
      const table1 = this.tableMgr.tableNameToTable(fKey.tableName);
      const table2 = this.tableMgr.tableNameToTable(fKey.refTableName);
      // Ignore lint error. UiJoin instals itself into the mgr.
      const xx = new UiJoin(
        this,
        table1.ix,
        table1.columnNameToIx(fKey.columnName),
        table2.ix,
        table2.columnNameToIx(fKey.refColumnName),
        CompareOp.eq,
        true,
      );
    }
    let ix = this.items.length;
    for (const cvJoin of this.manualJoins) {
      this.items.push(cvJoin);
      cvJoin.ix = ix++;
    }
  };

  public xyToJoin = (x: number, y: number): UiJoin => {
    for (let i = this.items.length; 0 < i--;) {
      const uiArrow = this.getJoin(i);
      if (uiArrow.pointInJoin(x, y)) {
        return uiArrow;
      }
    }
    return undefined;
  };
}


export class UiJoin extends UiItem {

  constructor(
    private mgr: UiJoinMgr,
    public uiTblIx1: number,
    public colIx1: number,
    public uiTblIx2: number,
    public colIx2: number,
    public operator: CompareOp,
    public isAuto: boolean,
  ) {
    super();
    // in parent
    this.ix = mgr.items.length;
    this.mgr.items.push(this);
    if (!isAuto) {
      this.mgr.manualJoins.push(this);
    }
    this.mgr.isDirty = true;
  }

  public draw = (isCurrJoin: boolean): void => {
    const ctx = this.mgr.uc.ctx;
    if (ctx) {
      const jDef = this.joinPath();
      ctx.beginPath();
      ctx.moveTo(jDef.x1, jDef.y1);
      ctx.lineTo(jDef.x1 +
        (jDef.left1 ? - firstJoinSegment : firstJoinSegment), jDef.y1);
      ctx.lineTo(jDef.x2 +
        (jDef.left2 ? - firstJoinSegment : firstJoinSegment), jDef.y2);
      ctx.lineTo(jDef.x2, jDef.y2);
      ctx.moveTo(jDef.x1, jDef.y1);
      ctx.closePath();
      ctx.lineWidth = isCurrJoin ? joinSelectedLineWidth : arrowJoinWidth;
      ctx.strokeStyle = UI.frameColor;
      ctx.stroke();
    }
  };

  public pointInJoin = (x: number, y: number): boolean => {
    const jDef = this.joinPath();
    const ctx = this.mgr.uc.ctx;
    ctx.beginPath();
    ctx.moveTo(jDef.x1 - 2, jDef.y1 - 2);
    ctx.lineTo(jDef.x1 - 2 +
      (jDef.left1 ? - firstJoinSegment : firstJoinSegment), jDef.y1 - 2);
    ctx.lineTo(jDef.x2 - 2 +
      (jDef.left2 ? - firstJoinSegment : firstJoinSegment), jDef.y2 - 2);
    ctx.lineTo(jDef.x2 - 2, jDef.y2 - 2);
    ctx.lineTo(jDef.x2 + 2, jDef.y2 + 2);
    ctx.lineTo(jDef.x2 + 2 +
      (jDef.left2 ? - firstJoinSegment : firstJoinSegment), jDef.y2 + 2);
    ctx.lineTo(jDef.x1 + 2 +
      (jDef.left1 ? - firstJoinSegment : firstJoinSegment), jDef.y1 + 2);
    ctx.lineTo(jDef.x1 + 2, jDef.y1 + 2);
    ctx.closePath();
    ctx.lineWidth = joinClickHitWidth;
    return ctx.isPointInPath(x * UI.sizeSc, y * UI.sizeSc);
  };

  // Private methods

  private joinPath = (): UiJoinDef => {
    const t1 = this.mgr.tableMgr.getTable(this.uiTblIx1);
    const cRect1 = t1.columnIxToRect(this.colIx1);
    const x11 = t1.rect.x;
    const x12 = t1.rect.x + t1.rect.width;
    const y1 = cRect1.y + cRect1.height / 2;

    const t2 = this.mgr.tableMgr.getTable(this.uiTblIx2);
    const cRect2 = t2.columnIxToRect(this.colIx2);
    const x21 = t2.rect.x;
    const x22 = t2.rect.x + t2.rect.width;
    const y2 = cRect2.y + cRect2.height / 2;

    let minDist = Math.abs(x11 - x21);
    let id = 0;
    let alt = Math.abs(x11 - x22);
    if (alt < minDist) {
      minDist = alt;
      id = 1;
    }
    alt = Math.abs(x12 - x21);
    if (alt < minDist) {
      minDist = alt;
      id = 2;
    }
    alt = Math.abs(x12 - x22);
    if (alt < minDist) {
      minDist = alt;
      id = 3;
    }
    let x1 = 0;
    let left1 = false;
    let x2 = 0;
    let left2 = false;
    switch (id) {
      case 0: // x11 -> x21
        x1 = x11;
        left1 = true;
        x2 = x21;
        left2 = true;
        break;
      case 1: // x11 -> x22
        x1 = x11;
        left1 = true;
        x2 = x22;
        break;
      case 2: // x12 -> x21
        x1 = x12;
        x2 = x21;
        left2 = true;
        break;
      case 3: // x12 -> x22
        x1 = x12;
        x2 = x22;
        break;
    }
    return { x1, y1, left1, x2, y2, left2 };
  };
}
