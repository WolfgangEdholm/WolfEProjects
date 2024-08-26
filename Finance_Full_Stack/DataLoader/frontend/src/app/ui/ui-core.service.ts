import { ElementRef, Injectable } from '@angular/core';
// import { DbEng } from '../api/db-eng.service';
import { ContextService } from '../core/context.service';
import { DbEngService } from '../api/db-eng.service';
import { DataEngService } from '../api/data-eng.service';
import { Point } from '@angular/cdk/drag-drop';
// import { XRect } from '../types/shared';
// import { Table, ForeignKey } from '../types/db';
import { QueryCoreService } from '../core/query-core.service';
import { TransCoreService } from '../core/trans-core.service';
import { UiCoreData } from './types';
import { UiiInfo, UimInfo, UiDragMgr, UiStatusProc } from './types';
import { UiEventHandler, UiMouseEventHandler, UiUtilityProc } from './types';
import { UiItem, UiItemMgr } from './ui-item';
import * as UI from './constants';
import { logUiUpdates } from '../../constants';
import { XRect } from '../types/shared';



@Injectable({
  providedIn: 'root'
})
export class UiCoreService {
  xe: UiCoreData;

  constructor(
    public g: ContextService,
    public qc: QueryCoreService,
    public tc: TransCoreService,
    public dbEng: DbEngService,
    public dataEng: DataEngService,
  ) { }

  public initCallbacks(): void {
    this.xe.eventHandlers[UI.changeHappened] = this.changeHappened;
    this.xe.eventHandlers[UI.draw] = this.draw;
    this.xe.eventHandlers[UI.updateExtent] = this.updateExtent;
    this.xe.eventHandlers[UI.updateStatus] = this.updateStatus;
    if (this.xe.eventHandlers.length !== UI.eventCount) {
      console.log('Bad evenhandler initializantion');
    }
    this.xe.mouseEventHandlers[UI.onDragOver] = this.onDragOver;
    if (this.xe.eventHandlers.length !== UI.eventCount) {
      console.log('Bad mouse evenhandler initializantion');
    }
    this.xe.utilityProcs[UI.uiiInfoToMgr] = this.uiiInfoToMgr;
    this.xe.utilityProcs[UI.clearCurrentItem] = this.clearCurrentItem;
    if (this.xe.utilityProcs.length !== UI.utilityProcCount) {
      console.log('Bad utility procedure initializantion');
    }

    this.xe.id = 'DrawCore';
   }

  // Event management methods

  public registerMgr = (mgr: UiItemMgr): void => {
    let i = this.xe.mgrs.length;
    while (0 < i) {
      // moved i-- so i is 0 after the loop and not -1
      i--;
      if (this.xe.mgrs[i].plane > mgr.plane) {
        break;
      }
    }
    this.xe.mgrs.splice(i, 0, mgr);
  };

  public registerStatusUpdater = (statusProc: UiStatusProc): void => {
    this.xe.statusUpdaters.push(statusProc);
  };

  // Vectored event handlers

  public changeHappened = (): boolean => {
    for (let i = this.xe.mgrs.length; 0 < i--;) {
      this.xe.mgrs[i].changeHappened();
    }
    return true;
  };

  public draw = (): boolean => {
    if (this.xe.ctx) {
      this.xe.ctx.clearRect(0, 0, this.xe.ctx.canvas.width,
        this.xe.ctx.canvas.height);
      // console.log('GENERIC DRAW', this.xe.id);
      // this.x.ctx.fillStyle = UI.bodyFg;
      // this.x.ctx.fillRect(0, 0, this.x.ctx.canvas.width,
      //   this.x.ctx.canvas.height);
      for (let i = this.xe.mgrs.length; i--;) {
        this.xe.mgrs[i].draw();
      }
    }
    return true;
  };

  public getExtents = (): XRect => {
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    for (const mgr of this.xe.mgrs) {
      const ext = mgr.getExtent();
      if (ext.x < x) {
        x = ext.x;
      }
      if (ext.y < y) {
        y = ext.y;
      }
      if (ext.width > width) {
        width = ext.width;
      }
      if (ext.height > height) {
        height = ext.height;
      }
    }
    return { x, y, width, height };
  };

  // Vectored mouse event handlers

  public onDragOver = (
    x: number, y: number, sourceInfo: UiiInfo): UiiInfo => {
    for (const mgr of this.xe.mgrs) {
      const foundInfo = mgr.onDragOver(x, y, sourceInfo);
      if (foundInfo.item) {
        return foundInfo;
      }
    }
    return { item: undefined, partIx: -1 };
  };

  // Event handlers

  public onMouseDown = async (event: MouseEvent): Promise<void> => {
    const currItem1 = this.getCurrentStatus();
    const x = event.offsetX;
    const y = event.offsetY;
    const dragMgr = this.xe.dragMgr;
    if (currItem1.mgr) {
      currItem1.mgr.currItem = undefined;
    }
    dragMgr.mouseDownUiiInfo = undefined;
    dragMgr.mouseDownTime = Date.now();
    dragMgr.mouseDownStart.x = x;
    dragMgr.mouseDownStart.y = y;
    dragMgr.mouseMoveAdjustSet = false;

    let clickInfo = { item: undefined, partIx: -1 };
    for (const mgr of this.xe.mgrs) {
      clickInfo = mgr.onMouseDown(x, y, currItem1);
      if (clickInfo.item) {
        new Promise(res => setTimeout(res, 200)).then(_ => {
          mgr.onDragStart(x, y, clickInfo);
        });
        break;
      }
    }
    this.draw();
    const currItem2 = this.getCurrentStatus();
    this.onStatusChange(currItem1, currItem2);
  };

  public onMouseMove = (event: MouseEvent): void => {
    const x = event.offsetX;
    const y = event.offsetY;
    const dragMgr = this.xe.dragMgr;

    if (dragMgr.mouseDownUiiInfo && event.buttons === 1) {
      for (const mgr of this.xe.mgrs) {
        if (mgr.onDragMove(x, y, dragMgr.mouseDownUiiInfo)) {
          return;
        }
      }
    } else {
      this.setCursor(x, y);
    }
  };

  public onMouseUp = (event: MouseEvent): void => {
    const currItem1 = this.getCurrentStatus();
    const x = event.offsetX;
    const y = event.offsetY;
    const dragMgr = this.xe.dragMgr;

    if (dragMgr.mouseDownUiiInfo) {
      for (const mgr of this.xe.mgrs) {
        const targetInfo = mgr.onDrop(x, y, dragMgr.mouseDownUiiInfo);
        if (targetInfo.item) {
          this.clearDragInfo();
          return;
        }
      }
      const sourceMgr = this.uiiInfoToMgr(dragMgr.mouseDownUiiInfo);
      sourceMgr.dropNotAccepted(x, y, dragMgr.mouseDownUiiInfo);
      this.draw();
    }
    this.clearDragInfo();
    const currItem2 = this.getCurrentStatus();
    this.onStatusChange(currItem1, currItem2);
  };

  public onStatusChange = (status1: UimInfo, status2: UimInfo): void => {
    if (status1.mgr !== status2.mgr ||
      status1.item !== status2.item ||
      status1.partIx !== status2.partIx) {
      if (logUiUpdates) {
        console.log('onStatusChange', status1, status2);
      }
      for (const statusUpdater of this.xe.statusUpdaters) {
        statusUpdater(status2);
      }
    }
  };

  // Public methods

  public updateStatus = (): boolean => {
    if (logUiUpdates) {
      console.log('UI UPDATESTATUS');
    }
    const status = this.getCurrentStatus();
    for (const statusUpdater of this.xe.statusUpdaters) {
      statusUpdater(status);
    }
    return true;
  };

  public updateExtent = (): boolean => {
    const extent = this.getExtents();
    this.setCanvasExtent(extent.x, extent.y, extent.width, extent.height);
    return true;
  };

  public setCursor = (x: number, y: number): void => {
    for (const mgr of this.xe.mgrs) {
      const uiiInfo = mgr.setCursor(x, y);
      if (uiiInfo.item) {
        return;
      }
    }
    this.xe.canvas.nativeElement.style.cursor = 'default';
  };

  public getCurrentStatus = (): UimInfo => {
    for (const mgr of this.xe.mgrs) {
      const uimInfo = mgr.getCurrUimItem();
      if (uimInfo.mgr) {
        return uimInfo;
      }
    }
    return { mgr: undefined, item: undefined, partIx: -1 };
  };

  public clearCurrentItem = (): UimInfo => {
    for (const mgr of this.xe.mgrs) {
      const uimInfo = mgr.getCurrUimItem();
      if (uimInfo.mgr) {
        mgr.currItem = undefined;
        return uimInfo;
      }
    }
    return { mgr: undefined, item: undefined, partIx: -1 };
  };

  public uiiInfoToMgr = (info: UiiInfo): UiItemMgr => {
    if (info.item) {
      for (const mgr of this.xe.mgrs) {
        if (mgr.firstPartCode < info.partIx && info.partIx < mgr.lastPartCode) {
          return mgr;
        }
      }
    }
    return undefined;
  };

  // Canvas management methods

  public initialize = (
    canvas: ElementRef,
    scrollWrapper: ElementRef,
  ): void => {
    this.xe.canvas = canvas;
    this.xe.scrollWrapper = scrollWrapper;
    this.setCanvasContext();
  };

  public uninitialize = (): void => {
    this.xe.isInitialized = false;
    this.xe.canvas = undefined;
    this.xe.ctx = undefined;
  };

  public setCanvasContext = (): void => {
    if (!this.xe.isInitialized && this.xe.canvas?.nativeElement?.getContext) {
      this.xe.isInitialized = true;
      this.xe.ctx = this.xe.canvas.nativeElement.getContext('2d');
      this.xe.eventHandlers[UI.updateExtent]();
      this.xe.eventHandlers[UI.draw]();
    }
  };

  public getMeasureCanvasContext = (): CanvasRenderingContext2D => {
    if (!this.xe.ctx) {
      this.setCanvasContext();
      if (this.xe.ctx) {
        // console.log('Freeing BUP Canvas');
        this.xe.bupCanvas = undefined;
      } else {
        if (!this.xe.bupCanvas) {
          // console.log('Creating BUP Canvas');
          this.xe.bupCanvas = document.createElement('CANVAS') as
            HTMLCanvasElement;
        }
        return this.xe.bupCanvas.getContext('2d');
      }
    }
    return this.xe.ctx;
  };

  public setCanvasExtent = (
    x: number,
    y: number,
    width: number,
    height: number,
  ): void => {
    const ctx = this.xe.ctx;
    // console.log('setExtents', x, y, width, height);
    const cvEl = this.xe.canvas?.nativeElement;
    if (cvEl) {
      // console.log('Element', cvEl);

      // width = Math.max(cvEl.parentElement.clientWidth, width) - x;
      // height = Math.max(cvEl.parentElement.clientHeight, height) - y;
      width = Math.max(cvEl.parentElement.clientWidth, width);
      height = Math.max(cvEl.parentElement.clientHeight, height);
      if (UI.magnify) {
        cvEl.scrollTop = -y;
        cvEl.scrollLeft = -x;
        cvEl.width = width;
        cvEl.height = height;
        this.xe.ctx.scale(UI.dpr, UI.dpr);
      } else {
        cvEl.width = width * UI.dpr;
        cvEl.height = height * UI.dpr;
        this.xe.ctx.scale(UI.dpr, UI.dpr);
      }
      // cvEl.style.position='relative';
      // cvEl.style.left = x + 'px';
      // cvEl.style.top = y + 'px';
      // console.log('STYLE', cvEl.style.left, cvEl.style.top );
      cvEl.style.width = width + 'px';
      cvEl.style.height = height + 'px';

      cvEl.scrollTo(-x, -y);
    }
  };

  public getCanvasExtent = (): Point => {
    const cvEl = this.xe.canvas.nativeElement;
    return { x: cvEl.width, y: cvEl.height };
  };

  public isGlobalPointInsideCanvas = (p: Point): boolean =>
    this.xe.canvas.nativeElement === document.elementFromPoint(p.x, p.y);

  public getCanvasBounds = (): DOMRect => {
    const cvEl = this.xe.canvas.nativeElement;
    return cvEl.getBoundingClientRect();
  };

  public getCanvasTopLeftScrollOffset = (): Point => {
    const cvEl = this.xe.canvas.nativeElement;
    return { x: cvEl.scrollLeft, y: cvEl.scrollTop };
  };

  public globalToLocal = (point: Point): Point => {
    const cvEl = this.xe.canvas.nativeElement;
    point.x -= cvEl.offsetLeft;
    point.y -= cvEl.offsetTop + this.g.toolbarHeight;
    return point;
  };

  public xroundRectPrim = (
    sx: number, sy: number, ex: number, ey: number,
    rLt: number, rRt: number, rRb: number, rLb: number,
    code: number, chkx: number, chky: number
  ): boolean => {
    const isStroke = (code === 1 || code === 4);
    const isFill = (code === 2);
    const d2r = Math.PI / 180;
    const ctx = this.xe.ctx;

    ctx.beginPath();
    ctx.moveTo(sx + rLt, sy);
    ctx.lineTo(ex - rRt, sy);
    ctx.arc(ex - rRt, sy + rRt, rRt, d2r * 270, d2r * 360, false);
    ctx.lineTo(ex, ey - rRb);
    ctx.arc(ex - rRb, ey - rRb, rRb, d2r * 0, d2r * 90, false);
    ctx.lineTo(sx + rLb, ey);
    ctx.arc(sx + rLb, ey - rLb, rLb, d2r * 90, d2r * 180, false);
    ctx.lineTo(sx, sy + rLt);
    ctx.arc(sx + rLt, sy + rLt, rLt, d2r * 180, d2r * 270, false);
    ctx.closePath();

    if (isFill) {
      ctx.fill();
      return false;
    }
    if (isStroke) {
      ctx.stroke();
      if (code !== 4) {
        return false;
      }
    }
    return ctx.isPointInPath(chkx, chky);
  };

  // Private methods

  private clearDragInfo = (): void => {
    this.xe.dragMgr.mouseDownUiiInfo = undefined;
  };

}
