
import { Point } from '@angular/cdk/drag-drop';
import * as UI from './constants';
import { XRect } from '../types/shared';
import { UiDragMgr, UiEventHandler, UiMouseEventHandler } from './types';
import { UiUtilityProc, UiStatusProc, UimInfo, UiiInfo } from './types';
import { UiCoreData } from './types';


// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export class UiItemMgr {
  public firstPartCode = 0;
  public lastPartCode = 0;
  public items: UiItem[] = [];
  public currItem: UiItem;
  public isDirty = false;

  constructor(
    public uc: UiCoreData,
    public plane: number,
  ) {
  }

  public changeHappened = (): void => {
  };

  public draw = (): void => {
  };

  public dropNotAccepted = (
    x: number, y: number, sourceInfo: UiiInfo): boolean =>
    false;

  public getCurrUimItem = (): UimInfo => {
    const mgr = this.currItem ? this : undefined;
    return { mgr, item: this.currItem, partIx: -1 };
  };

  public getExtent = (): XRect =>
    ({ x: 0, y: 0, width: 0, height: 0, });

  public onMouseDown = (
    x: number, y: number, currItem: UimInfo): UiiInfo =>
    ({ item: undefined, partIx: -1 });

  public onDragStart = (
    x: number, y: number, clickInfo: UiiInfo): void => {
  };

  public onDragMove = (
    x: number, y: number, sourceInfo: UiiInfo): boolean =>
    false;

  public onDragOver = (
    x: number, y: number, sourceInfo: UiiInfo): UiiInfo =>
    ({ item: undefined, partIx: -1 });

  public onDrop = (
    x: number, y: number, sourceInfo: UiiInfo): UiiInfo =>
    ({ item: undefined, partIx: -1 });

  public setCursor = (x: number, y: number): UiiInfo =>
    ({ item: undefined, partIx: -1 });

  // Vectored events

  public vecChangeHappened = (): void => {
    this.uc.eventHandlers[UI.changeHappened]();
  };

  public vecDraw = (): void => {
    this.uc.eventHandlers[UI.draw]();
  };

  public vecUpdateExtent = (): void => {
    this.uc.eventHandlers[UI.updateExtent]();
  };

  public vecUpdateStatus = (): void => {
    this.uc.eventHandlers[UI.updateStatus]();
  };

  // Vectored mouse events

  public vecOnDragOver = (
    x: number, y: number, sourceInfo: UiiInfo): UiiInfo =>
    this.uc.mouseEventHandlers[UI.onDragOver](x, y, sourceInfo);

  // Vectored utilities

  public vecCvoToMgr = (uiiInfo: UiiInfo): UiItemMgr =>
    this.uc.utilityProcs[UI.uiiInfoToMgr](uiiInfo);

  public vecClearCurrentItem = (): UimInfo =>
    this.uc.utilityProcs[UI.clearCurrentItem](0);

}

export class UiItem {
  public ix: number;

  constructor(
  ) { }

  public changeHappened = () => {
    console.log('BASE changeHappened');
  };

  public drag = (
    x: number, y: number, sourceInfo: UiiInfo): void => {
  };

  public dragOver = (
    x: number,
    y: number,
    sourceInfo: UiiInfo,
    targetInfo: UiiInfo,
  ): UiiInfo =>
    ({ item: undefined, partIx: -1 });

  public receiveDrop = (
    x: number,
    y: number,
    sourceInfo: UiiInfo,
    targetInfo: UiiInfo,
  ): UiiInfo =>
    ({ item: undefined, partIx: -1 });

  public getExtent = (): Point =>
    ({ x: 0, y: 0 });

  public move = (
    x: number, y: number, sourceInfo: UiiInfo): void => {
  };

}
