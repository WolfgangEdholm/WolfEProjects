import { Component, ViewChild, ElementRef, AfterViewInit,
  OnDestroy, OnInit, ViewChildren, QueryList, HostListener
  } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import * as Modal from '../services/modal.service';
import { Md2Service, Md2Params } from '../md2/md2.service';
import { CssService } from '../ui-engine/ui-css.service';
import { DbEngService } from '../api/db-eng.service';
import { DataEngService } from '../api/data-eng.service';
import { ComputeService } from '../code/compute.service';
import { ContextService } from '../core/context.service';
import { TransCoreService } from '../core/trans-core.service';
import { TransService } from '../cmd/trans.service';
import { QueryService } from '../cmd/query.service';
import { UiCoreService } from '../ui/ui-core.service';
import { Observable, Subscription, fromEvent, } from 'rxjs';
import { UimInfo } from '../ui/types';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { QDocService } from '../api/qdoc.service';
import { TDocService } from '../api/tdoc.service';
import { UiCoreData } from '../ui/types';
import { UiTransMgr, UiTrans } from '../ui/ui-trans';
import { UiArrowMgr } from '../ui/ui-arrow';
import { SidePanelService } from '../sidepanel/side-panel.service';
import { PanelDataService } from '../core/panel-data.service';
import { Point } from '@angular/cdk/drag-drop';
import { IoQuery } from '../types/qIo';
import { AppService } from '../core/app.service';
import { TDoc } from '../types/trans';
import { QDoc } from '../types/query';
import { TransEngService } from '../api/trans-eng.service';
import { TransResultsMd2Component, TransResultsMd2Spec,
} from '../md2/trans-results-md2/trans-results-md2.component';
import { FilterParamsComponent, FilterParamsSpec,
} from '../filter-params/filter-params.component';
import { TRANSPARAMS } from '../types/filter';


// 45678911234567892123456789312345678941234567895123456789612345678971234567898

const MODAL_TOP = '10rem';

@Component({
  selector: 'app-trans',
  templateUrl: './trans.component.html',
  styleUrls: ['./trans.component.scss']
})
export class TransComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('scrollWrapper', {static: false, read: ElementRef})
    canvasScroll: ElementRef;
  // @ViewChild('transTarget', {static: false, read: ElementRef})
  //   tTarget: ElementRef;
  @ViewChildren('xcanvas') xquery: QueryList<ElementRef>;

  uc: UiCoreData;

  lpExpandedCode = 0;

  // rpTopIx = -1;
  // rpTopSelectedItemIx = -1;

  showLeftColumn = true;
  leftColumnDisplaySize = 20;
  showRightColumn = true;
  rightColumnDisplaySize = 20;

  leftColumnSize = 0;
  centerColumnSize = 0;
  rightColumnSize = 0;

  tlMsg1 = 'Show';
  tlMsg2 = 'Hide';

  isOutsideInDragging = false;

  removeIsDisabled = false;
  editIsDisabled = false;
  saveIsDisabled = false;
  runIsDisabled = false;

  private subscriptions = new Subscription();
  private resizeObservable$: Observable<Event>;

  constructor(
    private router: Router,
    private matDialog: MatDialog,
    public modal: Modal.ModalService,
    public md2: Md2Service,
    public dbEng: DbEngService,
    public dataEng: DataEngService,
    // don't remove computeEng for initialization reasons
    // (loading compute engine hooks it up to data engine)
    public computeEng: ComputeService,

    public css: CssService,
    public g: ContextService,
    public core: UiCoreService,
    public qd: QDocService,
    public td: TDocService,
    public sp: SidePanelService,
    public pd: PanelDataService,
    public qs: QueryService,
    public tc: TransCoreService,
    public ts: TransService,
    public as: AppService,
    public transEng: TransEngService,
  ) {
    console.log('----------------------------- Transformer Screen');
    this.uc = g.transData;
    core.xe = this.uc;
    this.uc.core = core;

    this.calcPanelSizes();

    this.tc.transMgr.setClickHandler(this.onTransClick);
  }

  // to prevent text selcetion by doubleclick,
  @HostListener('document:mousedown', ['$event'])
  eatMouseDown(e: MouseEvent): void {
    if (e.detail > 1) {
      // console.log('Double Click');
      e.preventDefault();
    }
  }

  public async ngOnInit(): Promise<void> {
    this.g.setAppSection('Transformer Build Page');
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.subscriptions.add(this.resizeObservable$.subscribe(this.onResize));
    // this URL is sometimes an entry point
    await this.dbEng.setCurrentDatabase('demo1');

    this.tc.showRun = true;
    // this.qdoc.dataEmitter.subscribe(() => { this.onLoadedData(); });
    await this.qd.getAllIoQuerys();
    await this.td.getAllIoTranses();

    this.g.queryPaneIx = this.pd.queryPaneRebuild(this.g.queryPaneIx);
    this.g.filterPaneIx = this.pd.filterPaneRebuild(this.g.filterPaneIx);
    this.g.transPaneIx = this.pd.transPaneRebuild(this.g.transPaneIx);
    this.g.helperPaneIx = this.pd.helperPaneRebuild(this.g.helperPaneIx);

    this.core.registerStatusUpdater(this.statusUpdater);
    this.statusUpdater(this.core.getCurrentStatus());
  }

  ngAfterViewInit(): void {
    // This construct calls initialize after data is loaded the first time
    this.xquery.changes.subscribe(_ => {
      this.initializeCanvas();
    });

    // This construct calls initialie when returning later
    if (this.xquery.first) {
      this.initializeCanvas();
      this.core.draw();
    }
  }

  ngOnDestroy(): void {
    this.tc.showRun = false;
    this.subscriptions.unsubscribe();
    this.core.uninitialize();
  }

  public onResize = (event: any): void => {
    this.ts.onResize();
  };

  // Start of main command functions

  public async onAdd(ix: number): Promise<void>  {
  }

  public statusUpdater = (status: UimInfo): void => {
    // console.log('TRANS COMPONENT UPDATER');
    if (status.mgr === this.tc.transMgr) {
      this.removeIsDisabled = false;
      this.editIsDisabled = true;
    } else if (status.mgr === this.tc.arrowMgr) {
      this.removeIsDisabled = false;
      this.editIsDisabled = true;
    } else {
      this.removeIsDisabled = false;
      this.editIsDisabled = true;
    }
    // this.saveIsDisabled = this.tc.transMgr.items.length === 0;
    this.runIsDisabled = this.tc.transMgr.items.length === 0;
  };

  public onRemove(): void {
    const tc = this.tc;
    const arrowMgr = tc.arrowMgr;
    const transMgr = tc.transMgr;
    if (arrowMgr.currItem) {
      this.modal.confirm({
        title: 'Remove Arrow',
        message: 'Are you sure you want to remove the selected arrow?',
        okButton: 'Remove',
        cancelButton: 'Cancel',
      }).then((resp: Modal.CodeReturn) => {
        if (resp.code === Modal.ReturnCode.ok) {
          this.ts.removeTransArrow(arrowMgr.currItem.ix);
        }
      });
    } else if (transMgr.currItem) {
      this.modal.confirm({
        title: 'Remove Transformer Item',
        message: `Are you sure you want to remove the selected '${
          transMgr.currTItem().displayName}' transformer item?`,
        okButton: 'Remove',
        cancelButton: 'Cancel',
      }).then((resp: Modal.CodeReturn) => {
        if (resp.code === Modal.ReturnCode.ok) {
          this.ts.removeTransItem(transMgr.currItem.ix);
        }
      });
    } else if (tc.mainTrans.id > 0) {
        const tName = tc.mainTrans.dbTransName;
        this.modal.confirm({
          title: 'Remove Entire Transformer',
          message:
            `Are you sure you want to delete '${tName}' from the database?`,
          okButton: 'Delete',
          cancelButton: 'Cancel',
        }).then((resp: Modal.CodeReturn) => {
          if (resp.code === Modal.ReturnCode.ok) {
            this.ts.deleteTrans();
          }
        });
    } else {
      this.modal.confirm({
        title: 'Remove All Transformer Items',
        message: 'Are you sure you want to remove all transformer items?',
        okButton: 'Remove',
        cancelButton: 'Cancel',
      }).then((resp: Modal.CodeReturn) => {
        if (resp.code === Modal.ReturnCode.ok) {
          this.td.transInit();
        }
      });
    }
  }

  public onEdit(): void {
    console.log('Transformer Edit');
    const transMgr = this.tc.transMgr;
    const tItem = transMgr.currTItem();
    if (tItem?.tp === 'F' || tItem?.tp === 'H' || tItem?.tp === 'T') {
      const modalRef = this.matDialog.open(FilterParamsComponent, {
        maxWidth: window.innerWidth + 'px',
        maxHeight: window.innerHeight + 'px',
        // width,
        position: { top: MODAL_TOP, left: '', bottom: '', right: '' },
        disableClose: true,
        panelClass: 'x-mat-container',
        data: {
          tdoc: this.tc.mainTrans,
          filterType: tItem.tp,
          filterName: tItem.tp === 'T' ? TRANSPARAMS : tItem.dbItemName,
          transItemIx: tItem.ix,
          filterIx: tItem.filterIx,
          transName: tItem.displayName,
        } as FilterParamsSpec,
      });
      lastValueFrom(modalRef.afterClosed()).then(result => {
      });
    }

  }

  public onSave(event: MouseEvent): void {
    console.log('SAVE shift =', event.shiftKey);
    this.td.uxSaveTDoc(event.shiftKey);
    this.tc.clearTDirty();
  }

  public async onRun(): Promise<void> {
    // if (!this.tc.transMgr.currItem) {
    //   this.modal.alert({
    //     title: 'No transformer item selected',
    //     message: 'Select which',
    //     okButton: 'OK',
    //   }).then(res => {
    //     console.log('Modal results', res);
    //   });
    // }
    // const transItem = this.tc.transMgr.currTItem();
    // const exDoc = transItem ? transItem.idoc
    // if (!transItem) {
    //   transItem = this.tc.transMgr.getTItem(0);
    // }
    // check current query not dirty
    const goOn = await this.as.checkForDirtyQueryOk();
    if (goOn) {
      this.td.copyMainFiltersToTrans(this.tc.mainTrans);
      const runCode = await this.transEng.runTrans(this.tc.mainTrans);
      this.showRunResults();

    }
    // const queryUrl = `/data`;
    // this.router.navigate( [ queryUrl ] );
  }

  public showRunResults(): void {
    const modalRef = this.matDialog.open(
      TransResultsMd2Component,
      this.md2.modalSetup({
        dbTransName: this.tc.mainTrans.dbTransName,
        reportItems: this.transEng.reportItems,
        errorItems: this.transEng.errorItems,
      } as TransResultsMd2Spec),
    );
    lastValueFrom(modalRef.afterClosed()).then((resp: Modal.Return) => {
    });
  }

  public onMouseDown = (event: MouseEvent): void => {
    if (!this.core.xe.canvas) {
      return;
    }
    this.core.onMouseDown(event);
  };

  public onMouseMove = (event: MouseEvent): void => {
    if (!this.core.xe.canvas) {
      return;
    }
    if (!this.isOutsideInDragging) {
      this.core.onMouseMove(event);
    }
  };

  public onMouseUp = (event: MouseEvent): void => {
    if (!this.core.xe.canvas) {
      return;
    }
    if (!this.isOutsideInDragging) {
      this.core.onMouseUp(event);
    }
  };

  public onDblClick = (event: MouseEvent): void => {
    this.onEdit();
  };

  // Left Pane Support

  public centerAlighment(): string {
    if (this.showLeftColumn) {
      if (this.showRightColumn) {
        return 'center';
      }
      return 'right';
    }
    if (this.showRightColumn) {
      return 'left';
    }
    return 'full';
  }

  public calcPanelSizes(): void {
    this.leftColumnSize = this.showLeftColumn ? this.leftColumnDisplaySize : 0;
    this.rightColumnSize = this.showRightColumn
      ? this.rightColumnDisplaySize : 0;
    this.centerColumnSize = 100 - this.leftColumnSize - this.rightColumnSize;
  }

  public showHideLeftPanel(): void {
    this.showLeftColumn = !this.showLeftColumn;
    this.calcPanelSizes();
  }

  public showHideRightPanel(): void {
    this.showRightColumn = !this.showRightColumn;
    this.calcPanelSizes();
  }

  public toggleExpanded(): void {
    this.lpExpandedCode += (this.lpExpandedCode === 2) ? -2 : 1;
  }

  // Private methods

  private initializeCanvas(): void {
    const canvas = this.xquery.first;
    this.ts.initialize(canvas, this.canvasScroll);
  }

  private onTransClick = (uiTrans: UiTrans): void => {
    //  this.constraintDialog(uiTable.ix, uiTable.currColumnIx);
  };

}
