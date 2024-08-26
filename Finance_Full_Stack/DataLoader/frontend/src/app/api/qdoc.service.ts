import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RepoService } from './repo.service';
import { DbEngService } from './db-eng.service';
import { lastValueFrom } from 'rxjs';
import { DataEngService, Uuid, WorkDataCode, Integrity, DisplayChangeSource,
} from './data-eng.service';
import { QueryTable, QueryJoin, QueryConstraint, QueryRequestColumn,
  QueryWorkColumn, QueryParams, QDoc, AggSibling, QueryStructIntegrityItem,
  // QueryIntegrityParam,
} from '../types/query';
import { TransItemType } from '../types/trans';
import { UiRequestColumn } from '../ui/ui-request';
import { UiJoin } from '../ui/ui-join';
import { CompareOp, compareOpToIoStr, ioStrToCompareOp, valueTypeToDefaultDbStr,
} from '../types/compute';
import { AggType, Just, justToIoStr, ioStrToJust, valueTypeToStr,
  strToValueType, ValueType,
} from '../types/compute';
import { DbColumn } from '../types/db';
import { ApiIoQuery, IoQuery, IoQueryItem, IoQueryItemKind,
} from '../types/qIo';
import { convertArrayToString } from '../utils/array';
import { DataIntegrityService } from './data-integrity.service';
import { StructIntegrityService } from './struct-integrity.service';
import { QueryCoreService } from '../core/query-core.service';
import { SaveMd2Component, SaveMd2Spec, SaveMd2FormElements,
  SaveFromDialogFunc, SaveFunc } from '../md2/save/save-md2.component';
import * as Modal from '../services/modal.service';
import { nowString } from '../utils/date';
import { RunCode } from '../types/trans';
import { Md2Service } from '../md2//md2.service';
import { CaseInsensitiveMap } from '../utils/map';
import { UiCoreService } from '../ui/ui-core.service';
import { ContextService } from '../core/context.service';


const dataUrl = `api/queryDoc`;
const dataUrlName = `api/queryDocName`;

const param1Len = 250;
const param2Len = 150;
const strValueDelimiter = '|_|';

@Injectable({
  providedIn: 'root'
})
export class QDocService {

  public isLoading = false;

  // Only head information is filled in
  public dataItems: ApiIoQuery[];
  public map = new CaseInsensitiveMap<string, ApiIoQuery>();
  // public dataEmitter: EventEmitter<IoQuery[]> = new EventEmitter();

  public currQueryName: string;
  public newQuerySeqNum = 1;

  private lastConstraint: QueryConstraint;

  // To be replaced with a system table setting setup?
  private dataOutDbs = [
    'wrk_data',
    'bup_data',
  ];
  private currDataOutDbIx = 0;

  constructor(
    private repo: RepoService,
    private matDialog: MatDialog,
    private md2: Md2Service,
    public g: ContextService,
    public core: UiCoreService,
    public dbEng: DbEngService,
    public dataEng: DataEngService,
    public dis: DataIntegrityService,
    public sis: StructIntegrityService,
    public qc: QueryCoreService,
  ) { }

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

  public async uxSaveDoc(
    forceDialog: boolean,
    docType: string,
    docDbName: string,
    docId: number,
    docDbNames: string[],
    saveFromDialog: SaveFromDialogFunc,
    saveFunc: SaveFunc,
  ): Promise<boolean> {
    if (!this.dbEng.databases || forceDialog) {
      await this.dbEng.loadAllDatabases();
    }
    const docPath = docDbName.split('.');
    const docName = docPath[1];
    const dbName = docPath[0];

    let mr: Modal.Return;

    if (docId === 0 || forceDialog) {
      const modalRef = this.matDialog.open(
        SaveMd2Component,
        this.md2.modalSetup({
          modalTitle: 'Save As:',
          isExisting: docId > 0,
          docName,
          dbName,
          docDbNames,
          docType,
        } as SaveMd2Spec),
      );
      mr = await lastValueFrom(modalRef.afterClosed())
        .then((resp: Modal.Return) => {
          if (resp.code === Modal.ReturnCode.ok) {
            saveFromDialog(resp.values as SaveMd2FormElements);
          }
          return Promise.resolve(resp);
        });
      return mr.code === Modal.ReturnCode.ok;
    } else {
      saveFunc();
      return true;
    }
  }

  public async uxSaveQDoc(forceDialog: boolean): Promise<boolean> {
    const qc = this.qc;
    console.log('UX Save QDoc', qc.currQuery.dbQueryName);
    const docDbName = qc.currQuery.dbQueryName;
    const docId = qc.currQuery.id;
    const docDbNames = [];
    if (docId === 0 || forceDialog) {
      this.map.forEach(e => docDbNames.push(e.dbQueryName));
    }
    return this.uxSaveDoc(
      forceDialog,
      'query',
      docDbName,
      docId,
      docDbNames,
      this.saveQDocFromDialog,
      this.saveDfltQDoc,
    );
  }

  public newQDoc(generateNewName: boolean): void {
    this.dataEng.initDataEngForNewQDoc();
    this.qc.currQuery = this.createQDoc();
    if (generateNewName) {
      this.currQueryName = 'Query' + this.newQuerySeqNum++;
      this.qc.currQuery.dbQueryName =
        `${this.dbEng.currDatabase}.${this.currQueryName}`;
    }
  }

  public async saveQDoc(qdoc: QDoc): Promise<void> {
    this.dataEng.syncDataspaceWithQueryDef();
    this.getCurrQDocStructure(qdoc);
    await this.saveQDocPrim(qdoc);
  }


  public async deleteQDoc(qdoc: QDoc): Promise<void> {
    if (!qdoc || !(qdoc.id > 0)) {
      return;
    }
    // if (!qdoc.oldDbQueryName) {
    //   qdoc.oldDbQueryName = qdoc.dbQueryName;
    // }
    qdoc.apiIoQuery = this.populateQueryIoArray(qdoc);
    qdoc.apiDi = this.dis.populateOutputArray(qdoc);
    qdoc.apiSi = this.sis.populateOutputArray(qdoc);

    await this.deleteIoQuery(qdoc.apiIoQuery);
    await this.dis.deleteDataIntegrity(qdoc.apiDi);
    await this.sis.deleteStructIntegrity(qdoc.apiSi);
    if (qdoc === this.qc.currQuery) {
      this.qc.currQuery = undefined;
    }
    await this.getAllIoQuerys();
  }

  public async getQDoc(id: number): Promise<QDoc> {
    const apiIoQuery = await this.getIoQuery(id);
    return this.createQDocFromIoObjec(apiIoQuery);
  }

  public async getQDocFromName(
    dbQueryName: string,
    skipIntegrity: boolean = false,
  ): Promise<QDoc> {
    const apiIoQuery = await
      this.getIoQueryFromName(dbQueryName);
    if (!skipIntegrity) {
      this.dataEng.initDataEngineData();
    }
    return this.createQDocFromIoObjec(apiIoQuery, skipIntegrity);
  }

  public async createQDocFromIoObjec(
    apiIoQuery: ApiIoQuery,
    skipIntegrity: boolean = false,
  ): Promise<QDoc> {
    let apiDi;
    let apiSi;
    if (!skipIntegrity) {
      apiDi = await this.dis.getDataIntegrityFromName(apiIoQuery.dbQueryName);
      apiSi = await this.sis.getStructIntegrityFromName(apiIoQuery.dbQueryName);
    }
    const qdoc = this.createQDoc();
    qdoc.id = apiIoQuery.id;
    qdoc.diId = skipIntegrity ? -1 : apiDi.id;
    qdoc.siId = skipIntegrity ? -1 : apiSi.id;
    qdoc.creator = apiIoQuery.creator;
    qdoc.created = apiIoQuery.created;
    qdoc.modifier = apiIoQuery.modifier;
    qdoc.modified = apiIoQuery.modified;
    qdoc.dbQueryName = apiIoQuery.dbQueryName;
    qdoc.oldDbQueryName = apiIoQuery.dbQueryName;
    qdoc.okDate = apiIoQuery.okDate;

    this.currQueryName = qdoc.dbQueryName.split('.')[1];
    qdoc.outputIsTemporary = apiIoQuery.outputIsTemporary;
    qdoc.itemIds = apiIoQuery.itemIds;
    qdoc.diItemIds = skipIntegrity ? undefined : apiDi.itemIds;
    qdoc.siItemIds = skipIntegrity ? undefined : apiSi.itemIds;

    // for delete
    qdoc.apiIoQuery = apiIoQuery;
    qdoc.apiDi = apiDi;
    qdoc.apiSi = apiSi;

    this.lastConstraint = undefined;
    for (let i = 0; i < apiIoQuery.items.length; i++) {
      const ioItem = apiIoQuery.items[i];

      switch (ioItem.itemKind) {
        // case 'sourceDatabase': {
        //   break;
        // }
        // case 'sourceTable': {
        //   break;
        // }
        case 'queryTable': {
          qdoc.queryTables.push(this.decodeApiQDocQueryTable(ioItem));
          break;
        }
        case 'queryJoin': {
          qdoc.queryJoins.push(this.decodeApiQDocQueryJoin(ioItem));
          break;
        }
        case 'queryConstraint': {
          const constr = this.decodeApiQDocQueryConstraint(ioItem);
          if (constr) {
            this.lastConstraint = constr;
            qdoc.queryConstraints.push(constr);
          }
          break;
        }
        case 'requestColumn': {
          qdoc.requestColumns.push(this.decodeApiQDocQueryColumn(ioItem));
          break;
        }
        case 'workData':
        case 'workComputed': {
          const column = this.decodeApiQDocWorkColumn(ioItem);
          qdoc.workColumns.push(column);
          if (ioItem.itemKind === 'workComputed') {
            i += 1;
            column.source = apiIoQuery.items[i].param2;
          }
          break;
        }
        case 'queryParams': {
          qdoc.params = this.decodeApiQDocQueryParams(ioItem);
          break;
        }
        default:
          console.log(`LoadDoc error: ItemType ${ioItem.itemKind
            } not recognized`);
      }
    }
    if (!skipIntegrity) {
      // const [queryOk, docOk] =
      await this.sis.loadStructIntegrityDocItems(qdoc);
    }
    return qdoc;
  }

  public createQDoc(): QDoc {
    const qdoc = {
      id: 0,
      ttype: 'Q' as TransItemType,    // Don't know why cast is necessary
      diId: 0,
      siId: 0,
      dbQueryName: '',
      oldDbQueryName: '',
      openedWithError: false,
      okDate: '',
      outputIsTemporary: false,
      params: undefined,
      queryTables: [],
      queryJoins: [],
      queryConstraints: [],
      requestColumns: [],
      workColumns: [],
      integrityItems: [],
      itemIds: [],
      diItemIds: [],
      siItemIds: [],

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      apiIoQuery: undefined,
      apiDi: undefined,
      apiSi: undefined,

      apiIoIx: -1,
      hasIntegrityError: false,
    };
    return qdoc;
  }

  public createApiIoQuery(): ApiIoQuery {
    const apiIoDoc = {
      id: 0,
      dbQueryName: '',
      oldDbQueryName: '',
      outputIsTemporary: false,

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],

      itemIds: [],
      ix: -1,
    } as ApiIoQuery;
    return apiIoDoc;
  }

  public createApiQDoc(): ApiIoQuery {
    const apiDoc = {
      id: 0,
      dbQueryName: '',
      oldDbQueryName: '',
      outputIsTemporary: false,
      itemIds: [],

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
    } as ApiIoQuery;
    return apiDoc;
  }

  // Io Methods 7892123456789312345678941234567895123456789612345678971234567898

  public async getAllIoQuerys(): Promise<boolean> {
    this.isLoading = true;
    const response = await this.repo.xloadAll(dataUrl);
    if (!response.hasError) {
      this.dataItems = response.data as ApiIoQuery[];
      this.map.clear();
      for (const [i, item] of this.dataItems.entries()) {
        this.map.set(item.dbQueryName, item);
        item.ix = i;
      }
      // this.dataEmitter.emit(this.dataItems);
      this.isLoading = false;
      return true;
    }
    return false;
  }

  public async getIoQuery(id: number): Promise<ApiIoQuery> {
    this.isLoading = true;
    const response = await this.repo.xget(dataUrl, id);
    if (!response.hasError) {
      const ioDoc = response.data as ApiIoQuery;
      ioDoc.itemIds = [];
      ioDoc.items.forEach(e => { ioDoc.itemIds.push(e.id); });
      this.isLoading = false;
      return ioDoc;
    }
    return undefined;
  }

  public async getIoQueryFromName(
    name: string
  ): Promise<ApiIoQuery> {
    this.isLoading = true;
    const response = await this.repo.xgetFromName(dataUrlName, name);
    if (!response.hasError) {
      const ioDoc = response.data as ApiIoQuery;
      ioDoc.itemIds = [];
      ioDoc.items.forEach(e => { ioDoc.itemIds.push(e.id); });
      this.isLoading = false;
      return ioDoc;
    }
    return undefined;
  }

  public async saveIoQuery(ioDoc: IoQuery): Promise<IoQuery> {
    this.isLoading = true;
    if (ioDoc.id === 0) {
      // save new document
      const response = await this.repo.xcreate(dataUrl, ioDoc);
      if (!response.hasError) {
        ioDoc = response.data as IoQuery;
        this.isLoading = false;
        return ioDoc;
      }
    } else {
      // save edited document
      const response = await this.repo.xupdate(dataUrl, ioDoc.id, ioDoc);
      if (!response.hasError) {
        ioDoc = response.data as IoQuery;
        this.isLoading = false;
        return ioDoc;
      }
    }
    return undefined;
  }

  public async deleteIoQuery(ioDoc: IoQuery): Promise<boolean> {
    this.isLoading = true;
    if (ioDoc.id > 0) {
      // delete existing document. Note negative id.
      const response = await this.repo.xupdate(dataUrl, -ioDoc.id, ioDoc);
      if (!response.hasError) {
        // ioDoc = response.data as IoQuery;
        this.isLoading = false;
        return true;
      }
    }
    return false;
  }

  // Updates the DataIntegrity entry for qdoc based on the StructIntegrity
  // status (out of sync StructIntgegrity -> out of sync DataIntegrity)
  public async updateDataIntegrity(qdoc: QDoc): Promise<void> {
    const rCols = this.qc.requestMgr.getColumns().slice(1, -1);
    // const dis: QueryIntegrityParam[] = [];
    const dis: string[] = [];
    rCols.forEach((rCol, ix) => {
      const dCol = this.dataEng.dataColumnDefs.find(dc =>
        dc.uuid === rCol.uuid);
      // let qip: QueryIntegrityParam;
      let qip: string;
      if (dCol) {
        const qii = qdoc.integrityItems.find(ii =>
          ii.dbTblColSource === dCol.dbTblColSource);
        if (qii && qii.changeDate > dCol.fixDate) {
          // qip = {
          //   outOfSyncDate: qii.changeDate,
          // };
          qip = qii.changeDate;
        }
      }
      dis.push(qip);
    });
    const di = this.dis.populateOutputArray(qdoc, dis);
    await this.dis.saveDataIntegrity(di);
  }

  // Utilities

  public queryInit = (): void => {
    this.clearQuery();
    this.newQDoc(true);
    this.qc.clearQDirty();
    this.initRequestLine();
  };

  public clearQuery = (): void => {
    const qc = this.qc;
    if (qc.requestMgr.items.length > 0) {
      qc.requestMgr.isDirty = true;
    }
    if (qc.tableMgr.items.length > 0) {
      qc.tableMgr.isDirty = true;
    }
    qc.tableMgr.itemOrder = [];
    qc.tableMgr.items = [];
    qc.tableMgr.currItem = undefined;
    qc.joinMgr.items = [];
    qc.joinMgr.manualJoins = [];
    qc.joinMgr.fKeys = [];
    qc.joinMgr.currItem = undefined;
    if (qc.requestMgr.items.length > 2) {
      qc.requestMgr.items.splice(1,
        qc.requestMgr.items.length - 2);
      qc.requestMgr.items[1].ix = 1;
    }
    qc.requestMgr.currItem = undefined;
    // called by newQDoc
    // this.dataEng.initDataEngForNewQDoc();

    this.core.draw();
  };

  public queryMakeNew = (): void => {
    this.queryInit();
    this.dataEng.setDisplayChangeSource(DisplayChangeSource.query);
    this.qc.requestMgr.initSeqNumGen();
    this.g.docName = 'New unsaved query';
  };

  public addRequestColumn(
    displayName,
    pos: number,              // position where to insert -1 -> insert at end
    sourceTableIx: number,
    sourceColumnIx: number,
    seqNum: number,           // sequence number for when created --
                              // new columns -> -1
    uuid: number,             // if new columns -> Uuid.generate
  ): UiRequestColumn {
    displayName = this.dataEng.verifyUniqueColumnName(displayName);
    return new UiRequestColumn(
      this.qc.requestMgr,
      displayName,
      pos,
      sourceTableIx,
      sourceColumnIx,
      seqNum,
      uuid,
    );
  }

  public initRequestLine(): void {
    this.qc.requestMgr.items = [];
    this.addRequestColumn('', -2, -1, -1, -2, Uuid.skip);
    this.addRequestColumn('Query', -1, -1, -1, -2, Uuid.skip);
    this.qc.requestMgr.isDirty = false;
  }

  // Private functions

  private saveQDocFromDialog = async (
    formValues: SaveMd2FormElements,
  ): Promise<void> => {
    const qdoc = this.qc.currQuery;
    qdoc.dbQueryName = `${formValues.docDbSelect}.${formValues.docName}`;
    if (formValues.makeCopy) {
      qdoc.id = 0;
    }
    await this.saveQDoc(qdoc);
    await this.getAllIoQuerys();
  };

  private saveDfltQDoc = async (): Promise<void> => {
    this.saveQDoc(this.qc.currQuery);
  };

  private async saveQDocPrim(qdoc: QDoc): Promise<void> {
    const currTime = nowString();
    if (qdoc.id === 0) {
      qdoc.creator = this.g.user;
      if (!qdoc.oldDbQueryName) {
        qdoc.oldDbQueryName = qdoc.dbQueryName;
      }
      this.newQuerySeqNum += 1;
      qdoc.created = currTime;
    }
    qdoc.modifier = this.g.user;
    qdoc.modified = currTime;
    let ioDoc = this.populateQueryIoArray(qdoc);
    let apiQs;
    if (qdoc.diId > -1) {
      apiQs = this.dis.populateOutputArray(qdoc);
    }
    let apoQs;
    if (qdoc.siId > -1) {
      apoQs = this.sis.populateOutputArray(qdoc);
    }
    ioDoc = await this.saveIoQuery(ioDoc) as ApiIoQuery;
    if (apiQs) {
      await this.dis.saveDataIntegrity(apiQs);
    }
    if (apoQs) {
      await this.sis.saveStructIntegrity(apoQs);
    }
    this.qc.currQuery = await this.getQDoc(ioDoc.id);
  }

  private decodeApiQDocQueryTable(ioItem: IoQueryItem): QueryTable {
    const table = {
      displayName: ioItem.itemName,
      dbTblSource: ioItem.param1,
      rect: JSON.parse(ioItem.param2),
    } as QueryTable;
    return table;
  }

  private decodeApiQDocQueryJoin(ioItem: IoQueryItem): QueryJoin {
    const params = JSON.parse(ioItem.param2);
    const join = {
      dbTblColSource1: ioItem.itemName,
      dbTblColSource2: ioItem.param1,
      operator: params.operator,
      isAuto: params.isAuto,
    } as QueryJoin;
    return join;
  }

  private decodeApiQDocQueryConstraint(ioItem: IoQueryItem): QueryConstraint {
    if (ioItem.itemName) {
      const constraint = {
        sourceColumn: ioItem.itemName,
        values: ioItem.param1.split('|_|'),
        operator: ioStrToCompareOp(ioItem.param2),
      } as QueryConstraint;
      return constraint;
    }
    const extraValues = ioItem.param1.split('|_|');
    this.lastConstraint.values.push(...extraValues);
    return undefined;
  }

  private decodeApiQDocQueryColumn(ioItem: IoQueryItem): QueryRequestColumn {
    const params = JSON.parse(ioItem.param2);
    const column = {
      displayName: ioItem.itemName,
      dbTblColSource: ioItem.param1,
      format: params.format,
      seqNum: params.seqNum,
      uuid: params.uuid,
    } as QueryRequestColumn;
    return column;
  }

  private decodeApiQDocWorkColumn(ioItem: IoQueryItem): QueryWorkColumn {
    const isComputed = ioItem.itemKind === 'workComputed';
    const params = JSON.parse(ioItem.param2);
    const computedType = isComputed
      ? strToValueType(params.type)
      : undefined;
    const column = {
      name: ioItem.itemName,
      uuid: params.uuid,
      source: ioItem.param1,
      isComputed,
      isHidden: params.isHidden,
      notOut: params.notOut,
      just: ioStrToJust(params.just),
      computedType,
      dbType: params.dbType,
      aggSibling: params.aggSibling,
      changeDate: params.changeDate,
      fixDate: params.fixDate,
    } as QueryWorkColumn;
    return column;
  }

  private decodeApiQDocQueryParams(ioItem: IoQueryItem): QueryParams {
    const params = JSON.parse(ioItem.param2);
    const qParams = {
      displayedColumns: params.displayed,
      sortIndexes: params.sortIxs,
      sortDirections: params.sortDirs,
      uuidGen: params.uuidGen,
      rcSeqNumGen: params.rcSeqNumGen,
    } as QueryParams;
    return qParams;
  }

  private calcId(qdoc: QDoc, seqNum: number): number {
    if (seqNum < qdoc.itemIds.length) {
      return qdoc.itemIds[seqNum];
    }
    return 0;
  }

  private populateQueryIoArray(qdoc: QDoc): ApiIoQuery {
    const ioDoc = this.createApiIoQuery();
    const creator = qdoc.creator;
    const modifier = this.g.user;
    const created = qdoc.created;
    const modified = nowString();
    ioDoc.id = qdoc.id;
    ioDoc.dbQueryName = qdoc.dbQueryName;
    ioDoc.oldDbQueryName = qdoc.oldDbQueryName;
    ioDoc.okDate = qdoc.okDate;
    ioDoc.outputIsTemporary = qdoc.outputIsTemporary;
    ioDoc.creator = creator;
    ioDoc.modifier = modifier;
    ioDoc.created = created;
    ioDoc.modified = modified;

    const queryId = qdoc.id;
    let seqNum = 0;
    let itemKind: IoQueryItemKind = 'queryTable';
    for (const table of qdoc.queryTables) {
      const rectStr = `{"x":${table.rect.x}, "y":${table.rect.y
        }, "width":${table.rect.width}, "height":${table.rect.height}}`;
      ioDoc.items.push({
        id: this.calcId(qdoc, seqNum),
        queryId,
        seqNum,
        itemKind,
        itemName: table.displayName,
        param1: table.dbTblSource,
        param2: rectStr,
        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
    }

    itemKind = 'queryJoin';
    for (const join of qdoc.queryJoins) {
      const par2 = `{"operator":"${compareOpToIoStr(join.operator)
        }", "isAuto":${join.isAuto}}`;
      ioDoc.items.push({
        id: this.calcId(qdoc, seqNum),
        queryId,
        seqNum,
        itemKind,
        itemName: join.dbTblColSource1,
        param1: join.dbTblColSource2,
        param2: par2,
        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
    }

    itemKind = 'queryConstraint';
    for (const constraint of qdoc.queryConstraints) {
      const values = convertArrayToString(
        constraint.values, param1Len, strValueDelimiter);
      ioDoc.items.push({
        id: this.calcId(qdoc, seqNum),
        queryId,
        seqNum,
        itemKind,
        itemName: constraint.sourceColumn,
        param1: values[0],
        param2: compareOpToIoStr(constraint.operator),
        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
      if (values.length > 1) {
        for (let i = 1; i < values.length; i++) {
          ioDoc.items.push({
            id: this.calcId(qdoc, seqNum),
            queryId,
            seqNum,
            itemKind,
            itemName: '',
            param1: values[i],
            param2: constraint.sourceColumn,
            creator,
            modifier,
            created,
            modified,
          });
          seqNum += 1;
        }
      }
    }

    itemKind = 'requestColumn';
    for (const column of qdoc.requestColumns) {
      let params = '{';
      params += `"format":"${column.format}"`;
      params += `, "seqNum":${column.seqNum}`;
      params += `, "uuid":${column.uuid}`;
      params += '}';
      ioDoc.items.push({
        id: this.calcId(qdoc, seqNum),
        queryId,
        seqNum,
        itemKind,
        itemName: column.displayName,
        param1: column.dbTblColSource,
        param2: params,
        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
    }

    for (const column of qdoc.workColumns) {
      const just = justToIoStr(column.just);
      let dbType: string;
      let params = '{';
      if (column.isComputed) {
        const computed = this.dataEng.compColumnDefs.find(e =>
          e.displayName === column.name);
        let tp: string;
        if (!computed) {
          tp = 'TYPE_UNDEF';
          dbType = 'int'; // dummy type
        } else {
          tp = valueTypeToStr(column.computedType);
          dbType = computed.dbType;
        }
        params += `"type":"${tp}", `;
      } else {
        const rCol = this.qc.requestMgr.items.find((e: UiRequestColumn) =>
          e.name === column.name) as UiRequestColumn;
        const qTbl = this.qc.tableMgr.getTable(rCol.sourceTableIx);
        dbType = qTbl.table.columns[rCol.sourceColumnIx].type;
      }
      params += `"uuid":${column.uuid}, `;
      params += `"dbType":"${dbType}", `;
      params += `"aggSibling":${column.aggSibling}, `;
      params += `"hidden":${column.isHidden}, "just":"${just}", `;
      params += `"notOut":${column.notOut}, `;
      params += `"changeDate":"${column.changeDate}", `;
      params += `"fixDate":"${column.fixDate}"`;
      params += '}';
      ioDoc.items.push({
        id: this.calcId(qdoc, seqNum),
        queryId,
        seqNum,
        itemKind: column.isComputed ? 'workComputed' : 'workData',
        itemName: column.name,
        param1: column.isComputed ? '1' : column.source,
        param2: params,
        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
      if (column.isComputed) {
        ioDoc.items.push({
          id: this.calcId(qdoc, seqNum),
          queryId,
          seqNum,
          itemKind: column.isComputed ? 'workComputed' : 'workData',
          itemName: column.name,
          param1: column.isComputed ? '2' : column.source,
          param2: column.source,
          creator,
          modifier,
          created,
          modified,
        });
        seqNum += 1;
      }
    }

    let param2 = '{';
    param2 += `"displayed":[`;
    qdoc.params.displayedColumns.forEach((e, ix) => {
      if (ix > 0) {
        param2 += ', ';
      }
      param2 += `${e}`;
    });
    param2 += `], "sortIxs":[`;
    qdoc.params.sortIndexes.forEach((e, ix) => {
      if (ix > 0) {
        param2 += ', ';
      }
      param2 += `${e}`;
    });
    param2 += `], "sortDirs":[`;
    qdoc.params.sortDirections.forEach((e, ix) => {
      if (ix > 0) {
        param2 += ', ';
      }
      param2 += `${e}`;
    });
    param2 += ']';
    param2 += `, "uuidGen":${qdoc.params.uuidGen}`;
    param2 += `, "rcSeqNumGen":${qdoc.params.rcSeqNumGen}`;
    param2 += '}';
    ioDoc.items.push({
      id: this.calcId(qdoc, seqNum),
      queryId,
      seqNum,
      itemKind: 'queryParams',
      itemName: 'Params',
      param1: `${qdoc.dbQueryName}.params`,
      param2,
      creator,
      modifier,
      created,
      modified,
    });
    seqNum += 1;

    for (let i = seqNum; i < qdoc.itemIds.length; i++) {
      ioDoc.items.push({
        id: -qdoc.itemIds[i],
        queryId,
        seqNum: i,
        itemKind: 'delete',
        itemName: '',
        param1: '',
        param2: '',
        creator,
        modifier,
        created,
        modified,
      });
    }

    return ioDoc;
  }

  // Get current documnent structure
  private getCurrQDocStructure(editDoc: QDoc): QDoc {
    const qdoc = editDoc;
    qdoc.queryTables = [];
    qdoc.queryJoins = [];
    qdoc.queryConstraints = [];
    qdoc.requestColumns = [];
    qdoc.workColumns = [];
    if (qdoc.okDate.length === 0) {
      qdoc.okDate = nowString();
    }
    qdoc.params = {
      displayedColumns: this.dataEng.rowMasterUuids,
      sortIndexes: this.dataEng.sortIndexes
        ? this.dataEng.sortIndexes : [],
      sortDirections: this.dataEng.sortDirections
        ? this.dataEng.sortDirections : [],
      uuidGen: this.qc.uuidGen,
      rcSeqNumGen: this.qc.requestMgr.seqNumGen,
    };
    // Get query table info
    for (const qTbl of this.qc.tableMgr.getTables()) {
      const rect = qTbl.rect;
      const displayName = qTbl.table.tableName;
      const dbTblSource = qTbl.dbTblSource;
      const isHidden = false;
      // const columns = [];
      // Query table columns are currently not saved with the document
      // for (const qCol of qTbl.table.columns) {
      //   const dn = qCol.columnName;
      //   const sn = qCol.columnName;
      //   const ih = false;
      //   columns.push({ displayName: dn, sourceName: sn, isHidden: ih
      //   } as SourceItem);
      // }
      qdoc.queryTables.push({
        displayName,
        dbTblSource,
        rect,
      } as QueryTable);
    }
    console.log('QUERY-TABLES', qdoc.queryTables);

    for (const qJoin of this.qc.joinMgr.items as UiJoin[]) {
      const qTbl1 = this.qc.tableMgr.getTable(qJoin.uiTblIx1);
      const qCol1 = qTbl1.table.columns[qJoin.colIx1] as DbColumn;
      const qTbl2 = this.qc.tableMgr.getTable(qJoin.uiTblIx2);
      const qCol2 = qTbl2.table.columns[qJoin.colIx2] as DbColumn;
      const dbTblColSource1 = `${qTbl1.dbTblSource}.${qCol1.columnName}`;
      const dbTblColSource2 = `${qTbl2.dbTblSource}.${qCol2.columnName}`;
      const operator = CompareOp.eq;
      const isAuto = qJoin.isAuto;
      qdoc.queryJoins.push({
        dbTblColSource1,
        dbTblColSource2,
        operator,
        isAuto,
      } as QueryJoin);
    }
    console.log('QUERY-JOINS', qdoc.queryJoins);

    for (const qTbl of this.qc.tableMgr.getTables()) {
      for (const qCol of qTbl.table.columns) {
        if (qCol.constraint) {
          // const sourceColumn = `${this.dbEng.currDatabase}.${
          //   qTbl.table.tableName}.${qCol.columnName}`;
          const sourceColumn = `${qTbl.dbTblSource}.${qCol.columnName}`;
          const operator = qCol.constraint.compareOp;
          const temp = qCol.constraint.valuesStr.split(',');
          const values = temp.map(item => item.trim());
          qdoc.queryConstraints.push({
            sourceColumn,
            operator,
            values,
          } as QueryConstraint);
        }
      }
    }
    console.log('QUERY-CONSTRAINTS', qdoc.queryConstraints);

    for (const rCol of this.qc.requestMgr.items as UiRequestColumn[]) {
      if (rCol.sourceTableIx > -1) {
        const displayName = rCol.name;
        const qTbl = this.qc.tableMgr.getTable(rCol.sourceTableIx);
        const qCol = qTbl.table.columns[rCol.sourceColumnIx] as DbColumn;
        const dbTblColSource = `${qTbl.dbTblSource}.${qCol.columnName}`;
        qdoc.requestColumns.push({
          displayName,
          dbTblColSource,
          format: rCol.format,
          seqNum: rCol.seqNum,
          uuid: rCol.uuid,
        } as QueryRequestColumn);
      }
    }
    console.log('QUERY-COLUMNS', qdoc.requestColumns);

    const qe = this.dataEng;
    // create list of all work columns
    const cols = qe.dataColumnDefs.map(dc => dc.ix);
    qe.compColumnDefs.slice(1).forEach(cc => {
      if (!cc.isAggSibling) {
        cols.push(-cc.ix - 1);
      }
    });
    qe.workDisplayUpdate();
    for (const [i, v] of this.dataEng.rowMasterIndexes.entries()) {
      const [runCode, wc] = this.createWorkColumn(v, cols);
      if (runCode === RunCode.success) {
        qdoc.workColumns.push(wc);
      }
    }
    cols.forEach(v => {
      const [runCode, wc] = this.createWorkColumn(v, undefined);
      if (runCode === RunCode.success) {
        qdoc.workColumns.push(wc);
      }
    });

    console.log('WORK-COLUMNS', qdoc.workColumns);
    return qdoc;
  }

  private createWorkColumn(
    v: number,
    cols: number[],
  ): [RunCode, QueryWorkColumn] {
    let name: string;
    let uuid: number;
    let source: string;
    let isHidden: boolean;
    let notOut: boolean;
    let just: Just;
    let computedType: ValueType;
    let changeDate: string;
    let fixDate: string;
    let dbType: string;
    let aggSibling: AggSibling;
    const isComputed = v < 0;
    if (isComputed) {
      if (v === WorkDataCode.groupByEnd) {
        name = '(groupByEnd)';
        uuid = Uuid.groupByEnd;
        source = '_groupByEnd_';
        isHidden = false;
        notOut = true;
        just = Just.default;
        computedType = ValueType.num;
        dbType = 'int';
        aggSibling = AggSibling.inactive;
        changeDate = '';
        fixDate = '';
      } else {
        const computed = this.dataEng.compColumnDefs[-v - 1];
        if (computed.codeUnit.aggType === AggType.support) {
          // This column is generated by compiling the aggretage source.
          return [RunCode.error, undefined];
        }
        name = computed.displayName;
        uuid = computed.uuid;
        source = computed.codeUnit.source;
        isHidden = !computed.isVisible;
        notOut = computed.doNotOutput;
        just = computed.just;
        computedType = computed.type;
        changeDate = computed.changeDate;
        fixDate = '';
        dbType = computed.dbType;
        aggSibling = computed.aggSibling;
      }
    } else {
      const dCol = this.dataEng.dataColumnDefs[v];
      const rCol = ( this.qc.requestMgr.items as UiRequestColumn[] ).find(
        rc => rc.uuid === dCol.uuid);
      const qTbl = this.qc.tableMgr.getTable(rCol.sourceTableIx);
      const qCol = qTbl.table.columns[rCol.sourceColumnIx] as DbColumn;
      name = dCol.displayName;
      uuid = dCol.uuid;
      source = `${qTbl.dbTblSource}.${qCol.columnName}`;
      isHidden = !dCol.isVisible;
      notOut = dCol.doNotOutput;
      just = dCol.just;
      changeDate = dCol.changeDate;
      fixDate = dCol.fixDate;
      // if (!fixDate) {
      //   fixDate = nowString();
      // }
      dbType = dCol.dbType;
      aggSibling = dCol.aggSibling;
    }
    if (!changeDate) {
      changeDate = nowString();
    }
    if (!fixDate) {
      fixDate = nowString();
    }
    if (cols) {
      const cix = cols.findIndex(cv => v === cv);
      cols.splice(cix, 1);
    }
    return [RunCode.success, {
      name,
      uuid,
      source,
      isHidden,
      notOut,
      isComputed,
      just,
      computedType,
      dbType,
      aggSibling,
      changeDate,
      fixDate,
    } as QueryWorkColumn];
  }

}
