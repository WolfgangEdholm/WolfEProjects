import { UiCoreData } from './types';
import * as UI from './constants';
import { UiiInfo, UimInfo } from './types';
import { UiItem, UiItemMgr } from './ui-item';
import { UiJoin, UiJoinMgr } from './ui-join';
import { UiRequestColumn, UiRequestMgr } from './ui-request';
import { Point } from '@angular/cdk/drag-drop';
import { XRect } from '../types/shared';
import { Table } from '../types/db';
import { CompareOp, compareOpToStr } from '../types/compute';
import { Integrity } from '../api/data-eng.service';

const minTableWidth = 100;
const maxTableWidth = 500;
const minTableHeight = 60;

const lightGray = 'rgb(245, 245, 245)';

const widthPadding = 20;
const heightPadding = 10;

const constraintEnd = 32;
const constraintMargin = 3;
const constraintRadius = 5;

const dropRadius = 5;
const edgeRadius = 17;
const titleHeight = 34;
const titleTextHeight = 24;
const titleTextMarg = 10;
// const leftMarg = 40;
const leftMarg = 50;
const rightMarg = 12;
const textMarg = 2;
const lineHeight = 20;
const firstLineAdjustment = 5;

const lineWidth = 2;

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export type UiTableClick = (uiTrans: UiTable) => void;

export class UiTableMgr extends UiItemMgr {
  itemOrder: number[] = [];
  joinMgr: UiJoinMgr;
  requestMgr: UiRequestMgr;
  moveDrawTable: UiTable;
  clickHandler: UiTableClick;
  lastUii: UiiInfo;

  constructor(
    uc: UiCoreData,
    plane: number,
    joinMgr: UiJoinMgr,
  ) {
    super(uc, plane);
    this.joinMgr = joinMgr;
    this.firstPartCode = UI.firstTableCode;
    this.lastPartCode = UI.lastTableCode;
    this.lastUii = { item: undefined, partIx: UI.tableOther };
  }

  public currTable = (): UiTable =>
    this.currItem as UiTable;

  public getTable = (ix: number): UiTable =>
    this.items[ix] as UiTable;

  public getTables = (): UiTable[] =>
    this.items as UiTable[];

  // If currItem is set the return object mgr will be set as well
  // as item and partIx (if currColumnIx > -1).
  // Otherwise they will be undefined.
  public getCurrUimItem = (): UimInfo => {
    const mgr = this.currItem ? this : undefined;
    const partIx = this.currItem ?
    ( this.currItem as UiTable ).currColumnIx : -1;
    return { mgr, item: this.currItem, partIx };
  };

  public getExtent = (): XRect => {
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (const uiTable of this.getTables()) {
      const left = uiTable.rect.x - UI.cvRightMarg;
      const right = uiTable.rect.x + uiTable.rect.width + UI.cvRightMarg;
      x = Math.min(x, left);
      width = Math.max(width, right);
      const top = uiTable.rect.y - UI.cvBottomMarg;
      const bottom = uiTable.rect.y + uiTable.rect.height +
        UI.cvBottomMarg;
      y = Math.min(y, top);
      height = Math.max(height, bottom);
    }
    return { x, y, width, height, };
  };

  public draw = (): void => {
    for (const order of this.itemOrder) {
      this.getTable(order).draw();
    }
  };

  public onMouseDown = (
    x: number, y: number, currItem: UimInfo): UiiInfo => {
    const clickInfo = this.xyToTableAndPart(x, y);
    if (clickInfo.item) {
      const uiTable = clickInfo.item as UiTable;
      if (clickInfo.partIx === UI.tableLeftColumn) {
        uiTable.currColumnIx = uiTable.xyToColumnIx(x, y);
        if (uiTable.currColumnIx > -1) {
          this.clickHandler(uiTable);
        }
      } else if (clickInfo.partIx === UI.tableCenterMiddle) {
        uiTable.currColumnIx = uiTable.xyToColumnIx(x, y);
      } else if (clickInfo.partIx === UI.tableCenterMiddleBelow) {
        uiTable.currColumnIx = -1;
      }
      const tableChange = currItem.item !== uiTable;
      this.currItem = uiTable;
      if (tableChange) {
        const eoa = this.itemOrder.length - 1;
        if (uiTable.ix !== this.itemOrder[eoa]) {
          for (let i = this.itemOrder.length; 0 < i--;) {
            if (uiTable.ix === this.itemOrder[i]) {
              for (let j = i; j < eoa; j++) {
                this.itemOrder[j] = this.itemOrder[j + 1];
              }
              this.itemOrder[eoa] = uiTable.ix;
            }
          }
        }
      }
    }
    return clickInfo;
  };

  public onDragMove = (
    x: number, y: number, sourceInfo: UiiInfo): boolean => {
    if (this.firstPartCode < sourceInfo.partIx &&
      sourceInfo.partIx < this.lastPartCode) {
      const uiTable = sourceInfo.item as UiTable;
      if (sourceInfo.partIx === UI.tableCenterMiddle) {
        uiTable.drag(x, y, sourceInfo);
      }
      else if (sourceInfo.partIx === UI.tableTitleBar) {
        uiTable.move(x, y, sourceInfo);
      } else if (sourceInfo.partIx !== UI.tableOther) {
        uiTable.resize(x, y, sourceInfo);
      }
      return true;
    }
    return false;
  };

  public onDragStart = (
    x: number, y: number, clickInfo: UiiInfo): void => {
    const uiTable = clickInfo.item as UiTable;
    const dragMgr = this.uc.dragMgr;
    if (clickInfo.partIx >= UI.tableLeftTop
      && clickInfo.partIx <= UI.tableRightBottom
      && clickInfo.partIx !== UI.tableCenterMiddle) {
      dragMgr.mouseDownUiiInfo = clickInfo;
      uiTable.resize(x, y, clickInfo);
    } else if (clickInfo.partIx === UI.tableTitleBar) {
      dragMgr.lastMovePos.x = -1;
      dragMgr.mouseDownUiiInfo = clickInfo;
      uiTable.move(x, y, clickInfo);
    } else if (clickInfo.partIx === UI.tableCenterMiddle) {
      dragMgr.lastMovePos.x = -1;
      dragMgr.mouseDownUiiInfo = clickInfo;
      uiTable.drag(x, y, clickInfo);
    }
  };

  public onDragOver = (
    x: number, y: number, sourceInfo: UiiInfo): UiiInfo => {
    let targetInfo = this.xyToTableAndPart(x, y);
    if (this.isDropOk(x, y, sourceInfo, targetInfo)) {
      const uiTable = targetInfo.item as UiTable;
      targetInfo = uiTable.dragOver(x, y, sourceInfo, targetInfo);
    }
    return targetInfo;
  };

  public onDrop = (
    x: number, y: number, sourceInfo: UiiInfo): UiiInfo => {
    let targetInfo = this.xyToTableAndPart(x, y);
    if (this.isDropOk(x, y, sourceInfo, targetInfo)) {
      const uiTable = targetInfo.item as UiTable;
      targetInfo = uiTable.receiveDrop(x, y, sourceInfo, targetInfo);
      this.vecDraw();
      this.vecUpdateStatus();
    }
    return targetInfo;
  };

  public setCursor = (x: number, y: number): UiiInfo => {
    const uiiInfo = this.xyToTableAndPart(x, y);
    if (uiiInfo.partIx === UI.tableLeftColumn) {
      this.moveDrawTable = uiiInfo.item as UiTable;
      this.moveDrawTable.draw();
      const colIx = this.moveDrawTable.xyToColumnIx(x, y);
      if (colIx > -1) {
        const r = this.moveDrawTable.rect;
        const sx = r.x + UI.stdLineWidth + constraintMargin;
        const sy = r.y + titleHeight + colIx * lineHeight;
        // const ex = r.x + leftMarg - constraintMargin;
        const ex = r.x + constraintEnd - constraintMargin;
        const ey = sy + lineHeight;
        const ctx = this.joinMgr.uc.ctx;
        ctx.fillStyle = lightGray;
        this.uc.core.xroundRectPrim(
          sx, sy, ex, ey, constraintRadius, constraintRadius,
          constraintRadius, constraintRadius, 2, -1, -1
        );
        if (this.moveDrawTable.table.columns[colIx].constraint) {
          this.moveDrawTable.drawConstraint(colIx, sx, sy, ex, ey);
        }
        this.uc.canvas.nativeElement.style.cursor = 'pointer';
        return uiiInfo;
      }
    } else if (this.moveDrawTable) {
      this.moveDrawTable.draw();
      this.moveDrawTable = undefined;
    }
    if (uiiInfo.item) {
      let cursor = '';
      switch (uiiInfo.partIx) {
        case UI.tableLeftTop:
          cursor = 'nwse-resize';
          break;
        case UI.tableLeftMiddle:
          cursor = 'ew-resize';
          break;
        case UI.tableLeftBottom:
          cursor = 'nesw-resize';
          break;
        case UI.tableCenterTop:
          cursor = 'ns-resize';
          break;
        case UI.tableCenterMiddle:
          cursor = 'alias';
          break;
        case UI.tableCenterBottom:
          cursor = 'ns-resize';
          break;
        case UI.tableRightTop:
          cursor = 'nesw-resize';
          break;
        case UI.tableRightMiddle:
          cursor = 'ew-resize';
          break;
        case UI.tableRightBottom:
          cursor = 'nwse-resize';
          break;
        case UI.tableTitleBar:
          cursor = 'move';
          break;
        case UI.tableCenterMiddleBelow:
          cursor = 'default';
          break;
      }
      this.uc.canvas.nativeElement.style.cursor = cursor;
      return uiiInfo;
    }
    return uiiInfo;
  };

  // Support methods

  public setClickHandler = (handler: UiTableClick): void => {
    this.clickHandler = handler;
  };

  public tableNameToTable = (tableName: string): UiTable => {
    for (const uiTable of this.getTables()) {
      if (uiTable.table.tableName === tableName) {
        return uiTable;
      }
    }
    return undefined;
  };

  public xyToTableBody = (x: number, y: number): UiTable => {
    for (let i = this.itemOrder.length; 0 < i--;) {
      const uiTableIx = this.itemOrder[i];
      const uiTable = this.getTable(uiTableIx);
      const sx = uiTable.rect.x + 2;
      const sy = uiTable.rect.y + titleHeight;
      const ex = sx + uiTable.rect.width - 4;
      const ey1 = sy + lineHeight * uiTable.table.columns.length;
      const ey2 = uiTable.rect.y + uiTable.rect.height - 2;
      const ey = Math.min(ey1, ey2);
      if (sx < x && x < ex && sy < y && y < ey) {
        return uiTable;
      }
    }
    return undefined;
  };

  public xyToTableColumnIx = (x: number, y: number): UiiInfo => {
    const uiTable = this.xyToTableBody(x, y);
    let colIx = -1;
    if (uiTable) {
      colIx = uiTable.xyToColumnIx(x, y);
    }
    return { item: uiTable, partIx: colIx };
  };

  public xyToTableAndPart = (x: number, y: number): UiiInfo => {
    let uiiInfo = { item: undefined, partIx: UI.tableOther };
    for (let i = this.itemOrder.length; 0 < i--;) {
      const uiTableIx = this.itemOrder[i];
      const uiTable = this.getTable(uiTableIx);
      uiiInfo = uiTable.xyToPart(x, y);
      if (uiiInfo.item) {
        this.lastUii.item = uiiInfo.item;
        this.lastUii.partIx = uiiInfo.partIx;
        return uiiInfo;
      }
    }
    return uiiInfo;
  };

  // Private methods

  private isDropOk = (
    x: number,
    y: number,
    sourceInfo: UiiInfo,
    targetInfo: UiiInfo,
  ): boolean =>
    (targetInfo.item && targetInfo.partIx !== -1 &&
      // this.firstPartCode < sourceInfo.partIx &&
      // sourceInfo.partIx < this.lastPartCode &&
      sourceInfo.partIx === UI.tableCenterMiddle);
}


export class UiTable extends UiItem {
  public currColumnIx = -1;
  public rect: XRect;
  public displayName: string;
  public dbTblSource: string;
  public table: Table;

  private mgr: UiTableMgr;

  constructor(
    mgr: UiTableMgr,
    leftTop: Point,
    displayName: string,
    table: Table,
  ) {
    super();
    // in parent
    this.ix = mgr.items.length;
    this.mgr = mgr;
    const tableWidth = this.calcWidth(table) + widthPadding * UI.sizeSc;
    const tableHeight = this.calcHeight(table) + heightPadding * UI.sizeSc;
    this.rect = new XRect(leftTop.x, leftTop.y, tableWidth, tableHeight);
    this.displayName = displayName ? displayName : table.tableName;
    this.table = table;
    const currDb = mgr.uc.core.dbEng.currDatabase;
    this.dbTblSource = `${currDb}.${table.tableName}`;

    this.mgr.items.push(this);
    this.mgr.itemOrder.push(this.mgr.items.length - 1);

    this.mgr.isDirty = true;

    this.mgr.vecUpdateExtent();
    this.mgr.vecChangeHappened();
    this.mgr.vecDraw();
  }

  public draw = (): void => {
    const ctx = this.mgr.uc.ctx;
    const core = this.mgr.uc.core;
    if (ctx) {
      const isCurr = this === this.mgr.currItem;
      const x = this.rect.x;
      const y = this.rect.y;
      const width = this.rect.width;
      const height = this.rect.height;
      const ex = x + width;
      const ey = y + height;
      const ty = y + titleHeight;
      let hasError = false;

      ctx.fillStyle = UI.titleBg;
      core.xroundRectPrim(x, y, ex, ty,
        edgeRadius, edgeRadius, 0, 0, 2, -1, -1);
      ctx.textAlign = 'center';
      ctx.fillStyle = UI.titleFg;
      ctx.font = UI.titleFont;
      ctx.fillText(this.table.tableName, (x + ex) / 2,
        y + titleTextHeight, width - titleTextMarg);
      ctx.fillStyle = UI.bodyBg;
      core.xroundRectPrim(x, ty, ex, ey,
        0, 0, edgeRadius, edgeRadius, 2, -1, -1);
      const endY = ey - 3 * UI.sizeSc;
      if (isCurr && this.currColumnIx > -1) {
        const rect = this.columnIxToRect(this.currColumnIx);
        if (rect.y + rect.height - 6 * UI.sizeSc < endY) {
          ctx.fillStyle = UI.selectBg;
          ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
      }
      ctx.fillStyle = UI.bodyFg;
      ctx.font = UI.bodyFont;
      ctx.textAlign = 'start';
      const textLeft = x + leftMarg;
      const textWidth = width - leftMarg - rightMarg;
      const constrX = x + (constraintMargin + constraintEnd) / 2;
      // const constrWidth = leftMarg - 2 * constraintMargin;
      const constrWidth = constraintEnd - 2 * constraintMargin;
      let textY = ty + lineHeight - firstLineAdjustment;
      const iconStart = x + constraintEnd;
      const iconWidth = leftMarg - constraintEnd;
      for (const [i, col] of this.table.columns.entries()) {
        if (textY > endY) {
          break;
        }
        if (col.constraint) {
          const constrStr = compareOpToStr(col.constraint.compareOp);
          ctx.textAlign = 'center';
          ctx.fillText(constrStr, constrX, textY, constrWidth);
          ctx.textAlign = 'start';
        }
        let isOk = true;
        const reqIx = this.mgr.requestMgr.findIxFromTblCol(this.ix, i);
        if (-1 < reqIx) {
          const rCol = this.mgr.requestMgr.getColumn(reqIx);
          isOk = rCol.integrityCode === Integrity.ok;
          if (!isOk) {
            ctx.fillStyle = UI.red;
            hasError = true;
          }
          ctx.font = UI.tableIconFont;
          ctx.fillText('done', iconStart, textY + 5, iconWidth);
          ctx.font = UI.bodyFont;
        }
        ctx.fillText(col.columnName, textLeft, textY, textWidth);
        ctx.fillStyle = UI.bodyFg;
        textY += lineHeight;
      }
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = hasError ? UI.red : UI.frameColor;
      core.xroundRectPrim(x, y, x + width, y + height,
        edgeRadius, edgeRadius, edgeRadius, edgeRadius,
        1, -1, -1);
      if (isCurr) {
        core.xroundRectPrim(x - 2, y - 2, x + width + 2, y + height + 2,
          edgeRadius + 2, edgeRadius + 2, edgeRadius + 2, edgeRadius + 2,
          1, -1, -1);
      }
    }
  };

  public drawConstraint = (
    colIx: number,
    sx: number,
    sy: number,
    ex: number,
    ey: number,
  ): void => {
    const constrStr =
      compareOpToStr(this.table.columns[colIx].constraint.compareOp);
    const ctx = this.mgr.uc.ctx;
    ctx.fillStyle = UI.bodyFg;
    ctx.font = UI.bodyFont;
    ctx.textAlign = 'center';
    ctx.fillText(constrStr, (sx + ex) / 2, ey - firstLineAdjustment,
                 ex - sx - 2 * constraintMargin);
  };

  public drag = (
    x: number,
    y: number,
    clickInfo: UiiInfo,
  ): void => {
    const dragMgr = this.mgr.uc.dragMgr;
    if (dragMgr.lastMovePos.x === -1) {
      dragMgr.dragRect = this.calcDragRect(x, y, clickInfo);
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
    this.dragDraw(colDragRect);

    this.mgr.vecOnDragOver(x, y, clickInfo);
  };

  public dragOver = (
    x: number, y: number, sourceInfo: UiiInfo, targetInfo: UiiInfo
  ): UiiInfo => {
    if (targetInfo.item !== sourceInfo.item) {
      const rect = this.columnIxToRect(this.xyToColumnIx(x, y));
      this.mgr.uc.ctx.strokeStyle = UI.dropFrame;
      this.mgr.uc.core.xroundRectPrim(rect.x - 2, rect.y - 2,
        rect.x + rect.width + 2, rect.y + rect.height + 2,
        dropRadius, dropRadius, dropRadius, dropRadius, 1, -1, -1);
    }
    return targetInfo;
  };

  public receiveDrop = (
    x: number, y: number, sourceInfo: UiiInfo, targetInfo: UiiInfo
  ): UiiInfo => {
    const colIx2 = this.xyToColumnIx(x, y);
    if (colIx2 !== -1 && sourceInfo.item.ix !== targetInfo.item.ix) {
      const cvJoin = new UiJoin(this.mgr.joinMgr,
        sourceInfo.item.ix,
        ( sourceInfo.item as UiTable ).currColumnIx,
        targetInfo.item.ix,
        colIx2,
        CompareOp.eq,
        false,
      );
      this.mgr.vecClearCurrentItem();
      this.mgr.joinMgr.currItem = cvJoin;
    }
    return targetInfo;
  };

  public move = (
    x: number,
    y: number,
    clickInfo: UiiInfo,
  ): void => {
    const dragMgr = this.mgr.uc.dragMgr;
    if (dragMgr.lastMovePos.x === -1) {
      dragMgr.lastMovePos.x = x;
      dragMgr.lastMovePos.y = y;
      return;
    }
    this.rect.x += (x - dragMgr.lastMovePos.x) * UI.csc;
    this.rect.y += (y - dragMgr.lastMovePos.y) * UI.csc;
    dragMgr.lastMovePos.x = x;
    dragMgr.lastMovePos.y = y;
    this.mgr.vecDraw();
  };

  public resize = (x: number, y: number, clickInfo: UiiInfo): void => {
    this.mgr.isDirty = true;
    const dragMgr = this.mgr.uc.dragMgr;
    const acd = dragMgr.mouseDownUiiInfo.partIx;
    const ex = this.rect.x + this.rect.width;
    const ey = this.rect.y + this.rect.height;
    const xStart = acd < UI.tableCenterTop;
    const yStart = (acd === UI.tableLeftTop || acd === UI.tableCenterTop ||
      acd === UI.tableRightTop);
    let xsc = x * UI.csc;
    let ysc = y * UI.csc;
    if (!dragMgr.mouseMoveAdjustSet) {
      // corrents when dragging the rounded corners
      dragMgr.mouseMoveAdjust.x = xStart ? this.rect.x - xsc : ex - xsc;
      dragMgr.mouseMoveAdjust.y = yStart ? this.rect.y - ysc : ey - ysc;
      dragMgr.mouseMoveAdjustSet = true;
      return;
    }
    xsc += dragMgr.mouseMoveAdjust.x;
    ysc += dragMgr.mouseMoveAdjust.y;

    const xDelta = acd < UI.tableCenterTop ? this.rect.x - xsc : xsc - ex;
    const yDelta = (acd === UI.tableLeftTop || acd === UI.tableCenterTop ||
      acd === UI.tableRightTop) ? this.rect.y - ysc : ysc - ey;
    const width = this.rect.width + xDelta * UI.csc;
    const height = this.rect.height + yDelta * UI.csc;
    let xAdjust = 0;
    let yAdjust = 0;
    if (width < minTableWidth) {
      xAdjust = minTableWidth - width;
    } else if (width > maxTableWidth) {
      xAdjust = maxTableWidth - width;
    }
    if (height < minTableHeight) {
      yAdjust = minTableHeight - height;
    }

    switch (acd) {
      case UI.tableLeftTop:
        this.rect.x = xsc - xAdjust;
        this.rect.width = width + xAdjust;
        this.rect.y = ysc - yAdjust;
        this.rect.height = height + yAdjust;
        break;
      case UI.tableLeftMiddle:
        this.rect.x = xsc - xAdjust;
        this.rect.width = width + xAdjust;
        break;
      case UI.tableLeftBottom:
        this.rect.x = xsc - xAdjust;
        this.rect.width = width + xAdjust;
        this.rect.height = height + yAdjust;
        break;
      case UI.tableCenterTop:
        this.rect.y = ysc - yAdjust;
        this.rect.height = height + yAdjust;
        break;
      case UI.tableCenterBottom:
        this.rect.height = height + yAdjust;
        break;
      case UI.tableRightTop:
        this.rect.width = width + xAdjust;
        this.rect.y = ysc - yAdjust;
        this.rect.height = height + yAdjust;
        break;
      case UI.tableRightMiddle:
        this.rect.width = width + xAdjust;
        break;
      case UI.tableRightBottom:
        this.rect.width = width + xAdjust;
        this.rect.height = height + yAdjust;
        break;
    }
    this.mgr.vecDraw();
  };

  public xyToPart = (x: number, y: number): UiiInfo => {
    const uiiInfo = { item: undefined, partIx: UI.tableOther };
    const r = this.rect;
    const core = this.mgr.uc.core;
    if (core.xroundRectPrim(r.x, r.y, r.x + r.width, r.y + r.height,
      edgeRadius, edgeRadius, edgeRadius, edgeRadius,
        3, x * UI.sizeSc, y * UI.sizeSc)) {
      uiiInfo.item = this;
      const xsc = x * UI.csc;
      const ysc = y * UI.csc;
      if (!core.xroundRectPrim(r.x + 3, r.y + 3, r.x + r.width - 6,
        r.y + r.height - 6,  edgeRadius, edgeRadius, edgeRadius,
        edgeRadius, 3, x * UI.sizeSc, y * UI.sizeSc)) {
        const xPos = (xsc - r.x <= edgeRadius) ? 0 :
          (r.x + r.width - xsc <= edgeRadius) ? 6 : 3;
        const yPos = (ysc - r.y <= edgeRadius) ? 0 :
          (r.y + r.height - ysc <= edgeRadius) ? 2 : 1;
        uiiInfo.partIx = this.mgr.firstPartCode + xPos + yPos + 2;
        return uiiInfo;
      }
      if (ysc - r.y <= titleHeight) {
        uiiInfo.partIx = UI.tableTitleBar;
        return uiiInfo;
      }
      if (ysc - r.y - titleHeight >
        this.table.columns.length * lineHeight + 2) {
        uiiInfo.partIx = UI.tableCenterMiddleBelow;
        return uiiInfo;
      }
      if (xsc - r.x < leftMarg) {
        uiiInfo.partIx = UI.tableLeftColumn;
      } else {
        uiiInfo.partIx = UI.tableCenterMiddle;
      }
      return uiiInfo;
    }
    return uiiInfo;
  };

  // Support methods

  public xyToColumnIx = (x: number, y: number): number => {
    const yOffs = y - (this.rect.y + titleHeight);
    const colIx = Math.floor((yOffs) / lineHeight);
    return colIx < this.table.columns.length ? colIx : -1;
  };

  public columnIxToRect = (colIx: number): XRect => {
    if (colIx < 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    return new XRect(
      this.rect.x + leftMarg,
      this.rect.y + titleHeight + lineHeight * colIx,
      this.rect.width - leftMarg - rightMarg,
      lineHeight,
    );
  };

  public columnNameToIx = (columnName: string): number => {
    for (let i = this.table.columns.length; 0 < i--;) {
      if (this.table.columns[i].columnName === columnName) {
        return i;
      }
    }
    return -1;
  };

  // Private methods

  private calcWidth = (table: Table): number => {
    const ctx = this.mgr.uc.core.getMeasureCanvasContext();
    let width = 100 * UI.sizeSc;
    if (ctx) {
      ctx.font = UI.titleFont;
      width = ctx.measureText(table.tableName).width;
      ctx.font = UI.bodyFont;
      for (const col of table.columns) {
        const colWidth = ctx.measureText(col.columnName).width + leftMarg;
        if (colWidth > width) {
          width = colWidth;
        }
      }
      if (width < minTableWidth) {
        width = minTableWidth;
      } else if (width > maxTableWidth) {
        width = maxTableWidth;
      }
    }
    return width;
  };

  private calcHeight = (table: Table): number => {
    let height = titleHeight;
    height += table.columns.length * lineHeight;
    if (height < minTableHeight) {
      height = minTableHeight;
    }
    return height;
  };

  private calcDragRect = (
    x: number,
    y: number,
    clickInfo: UiiInfo,
  ): XRect =>
    this.columnIxToRect(this.currColumnIx);

  private dragDraw = (rect: XRect): void => {
    const ctx = this.mgr.uc.ctx;
    ctx.fillStyle = UI.selectBg;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.fillStyle = UI.bodyFg;
    ctx.font = UI.bodyFont;
    ctx.textAlign = 'start';
    // const textIndent = leftMarg - rightMarg;
    // const textLeft = rect.x + textIndent;
    const textIndent = textMarg;
    const textLeft = rect.x + textIndent;
    const textWidth = rect.width - textIndent;
    const textY = rect.y + lineHeight - firstLineAdjustment;
    const col = this.table.columns[this.currColumnIx];
    ctx.fillText(col.columnName, textLeft, textY, textWidth);
  };

}

