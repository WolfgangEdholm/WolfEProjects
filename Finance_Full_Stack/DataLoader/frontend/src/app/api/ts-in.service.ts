import { EventEmitter, Injectable } from '@angular/core';
import { RepoService } from './repo.service';
import { DbEngService } from './db-eng.service';
import { DataEngService } from './data-eng.service';
import { TDoc, TransIntegrityItem } from '../types/trans';
import { TransCoreService } from '../core/trans-core.service';
import { UiRequestColumn } from '../ui/ui-request';
import { ApiTransSourceIn, TransSourceIn, TransSourceInItem,
} from '../types/ts';
import { TransIntegrityCheckItem } from '../types/ts';
import { zeroTimeString, nowString, timeString } from '../utils/date';
import { ContextService } from '../core/context.service';


const dataUrl = `api/transSourceIn`;
const dataUrlName = `api/transSourceInName`;
const dsDataUrl = `api/transSourceInItems`;

// const param1Len = 250;
// const param2Len = 150;
// const strValueDelimiter = '|_|';

@Injectable({
  providedIn: 'root'
})
export class TransSourceInService {

  public isLoading = false;

  public dataItems: TransSourceIn[] = [];
  public map = new Map<string, TransSourceIn>();
  public dataEmitter: EventEmitter<TransSourceIn[]> = new EventEmitter();

  public tsItems: TransIntegrityCheckItem[] = [];

  public hists: TransSourceIn[];

  constructor(
    private repo: RepoService,
    private g: ContextService,
    public dbEng: DbEngService,
    public dataEng: DataEngService,
    public tc: TransCoreService,
  ) { }

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

  public populateOutputArray(tdoc: TDoc): TransSourceIn {
    const ts = this.createTransSourceIn();
    const creator = tdoc.creator;
    const modifier = this.g.user;
    const created = tdoc.created;
    const modified = nowString();
    ts.id = tdoc.id === 0 ? 0 : tdoc.tsiId;
    ts.dbTransName = tdoc.dbTransName;
    ts.okDate = tdoc.okDate;
    ts.creator = creator;
    ts.modifier = modifier;
    ts.created = created;
    ts.modified = modified;

    const tsId = tdoc.tsiId;
    let seqNum = 0;
    for (const item of tdoc.transItems) {
      const tItem = this.tc.transMgr.getTItem(seqNum);
      const fixDate = tItem.fixDate ? tItem.fixDate : created;

      ts.items.push({
        id: this.calcId(tdoc, seqNum),
        tsId,
        seqNum,
        dbTransName: ts.dbTransName,
        itemName: item.displayName,
        dbItemName: item.dbItemName,
        itemKind: item.itemKind,
        fixDate,

        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
    }

    for (let i = seqNum; i < tdoc.tsiItemIds.length; i++) {
      ts.items.push({
        id: -tdoc.tsoItemIds[i],
        tsId,
        seqNum: i,
        dbTransName: '',
        itemName: '',
        dbItemName: '',
        itemKind: 'delete',
        fixDate: created,

        creator,
        modifier,
        created,
        modified,
      } as TransSourceInItem);
    }

    return ts;
  }

  public createTransSourceIn(): TransSourceIn {
    const ts = {
      id: 0,
      dbTransName: '',
      okDate: '',

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
    } as TransSourceIn;
    return ts;
  }

  public createApiTransSourceIn(): ApiTransSourceIn {
    const aqs = {
      id: 0,
      dbTransName: '',
      okDate: '',

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
      itemIds: [],
    } as ApiTransSourceIn;
    return aqs;
  }

  // Io Methods 7892123456789312345678941234567895123456789612345678971234567898

  public async loadAllTransSourceIntegrityItems(
    forceReload?: boolean
  ): Promise<boolean> {
    if (this.tsItems.length > 0 && !forceReload) {
      console.log('loadAllTransSourceItems In: EARLY RETURN');
      return true;
    }
    this.isLoading = true;
    // console.log('Query Source: loadAllTransSourceItems');
    const response = await this.repo.xloadAll(dsDataUrl);
    if (!response.hasError) {
      this.tsItems = response.data as TransIntegrityCheckItem[];
      // console.log('TransSourceItems', this.dataItems);
      // this.map.clear();
      // for (const item of this.dataItems) {
      //   this.map.set(item.dbQueryName, item);
      // }
      // this.dataEmitter.emit(this.qsItems);
      this.isLoading = false;
      return true;
    }
    return false;
  }

  public async getTransSourceIn(id: number): Promise<ApiTransSourceIn> {
    this.isLoading = true;
    const response = await this.repo.xget(dataUrl, id);
    if (!response.hasError) {
      const aqs = response.data as ApiTransSourceIn;
      aqs.itemIds = [];
      aqs.items.forEach(e => { aqs.itemIds.push(e.id); });
      this.isLoading = false;
      return aqs;
    }
    return undefined;
  }

  public async getTransSourceInFromName(
    name: string
  ): Promise<ApiTransSourceIn> {
    this.isLoading = true;

    const response = await this.repo.xgetFromName(dataUrlName, name);
    if (!response.hasError) {
      const aqs = response.data as ApiTransSourceIn;
      aqs.itemIds = [];
      aqs.items.forEach(e => { aqs.itemIds.push(e.id); });
      this.isLoading = false;
      return aqs;
    }
    return undefined;
  }

  public async saveTransSourceIn(ts: TransSourceIn): Promise<TransSourceIn> {
    this.isLoading = true;
    if (ts.id === 0) {
      // save new query source
      const response = await this.repo.xcreate(dataUrl, ts);
      if (!response.hasError) {
        ts = response.data as TransSourceIn;
        this.isLoading = false;
        return ts;
      }
    } else {
      // save changed query source
      const response = await this.repo.xupdate(dataUrl, ts.id, ts);
      if (!response.hasError) {
        ts = response.data as TransSourceIn;
        this.isLoading = false;
        return ts;
      }
    }
    return undefined;
  }

  public async deleteTransSourceIn(ts: TransSourceIn): Promise<boolean> {
    this.isLoading = true;
    if (ts.id > 0) {
      // delete existing query source. Note negative id.
      const response = await this.repo.xupdate(dataUrl, -ts.id, ts);
      if (!response.hasError) {
        // hist = response.data as Hist;
        this.isLoading = false;
        return true;
      }
    }
    return false;
  }

  // Private methods

  private calcId(tdoc: TDoc, seqNum: number): number {
    if (seqNum < tdoc.tsiItemIds.length) {
      return tdoc.tsiItemIds[seqNum];
    }
    return 0;
  }

}
