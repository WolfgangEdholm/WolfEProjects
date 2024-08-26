import { Injectable } from '@angular/core';
import { UiArrow, UiArrowMgr } from '../ui/ui-arrow';
import { UiTrans, UiTransMgr } from '../ui/ui-trans';
import { TDoc } from '../types/trans';
import { TransEngService } from '../api/trans-eng.service';
import { FilterSpec, FilterFunc, FilterDef, FilterRef,
} from '../types/filter';
import { Integrity } from '../api/data-eng.service';

export type IntegrityUpdate = () => void;

@Injectable({
  providedIn: 'root'
})
export class TransCoreService {
  arrowMgr: UiArrowMgr;
  transMgr: UiTransMgr;

  transEng: TransEngService;
  updateIntegrity: IntegrityUpdate;

  // the transformer container that is being created, edited, or
  // outermost transformer being executed
  mainTrans: TDoc;
  // the transformer container that is being executed
  execTrans: TDoc;
  // mainFilters matches the filter array in mainTrans and not this.filters
  //
  mainFilters: FilterRef[] = [];

  // true if main transformer is open
  public showRun: boolean;
  public runItem: any;
  public runColor = 'rgb(255, 138, 000)';

  // Master list of Filter specifications
  public filters: FilterSpec[] = [];
  public filterMap = new Map<string, FilterSpec>();

  public helpers: FilterSpec[] = [];
  public helperMap = new Map<string, FilterSpec>();

  public transParams: FilterSpec;

  public errColor = '#ff0000';
  public warnColor = '#FF8c00';
  public qColor = '#14c8c8';
  public fColor = '#ffc800';
  public tColor = '#c8c8c8';
  public hColor = '#88ccee';
  // public hColor = '#ff8844';

  constructor(
  ) {
  }

  public setArrowDirty(): void {
    this.arrowMgr.isDirty = true;
  }

  public setTransDirty(): void {
    this.transMgr.isDirty = true;
  }

  public clearTDirty(): void {
    this.arrowMgr.isDirty = false;
    this.transMgr.isDirty = false;
  }

  public isTDirty(): boolean {
    return this.arrowMgr.isDirty || this.transMgr.isDirty;
  }

  // ui utility functions

  public updateUiItemIntegrity(itemIx: number, ic: Integrity): void {
    const uiItem = this.transMgr.getTItem(itemIx);
    uiItem.integrityCode = ic;
  }

}
