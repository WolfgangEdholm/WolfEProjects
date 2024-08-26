import { ElementRef } from '@angular/core';
import { UiItem, UiItemMgr } from './ui-item';
import { Point } from '@angular/cdk/drag-drop';
import { XRect } from '../types/shared';
import { UiCoreService } from './ui-core.service';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export class UiDragMgr {
  mouseDownUiiInfo: UiiInfo;
  mouseDownTime = 0;
  mouseDownStart = { x: 0, y: 0 };
  mouseMoveAdjust = { x: 0, y: 0 };
  mouseMoveAdjustSet = false;
  lastMovePos = { x: -1, y: -1 };
  dragRect: XRect;
}

export type UimInfo = {
  mgr: UiItemMgr;
  item: UiItem;
  partIx: number;
};

export type UiiInfo = {
  item: UiItem;
  partIx: number;
};

export type UiEventHandler = () => boolean;

export type UiMouseEventHandler =
  (x: number, y: number, info: UiiInfo) => UiiInfo;

export type UiUtilityProc = (param: any) => any;

export type UiStatusProc = (status: UiiInfo) => void;

// export class UiItem {
//   public ix: number;
// };

// export class UiItemMgr {
//   public firstPartCode = 0;
//   public lastPartCode = 0;
//   public items: UiItem[] = [];
//   public currItem: UiItem;
// };

export class UiCoreData {
  public dbgName: string;
  public core: UiCoreService;
  public isInitialized: boolean;
  public canvas: ElementRef;
  public scrollWrapper: ElementRef;
  public ctx: CanvasRenderingContext2D;
  public bupCanvas: HTMLCanvasElement;
  public dragMgr = new UiDragMgr();
  public eventHandlers: UiEventHandler[] = [];
  public mouseEventHandlers: UiMouseEventHandler[] = [];
  public utilityProcs: UiUtilityProc[] = [];
  public requestColsColor = 1;
  public id: string;

  mgrs: UiItemMgr[] = [];
  statusUpdaters: UiStatusProc[] = [];
}
