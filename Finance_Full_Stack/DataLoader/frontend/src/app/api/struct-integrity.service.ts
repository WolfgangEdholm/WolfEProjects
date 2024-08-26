import { EventEmitter, Injectable } from '@angular/core';
import { RepoService } from './repo.service';
import { DbEngService } from './db-eng.service';
import { DataEngService } from './data-eng.service';
import { QDoc, QueryStructIntegrityItem } from '../types/query';
import { QueryCoreService } from '../core/query-core.service';
import { UiRequestColumn } from '../ui/ui-request';
import { UiTable } from '../ui/ui-table';
import { ApiStructIntegrity, StructIntegrity, StructIntegrityItem,
  ApiStructIntegrityQueryColumns,
} from '../types/integrity';
import { logIo } from '../../constants';
import { zeroTimeString, nowString, timeString } from '../utils/date';
import { ContextService } from '../core/context.service';


const dataUrl = `api/structIntegrity`;
const dataUrlName = `api/structIntegrityName`;
const dataItemUrl = `api/structIntegrityItems`;
const dataQueryOutItemUrl = `api/structIntegrityQueryItems`;

// const param1Len = 250;
// const param2Len = 150;
// const strValueDelimiter = '|_|';

@Injectable({
  providedIn: 'root'
})
export class StructIntegrityService {

  public isLoading = false;

  public dataItems: StructIntegrity[] = [];

  public qsItems: StructIntegrityItem[] = [];
  public map = new Map<string, StructIntegrityItem>();
  // public dataEmitter: EventEmitter<StructIntegrity[]> = new EventEmitter();

  // private lastConstraint: QueryConstraint;

  public hists: StructIntegrity[];

  constructor(
    private repo: RepoService,
    private g: ContextService,
    public dbEng: DbEngService,
    public dataEng: DataEngService,
    public qc: QueryCoreService,
  ) { }

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

  public populateOutputArray(qdoc: QDoc): ApiStructIntegrity {
    const si = this.createApiStructIntegrity();
    const creator = qdoc.creator;
    const modifier = this.g.user;
    const created = qdoc.created;
    const modified = nowString();
    si.id = qdoc.id === 0 ? 0 : qdoc.siId;
    si.dbTblName = qdoc.dbQueryName;
    si.creator = creator;
    si.modifier = modifier;
    si.created = created;
    si.modified = modified;

    const siId = qdoc.siId;
    let seqNum = 0;
    si.items.push({
      id: this.calcId(qdoc, seqNum),
      siId,
      seqNum,
      dbTblColName: `${qdoc.dbQueryName}.id`,
      changeDate: created,
      type: 'int',
      oldType: '',
      comment: '',

      creator,
      modifier,
      created,
      modified,
    });
    seqNum += 1;

    for (const column of qdoc.workColumns) {

      let type: string;
      if (column.isComputed) {
        const computed = this.dataEng.compColumnDefs.find(e =>
          e.displayName === column.name);
        type = computed ? computed.dbType : 'int';
      } else {
        const rCol = this.qc.requestMgr.items.find((e: UiRequestColumn) =>
          e.name === column.name) as UiRequestColumn;
        const qTbl = this.qc.tableMgr.getTable(rCol.sourceTableIx);
        type = qTbl.table.columns[rCol.sourceColumnIx].type;
      }

      si.items.push({
        id: this.calcId(qdoc, seqNum),
        siId,
        seqNum,
        dbTblColName: `${qdoc.dbQueryName}.${column.name}`,
        changeDate: column.changeDate,
        type,
        oldType: '',
        comment: '',

        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
    }

    // free up unused items
    for (let i = seqNum; i < qdoc.siItemIds.length; i++) {
      si.items.push({
        id: -qdoc.siItemIds[i],
        siId,
        seqNum: i,
        dbTblColName: '',
        changeDate: undefined,
        type: 'delete',
        oldType: '',
        comment: '',

        creator,
        modifier,
        created,
        modified,
      } as StructIntegrityItem);
    }

    return si;
  }

  public createStructIntegrity(): StructIntegrity {
    const qs = {
      id: 0,
      dbTblName: '',

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
    } as StructIntegrity;
    return qs;
  }

  public createApiStructIntegrity(): ApiStructIntegrity {
    const aqs = {
      id: 0,
      dbTblName: '',

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
      itemIds: [],
    } as ApiStructIntegrity;
    return aqs;
  }

  // Io Methods 7892123456789312345678941234567895123456789612345678971234567898

  // Loads all loadStructIntegrityDocItems for the given document.
  public async loadStructIntegrityDocItems(
    qdoc: QDoc
  ): Promise<[boolean, boolean]> {
    const params = { columns: [] } as ApiStructIntegrityQueryColumns;
    for (const qItem of qdoc.requestColumns) {
      params.columns.push(qItem.dbTblColSource);
    }
    this.isLoading = true;
    if (logIo) {
      console.log('StructIntegrity: loadDocItems');
    }
    const response = await this.repo.xcreate(dataQueryOutItemUrl, params);
    if (!response.hasError) {
      let queryOk = true;
      const queryDate = new Date(qdoc.okDate);
      const dsoItems = response.data as StructIntegrityItem[];
      qdoc.integrityItems = [];
      for (const item of dsoItems) {
        const itemDate = new Date(item.changeDate);
        const ok = itemDate < queryDate
          && (!item.oldType || item.oldType === item.type);
        if (!ok) {
          queryOk = false;
        }
        qdoc.integrityItems.push({
          dbTblColSource: item.dbTblColName,
          changeDate: item.changeDate,
          type: item.type,
          oldType: item.oldType,
          ok,
        } as QueryStructIntegrityItem);
      }
      qdoc.openedWithError = !queryOk;
      // console.log('QuerySourceItems', this.dataItems);
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

  // Loads all StructIntegrityItems in the system
  public async loadAllStructIntegrityItems(
    forceReload?: boolean
  ): Promise<boolean> {
    if (this.qsItems.length > 0 && !forceReload) {
      console.log('loadAllQuerySourceItems Out: EARLY RETURN');
      return true;
    }
    this.isLoading = true;
    if (logIo) {
      console.log('Trans Struct Integrity: loadAllStructIntegrityItems');
    }
    const response = await this.repo.xloadAll(dataItemUrl);
    if (!response.hasError) {
      this.qsItems = response.data as StructIntegrityItem[];
      // console.log('DataSourceItems', this.dataItems);
      this.map.clear();
      for (const item of this.qsItems) {
        this.map.set(item.dbTblColName, item);
        // console.log('QsOut', item.dbTblColName);
      }
      // this.dataEmitter.emit(this.qsItems);
      this.isLoading = false;
      return true;
    }
    return false;
  }

  // Loads all StructIntegrityItems in the system grouped by document
  public async loadAllQueryOutSources(forceReload?: boolean): Promise<boolean> {
    if (this.dataItems.length > 0 && !forceReload) {
      console.log('loadAllQuerySources Out: EARLY RETURN');
      return true;
    }
    this.isLoading = true;
    const response = await this.repo.xloadAll(dataUrl);
    if (!response.hasError) {
      this.dataItems = response.data as ApiStructIntegrity[];
      // console.log('QuerySources', this.dataItems);
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

  public async getStructIntegrity(id: number): Promise<ApiStructIntegrity> {
    this.isLoading = true;
    const response = await this.repo.xget(dataUrl, id);
    if (!response.hasError) {
      const aqs = response.data as ApiStructIntegrity;
      aqs.itemIds = [];
      aqs.items.forEach(e => { aqs.itemIds.push(e.id); });
      this.isLoading = false;
      return aqs;
    }
    return undefined;
  }

  public async getStructIntegrityFromName(
    name: string
  ): Promise<ApiStructIntegrity> {
    this.isLoading = true;
    const response = await this.repo.xgetFromName(dataUrlName, name);
    if (!response.hasError) {
      const aqs = response.data as ApiStructIntegrity;
      aqs.itemIds = [];
      aqs.items.forEach(e => { aqs.itemIds.push(e.id); });
      this.isLoading = false;
      return aqs;
    }
    return undefined;
  }

  public async saveStructIntegrity(
    qs: StructIntegrity,
  ): Promise<StructIntegrity> {
    this.isLoading = true;
    if (qs.id === 0) {
      // save new query source
      const response = await this.repo.xcreate(dataUrl, qs);
      if (!response.hasError) {
        qs = response.data as StructIntegrity;
        this.isLoading = false;
        return qs;
      }
    } else {
      // save changed query source
      const response = await this.repo.xupdate(dataUrl, qs.id, qs);
      if (!response.hasError) {
        qs = response.data as StructIntegrity;
        this.isLoading = false;
        return qs;
      }
    }
    return undefined;
  }

  public async deleteStructIntegrity(qs: StructIntegrity): Promise<boolean> {
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
    if (seqNum < qdoc.siItemIds.length) {
      return qdoc.siItemIds[seqNum];
    }
    return 0;
  }

}
