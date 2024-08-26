import { OnDestroy } from '@angular/core';
import { ElementRef, Injectable } from '@angular/core';
import { DbEngService } from '../api/db-eng.service';
import { UiCoreData } from '../ui/types';
import { ContextService } from '../core/context.service';
import { Point, transferArrayItem } from '@angular/cdk/drag-drop';
import { UiCoreService } from '../ui/ui-core.service';
import { UiTrans, UiTransMgr, UiTransClick, IoTransItem,
} from '../ui/ui-trans';
import { UiArrow, UiArrowMgr } from '../ui/ui-arrow';
import { TransItem, TransArrow, TDoc, TransIntegrityItem, TransItemType,
} from '../types/trans';
import { QDocService } from '../api/qdoc.service';
import { TDocService } from '../api/tdoc.service';
import { TransCoreService } from '../core/trans-core.service';
import * as Modal from '../services/modal.service';
import { DATA_IN, DATA_OUT, VERIFY, TRANSPARAMS } from '../types/filter';
import { zeroTimeString } from '../utils/date';
import { XRect } from '../types/shared';
import { TransEngService } from '../api/trans-eng.service';


@Injectable({
  providedIn: 'root'
})
export class TransService implements OnDestroy {
  uc: UiCoreData;

  constructor(
    private dbEng: DbEngService,
    public g: ContextService,
    public core: UiCoreService,
    public modal: Modal.ModalService,
    public tc: TransCoreService,
    public te: TransEngService,
    public qd: QDocService,
    public td: TDocService,
  ) {
    console.log('----------------------------- Transformer Service');
    g.transData = new UiCoreData();
    g.transData.dbgName = 'TransData';

    this.uc = g.transData;
    core.xe = this.uc;
    this.uc.core = core;
    core.initCallbacks();

    tc.arrowMgr = new UiArrowMgr(this.uc, 1, dbEng);
    tc.transMgr = new UiTransMgr(this.uc, 2, tc.arrowMgr);
    tc.arrowMgr.transMgr = tc.transMgr;

    // Register managers
    this.core.registerMgr(tc.arrowMgr);
    this.core.registerMgr(tc.transMgr);

    this.uc.id = 'DrawTrans';
   }

   ngOnDestroy(): void {
    // console.log('TransService Destroyed ****************************');
  }

  // Actions

  public initialize(canvas: ElementRef, scrollWrapper: ElementRef): void {
    this.core.initialize(canvas, scrollWrapper);
  }

  public setTransItemDisplayName(
    itemIx: number,
    displayName: string,
  ): void {
    const tItem = this.tc.transMgr.getTItem(itemIx);
    tItem.displayName = displayName;
    this.core.draw();
  }

  // The trans user interface elements cab be created in two different ways:
  // A) by dragging and clicking in the user interface, and
  // B) by loading a TDoc io-object.

  // When loading the trans io object, the data is stored as an ApiIoTrans
  // record. The createTDocFromIoObjec metond converst the io object into a
  // TDOC. A TDoc has the all the necessary data structures filled in except
  // the display data structures (which for historical reasons drive query
  // generation). The buildTDocumentUi method build the matching ui data
  // structures using the methods addUiTrans and addUiArrow.

  // When building the transformer using the transformer create or edit UI,
  // an empty TDoc document is created followed by the transformer and arrow
  // user interface objects. When a user interface object is created this way,
  // the TDoc is incrementally extended using the addTransItem and addTransArrow
  // methods.

  // Arrow methods

  public addUiArrow(
    tdoc: TDoc,
    fromIx: number,
    toIx: number
  ): UiArrow {
    return new UiArrow(
      this.tc.arrowMgr,
      fromIx,
      toIx,
      tdoc,
    );
  }

  // does not call addUiArrow
  public addTransArrow(
    fromIx: number,
    toIx: number
  ): void {
    const tdoc = this.tc.mainTrans;
    const ta: TransArrow = {
      fromDbItemName: tdoc.transItems[fromIx].displayName,
      toDbItemName: tdoc.transItems[toIx].displayName,
      fromIx,
      toIx,
    };
    tdoc.arrows.push(ta);
  }

  // does call removeUiArrow
  public async removeTransArrow(ix: number): Promise<void> {
    this.removeTransArrowPrim(ix);
    await this.te.checkTransIntegrity(this.tc.mainTrans);
    this.core.draw();
  }

  // TransItem methods

  public addUiTrans(
    leftTop: Point,
    displayName: string,
    tp: TransItemType,
    dbName: string,
    tdoc: TDoc,
  ): UiTrans {
    const nativeScroll =
      this.core.xe.scrollWrapper?.nativeElement as HTMLElement;
    if (nativeScroll) {
      leftTop.x += nativeScroll.scrollLeft;
      leftTop.y += nativeScroll.scrollTop;
    }
    const uiTrans = new UiTrans(
      this.tc.transMgr,
      leftTop,
      displayName,
      tp,
      tdoc,
    );
    uiTrans.dbItemName = dbName;
    if (tp === 'F' || tp === 'H' || tp === 'T') {
      if (dbName === DATA_IN) {
        uiTrans.specialIcon = 'arrow_circle_down';
      } else if (dbName === DATA_OUT) {
        uiTrans.specialIcon = 'arrow_circle_up';
      } else if (dbName === VERIFY) {
        uiTrans.specialIcon = 'check_circle';
      }
      this.tc.mainFilters[this.tc.mainFilters.length - 1]
        .def.fc.name = (tp === 'T' ? TRANSPARAMS : dbName);
    }
    this.core.clearCurrentItem();
    this.tc.transMgr.currItem = uiTrans;
    this.core.draw();
    return uiTrans;
  }

  // does not call addUiTrans
  public addTransItem(
    rect: XRect,
    displayName: string,
    tp: TransItemType,
    dbItemName: string,
  ): void {
    const tdoc = this.tc.mainTrans;
    const itemKind = tp === 'F' ? 'transFilter'
      : tp === 'H' ? 'transHelper'
      : tp === 'Q' ? 'transQuery'
      : 'transTrans';
    const ti: TransItem = {
      displayName,
      dbItemName,
      itemKind,
      itemIx: tdoc.transItems.length,
      rect,
      changeDate: zeroTimeString,
      fixDate: zeroTimeString,
    } as TransItem;
    tdoc.transItems.push(ti);
  }

  public async removeTransItem(itemIx: number): Promise<void> {
    const tdoc = this.tc.mainTrans;
    const transMgr = this.tc.transMgr;
    const arrowMgr = this.tc.arrowMgr;
    const transItem = tdoc.transItems[itemIx];
    if (transItem.itemKind === 'transFilter') {
      const filterIx = transMgr.getTItem(itemIx).filterIx;
      transMgr.getTItems().forEach(ti => {
        if (ti.filterIx > filterIx) {
          ti.filterIx -= 1;
        }
      });
      tdoc.filters.splice(filterIx, 1);
      tdoc.filters.forEach((f, ix) => {
        if (f.fc.itemIx > filterIx) {
          f.fc.itemIx -= 1;
        }
      });
    }
    this.td.copyTransFiltersToMain(tdoc);

    tdoc.transItems.splice(itemIx, 1);
    transMgr.currItem = undefined;
    transMgr.items.splice(itemIx, 1);
    transMgr.itemOrder.pop();
    transMgr.getTItems().forEach((ti, ix) => { ti.ix = ix; });

    for (let i = tdoc.arrows.length; 0 < i--;) {
      const arrow = tdoc.arrows[i];
      if (arrow.fromIx === itemIx || arrow.toIx === itemIx) {
        tdoc.arrows.splice(i, 1);
        arrowMgr.items.splice(i, 1);
      }
    }
    await this.te.checkTransIntegrity(this.tc.mainTrans);
    this.core.draw();
  }

  // // does call removeUiTrans
  // public async removeTransItem(ix: number): Promise<void> {
  //   this.removeUiArrow(ix);
  //   const tdoc = this.tc.mainTrans;
  //   tdoc.arrows.splice(ix, 1);
  //   // update integrity (affects display)
  //   await this.te.checkTransIntegrity(tdoc);
  //   this.core.draw();
  // }

  // Event handlers

  public onResize(): void {
    this.tc.transMgr.vecUpdateExtent();
    this.tc.transMgr.vecDraw();
  }

  // Utilities

  public async deleteTrans(): Promise<void> {
    await this.td.deleteTDoc(this.tc.mainTrans);
    this.td.clearTrans();
    this.td.newTDoc(true);
    this.tc.clearTDirty();
  }

  // Load create methods

  public async createTransItem(tdoc: TDoc, ti: TransItem): Promise<void> {
    const leftTop = { x: ti.rect.x, y: ti.rect.y } as Point;
    let tpCode;
    if (ti.itemKind === 'transFilter') {
      tpCode = 'F';
    } else if (ti.itemKind === 'transHelper') {
      tpCode = 'H';
    } else if (ti.itemKind === 'transQuery') {
      tpCode = 'Q';
    } else if (ti.itemKind === 'transTrans') {
      tpCode = 'T';
    }
    if (tdoc === this.tc.mainTrans) {
      const uiTrans = await
      this.addUiTrans(
        leftTop,
        ti.displayName,
        tpCode,
        ti.dbItemName,
        tdoc,
      );
      uiTrans.rect.width = ti.rect.width;
      uiTrans.rect.height = ti.rect.height;
      uiTrans.changeDate = ti.changeDate;
      uiTrans.fixDate = ti.fixDate;
    }
  }

  public createArrow(tdoc: TDoc, ta: TransArrow): void {
    const tc = this.tc;
    if (tdoc === tc.mainTrans) {
      // unused assingment to avoid lint wanring
      const uiTrans = new UiArrow(tc.arrowMgr, ta.fromIx, ta.toIx, tdoc);
    }
  }

  // public updateOneTransItemIntegrity(
  //   qdoc: TDoc,
  //   item: TransItem,
  // ): Integrity {
  //   // const integrityItem = qdoc.integrityItems.find(ii =>
  //   //   dCol.dbTblColSource === ii.dbTblColSource);
  //   // const rCol = this.requestMgr.getColumn(dCol.ix + 1);
  //   // const changeDate = new Date(integrityItem.changeDate);
  //   // const fixDate = new Date(dCol.fixDate);
  //   // const integrityCode = changeDate > fixDate
  //   //   ? Integrity.error : Integrity.ok;
  //   // rCol.integrityCode = integrityCode;
  //   // dCol.integrityCode = integrityCode;
  //   // return integrityCode;
  //   return Integrity.ok;
  // }

  // public updateTransItemsIntegrity(
  //   qdoc: TDoc
  // ): boolean {          // false: ok - true: integrity error
  //   const docHasIntegrityError = false;
  //   this.te.checkTransIntegrity(qdoc);
  //   // this.dataEng.dataColumnDefs.forEach(dCol => {
  //   //   const iError = this.updateOneDataColIntegrity(qdoc, dCol);
  //   //   if (iError) {
  //   //     docHasIntegrityError = true;
  //   //   }
  //   // });
  //   return docHasIntegrityError;
  // }

  // public updateTDocIntegrity(
  //   tdoc: TDoc
  // ): boolean {          // false: ok - true: integrity error
  //   const docHasIntegrityError = this.updateTransItemsIntegrity(tdoc);
  //   return docHasIntegrityError;
  // }

  public async buildTDocumentUi(
    tdoc: TDoc,
    skipIntegrity: boolean = false,
  ): Promise<void> {
    if (tdoc.transItems.length > 0) {
      // had to change the loop to get the await to work
      for (const item of tdoc.transItems) {
        await this.createTransItem(tdoc, item);
      }

      tdoc.arrows.forEach(e => this.createArrow(tdoc, e));
      // console.log('AFTER BUILD TDOCUMENT', this.tdoc.currDoc);
      this.core.draw();
    }
  }

  // Private methods

  private removeUiArrow(ix: number): void {
    const arrowMgr = this.tc.arrowMgr;
    arrowMgr.items.splice(ix, 1);
    arrowMgr.isDirty = true;
  }

  // does call removeUiArrow
  private removeTransArrowPrim(ix: number): void {
    this.removeUiArrow(ix);
    this.tc.mainTrans.arrows.splice(ix, 1);
  }
}

