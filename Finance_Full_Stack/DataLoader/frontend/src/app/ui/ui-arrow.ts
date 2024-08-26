
import * as UI from './constants';
import { UiCoreData, UiiInfo, UimInfo } from './types';
import { UiItem, UiItemMgr} from './ui-item';
// import { ForeignKey } from '../types/db';
// import { CompareOp } from '../types/compute';
import { UiTrans, UiTransMgr } from './ui-trans';
import { DbEngService } from '../api/db-eng.service';
import { TDoc } from '../types/trans';

const arrowLineWidth = 4;
const arrowSelectedLineWidth = 6;
const arrowWidth = 16;
const arrowLength = 16;

const arrowClickHitWidth = 6;

const firstArrowSegment = 15;

type UiArrowDef = {
  xOrientation: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export class UiArrowMgr extends UiItemMgr {
  public transMgr: UiTransMgr;

  constructor(
    uc: UiCoreData,
    plane: number,
    tc: DbEngService,
  ) {
    super(uc, plane);
    this.firstPartCode = UI.firstJoinCode;
    this.lastPartCode = UI.lastJoinCode;
  }

  public currArrow = (): UiArrow =>
    this.currItem as UiArrow;

  public getArrow = (ix: number): UiArrow =>
    this.items[ix] as UiArrow;

  public getArrows = (): UiArrow[] =>
    this.items as UiArrow[];

  public draw = (): void => {
    for (let i = this.items.length; 0 < i--;) {
      ( this.items[i] as UiArrow ).draw(i === this.currItem?.ix);
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
      this.transMgr.uc.canvas.nativeElement.style.cursor = 'crosshair';
    }
    return uiiInfo;
  };

  public changeHappened = () => {
  };

  public xyToJoin = (x: number, y: number): UiArrow => {
    for (let i = this.items.length; 0 < i--;) {
      const uiArrow = this.items[i] as UiArrow;
      if (uiArrow.pointInArrow(x, y)) {
        return uiArrow;
      }
    }
    return undefined;
  };

  // Private methods

  // Return array
  // 0: trans1 corner - lt = 0 rt = 1 rb = 2 lb = 3
  // 1: trans1 corner - x coord
  // 2: trans1 corner - y coord
  // 3: trans2 corner - lt = 0 rt = 1 rb = 2 lb = 3
  // 4: trans2 corner - x coord
  // 5: trans2 corner - y coord
  private closestCorners = (transIx1: number, transIx2: number): number[] => {
    const trans1 = this.transMgr.items[transIx1];
    const trans2 = this.transMgr.items[transIx2];
    const retArr = [];
    return retArr;
  };
}


export class UiArrow extends UiItem {

  constructor(
    private mgr: UiArrowMgr,
    public fromIx: number,
    public toIx: number,
    public tdoc: TDoc,
  ) {
    super();
    // in parent
    this.ix = mgr.items.length;
    this.mgr.items.push(this);
  }

  public getArrowTrans = (transIx: number): UiTrans =>
    this.mgr.transMgr.items[transIx] as UiTrans;

  public draw = (isCurrArrow: boolean): void => {
    if (this.tdoc !== this.mgr.uc.core.tc.mainTrans) {
      return;
    }
    const ctx = this.mgr.uc.ctx;
    if (ctx) {
      const aDef = this.arrowPath();
      let xa: number;
      let ya: number;
      let xb: number;
      let yb: number;
      if (aDef.xOrientation) {
        xa = aDef.x1 + firstArrowSegment * (aDef.x1 < aDef.x2 ? 1 : -1);
        ya = aDef.y1;
        xb = xa;
        yb = aDef.y2;
      } else {
        xa = aDef.x1;
        ya = aDef.y1 + firstArrowSegment * (aDef.y1 < aDef.y2 ? 1 : -1);
        xb = aDef.x2;
        yb = ya;
      }
      ctx.beginPath();
      ctx.moveTo(aDef.x1, aDef.y1);
      ctx.lineTo(xa, ya);
      ctx.lineTo(xb, yb);
      ctx.lineTo(aDef.x2, aDef.y2);
      ctx.moveTo(aDef.x1, aDef.y1);
      ctx.closePath();
      ctx.lineWidth = isCurrArrow ? arrowSelectedLineWidth
        : arrowLineWidth;
      ctx.strokeStyle = UI.frameColor;
      ctx.lineJoin = 'round';
      ctx.stroke();
      this.drawArrow(ctx, aDef.xOrientation, xb, yb, aDef.x2, aDef.y2);
    }
  };

  public drawArrow = (
    ctx: CanvasRenderingContext2D,
    xOrientation: boolean,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): void => {
    const aw = arrowWidth / 2 + (this.ix === this.mgr.currItem?.ix ? 2 : 0);
    ctx.beginPath();
    if (xOrientation) {
      const x0 = x2 + ((x1 < x2) ? - arrowLength : arrowLength);
      const ex = x2 + ((x1 < x2) ? + 2 : -2);
      ctx.moveTo(ex, y2);
      ctx.lineTo(x0, y1 - aw);
      ctx.lineTo(x0, y1 + aw);
    } else {
      const y0 = y2 + ((y1 < y2) ? - arrowLength : arrowLength);
      const ey = y2 + ((y1 < y2) ? + 2 : -2);
      ctx.moveTo(x2, ey);
      ctx.lineTo(x1 - aw, y0);
      ctx.lineTo(x1 + aw, y0);
    }
    ctx.closePath();
    ctx.fillStyle = UI.frameColor;
    ctx.fill();
  };

  public pointInArrow = (x: number, y: number): boolean => {
    const ctx = this.mgr.uc.ctx;
    if (ctx) {
      const aDef = this.arrowPath();
      let xa: number;
      let ya: number;
      let xb: number;
      let yb: number;
      if (aDef.xOrientation) {
        xa = aDef.x1 + firstArrowSegment * (aDef.x1 < aDef.x2 ? 1 : -1);
        ya = aDef.y1;
        xb = xa;
        yb = aDef.y2;
      } else {
        xa = aDef.x1;
        ya = aDef.y1 + firstArrowSegment * (aDef.y1 < aDef.y2 ? 1 : -1);
        xb = aDef.x2;
        yb = ya;
      }
      ctx.beginPath();
      ctx.moveTo(aDef.x1 - 2, aDef.y1 - 2);
      ctx.lineTo(xa - 2, ya - 2);
      ctx.lineTo(xb - 2, yb - 2);
      ctx.lineTo(aDef.x2 - 2, aDef.y2 - 2);
      ctx.lineTo(aDef.x2 + 2, aDef.y2 + 2);
      ctx.lineTo(xb + 2, yb + 2);
      ctx.lineTo(xa + 2, ya + 2);
      ctx.closePath();
      ctx.lineWidth = arrowClickHitWidth;
      return ctx.isPointInPath(x * UI.sizeSc, y * UI.sizeSc);
    }
    return false;
  };

  // Private methods

  private arrowPath = (): UiArrowDef => {
    if (this.fromIx < 0 || this.toIx < 0) {
      return { xOrientation: false, x1: 0, y1: 0, x2: 0, y2: 0, };
    }
    const t1 = this.getArrowTrans(this.fromIx);
    const x11 = t1.rect.x;
    const x12 = x11 + t1.rect.width;
    const y11 = t1.rect.y;
    const y12 = y11 + t1.rect.height;

    const t2 = this.getArrowTrans(this.toIx);
    const x21 = t2.rect.x;
    const x22 = x21 + t2.rect.width;
    const y21 = t2.rect.y;
    const y22 = y21 + t2.rect.height;

    // codes for t2 pos relative to t1 in center
    // 1  2  3
    // 4  5  6
    // 7  8  9

    // let pos: number;
    let xOrientation = false;
    let x1: number;
    let y1: number;
    let x2: number;
    let y2: number;
    if (x12 < x21) {
      if (y12 < y21) {
        // pos = 9;
        xOrientation = (x21 - x12) / (y21 - y12) > 1;
        x1 = xOrientation ? x12 : (x11 + x12) / 2;
        y1 = xOrientation ? (y11 + y12) / 2 : y12;
        x2 = xOrientation ? x21 : (x21 + x22) / 2;
        y2 = xOrientation ? (y21 + y22) / 2 : y21;
      } else if (y22 < y11) {
        // pos = 3;
        xOrientation = (x21 - x12) / (y11 - y22) > 1;
        x1 = xOrientation ? x12 : (x11 + x12) / 2;
        y1 = xOrientation ? (y11 + y12) / 2 : y11;
        x2 = xOrientation ? x21 : (x21 + x22) / 2;
        y2 = xOrientation ? (y21 + y22) / 2 : y22;
      } else {
        // pos = 6
        xOrientation = true;
        x1 = x12;
        y1 = (y11 + y12) / 2;
        x2 = x21;
        y2 = (y21 + y22) / 2;
      }
    } else if (x22 < x11) {
      if (y12 < y21) {
        // pos = 7;
        xOrientation = (x11 - x22) / (y21 - y12) > 1;
        x1 = xOrientation ? x11 : (x11 + x12) / 2;
        y1 = xOrientation ? (y11 + y12) / 2 : y12;
        x2 = xOrientation ? x22 : (x21 + x22) / 2;
        y2 = xOrientation ? (y21 + y22) / 2 : y21;
      } else if (y22 < y11) {
        // pos = 1;
        xOrientation = (x11 - x22) / (y11 - y22) > 1;
        x1 = xOrientation ? x11 : (x11 + x12) / 2;
        y1 = xOrientation ? (y11 + y12) / 2 : y11;
        x2 = xOrientation ? x22 : (x21 + x22) / 2;
        y2 = xOrientation ? (y21 + y22) / 2 : y22;
      } else {
        // pos = 4;
        xOrientation = true;
        x1 = x11;
        y1 = (y11 + y12) / 2;
        x2 = x22;
        y2 = (y21 + y22) / 2;
      }
    } else {
      if (y12 < y21) {
        // pos = 8;
        x1 = (x11 + x12) / 2;
        y1 = y12;
        x2 = (x21 + x22) / 2;
        y2 = y21;
      } else if (y22 < y11) {
        // pos = 2;
        x1 = (x11 + x12) / 2;
        y1 = y11;
        x2 = (x21 + x22) / 2;
        y2 = y22;
      } else {
        // pos = 5;
        x1 = 0;
        y1 = 0;
        x2 = 0;
        x2 = 0;
      }
    }
    return { xOrientation, x1, y1, x2, y2, };
  };

}
