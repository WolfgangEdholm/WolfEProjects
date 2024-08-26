import { UiCoreData } from './types';
import * as UI from './constants';
import { UiItem, UiItemMgr } from './ui-item';
import { UiiInfo, UimInfo } from './types';
import { Point } from '@angular/cdk/drag-drop';
import { XRect } from '../types/shared';
import { UiTable, UiTableMgr } from './ui-table';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Integrity, Uuid } from '../api/data-eng.service';

const seqNumInit = 0;

const dropRadius = 7;

const requestLeft = 10;
const requestTop = 10;
const requestHeight = 40;
const requestTextHeight = 26;
const requestRadius = 9;
const requestMargLeft = 5;
const requestMargRight = 5;
const requestIconWidth = 30;
const requestIconAdjustment = 2.5;

export class UiRequestMgr extends UiItemMgr {
  tableMgr: UiTableMgr;
  seqNumGen = seqNumInit;

  constructor(
    uc: UiCoreData,
    plane: number,
    tableMgr: UiTableMgr,
  ) {
    super(uc, plane);
    this.tableMgr = tableMgr;
    this.firstPartCode = UI.firstRequestCode;
    this.lastPartCode = UI.lastRequestCode;
  }

  public initSeqNumGen = (): void => {
    this.seqNumGen = seqNumInit;
    // console.log('Resetting seqNumGen');
  };

  public columnFromUuid = (uuid: Uuid): UiRequestColumn =>
    ( this.items as UiRequestColumn[] ).find(rc => rc.uuid === uuid);

  public currColumn = (): UiRequestColumn =>
    this.currItem as UiRequestColumn;

  public getColumn = (ix: number): UiRequestColumn =>
    this.items[ix] as UiRequestColumn;

  public getColumns = (): UiRequestColumn[] =>
    this.items as UiRequestColumn[];

  public draw = (): void => {
    // console.log('QUERY DRAW', this.uc.id);
    const uc = this.tableMgr.uc;
    let x = requestLeft;
    const y = requestTop;
    uc.ctx.strokeStyle = UI.frameColor;
    let currItem: UiRequestColumn;
    let currX: number;
    let currWidth: number;
    for (let i = 0; i < this.items.length; i++) {
      const rCol = this.getColumn(i);
      const isCurr = i > 0 && rCol === this.currItem;
      if (isCurr) {
        currItem = rCol;
        currX = x;
        currWidth = rCol.width;
      } else {
        rCol.draw(x, rCol.width, false);
      }
      x += rCol.width;
    }
    if (currItem) {
      currItem.draw(currX, currWidth, true);
    }
    if (this.currItem === this.items[0]) {
      const width = this.calcWidth(0);
      x = requestLeft;
      const rRad = requestRadius + 2;
      uc.ctx.lineWidth = UI.stdLineWidth;
      uc.core.xroundRectPrim(x - 2, y - 2, x + width + 2,
        y + requestHeight + 2, rRad, rRad, rRad, rRad, 1, -1, -1);
    }
  };

  public getExtent = (): XRect => {
    const width = this.calcWidth(0);
    const height = requestTop + requestHeight + 2;
    return { x: 0, y: 0, width, height, };
  };

  public onMouseDown = (
    x: number, y: number, currItem: UimInfo): UiiInfo => {
    const colIx = this.xyToColumnIx(x, y);
    if (colIx !== -1) {
      this.currItem = this.items[colIx];
      return { item: this.currItem, partIx: UI.requestColumn0 + colIx };
    }
    return { item: undefined, partIx: -1 };
  };

  public onDragMove = (
    x: number, y: number, sourceInfo: UiiInfo): boolean => {
    if (this.firstPartCode < sourceInfo.partIx &&
      sourceInfo.partIx < this.lastPartCode) {
      const rCol = sourceInfo.item as UiRequestColumn;
      rCol.drag(x, y, sourceInfo);
      return true;
    }
    return false;
  };

  public onDragStart = (
    x: number, y: number, clickInfo: UiiInfo): void => {
    const rCol = clickInfo.item as UiRequestColumn;
    const dragMgr = this.uc.dragMgr;
    dragMgr.lastMovePos.x = -1;
    dragMgr.mouseDownUiiInfo = clickInfo;
    rCol.drag(x, y, clickInfo);
  };

  public onDragOver = (
    x: number, y: number, sourceInfo: UiiInfo): UiiInfo => {
    const colIx = this.xyToColumnIx(x, y);
    if (colIx !== -1) {
      let targetInfo = { item: this.items[colIx],
        partIx: UI.requestColumn0 + colIx };
      if (this.isDropOk(x, y, sourceInfo, targetInfo)) {
        const rCol = targetInfo.item as UiRequestColumn;
        targetInfo = rCol.dragOver(x, y, sourceInfo, targetInfo);
      }
      return targetInfo;
    }
    return { item: undefined, partIx: -1 };
  };

  public onDrop = (
    x: number, y: number, sourceInfo: UiiInfo): UiiInfo => {
    const colIx = this.xyToColumnIx(x, y);
    if (colIx !== -1) {
      let targetInfo = { item: this.items[colIx],
        partIx: UI.requestColumn0 + colIx };
      if (this.isDropOk(x, y, sourceInfo, targetInfo)) {
        targetInfo = this.receiveDrop(x, y, sourceInfo, targetInfo);
        this.vecDraw();
        this.vecUpdateStatus();
      }
      return targetInfo;
    }
    return { item: undefined, partIx: -1 };
  };

  public dropNotAccepted = (
    x: number, y: number, sourceInfo: UiiInfo): boolean => {
    if (this.firstPartCode < sourceInfo.partIx &&
      sourceInfo.partIx < this.lastPartCode) {
      const fromColIx = sourceInfo.partIx - UI.requestColumn0;
      this.removeRequestItem(fromColIx);
      return true;
    }
    return false;
  };

  // removes a request data item -- colIx of the first data item is 1
  public removeRequestItem = (colIx: number): void => {
    const end = this.items.length - 1;
    for (let i = colIx; i < end; i++) {
      this.items[i] = this.items[i + 1];
      this.items[i].ix = i;
    }
    this.currItem = undefined;
    this.items.pop();
    const de = this.uc.core.dataEng;
    de.syncDataspaceWithQueryDef();
    de.workDisplayUpdate();
  };

  // Support methods

  public findIxFromUuid = (uuid: Uuid): number =>
    this.items.findIndex((e: UiRequestColumn) => uuid === e.uuid);

  public findIxFromTblCol = (tblIx: number, colIx: number): number =>
    this.items.findIndex((e: UiRequestColumn) =>
      tblIx === e.sourceTableIx && colIx === e.sourceColumnIx);

  public xyToColumnIx = (x: number, y: number): number => {
    if (requestTop < y && y < requestTop + requestHeight &&
      x > requestLeft) {
      let yTest = requestLeft;
      for (let i = 0; i < this.items.length; i++) {
        const rCol = this.getColumn(i);
        yTest += rCol.width;
        if (yTest > x) {
          return i;
        }
      }
    }
    return -1;
  };

  public columnIxToRect = (colIx: number): XRect => {
    if (colIx < 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    let left = requestLeft;
    for (let i = 0; i < colIx; i++) {
      left += this.getColumn(i).width;
    }
    return {
      x: left,
      y: requestTop,
      width: this.getColumn(colIx).width,
      height: requestHeight,
    };
  };

  public reindex = (startPos: number): void => {
    for (let i = startPos; i < this.items.length; i++) {
      this.items[i].ix = i;
    }
  };

  // Private methods

  private receiveDrop = (
    x: number, y: number, sourceInfo: UiiInfo, targetInfo: UiiInfo
  ): UiiInfo => {
    let rCol;
    let toColIx = targetInfo.partIx - UI.requestColumn0;
    if (this.firstPartCode < sourceInfo.partIx &&
      sourceInfo.partIx < this.lastPartCode) {
      // source is request
      const fromColIx = this.currItem.ix;
      if (toColIx > fromColIx) {
        // in this case, moveItemInArray moves too far
        toColIx -= 1;
      }
      if (fromColIx !== toColIx) {
        moveItemInArray(this.items, fromColIx, toColIx);
        this.reindex(0);
        this.isDirty = true;
      }
      rCol = this.items[toColIx];
    } else {
      // source is table
      const uiTable = sourceInfo.item as UiTable;
      const column = uiTable.table.columns[uiTable.currColumnIx];
      const de = this.uc.core.dataEng;
      const name = de.verifyUniqueColumnName(column.columnName);
      rCol = new UiRequestColumn(
        this,
        name,
        toColIx,
        sourceInfo.item.ix,
        ( sourceInfo.item as UiTable ).currColumnIx,
        -1,
        Uuid.generate,
      );
    }
    this.vecClearCurrentItem();
    this.currItem = rCol;
    return targetInfo;
  };

  private isDropOk = (
    x: number,
    y: number,
    sourceInfo: UiiInfo,
    targetInfo: UiiInfo
  ): boolean => {
    if (targetInfo.item && targetInfo.partIx !== -1 &&
      ((this.firstPartCode < sourceInfo.partIx &&
      sourceInfo.partIx < this.lastPartCode) ||
      sourceInfo.partIx === UI.tableCenterMiddle)) {
      const colIx = targetInfo.partIx - UI.requestColumn0;
      if (colIx > 0 && sourceInfo.item !== targetInfo.item) {
        return true;
      }
    }
    return false;
  };

  private calcWidth = (starIx: number): number => {
    let width = 0;
    for (let i = starIx; i < this.items.length; i++) {
      width += this.getColumn(i).width;
    }
    return width;
  };
}


export class UiRequestColumn extends UiItem {
  sourceTableIx: number;
  sourceColumnIx: number;
  name: string;
  format: string;
  width: number;
  integrityCode = Integrity.ok;
  seqNum: number;
  uuid: Uuid;

  private mgr: UiRequestMgr;

  constructor(
    mgr: UiRequestMgr,
    name: string,
    ix: number,       // position where to insert -1 -> insert at end
    sourceTableIx: number,
    sourceColumnIx: number,
    seqNum: number,   // sequence number for when created --
                      // new columns -> -1
    uuid: Uuid,       // if new columns -> Uuid.generate
  ) {
    super();
    this.mgr = mgr;
    this.seqNum = seqNum !== -1 ? seqNum : mgr.seqNumGen++;
    this.uuid = uuid !== Uuid.generate ? uuid : mgr.uc.core.qc.uuidGen++;
    this.sourceTableIx = sourceTableIx;
    this.sourceColumnIx = sourceColumnIx;
    this.format = '';
    this.setName(name);

    this.mgr.isDirty = true;

    if (ix > mgr.items.length - 1) {
      ix = -1;
    }
    if (ix === -2) {
      this.ix = mgr.items.length;
      this.mgr.items.push(this);
    } else if (ix === -1) {
      this.ix = mgr.items.length - 1;
      this.mgr.items.splice(this.ix, 0, this);
      this.mgr.items[this.ix + 1].ix += 1;
    } else {
      this.ix = ix;
      this.mgr.items.splice(this.ix, 0, this);
      this.mgr.reindex(this.ix + 1);
    }
    this.mgr.vecDraw();
  }

  public setName = (name: string): void => {
    this.name = name;
    this.width = this.calcWidth(name);
  };

  public calcWidth = (name: string): number => {
    const ctx = this.mgr.uc.core.getMeasureCanvasContext();
    ctx.font = UI.titleFont;
    return name === ''
      ? requestIconWidth
      : ctx.measureText(name).width + requestMargLeft + requestMargRight;
  };

  public draw = (x: number, width: number, isCurr: boolean): void => {
    const uc = this.mgr.uc;
    const ctx = uc.ctx;
    const y = requestTop;
    const ix = this.ix;
    const rRad = isCurr ? requestRadius + 2 : requestRadius;
    ctx.lineWidth = isCurr ? UI.currLineWidth : UI.stdLineWidth;
    const isLast = ix + 1 === this.mgr.items.length;
    const leftTopRadius = ix === 0 ? rRad : 0;
    const rightTopRadius = isLast ? rRad : 0;
    const rightBottomRadius = isLast ? rRad : 0;
    const leftBottomRadius = ix === 0 ? rRad : 0;
    if (ix === 0 || isLast) {
      ctx.fillStyle = UI.titleBg;
    } else if (this.integrityCode === Integrity.error) {
      ctx.fillStyle = UI.red;
    } else {
      ctx.fillStyle = uc.requestColsColor === 0 ? UI.bodyBg : UI.titleBg;
    }
    uc.core.xroundRectPrim(x, y, x + this.width, y + requestHeight,
      leftTopRadius, rightTopRadius, rightBottomRadius, leftBottomRadius,
      2, -1, -1);
    let name = this.name;

    ctx.font = UI.titleFont;
    if (ix === 0 || isLast) {
      ctx.fillStyle = UI.titleFg;
    } else {
      ctx.fillStyle = uc.requestColsColor === 0 ? UI.requestFg : UI.titleFg;
    }
    ctx.textAlign = 'center';
    let nameY = y + requestTextHeight;
    if (this.name === '') {
      ctx.font = UI.titleIconFont;
      name = 'policy';
      nameY += requestIconAdjustment * UI.sizeSc;
    }
    ctx.fillText(name, x + this.width / 2,
      nameY, this.width - requestMargRight);
    uc.core.xroundRectPrim(x, y, x + this.width, y + requestHeight,
      leftTopRadius, rightTopRadius, rightBottomRadius, leftBottomRadius,
      1, -1, -1);
  };

  public drag = (x: number, y: number, sourceInfo: UiiInfo): void => {
    const colIx = sourceInfo.partIx - UI.requestColumn0;
    const dragMgr = this.mgr.uc.dragMgr;
    if (dragMgr.lastMovePos.x === -1) {
      dragMgr.dragRect = this.mgr.columnIxToRect(colIx);
      dragMgr.lastMovePos.x = x;
      dragMgr.lastMovePos.y = y;
      return;
    }
    const colDragRect = dragMgr.dragRect;
    colDragRect.x += (x - dragMgr.lastMovePos.x) * UI.csc;
    colDragRect.y += (y - dragMgr.lastMovePos.y) * UI.csc;
    dragMgr.lastMovePos.x = x;
    dragMgr.lastMovePos.y = y;
    // draw 'background'
    this.mgr.vecDraw();

    // draw drag object
    const ctx = this.mgr.uc.ctx;
    ctx.fillStyle = UI.selectBg;
    ctx.fillRect(colDragRect.x, colDragRect.y,
      colDragRect.width, colDragRect.height);
    ctx.fillStyle = UI.bodyFg;
    ctx.font = UI.bodyFont;
    ctx.textAlign = 'center';
    const textMarg = requestMargLeft - requestMargRight;
    const textX = colDragRect.x + colDragRect.width / 2;
    const textWidth = colDragRect.width - textMarg;
    const textY = colDragRect.y + requestTextHeight;
    ctx.fillText(this.name, textX, textY, textWidth);
    this.mgr.vecOnDragOver(x, y, sourceInfo);
  };

  public dragOver = (
    x: number,
    y: number,
    sourceInfo: UiiInfo,
    targetInfo: UiiInfo,
  ): UiiInfo => {
    const uc = this.mgr.uc;
    const rect = this.mgr.columnIxToRect(
      targetInfo.partIx - UI.requestColumn0);
    uc.ctx.strokeStyle = UI.bodyBg;
    uc.core.xroundRectPrim(rect.x + 2, rect.y + 2, rect.x + rect.width - 2,
      rect.y + rect.height - 2, dropRadius, dropRadius, dropRadius,
      dropRadius, 1, -1, -1);
    return targetInfo;
  };

  // Support methods

  // Private methods

}
