import { EventEmitter, Injectable } from '@angular/core';
import { RepoService } from './repo.service';
import { DbEngService } from './db-eng.service';
import { DataEngService } from './data-eng.service';
import { QDoc, QueryStructIntegrityItem } from '../types/query';
import { QueryCoreService } from '../core/query-core.service';
import { QueryService } from '../cmd/query.service';
import { UiRequestColumn } from '../ui/ui-request';
import { ApiDataIntegrity, DataIntegrity, DataIntegrityItem,
} from '../types/integrity';
import { QueryIntegrityCheckItem } from '../types/integrity';
import { zeroTimeString, nowString, timeString } from '../utils/date';
import { ContextService } from '../core/context.service';


const dataUrl = `api/dataIntegrity`;
const dataUrlName = `api/dataIntegrityName`;
const dsDataUrl = `api/dataIntegrityItems`;

// const dataUrl = `api/querySourceIn`;
// const dataUrlName = `api/querySourceInName`;
// const dsDataUrl = `api/querySourceInItems`;

// const param1Len = 250;
// const param2Len = 150;
// const strValueDelimiter = '|_|';

@Injectable({
  providedIn: 'root'
})
export class DataIntegrityService {

  public isLoading = false;

  public dataItems: DataIntegrity[] = [];
  public map = new Map<string, DataIntegrity>();
  public dataEmitter: EventEmitter<DataIntegrity[]> = new EventEmitter();

  public qsItems: QueryIntegrityCheckItem[] = [];

  public hists: DataIntegrity[];

  constructor(
    private repo: RepoService,
    private g: ContextService,
    public dbEng: DbEngService,
    public dataEng: DataEngService,
    public qc: QueryCoreService,
  ) { }

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

  public populateOutputArray(
    qdoc: QDoc,
    outOfSyncDates?: string[],
  ): ApiDataIntegrity {
    const di = this.createApiDataIntegrity();
    const creator = qdoc.creator;
    const modifier = this.g.user;
    const created = qdoc.created;
    const modified = nowString();

    di.id = qdoc.id === 0 ? 0 : qdoc.diId;
    di.dbTblName = qdoc.dbQueryName;
    di.outOfSyncDate = zeroTimeString; // Figure out what to do here later
    di.runDate = nowString();
    di.creator = creator;
    di.modifier = modifier;
    di.created = created;
    di.modified = modified;

    const diId = qdoc.diId;
    let seqNum = 0;
    let changeDate: Date;
    qdoc.requestColumns.forEach((col, ix) => {
      // const workColumn = qdoc.workColumns.find(wc =>
      // wc.name === column.displayName);
      const wCol = qdoc.workColumns.find(wc => wc.uuid === col.uuid);
      const rCol = this.qc.requestMgr.getColumn(seqNum + 1);
      const qTbl = this.qc.tableMgr.getTable(rCol.sourceTableIx);
      const fixDate = wCol.fixDate ? wCol.fixDate : zeroTimeString;

      let outOfSyncDate: string;
      if (outOfSyncDates && outOfSyncDates[ix]) {
        outOfSyncDate = outOfSyncDates[ix];
      } else {
        outOfSyncDate = wCol.changeDate > wCol.fixDate
        ? wCol.changeDate
        : zeroTimeString;
      }

      if (outOfSyncDate > zeroTimeString) {
        const colChangeDate = new Date(wCol.changeDate);
        if (!changeDate || changeDate > colChangeDate) {
          changeDate = colChangeDate;
        }
      }
      const defDate = wCol.fixDate ? wCol.fixDate : nowString();
      di.items.push({
        id: this.calcId(qdoc, seqNum),
        diId,
        seqNum,
        dbTblName: di.dbTblName,
        colName: col.displayName,
        dbTblColSource: col.dbTblColSource,
        type: qTbl.table.columns[rCol.sourceColumnIx].type,
        fixDate,
        outOfSyncDate,

        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
    });

    for (let i = seqNum; i < qdoc.diItemIds.length; i++) {
      di.items.push({
        id: -qdoc.siItemIds[i],
        diId,
        seqNum: i,
        dbTblName: '',
        colName: '',
        dbTblColSource: '',
        type: 'delete',
        outOfSyncDate: '',

        creator,
        modifier,
        created,
        modified,
      } as DataIntegrityItem);
    }

    return di;
  }

  public createDataIntegrity(): DataIntegrity {
    const di = {
      id: 0,
      dbTblName: '',
      outOfSyncDate: '',
      runDate: '',

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
    } as DataIntegrity;
    return di;
  }

  public createApiDataIntegrity(): ApiDataIntegrity {
    const adi = {
      id: 0,
      dbTblName: '',
      outOfSyncDate: '',
      runDate: '',

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
      itemIds: [],
    } as ApiDataIntegrity;
    return adi;
  }

  // Io Methods 7892123456789312345678941234567895123456789612345678971234567898

  public async loadAllDataIntegrityItems(
    forceReload?: boolean
  ): Promise<boolean> {
    if (this.qsItems.length > 0 && !forceReload) {
      console.log('loadAllQuerySourceItems In: EARLY RETURN');
      return true;
    }
    this.isLoading = true;
    // console.log('Query Source: loadAllQuerySourceItems');
    const response = await this.repo.xloadAll(dsDataUrl);
    if (!response.hasError) {
      this.qsItems = response.data as QueryIntegrityCheckItem[];
      // console.log('QuerySourceItems', this.dataItems);
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

  public async getDataIntegrity(id: number): Promise<ApiDataIntegrity> {
    this.isLoading = true;
    const response = await this.repo.xget(dataUrl, id);
    if (!response.hasError) {
      const aqs = response.data as ApiDataIntegrity;
      aqs.itemIds = [];
      aqs.items.forEach(e => { aqs.itemIds.push(e.id); });
      this.isLoading = false;
      return aqs;
    }
    return undefined;
  }

  public async getDataIntegrityFromName(
    name: string
  ): Promise<ApiDataIntegrity> {
    this.isLoading = true;
    const response = await this.repo.xgetFromName(dataUrlName, name);
    if (!response.hasError) {
      const aqs = response.data as ApiDataIntegrity;
      aqs.itemIds = [];
      aqs.items.forEach(e => { aqs.itemIds.push(e.id); });
      this.isLoading = false;
      return aqs;
    }
    return undefined;
  }

  public async saveDataIntegrity(qs: DataIntegrity): Promise<DataIntegrity> {
    this.isLoading = true;
    if (qs.id === 0) {
      // save new query source
      const response = await this.repo.xcreate(dataUrl, qs);
      if (!response.hasError) {
        qs = response.data as DataIntegrity;
        this.isLoading = false;
        return qs;
      }
    } else {
      // save changed query source
      const response = await this.repo.xupdate(dataUrl, qs.id, qs);
      if (!response.hasError) {
        qs = response.data as DataIntegrity;
        this.isLoading = false;
        return qs;
      }
    }
    return undefined;
  }

  public async deleteDataIntegrity(qs: DataIntegrity): Promise<boolean> {
    this.isLoading = true;
    if (qs.id > 0) {
      // delete existing query source. Note negative id.
      const response = await this.repo.xupdate(dataUrl, -qs.id, qs);
      if (!response.hasError) {
        // hist = response.data as Hist;
        this.isLoading = false;
        return true;
      }
    }
    return false;
  }

  // Private methods

  private calcId(qdoc: QDoc, seqNum: number): number {
    if (seqNum < qdoc.diItemIds.length) {
      return qdoc.diItemIds[seqNum];
    }
    return 0;
  }

}
