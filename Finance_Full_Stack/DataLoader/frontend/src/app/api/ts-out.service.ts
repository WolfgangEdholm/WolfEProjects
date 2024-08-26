import { EventEmitter, Injectable } from '@angular/core';
import { RepoService } from './repo.service';
import { DbEngService } from './db-eng.service';
import { DataEngService } from './data-eng.service';
import { TDoc, TransIntegrityItem } from '../types/trans';
import { TransCoreService } from '../core/trans-core.service';
import { UiRequestColumn } from '../ui/ui-request';
import { UiTable } from '../ui/ui-table';
import { ApiTransSourceOut, TransSourceOut, TransSourceOutItem,
  ApiTransSourceOutTransItems,
} from '../types/ts';
import { zeroTimeString, nowString, timeString } from '../utils/date';
import { ContextService } from '../core/context.service';


const dataUrl = `api/transSourceOut`;
const dataUrlName = `api/transSourceOutName`;
const dataItemUrl = `api/transSourceOutItems`;
const dataQueryOutItemUrl = `api/transSourceOutTransItems`;

// const param1Len = 250;
// const param2Len = 150;
// const strValueDelimiter = '|_|';

@Injectable({
  providedIn: 'root'
})
export class TransSourceOutService {

  public isLoading = false;

  public dataItems: TransSourceOut[] = [];


  public qsItems: TransSourceOutItem[] = [];
  public map = new Map<string, TransSourceOutItem>();
  // public dataEmitter: EventEmitter<TransSourceOut[]> = new EventEmitter();

  public hists: TransSourceOut[];

  constructor(
    private repo: RepoService,
    private g: ContextService,
    public dbEng: DbEngService,
    public dataEng: DataEngService,
  ) { }

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

  // public saveQuerSource(
  //   name: string,
  //   outputTable: string,
  //   temp: boolean = false
  // ): void {
  //   const currTime = new Date().toJSON().slice(0, 19).replace('T', ' ');
  //   const tdoc = this.getDocStructure();
  //   if (tdoc.requestColumns.length > 0 || tdoc.workColumns.length > 0) {
  //     tdoc.docName = name;
  //     tdoc.outputTable = outputTable;
  //     tdoc.creator = this.creator;
  //     tdoc.modifier = this.creator;
  //     tdoc.created = currTime;
  //     tdoc.modified = currTime;
  //     const qs = this.populateOuputArray(tdoc);

  //     this.saveQuerSourceRec(qs);
  //   }
  // }

  public populateOutputArray(tdoc: TDoc): TransSourceOut {
    const dso = this.createTransSourceOut();
    const creator = tdoc.creator;
    const modifier = this.g.user;
    const created = tdoc.created;
    const modified = nowString();
    dso.id = tdoc.id === 0 ? 0 : tdoc.tsoId;
    dso.dbTransName = tdoc.dbTransName;
    dso.creator = creator;
    dso.modifier = modifier;
    dso.created = created;
    dso.modified = modified;

    const tsId = tdoc.tsoId;
    let seqNum = 0;

    for (const item of tdoc.transItems) {
      const changeDate = item.changeDate ? item.changeDate : created;
      dso.items.push({
        id: this.calcId(tdoc, seqNum),
        tsId,
        seqNum,
        dbTransItem: `${tdoc.dbTransName}.${item.displayName}`,
        changeDate,
        itemKind: item.itemKind,
        comment: '',

        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
    }

    // free up unused items
    for (let i = seqNum; i < tdoc.tsoItemIds.length; i++) {
      dso.items.push({
        id: -tdoc.tsoItemIds[i],
        tsId,
        seqNum,
        dbTransItem: '',
        changeDate: '',
        itemKind: 'delete',
        comment: '',

        creator,
        modifier,
        created,
        modified,
      } as TransSourceOutItem);
    }

    return dso;
  }

  public createTransSourceOut(): TransSourceOut {
    const qs = {
      id: 0,
      dbTransName: '',

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
    } as TransSourceOut;
    return qs;
  }

  public createApiTransSourceOut(): ApiTransSourceOut {
    const aqs = {
      id: 0,
      dbTransName: '',

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
      itemIds: [],
    } as ApiTransSourceOut;
    return aqs;
  }

  // Io Methods 7892123456789312345678941234567895123456789612345678971234567898

  // Loads all TransSourceOutItems for the given document.
  public async loadTransSourceOutIntegrity(
    tdoc: TDoc
  ): Promise<[boolean, boolean]> {
    const params = { items: [] } as ApiTransSourceOutTransItems;
    for (const item of tdoc.transItems) {
      params.items.push(item.dbItemName);
    }
    this.isLoading = true;
    const response = await this.repo.xcreate(dataQueryOutItemUrl, params);
    if (!response.hasError) {

      let queryOk = true;
      const queryDate = new Date(tdoc.okDate);
      const tsoItems = response.data as TransSourceOutItem[];
      tdoc.integrityItems = [];
      for (const item of tsoItems) {
        const itemDate = new Date(item.changeDate);
        const ok = itemDate < queryDate;
        if (!ok) {
          queryOk = false;
        }
        tdoc.integrityItems.push({
          dbItemName: item.dbTransItem,
          changeDate: item.changeDate,
          ok,
        } as TransIntegrityItem);
      }
      tdoc.openedWithError = !queryOk;


      // console.log('TransSourceItems', this.dataItems);
      // this.map.clear();
      // for (const item of this.dataItems) {
      //   this.map.set(item.dbQueryName, item);
      // }
      // this.dataEmitter.emit(this.qsItems);
      this.isLoading = false;
      return [true, queryOk];
    }
    return [false, false];
  }

  // Loads all TransSourceOutItems in the system
  public async loadAllTransSourceOutItems(
    forceReload?: boolean
  ): Promise<boolean> {
    if (this.qsItems.length > 0 && !forceReload) {
      console.log('loadAllTransSourceItems Out: EARLY RETURN');
      return true;
    }
    this.isLoading = true;
    console.log('Query Source: loadAllTransSourceItems');
    const response = await this.repo.xloadAll(dataItemUrl);
    if (!response.hasError) {
      this.qsItems = response.data as TransSourceOutItem[];
      // console.log('TransSourceItems', this.dataItems);
      this.map.clear();
      for (const item of this.qsItems) {
        this.map.set(item.dbTransItem, item);
      }
      // this.dataEmitter.emit(this.qsItems);
      this.isLoading = false;
      return true;
    }
    return false;
  }

  // Loads all TransSourceOutItems in the system grouped by document
  public async loadAllTransOutSources(forceReload?: boolean): Promise<boolean> {
    if (this.dataItems.length > 0 && !forceReload) {
      console.log('loadAllTransSources Out: EARLY RETURN');
      return true;
    }
    this.isLoading = true;
    console.log('Query Source: loadAllTransSources');
    const response = await this.repo.xloadAll(dataUrl);
    if (!response.hasError) {
      this.dataItems = response.data as ApiTransSourceOut[];
      // console.log('TransSources', this.dataItems);
      // this.map.clear();
      // for (const item of this.dataItems) {
      //   this.map.set(item.dbTblName, item);
      // }
      // this.dataEmitter.emit(this.dataItems);
      this.isLoading = false;
      return true;
    }
    return false;
  }

  public async getTransSourceOut(id: number): Promise<ApiTransSourceOut> {
    this.isLoading = true;
    const response = await this.repo.xget(dataUrl, id);
    if (!response.hasError) {
      const aqs = response.data as ApiTransSourceOut;
      aqs.itemIds = [];
      aqs.items.forEach(e => { aqs.itemIds.push(e.id); });
      this.isLoading = false;
      return aqs;
    }
    return undefined;
  }

  public async getTransSourceOutFromName(
    name: string
  ): Promise<ApiTransSourceOut> {
    this.isLoading = true;
    const response = await this.repo.xgetFromName(dataUrlName, name);
    if (!response.hasError) {
      const aqs = response.data as ApiTransSourceOut;
      aqs.itemIds = [];
      aqs.items.forEach(e => { aqs.itemIds.push(e.id); });
      this.isLoading = false;
      return aqs;
    }
    return undefined;
  }

  public async saveTransSourceOut(ts: TransSourceOut): Promise<TransSourceOut> {
    this.isLoading = true;
    if (ts.id === 0) {
      // save new query source
      const response = await this.repo.xcreate(dataUrl, ts);
      if (!response.hasError) {
        ts = response.data as TransSourceOut;
        this.isLoading = false;
        return ts;
      }
    } else {
      // save changed query source
      const response = await this.repo.xupdate(dataUrl, ts.id, ts);
      if (!response.hasError) {
        ts = response.data as TransSourceOut;
        this.isLoading = false;
        return ts;
      }
    }
    return undefined;
  }

  public async deleteTransSourceOut(ts: TransSourceOut): Promise<boolean> {
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
    if (seqNum < tdoc.tsoItemIds.length) {
      return tdoc.tsoItemIds[seqNum];
    }
    return 0;
  }

}
