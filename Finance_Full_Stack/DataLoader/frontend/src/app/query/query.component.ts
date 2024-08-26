import { Component, ViewChild, ElementRef, AfterViewInit,
  OnDestroy, OnInit, ViewChildren, QueryList, HostListener,
} from '@angular/core';
import { CdkDragEnd, CdkDragEnter, CdkDragExit,
} from '@angular/cdk/drag-drop';
import { lastValueFrom } from 'rxjs';
import * as Modal from '../services/modal.service';
import { CssService } from '../ui-engine/ui-css.service';
import { DbEngService } from '../api/db-eng.service';
import { DataEngService, DisplayChangeSource, Uuid,
} from '../api/data-eng.service';
import { StructIntegrityService } from '../api/struct-integrity.service';
import { ComputeService } from '../code/compute.service';
import { ContextService } from '../core/context.service';
import { QueryCoreService } from '../core/query-core.service';
import { QueryService } from '../cmd/query.service';
import { UiCoreService } from '../ui/ui-core.service';
import { SidePanelService, SidePanelItem, SidePanelLoadReturn
} from '../sidepanel/side-panel.service';
import { HighlightCode, } from '../sidepanel/side-panel.component';
import { Observable, Subscription, fromEvent, } from 'rxjs';
import { UimInfo } from '../ui/types';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConstrModalComponent, ConstrModalSpec
} from '../modals/constr/constr-modal.component';
import { CompareOp, compareOpToStr, strToCompareOp } from '../types/compute';
import { dbTypeToValueType } from '../types/compute';
import { QDocService } from '../api/qdoc.service';
import { UiCoreData } from '../ui/types';
import { UiTable } from '../ui/ui-table';
import { Point } from '@angular/cdk/drag-drop';
import { Table, Constraint } from '../types/db';
import { tableTitleBar, tableCenterMiddle, } from '../ui/constants';


// 45678911234567892123456789312345678941234567895123456789612345678971234567898

const MODAL_TOP = '160px';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('scrollWrapper', {static: false, read: ElementRef})
    canvasScroll: ElementRef;
  @ViewChild('actions', {static: false, read: ElementRef})
    actions: ElementRef;
  @ViewChildren('xcanvas') xquery: QueryList<ElementRef>;

  uc: UiCoreData;

  lpTopIx = -1;
  lpTopSelectedItemIx = -1;
  lpTopHeight = 2.5;

  showLeftColumn = true;
  leftColumnSize = 25;
  rightColumnSize = 75;

  tlMsg1 = 'Show Tables';
  tlMsg2 = 'Hide Tables';

  isOutsideInDragging = false;

  // Table drag source (not used but is referenced)
  tableSource;

  removeIsDisabled = false;
  editIsDisabled = false;
  saveIsDisabled = true;
  getDataIsDisabled = false;

  private subscriptions = new Subscription();
  private resizeObservable$: Observable<Event>;

  constructor(
    private router: Router,
    private matDialog: MatDialog,
    public modal: Modal.ModalService,
    public dbEng: DbEngService,
    public dataEng: DataEngService,
    private dso: StructIntegrityService,
    // don't remove computeEng for initialization reasons
    // (loading compute engine hooks it up to data engine)
    public computeEng: ComputeService,

    public css: CssService,
    public g: ContextService,
    public qc: QueryCoreService,
    public qs: QueryService,
    public core: UiCoreService,
    public qd: QDocService,
    public sp: SidePanelService,
  ) {
    console.log('----------------------------- Query Screen');
    this.uc = g.tableData;
    core.xe = this.uc;
    this.uc.core = core;

    this.qc.tableMgr.setClickHandler(this.onTableClick);
  }

  // Start of standard accessor functions

  public get currentItemId(): string { return this.dbEng.currItemId; }
  public set currentItemId(id: string) {
    this.dbEng.currItemId = id;
  }

  // End of standard accessor functions

  // to prevent text selcetion by doubleclick,
  @HostListener('document:mousedown', ['$event'])
  eatMouseDown(e: MouseEvent): void {
    // console.log('double-click');
    if (e.detail > 1) {
      e.preventDefault();
    }
  }

  public async ngOnInit(): Promise<void> {
    this.g.setAppSection('Query Build Page');
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.subscriptions.add(this.resizeObservable$.subscribe(this.onResize));
    // this.dbEng.dataEmitter.subscribe(() => { this.onLoadedData(); });
    // this URL is sometimes an entry point
    await this.dbEng.setCurrentDatabase('demo1');
    await this.dbEng.loadAllTables();
    await this.dso.loadAllStructIntegrityItems(false);

    this.verifyTables();
    this.buildLeftList();
    // this.onLoadedData();
    this.dataEng.setDisplayChangeSource(DisplayChangeSource.query);

    this.core.registerStatusUpdater(this.statusUpdater);
    this.statusUpdater(this.core.getCurrentStatus());
  }

  ngAfterViewInit(): void {
    // console.log('CHANGEDECTION');
    // this.cdr.detectChanges();
    // console.log('Table ElementRes 2', this.tSource, this.tTarget);
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
    // this.g.counter += 1;
    this.subscriptions.unsubscribe();
    this.core.uninitialize();
  }

  // public async onLoadedData(): Promise<void> {
  //   // console.log('Data Loaded', this.dbEng.dataItems);
  //   // if (this.qc.tableMgr.items.length === 0) {
  //   //   this.qs.initRequestLine();
  //   //   if (!this.qc.currQuery) {
  //   //     this.qdoc.newQDoc();
  //   //   }
  //   // }

  //   this.core.registerStatusUpdater(this.statusUpdater);
  //   this.statusUpdater(this.core.getCurrentStatus());
  // }

  public verifyTables(): void {
    // Ensure tables have StructIntegrity info.
    this.dbEng.dataItems.forEach(e => {
      e.hasDataSourceInfo = true;
      e.columns.forEach(col => {
        const dbTblColName = `${e.dbTableName}.${col.columnName}`;
        const dsItem = this.dso.map.get(dbTblColName);
        if (dsItem) {
          col.hasDataSourceInfo = true;
        } else {
          // console.log('verifyTables failed for', dbTblColName);
          col.hasDataSourceInfo = false;
          e.hasDataSourceInfo = false;
        }
      });
    });
  }

  public onResize = (event: any): void => {
    this.qs.onResize();
  };

  // Start of main command functions

  // public async onAdd(ix: number): Promise<void>  {
  // }

  public onTableListToggle(): void {
    this.showLeftColumn = !this.showLeftColumn;
    if (this.showLeftColumn) {
      this.rightColumnSize = 100 - this.leftColumnSize;
    } else {
      this.rightColumnSize = 100;
    }
  }

  public statusUpdater = (status: UimInfo): void => {
    // console.log('QUERY COMPONENTS UPDATER');
    if (status.mgr === this.qc.requestMgr) {
      const isLast =
        status.item.ix === this.qc.requestMgr.items.length - 1;
      const isFrame = status.item.ix === 0 || isLast;
      this.removeIsDisabled = isLast;
      this.editIsDisabled = isFrame;
    } else if (status.mgr === this.qc.tableMgr) {
      this.removeIsDisabled = false;
      this.editIsDisabled = true;
    } else if (status.mgr === this.qc.joinMgr) {
      this.removeIsDisabled = false;
      this.editIsDisabled = true;
    } else {
      this.editIsDisabled = true;
    }
    this.saveIsDisabled = this.qc.tableMgr.items.length === 0;
    this.getDataIsDisabled = this.qc.requestMgr.items.length < 3;
    // console.log('Edit =', this.editIsDisabled, 'Save =', this.saveIsDisabled,
    // this.g.changeCounter);
    // this.cd.detectChanges();
    // this.zone.run(() => this.isSaveDisabled());
  };

  public isEditDisabled = (): boolean =>
    // this.g.changeCounter += 1;
    // return this.editIsDisabled;
    false;

  public isSaveDisabled = (): boolean =>
    this.saveIsDisabled;


  public onRemove(): void {
    const qc = this.qc;
    const qs = this.qs;
    if (qc.joinMgr.currItem) {
      if (qs.okToRemoveUiJoin()) {
        this.modal.confirm({
          title: 'Remove Join',
          message: 'Are you sure you want to remove the selected join?',
          okButton: 'Remove',
          cancelButton: 'Cancel',
        }).then((resp: Modal.CodeReturn) => {
          if (resp.code === Modal.ReturnCode.ok) {
            qs.removeUiJoin();
          }
        });
      } else {
        this.modal.message('You are not allowed to delete a foreign key.');
      }
    } else if (qc.tableMgr.currItem) {
      if (this.qs.okToRemoveUiTable()) {
        this.modal.confirm({
          title: 'Remove Table',
          message: 'Are you sure you want to remove the selected table?',
          okButton: 'Remove',
          cancelButton: 'Cancel',
        }).then((resp: Modal.CodeReturn) => {
          if (resp.code === Modal.ReturnCode.ok) {
            qs.removeUiTable();
          }
        });
      }
    } else if (qc.requestMgr.currItem) {
      const rCol = this.qc.requestMgr.currColumn();
      if (qs.okToRemoveUiRequestColumn(rCol)) {
        this.modal.confirm({
          title: 'Remove Request Column(s)',
          message: 'Are you sure you want to remove the selected column(s)?',
          okButton: 'Remove',
          cancelButton: 'Cancel',
        }).then((resp: Modal.CodeReturn) => {
          if (resp.code === Modal.ReturnCode.ok) {
            qs.removeUiRequestColumn(rCol);
          }
        });
      } else if (rCol.ix === 0) {

      }
    } else {
      const existingQuery = qc.currQuery.id > 0;
      const query = !existingQuery ? ''
        : `${qc.currQuery.dbQueryName}`;
      const message = existingQuery
        ? `Are you sure you want to delete '${query}' from the database?`
        : 'Are you sure you want to clear the current query?';
      this.modal.confirm({
        title: 'Remove Query',
        message,
        okButton: existingQuery ? 'Delete' : 'Clear',
        cancelButton: 'Cancel',
      }).then((resp: Modal.CodeReturn) => {
        if (resp.code === Modal.ReturnCode.ok) {
          if (qc.currQuery.id === 0) {
            this.qd.queryInit();
          } else {
            qs.deleteQuery();
          }
        }
      });
    }
  }

  public onEdit(): void {
    const qc = this.qc;
    const mgr = qc.requestMgr;
    if (mgr.currItem && mgr.currItem.ix > 0 &&
      mgr.currItem.ix < mgr.items.length - 1) {
        const rCol = mgr.currColumn();
        const uiTable = qc.tableMgr.getTable(rCol.sourceTableIx);
        this.modal.prompt({
          title: 'Edit Request Column',
          message: `Database field ${uiTable.table.tableName
            }.${uiTable.table.columns[rCol.sourceColumnIx].columnName}`,
          placeholder1: 'Print Name',
          initial1: rCol.name,
          placeholder2: 'Format',
          initial2: rCol.format,
          okButton: 'OK',
          cancelButton: 'Cancel',
        }).then((resp: Modal.Return) => {
          if (resp.code === Modal.ReturnCode.ok) {
            rCol.setName(resp.values.input1);
            rCol.format = resp.values.input2;
            mgr.isDirty = true;
            this.core.draw();
          }
          console.log('Dialog results', resp);
        });
    }
  }

  public onGetData(): void {
    const dataUrl = `/data`;
    // this.zone.run(() => this.router.navigate( [ queryUrl ] ));
    this.router.navigate( [ dataUrl ] );
  }

  public onSave(event: MouseEvent): void {
    console.log('SAVE shift =', event.shiftKey);
    this.qd.uxSaveQDoc(event.shiftKey);
    this.qc.clearQDirty();
  }

  // End of main command functions

  public onDragEntered(event: CdkDragEnter<any>): void {
    // console.log('cdkDragEntered', event);
    // if (event.container.element.nativeElement ===
    //   this.tTarget.nativeElement) {
    //   this.isOutsideInDragging = true;
    //   // console.log('TARGET', event);
    // } else if (event.container.element.nativeElement ===
    //   this.tSource.nativeElement) {
    //   // console.log('SOURCE', event);
    // }
  }

  public onDragExited(event: CdkDragExit<any>): void {
    // console.log('cdkDragExited', event);
    // if (event.container.element.nativeElement ===
    //   this.tTarget.nativeElement) {
    //   // console.log('TARGET', event);
    // } else if (event.container.element.nativeElement ===
    //   this.tSource.nativeElement) {
    //   // console.log('SOURCE', event);
    // }
  }

  // public onDragReleased(event: CdkDragEnd): void {
  //   this.isOutsideInDragging = false;
  //   const dragRef: any = event.source._dragRef;
  //   const mouse = dragRef._lastKnownPointerPosition;
  //   const offset = dragRef._pickupPositionInElement;
  //   const localPoint = this.core.globalToLocal(
  //     { x: mouse.x - offset.x, y: mouse.y - offset.y });
  //   const table = this.dbEng.map.get(event.source.data.tablePath);
  //   this.cmd.addUiTable(localPoint, table);
  // }

  // Utility functions

  // toggleOpen(index: number): void {
  //   console.log('toggleOpen IX=', index, 'Curr =', this.dbEng.currItemId);
  //   const table = this.leftList.displayItems[index];
  //   if (table.isTable) {
  //     table.isOpen = !table.isOpen;
  //     this.leftList.setOpenState(table.id, table.isOpen);
  //     this.currentItemId = table.tableName;
  //     this.buildLeftList();
  //   }
  // }

  public async constraintDialog(
    tableIx: number,
    columnIx: number
  ): Promise<void> {
    // const width = window.innerWidth + 'px';
    const width = '50%';
    const uiTable = this.qc.tableMgr.getTable(tableIx);
    const tCol = uiTable.table.columns[columnIx];
    let constr = tCol.constraint;
    if (!constr) {
      constr = {
        tableName: uiTable.table.tableName,
        columnName: tCol.columnName,
        compareOp: CompareOp.in,
        valuesStr: '',
        tp: dbTypeToValueType(tCol.type),
      } as Constraint;
    }

    const modalRef = this.matDialog.open(ConstrModalComponent, {
      maxWidth: window.innerWidth + 'px',
      maxHeight: window.innerHeight + 'px',
      minWidth: width,
      position: { top: MODAL_TOP, left: '', bottom: '', right: '' },
      disableClose: true,
      panelClass: 'x-mat-container',
      data: {
        tableName: uiTable.table.tableName,
        tableIx,
        columnName: tCol.columnName,
        columnIx,
        compareOpStr: constr ? compareOpToStr(constr.compareOp) : 'in',
        compareOp: constr ? constr.compareOp : CompareOp.eq,
        valuesStr: constr ? constr.valuesStr : '',
      } as ConstrModalSpec,
    });
    lastValueFrom(modalRef.afterClosed()).then((resp: Modal.Return) => {
        if (resp.code === Modal.ReturnCode.other) {
          // Delete constraint
          tCol.constraint = undefined;
        } else if (resp.code === Modal.ReturnCode.ok) {
          if (!tCol.constraint) {
            tCol.constraint = constr;
          }
          constr.compareOp = strToCompareOp(resp.values.opSelect);
          constr.valuesStr = resp.values.values;
        }
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
    const tableMgr = this.qc.tableMgr;
    const uiTable = tableMgr.currTable();
    const partCd = tableMgr.lastUii.partIx;
    if (partCd === tableCenterMiddle) {
      if (tableMgr.currItem) {
        this.addRequestColumn(uiTable.ix, uiTable.currColumnIx);
      }
    } else if (partCd === tableTitleBar) {
      uiTable.table.columns.slice(1).forEach((c, ix) => {
        this.addRequestColumn(uiTable.ix, ix + 1);
      });
    }
  };

  // top

  public loadTables = (
    itemIx: number,
    items: Table[],
    childIx: number = -1,
  ): SidePanelLoadReturn => {
    const table = items[itemIx];
    const tableName = childIx === -1
      ? table.dbTableName.split('.')[1]
      : table.columns[childIx].columnName;
    return {
      displayName: tableName,
      isTopLevel: childIx === -1,
      childCount: table.columns.length,
      data: undefined,
      item: table,
      itemIx,
      childIx,
    } as SidePanelLoadReturn;
  };

  public rebuildTopLeftPane = (): void => {
    this.lpTopIx = this.sp.rebuildSidePane(
      this.lpTopIx, this.dbEng.dataItems, this.loadTables,
    );
  };

  public topIconClick = async (): Promise<void> => {
    console.log('refresh tables');
    await this.dbEng.loadAllTables(true);
    await this.dso.loadAllStructIntegrityItems(true);
    this.verifyTables();
    this.buildLeftList();
  };

  public topHighlight(sideItem: SidePanelItem): HighlightCode {
    const table = sideItem.item as Table;
    return table.hasDataSourceInfo ? HighlightCode.none : HighlightCode.error;
  }

  public topChildHighlight(sideItem: SidePanelItem): HighlightCode {
    const table = sideItem.item as Table;
    return table.columns[sideItem.childIx].hasDataSourceInfo
      ? HighlightCode.none : HighlightCode.error;
  }

  public topItemSelect = (ix: number): void => {
    // console.log('topItemSelect IX=', ix, 'Curr =', this.dbEng.currItemId);
    // // find header
    // const items = this.sp.panes[this.lpTopIx].items;
    // while (!items[ix].isTopLevel) {
    //   ix--;
    // }
    // const id = items[ix].displayName;
    // this.currentItemId = id;
  };

  public onTopDragReleased = (
    globalMousePoint: Point,
    globalPoint: Point,
    name: string,
    item: Table,
  ): void => {
    if (!this.core.isGlobalPointInsideCanvas(globalMousePoint)) {
      return;
    }
    const localPoint = this.core.globalToLocal(globalPoint);
    this.qs.addUiTable(localPoint, item);
  };

  // Private methods

  private initializeCanvas(): void {
    const canvas = this.xquery.first;
    this.qs.initialize(canvas, this.canvasScroll);
  }

  private buildLeftList(): void {
    this.rebuildTopLeftPane();
  }

  private onTableClick = (uiTable: UiTable): void => {
    this.constraintDialog(uiTable.ix, uiTable.currColumnIx);
  };

  private addRequestColumn(tableIx: number, columnIx): void {
    const uiTable = this.qc.tableMgr.getTable(tableIx);
    const column = uiTable.table.columns[columnIx];
    const name = this.dataEng.verifyUniqueColumnName(column.columnName);
    this.qd.addRequestColumn(
      name,
      -1,               // position where to insert -1 -> insert at end
      tableIx,
      columnIx,
      -1,               // sequence number for when created --
                        // new columns -> -1
      Uuid.generate,    // if new columns -> Uuid.generate
    );
  }

}
