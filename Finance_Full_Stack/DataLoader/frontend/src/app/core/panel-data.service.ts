import { Injectable } from '@angular/core';
import { ContextService } from '../core/context.service';
import { TransCoreService } from '../core/trans-core.service';
import { QueryCoreService } from '../core/query-core.service';
import { TransService } from '../cmd/trans.service';
import { QueryService } from '../cmd/query.service';
import { UiCoreService } from '../ui/ui-core.service';
import { SidePanelService, SidePanelLoadReturn, SidePanelLoader,
} from '../sidepanel/side-panel.service';
import { QDocService } from '../api/qdoc.service';
import { TDocService } from '../api/tdoc.service';
import { Point } from '@angular/cdk/drag-drop';
import { ApiIoQuery } from '../types/qIo';
import { ApiIoTrans } from '../types/tIo';
import { AppService } from './app.service';
import { FilterSpec, FilterFunc, FilterDef } from '../types/filter';
import { Filter } from '../filters/filter';
import { DATA_IN, DATA_OUT, VERIFY, TRANSPARAMS } from '../types/filter';
import { TransParamsFilter } from '../filters/trans-params-filter';
import { CapitalizeFilter } from '../filters/capitalize-filter';
import { DataInFilter } from '../filters/data-in-filter';
import { DataOutFilter } from '../filters/data-out-filter';
import { IncludeFilter } from '../filters/include-filter';
import { VerifyFilter } from '../filters/verify-filter';
import * as Modal from '../services/modal.service';
import { TransEngService } from '../api/trans-eng.service';
import { DbEngService } from '../api/db-eng.service';


export type PanelDataControl = {
  paneIx: number;
  selectedItemIx: number;
  siblings: PanelDataControl[];
  ix: number;
};

@Injectable({
  providedIn: 'root'
})
export class PanelDataService {
  paneControls: PanelDataControl[] = [];

  filterSpecs: [string, string, Filter][] = [
    ['Capitalize', 'capitalize', new CapitalizeFilter()],
    ['Include', 'include', new IncludeFilter()],
  ];

  helperSpecs: [string, string, Filter][] = [
    ['Data In', DATA_IN, new DataInFilter()],
    ['Data Out', DATA_OUT, new DataOutFilter()],
    ['Verify', VERIFY, new VerifyFilter(this.modal)],
  ];

  transParamFilterSpec: [string, string, Filter] =
    ['Transformer', TRANSPARAMS, new TransParamsFilter()];

  constructor(
    private sp: SidePanelService,
    private dbEng: DbEngService,
    public g: ContextService,
    public qc: QueryCoreService,
    public qs: QueryService,
    private qd: QDocService,
    public tc: TransCoreService,
    public ts: TransService,
    public te: TransEngService,
    private td: TDocService,
    public core: UiCoreService,
    public app: AppService,
    public modal: Modal.ModalService,
  ) {
    // hookup filter handlers
    this.filterSpecs.forEach(s => {
      tc.filters.push({
        displayName: s[0],
        name: s[1],
        handler: s[2],
      });
    });

    // install filters, helpers & transParams
    tc.filterMap.clear();
    tc.filters.forEach(f => tc.filterMap.set(f.name, f));

    this.helperSpecs.forEach(s => {
      tc.helpers.push({
        displayName: s[0],
        name: s[1],
        handler: s[2],
      });
    });

    tc.helperMap.clear();
    tc.helpers.forEach(f => tc.helperMap.set(f.name, f));

    tc.transParams = {
      displayName: this.transParamFilterSpec[0],
      name: this.transParamFilterSpec[1],
      handler: this.transParamFilterSpec[2],
    };
  }

  public sidePanelIx = (paneControlIx: number): number =>
    this.paneControls[paneControlIx].paneIx;

  public makeGroup = (siblings: number[]): void => {
    for (const siblingIx of siblings) {
      const siblingControl = this.paneControls[siblingIx];
      siblingControl.siblings = [];
      for (const innerSiblingIx of siblings) {
        if (innerSiblingIx !== siblingIx) {
          const innerSiblingControl = this.paneControls[innerSiblingIx];
          siblingControl.siblings.push(innerSiblingControl);
        }
      }
    }
  };

  public stdSelectItem = (
    paneControlIx: number,
    paneItemIx: number,
  ): void => {
    const control = this.paneControls[paneControlIx];
    control.selectedItemIx = paneItemIx;
    for (const sibling of control.siblings) {
      sibling.selectedItemIx = -1;
    }
  };

  // Queries

  public queryLoader = (
    itemIx: number,
    items: ApiIoQuery[],
    childIx: number = -1,
  ): SidePanelLoadReturn =>
    ({
      displayName: items[itemIx].dbQueryName.split('.')[1],
      isTopLevel: true,
      childCount: 0,
      item: items[itemIx],
      itemIx,
      childIx,
    } as SidePanelLoadReturn);


  public queryPaneRebuild = (paneControlIx: number): number =>
    this.buildPane(paneControlIx, this.qd.dataItems, this.queryLoader);


  public querySelectItem = (
    paneControlIx: number,
    paneItemIx: number,
  ): void => {
    this.stdSelectItem(paneControlIx, paneItemIx);
    const control = this.paneControls[paneControlIx];
    const spItem = this.sp.panes[control.paneIx].items[paneItemIx];
    const ioDoc = spItem.item as ApiIoQuery;
    this.app.queryEdit(ioDoc.id, ioDoc.dbQueryName);
  };

  public queryDragReleased = async (
    globalMousePoint: Point,
    globalPoint: Point,
    name: string,
    item: ApiIoQuery,
  ): Promise<void> => {
    if (!this.core.isGlobalPointInsideCanvas(globalMousePoint)) {
      return;
    }
    const itemIx = this.tc.transMgr.items.length;
    const dbQueryName = `${this.dbEng.currDatabase}.${name}`;
    this.qd.queryInit();
    const qdoc = await this.qd.getQDocFromName(dbQueryName, false);
    await this.qs.buildQDocument(qdoc, true);
    const dummyIntegrityErrors: string[] = [];
    // const hasIntegrityError =
    //   this.qs.updateQDocIntegrity(qdoc, dummyIntegrityErrors);
    const localPoint = this.core.globalToLocal(globalPoint);
    const uiTi = this.ts.addUiTrans(
      localPoint,
      name,
      'Q',
      item.dbQueryName,
      this.tc.mainTrans,
    );
    this.ts.addTransItem(
      uiTi.rect, uiTi.displayName, uiTi.tp, item.dbQueryName);
    // if (hasIntegrityError) {
    //   this.ts.updateUiItemIntegrity(itemIx, Integrity.error);
    //   this.ts.core.draw();
    // }
    await this.te.checkTransIntegrity(this.tc.mainTrans);
    // the dropped query will be rebuilt in the background.
    // clear the dirty flags that result from it.
    // this.qc.clearQDirty();
  };

  // Transformers

  public transLoader = (
    itemIx: number,
    items: ApiIoTrans[],
    childIx: number = -1,
  ): SidePanelLoadReturn =>
    ({
      displayName: items[itemIx].dbTransName.split('.')[1],
      isTopLevel: true,
      childCount: 0,
      item: items[itemIx],
      itemIx,
      childIx,
    } as SidePanelLoadReturn);


  public transPaneRebuild = (paneControlIx: number): number =>
    this.buildPane(paneControlIx, this.td.dataItems, this.transLoader);


  public transSelectItem = (
    paneControlIx: number,
    paneItemIx: number,
  ): void => {
    this.stdSelectItem(paneControlIx, paneItemIx);
    const control = this.paneControls[paneControlIx];
    const spItem = this.sp.panes[control.paneIx].items[paneItemIx];
    const ioDoc = spItem.item as ApiIoTrans;
    this.app.transEdit(ioDoc.id, ioDoc.dbTransName);
  };

  public transDragReleased = async (
    globalMousePoint: Point,
    globalPoint: Point,
    name: string,
    item: ApiIoTrans,
  ): Promise<void> => {
    if (!this.core.isGlobalPointInsideCanvas(globalMousePoint)) {
      return;
    }
    const oldArrowIsDIrty = this.tc.arrowMgr.isDirty;
    const oldTransIsDIrty = this.tc.transMgr.isDirty;
    const itemIx = this.tc.transMgr.items.length;
    const dbTransName = `${this.dbEng.currDatabase}.${name}`;
    this.td.transInit();
    const tdoc = await this.td.getTDocFromName(dbTransName, false);
    await this.ts.buildTDocumentUi(tdoc, true);
    const localPoint = this.core.globalToLocal(globalPoint);
    const uiTi = this.ts.addUiTrans(
      localPoint,
      name,
      'T',
      item.dbTransName,
      this.tc.mainTrans,
    );
    this.ts.addTransItem(
      uiTi.rect, uiTi.displayName, uiTi.tp, item.dbTransName);
    await this.te.checkTransIntegrity(tdoc);
    await this.te.checkTransIntegrity(this.tc.mainTrans);

    // restore old dirty flags
    this.tc.arrowMgr.isDirty = oldArrowIsDIrty;
    this.tc.transMgr.isDirty = oldTransIsDIrty;
  };

  // Filters

  public filterLoader = (
    itemIx: number,
    items: FilterSpec[],
    childIx: number = -1,
  ): SidePanelLoadReturn =>
    ({
      displayName: items[itemIx].displayName,
      isTopLevel: true,
      childCount: 0,
      item: items[itemIx],
      itemIx,
      childIx: -1,
    } as SidePanelLoadReturn);


  public filterPaneRebuild = (
    paneControlIx: number,
  ): number =>
    this.buildPane(paneControlIx, this.tc.filters, this.filterLoader);


  public filterSelectItem = (
    paneControlIx: number,
    paneItemIx: number,
  ): void => {
    this.stdSelectItem(paneControlIx, paneItemIx);
    console.log('select filter');
  };

  public filterDragReleased = async (
    globalMousePoint: Point,
    globalPoint: Point,
    name: string,
    item: FilterSpec,
  ): Promise<void> => {
    if (!this.core.isGlobalPointInsideCanvas(globalMousePoint)) {
      return;
    }
    // const dummyIntegrityErrors = [];
    // const dbName = `${this.dbEng.currDatabase}.${name}`;
    // this.te.checkTableIntegrityPrim()
    const localPoint = this.core.globalToLocal(globalPoint);
    const uiTi = this.ts.addUiTrans(
      localPoint,
      name,
      'F',
      item.name,
      this.tc.mainTrans,
    );
    this.ts.addTransItem(
      uiTi.rect, uiTi.displayName, uiTi.tp, item.name);
    this.td.copyMainFiltersToTrans(this.tc.mainTrans);
    await this.te.checkTransIntegrity(this.tc.mainTrans);
  };

  // Helpers

  public helperLoader = (
    itemIx: number,
    items: FilterSpec[],
    childIx: number = -1,
  ): SidePanelLoadReturn =>
    ({
      displayName: items[itemIx].displayName,
      isTopLevel: true,
      childCount: 0,
      item: items[itemIx],
      itemIx,
      childIx: -1,
    } as SidePanelLoadReturn);


  public helperPaneRebuild = (
    paneControlIx: number,
  ): number =>
    this.buildPane(paneControlIx, this.tc.helpers, this.helperLoader);


  public helperSelectItem = (
    paneControlIx: number,
    paneItemIx: number,
  ): void => {
    this.stdSelectItem(paneControlIx, paneItemIx);
    console.log('select helper');
  };

  public helperDragReleased = async (
    globalMousePoint: Point,
    globalPoint: Point,
    name: string,
    item: FilterSpec,
  ): Promise<void> => {
    if (!this.core.isGlobalPointInsideCanvas(globalMousePoint)) {
      return;
    }
    const localPoint = this.core.globalToLocal(globalPoint);
    const uiTi = this.ts.addUiTrans(
      localPoint,
      name,
      'H',
      item.name,
      this.tc.mainTrans,
    );
    this.ts.addTransItem(
      uiTi.rect, uiTi.displayName, uiTi.tp, item.name);
    this.td.copyMainFiltersToTrans(this.tc.mainTrans);
    await this.te.checkTransIntegrity(this.tc.mainTrans);
  };

  // Private methods

  private buildPane = (
    paneControlIx: number,
    sourceItems: any[],
    loader: SidePanelLoader,
  ): number => {
    let ix = paneControlIx;
    if (paneControlIx === undefined || paneControlIx < 0) {
      ix = this.paneControls.length;
      this.paneControls.push({
        paneIx: -1,
        selectedItemIx: -1,
        siblings: [],
        ix,
      } as PanelDataControl);
    }
    const control = this.paneControls[ix];
    control.paneIx = this.sp.rebuildSidePane(
      control.paneIx, sourceItems, loader);
    return ix;
  };

}
