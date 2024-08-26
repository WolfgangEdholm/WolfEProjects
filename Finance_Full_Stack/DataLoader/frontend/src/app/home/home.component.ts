import { Component, ViewChild, ElementRef, AfterViewInit,
  OnDestroy, OnInit, ViewChildren, QueryList, HostListener
} from '@angular/core';
import * as Modal from '../services/modal.service';
import { CssService } from '../ui-engine/ui-css.service';
import { DbEngService } from '../api/db-eng.service';
import { DataEngService } from '../api/data-eng.service';
import { ComputeService } from '../code/compute.service';
import { ContextService } from '../core/context.service';
import { TransService } from '../cmd/trans.service';
import { TransCoreService } from '../core/trans-core.service';
import { UiCoreService } from '../ui/ui-core.service';
import { Observable, Subscription, fromEvent, } from 'rxjs';
import { UimInfo } from '../ui/types';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
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
import { uctToLocalDateString } from '../utils/date';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

// const MODAL_TOP = '160px';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  lpExpandedCode = 0;

  showLeftColumn = true;
  leftColumnSize = 25;
  centerColumnSize = 50;
  showRightColumn = true;
  rightColumnSize = 25;

  tlMsg1 = 'Show';
  tlMsg2 = 'Hide';

  isOutsideInDragging = false;

  // transSource;

  selectedStdTrans: string;

  selectedTransformer: string;

  removeIsDisabled = false;
  editIsDisabled = false;
  saveIsDisabled = true;
  getDataIsDisabled = false;

  private subscriptions = new Subscription();
  private resizeObservable$: Observable<Event>;

  constructor(
    private router: Router,
    private matDialog: MatDialog,
    public dialog: Modal.ModalService,
    public dbEng: DbEngService,
    public dataEng: DataEngService,
    public css: CssService,
    public g: ContextService,
    public tc: TransCoreService,
    public ts: TransService,
    public core: UiCoreService,
    public qdoc: QDocService,
    public tdoc: TDocService,
    public sp: SidePanelService,
    public pd: PanelDataService,
    public app: AppService,
  ) {
    console.log('----------------------------- Home Screen');
    //           12345678901234567890123456789
  }

  // to prevent text selcetion by doubleclick,
  @HostListener('document:mousedown', ['$event'])
  eatMouseDown(e: MouseEvent): void {
    if (e.detail > 1) {
      e.preventDefault();
    }
  }

  public async ngOnInit(): Promise<void> {
    this.g.setAppSectionOnly('Home Page');
    await this.dbEng.setCurrentDatabase('demo1');
    await this.qdoc.getAllIoQuerys();
    await this.tdoc.getAllIoTranses();

    this.g.homeQueryPaneIx =
      this.pd.queryPaneRebuild(this.g.homeQueryPaneIx);
    this.g.homeFilterPaneIx =
      this.pd.filterPaneRebuild(this.g.homeFilterPaneIx);
    this.g.homeTransPaneIx =
      this.pd.transPaneRebuild(this.g.homeTransPaneIx);

    // console.log('home ngOnInit end', this.tSource, this.tTarget);
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.core.uninitialize();
  }

  public async onLoadedData(): Promise<void> {
  }

  public onResize = (event: any): void => {
    this.ts.onResize();
  };

  // Start of main command functions

  public async onAdd(ix: number): Promise<void>  {
  }

  public statusUpdater = (status: UimInfo): void => {
  };

  public onRemove = (): void => {
  };

  public onEdit = (): void => {
  };

  public onGetData = (): void => {
    const queryUrl = `/data`;
    this.router.navigate( [ queryUrl ] );
  };

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

  public showHideLeftPane(): void {
    this.showLeftColumn = !this.showLeftColumn;
    if (this.showLeftColumn) {
      this.rightColumnSize = 100 - this.leftColumnSize;
    } else {
      this.rightColumnSize = 100;
    }
  };

  toggleExpanded = (): void => {
    this.lpExpandedCode += (this.lpExpandedCode === 2) ? -2 : 1;
  };

  // Private methods

  // private onTransClick = (uiTrans: UiTrans): void => {
  //   //  this.constraintDialog(uiTable.ix, uiTable.currColumnIx);
  // };

}
