import { UiCoreData } from './types';
import * as UI from './constants';
import { UiiInfo, UimInfo } from './types';
import { UiItem, UiItemMgr } from './ui-item';
import { UiArrow, UiArrowMgr } from './ui-arrow';
import { Point } from '@angular/cdk/drag-drop';
import { XRect } from '../types/shared';
import { TransItemType } from '../types/trans';
import { ApiIoQuery } from '../types/qIo';
import { ApiIoTrans } from '../types/tIo';
import { Integrity } from '../api/data-eng.service';
import { TDoc } from '../types/trans';


// 45678911234567892123456789312345678941234567895123456789612345678971234567898

const minTransWidth = 100;
const maxTransWidth = 500;
const minTransHeight = 60;
const defTransWidth = 120;
const defTransHeight = 120;

const lightGray = 'rgb(245, 245, 245)';

const widthPadding = 20;
// const heightPadding = 10;

const dropRadius = 5;
const edgeRadius = 7;
const titleHeight = 34;
const titleTextHeight = 24;
const titleTextMarg = 10;

const iconXMarg = 40;
const iconTopMarg = 12;
const iconBottomMarg = 18;

// const leftMarg = 40;
// const rightMarg = 12;
// const lineHeight = 20;
// const firstLineAdjustment = 5;

const lineWidth = 2;

// This type is usefull when caching io info during
// transformer creation
export type IoTransItem = ApiIoQuery | ApiIoTrans;

export type UiTransClick = (uiTrans: UiTrans) => void;

export class UiTransMgr extends UiItemMgr {
  itemOrder: number[] = [];
  arrowMgr: UiArrowMgr;
  moveDrawTrans: UiTrans;
  clickHandler: UiTransClick;

  constructor(
    uc: UiCoreData,
    plane: number,
    arrowMgr: UiArrowMgr,
  ) {
    super(uc, plane);
    this.arrowMgr = arrowMgr;
    this.firstPartCode = UI.firstTransCode;
    this.lastPartCode = UI.lastTransCode;
  }

  public currTItem = (): UiTrans =>
    this.currItem as UiTrans;

  public getTItem = (ix: number): UiTrans =>
    this.items[ix] as UiTrans;

  public getTItems = (): UiTrans[] =>
    this.items as UiTrans[];

  // If currItem is set the return object mgr will be set as well
  // as item. Otherwise they will be undefined.
  public getCurrUimItem = (): UimInfo => {
    const mgr = this.currItem ? this : undefined;
    const partIx = -1;
    return { mgr, item: this.currItem, partIx };
  };

  public getExtent = (): XRect => {
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (const uiTrans of this.items as UiTrans[]) {
      const left = uiTrans.rect.x - UI.cvRightMarg;
      const right = uiTrans.rect.x + uiTrans.rect.width + UI.cvRightMarg;
      x = Math.min(x, left);
      width = Math.max(width, right);
      const top = uiTrans.rect.y - UI.cvBottomMarg;
      const bottom = uiTrans.rect.y + uiTrans.rect.height +
        UI.cvBottomMarg;
      y = Math.min(y, top);
      height = Math.max(height, bottom);
    }
    return { x, y, width, height, };
  };

  public draw = (): void => {
    // console.log('TRANS DRAW', this.uc.id);
    for (const order of this.itemOrder) {
      ( this.items[order] as UiTrans ).draw();
    }
  };

  public onMouseDown = (
    x: number, y: number, currItem: UimInfo): UiiInfo => {
    const clickInfo = this.xyToTransAndPart(x, y);
    if (clickInfo.item) {
      const uiTrans = clickInfo.item as UiTrans;
      this.currItem = uiTrans;
    }
    return clickInfo;
  };

  public onDragMove = (
    x: number, y: number, sourceInfo: UiiInfo
  ): boolean => {
    if (this.firstPartCode < sourceInfo.partIx &&
      sourceInfo.partIx < this.lastPartCode) {
      const uiTrans = sourceInfo.item as UiTrans;
      if (sourceInfo.partIx === UI.transBody) {
        uiTrans.drag(x, y, sourceInfo);
      }
      else if (sourceInfo.partIx === UI.transTitleBar) {
        uiTrans.move(x, y, sourceInfo);
      } else /*if (sourceInfo.partIx !== UI.tableOther)*/ {
        uiTrans.resize(x, y, sourceInfo);
      }
      return true;
    }
    return false;
  };

  public onDragStart = (
    x: number, y: number, clickInfo: UiiInfo): void => {
    const uiTrans = clickInfo.item as UiTrans;
    const dragMgr = this.uc.dragMgr;
    if (clickInfo.partIx >= UI.transLeftTop
      && clickInfo.partIx <= UI.transRightBottom
      && clickInfo.partIx !== UI.transCenterMiddle) {
      dragMgr.mouseDownUiiInfo = clickInfo;
      uiTrans.resize(x, y, clickInfo);
    } else if (clickInfo.partIx === UI.transTitleBar) {
      dragMgr.lastMovePos.x = -1;
      dragMgr.mouseDownUiiInfo = clickInfo;
      uiTrans.move(x, y, clickInfo);
    } else if (clickInfo.partIx === UI.transBody) {
      dragMgr.lastMovePos.x = -1;
      dragMgr.mouseDownUiiInfo = clickInfo;
      uiTrans.drag(x, y, clickInfo);
    }
  };

  public onDragOver = (
    x: number, y: number, sourceInfo: UiiInfo): UiiInfo => {
    let targetInfo = this.xyToTransAndPart(x, y);
    if (this.isDropOk(x, y, sourceInfo, targetInfo)) {
      const uiTrans = targetInfo.item as UiTrans;
      targetInfo = uiTrans.dragOver(x, y, sourceInfo, targetInfo);
    }
    return targetInfo;
  };

  public onDrop = (
    x: number, y: number, sourceInfo: UiiInfo): UiiInfo => {
    let targetInfo = this.xyToTransAndPart(x, y);
    if (this.isDropOk(x, y, sourceInfo, targetInfo)) {
      const uiTrans = targetInfo.item as UiTrans;
      targetInfo = uiTrans.receiveDrop(x, y, sourceInfo, targetInfo);
      this.vecDraw();
      this.vecUpdateStatus();
    }
    return targetInfo;
  };

  public setCursor = (x: number, y: number): UiiInfo => {
    const uiiInfo = this.xyToTransAndPart(x, y);
    if (this.moveDrawTrans) {
      this.moveDrawTrans.draw();
      this.moveDrawTrans = undefined;
    }
    if (uiiInfo.item) {
      let cursor = '';
      switch (uiiInfo.partIx) {
        case UI.transLeftTop:
          cursor = 'nwse-resize';
          break;
        case UI.transLeftMiddle:
          cursor = 'ew-resize';
          break;
        case UI.transLeftBottom:
          cursor = 'nesw-resize';
          break;
        case UI.transCenterTop:
          cursor = 'ns-resize';
          break;
        case UI.transCenterMiddle:
          cursor = 'alias';
          break;
        case UI.transCenterBottom:
          cursor = 'ns-resize';
          break;
        case UI.transRightTop:
          cursor = 'nesw-resize';
          break;
        case UI.transRightMiddle:
          cursor = 'ew-resize';
          break;
        case UI.transRightBottom:
          cursor = 'nwse-resize';
          break;
        case UI.transTitleBar:
          cursor = 'move';
          break;
        case UI.transBody:
          cursor = 'default';
          break;
      }
      this.uc.canvas.nativeElement.style.cursor = cursor;
      return uiiInfo;
    }
    return uiiInfo;
  };

  // Support methods

  public setClickHandler = (handler: UiTransClick): void => {
    this.clickHandler = handler;
  };

  public xyToTransBody = (x: number, y: number): UiTrans => {
    for (let i = this.itemOrder.length; 0 < i--;) {
      const uiTransIx = this.itemOrder[i];
      const uiTrans = this.items[uiTransIx] as UiTrans;
      const sx = uiTrans.rect.x + 2;
      const sy = uiTrans.rect.y + titleHeight;
      const ex = sx + uiTrans.rect.width - 4;
      const ey = sy + uiTrans.rect.height - 4;
      if (sx < x && x < ex && sy < y && y < ey) {
        return uiTrans;
      }
    }
    return undefined;
  };

  public xyToTransAndPart = (x: number, y: number): UiiInfo => {
    let uiiInfo = { item: undefined, partIx: UI.transBody };
    for (let i = this.itemOrder.length; 0 < i--;) {
      const uiTransIx = this.itemOrder[i];
      const uiTrans = this.items[uiTransIx] as UiTrans;
      uiiInfo = uiTrans.xyToPart(x, y);
      if (uiiInfo.item) {
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
    targetInfo: UiiInfo
  ): boolean => (targetInfo.item && targetInfo.partIx !== -1 &&
    // this.firstPartCode < sourceInfo.partIx &&
    // sourceInfo.partIx < this.lastPartCode &&
    sourceInfo.partIx === UI.transBody);

}

export class UiTrans extends UiItem {
  public displayName: string;
  public rect: XRect;
  public dbItemName: string;
  public tp: TransItemType;
  public itemKind: string;
  public filterIx: number;       // index in tdoc filter array
  public specialIcon: string;
  public integrityCode = Integrity.ok;
  public changeDate: string;
  public fixDate: string;
  public tdoc: TDoc;

  private mgr: UiTransMgr;

  constructor(
    mgr: UiTransMgr,
    leftTop: Point,
    displayName: string,
    tp: TransItemType,
    tdoc: TDoc,
  ) {
    super();
    // in parent
    this.ix = mgr.items.length;
    this.mgr = mgr;
    this.displayName = displayName;
    this.tp = tp;
    this.tdoc = tdoc;
    this.itemKind = tp === 'Q' ? 'transQuery' :
      tp === 'F' ? 'transFilter' :
      tp === 'H' ? 'transHelper' : 'transTrans';
    const transWidth = this.calcWidth(displayName) + widthPadding * UI.sizeSc;
    const transHeight = defTransHeight;
    this.rect = new XRect(leftTop.x, leftTop.y, transWidth, transHeight);

    if (tp === 'F' || tp === 'H' || tp === 'T') {
      const tc = mgr.uc.core.tc;
      this.filterIx = tc.mainFilters.length;
      tc.mainFilters.push({
        def: {
          fc: {
            name: undefined,
            itemIx: this.ix,
            dfltDisplayName: undefined,
            displayName,
            inputDbTableLabel: undefined,
            inputDbTable: undefined,
            inputDbTablePicker: undefined,
            outputDbTableLabel: undefined,
            outputDbTable: undefined,
            hideIsTemporary: undefined,
            isTemporary: undefined,
            canInheritErrors: undefined,
            changeDate: undefined,
            fixDate: undefined,
          },
          params: undefined,
        },
      });
    } else {
      this.filterIx = this.ix;
    }

    // // temporary test code
    // if (this.mgr.items.length === 1) {
    //   this.integrityCode = Integrity.error;
    // }

    this.mgr.items.push(this);
    this.mgr.itemOrder.push(this.mgr.items.length - 1);
    this.mgr.vecUpdateExtent();
    this.mgr.vecDraw();
  }

  public draw = (): void => {
    if (this.tdoc !== this.mgr.uc.core.tc.mainTrans) {
      return;
    }

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
      const hasError = this.integrityCode !== Integrity.ok;
      const isRunning = this === this.mgr.uc.core.tc.runItem;
      const runColor = this.mgr.uc.core.tc.runColor;

      ctx.fillStyle = isRunning ? runColor : UI.titleBg;
      core.xroundRectPrim(x, y, ex, ty,
        edgeRadius, edgeRadius, 0, 0, 2, -1, -1);
      const integrityStyle = !hasError
        ? UI.titleFg
        // eslint-disable-next-line no-bitwise
        : (this.integrityCode & Integrity.errorMask)
          ? UI.errColor
          : UI.warnColor;
      ctx.textAlign = 'center';
      ctx.fillStyle = integrityStyle;
      ctx.font = UI.titleFont;
      ctx.fillText(this.displayName, (x + ex) / 2,
        y + titleTextHeight, width - titleTextMarg);
      ctx.fillStyle = isRunning ? runColor : this.pickTransColor();
        // this.tp === 'Q' ? UI.queryBodyBg :
        //   this.tp === 'F' ? UI.filterBodyBg : UI.transBodyBg;
      core.xroundRectPrim(x, ty, ex, ey,
        0, 0, edgeRadius, edgeRadius, 2, -1, -1);
      ctx.fillStyle = integrityStyle;
      ctx.font = UI.transIconFont;
      const icon = this.pickTransIcon();
      ctx.fillText(icon, (x + ex) / 2,
        (ty + ey) / 2 + titleTextHeight - 3, width - titleTextMarg);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = hasError ? integrityStyle : UI.frameColor;
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

  public drag = (x: number, y: number, clickInfo: UiiInfo): void => {
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
      const rect = this.calcDragRect(x, y, targetInfo);
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
    // add code to verify that the arrow is allowed
    if (sourceInfo.item.ix === targetInfo.item.ix) {
      // dropped on itself
      return targetInfo;
    }
    const fromIx = sourceInfo.item.ix;
    const toIx = targetInfo.item.ix;
    const tc = this.mgr.uc.core.tc;
    const tdoc = tc.mainTrans;

    const uiArrow = new UiArrow(this.mgr.arrowMgr, fromIx, toIx, this.tdoc);
    tdoc.arrows.push({
      fromDbItemName: tdoc.transItems[fromIx].displayName,
      toDbItemName: tdoc.transItems[toIx].displayName,
      fromIx,
      toIx,
    });
    tc.updateIntegrity();

    this.mgr.vecClearCurrentItem();
    this.mgr.arrowMgr.currItem = uiArrow;
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
    const dragMgr = this.mgr.uc.dragMgr;
    const acd = dragMgr.mouseDownUiiInfo.partIx;
    const ex = this.rect.x + this.rect.width;
    const ey = this.rect.y + this.rect.height;
    const xStart = acd < UI.transCenterTop;
    const yStart = (acd === UI.transLeftTop || acd === UI.transCenterTop ||
      acd === UI.transRightTop);
    let xsc = x * UI.csc;
    let ysc = y * UI.csc;
    if (!dragMgr.mouseMoveAdjustSet) {
      // corrects when dragging the rounded corners
      dragMgr.mouseMoveAdjust.x = xStart ? this.rect.x - xsc : ex - xsc;
      dragMgr.mouseMoveAdjust.y = yStart ? this.rect.y - ysc : ey - ysc;
      dragMgr.mouseMoveAdjustSet = true;
      return;
    }
    xsc += dragMgr.mouseMoveAdjust.x;
    ysc += dragMgr.mouseMoveAdjust.y;

    const xDelta = acd < UI.transCenterTop ? this.rect.x - xsc : xsc - ex;
    const yDelta = (acd === UI.transLeftTop || acd === UI.transCenterTop ||
      acd === UI.transRightTop) ? this.rect.y - ysc : ysc - ey;
    const width = this.rect.width + xDelta * UI.csc;
    const height = this.rect.height + yDelta * UI.csc;
    let xAdjust = 0;
    let yAdjust = 0;
    if (width < minTransWidth) {
      xAdjust = minTransWidth - width;
    } else if (width > maxTransWidth) {
      xAdjust = maxTransWidth - width;
    }
    if (height < minTransHeight) {
      yAdjust = minTransHeight - height;
    }

    switch (acd) {
      case UI.transLeftTop:
        this.rect.x = xsc - xAdjust;
        this.rect.width = width + xAdjust;
        this.rect.y = ysc - yAdjust;
        this.rect.height = height + yAdjust;
        break;
      case UI.transLeftMiddle:
        this.rect.x = xsc - xAdjust;
        this.rect.width = width + xAdjust;
        break;
      case UI.transLeftBottom:
        this.rect.x = xsc - xAdjust;
        this.rect.width = width + xAdjust;
        this.rect.height = height + yAdjust;
        break;
      case UI.transCenterTop:
        this.rect.y = ysc - yAdjust;
        this.rect.height = height + yAdjust;
        break;
      case UI.transCenterBottom:
        this.rect.height = height + yAdjust;
        break;
      case UI.transRightTop:
        this.rect.width = width + xAdjust;
        this.rect.y = ysc - yAdjust;
        this.rect.height = height + yAdjust;
        break;
      case UI.transRightMiddle:
        this.rect.width = width + xAdjust;
        break;
      case UI.transRightBottom:
        this.rect.width = width + xAdjust;
        this.rect.height = height + yAdjust;
        break;
    }
    this.mgr.vecDraw();
  };

  public xyToPart = (x: number, y: number): UiiInfo => {
    const uiiInfo = { item: undefined, partIx: UI.transBody };
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
        uiiInfo.partIx = UI.transTitleBar;
        return uiiInfo;
      }
    }
    return uiiInfo;
  };

  // Support methods

  // Private methods

  private pickTransIcon = (): string => {
    const icon = (this.tp === 'F' || this.tp === 'H')
      ? this.specialIcon
        ? this.specialIcon : 'build'
      : this.tp === 'T'
        ? 'account_tree' : 'policy';
    return icon;
  };

  private pickTransColor = (): string => {
    const tc = this.mgr.uc.core.tc;
    const color = this.tp === 'F' ? tc.fColor :
      this.tp === 'H' ? tc.hColor :
      this.tp === 'T' ? tc.tColor : tc.qColor;
    return color;
  };

  private calcDragRect = (x: number, y: number, clickInfo: UiiInfo): XRect => {
    const r = this.rect;
    return { x: r.x + iconXMarg,
      y: r.y + titleHeight + iconTopMarg,
      width: r.width - 2 * iconXMarg,
      height: r.height - titleHeight - iconTopMarg - iconBottomMarg,
    };
  };

  private dragDraw = (rect: XRect): void => {
    const ctx = this.mgr.uc.ctx;
    const core = this.mgr.uc.core;
    if (ctx) {
      const x = rect.x;
      const y = rect.y;
      const ex = rect.x + rect.width;
      const ey = rect.y + rect.height;
      // ctx.fillStyle = this.tp === 'Q' ? UI.queryBodyBg :
      //   this.tp === 'F' ? UI.filterBodyBg : UI.transBodyBg;
      ctx.fillStyle = this.pickTransColor();

      core.xroundRectPrim(x, y, ex, ey,
        dropRadius, dropRadius, dropRadius, dropRadius, 2, -1, -1);
      ctx.fillStyle = UI.titleFg;
      ctx.font = UI.transIconFont;
      ctx.textAlign = 'center';
      const icon = this.pickTransIcon();
      ctx.fillText(
        icon,
        (x + ex) / 2,
        (y + ey) / 2 + titleTextHeight - 1,
        rect.width
      );
    }
  };

  private calcWidth = (name: string): number => {
    const ctx = this.mgr.uc.core.getMeasureCanvasContext();
    let width = defTransWidth * UI.sizeSc;
    if (ctx) {
      ctx.font = UI.titleFont;
      width = ctx.measureText(name).width;
      ctx.font = UI.bodyFont;
      // for (const col of table.columns) {
      //   const colWidth = ctx.measureText(col.columnName).width + leftMarg;
      //   if (colWidth > width) {
      //     width = colWidth;
      //   }
      // }
      if (width < minTransWidth) {
        width = minTransWidth;
      } else if (width > maxTransWidth) {
        width = maxTransWidth;
      }
    }
    return width;
  };

  // private calcHeight = (table: Table): number => {
  //   let height = titleHeight;
  //   height += table.columns.length * lineHeight;
  //   if (height < minTransHeight) {
  //     height = minTransHeight;
  //   }
  //   return height;
  // };

}

