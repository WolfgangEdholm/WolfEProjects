import { EventEmitter, Injectable } from '@angular/core';
import { RepoService } from './repo.service';
import { DbEngService } from './db-eng.service';
import { DataEngService } from './data-eng.service';
import { TransItem, TransArrow, TDoc, TransItemType, RunCode
} from '../types/trans';
import { TransCoreService } from '../core/trans-core.service';
import { UiTrans } from '../ui/ui-trans';
import { UiArrow } from '../ui/ui-arrow';
import { FilterParamType } from '../types/filter';
import { ApiIoTrans, IoTrans, IoTransItem, IoTransItemKind
} from '../types/tIo';
import { TransSourceInService } from './ts-in.service';
import { TransSourceOutService } from './ts-out.service';
import { SaveMd2Component, SaveMd2Spec, SaveMd2FormElements,
} from '../md2/save/save-md2.component';
import * as Modal from '../services/modal.service';
import { FilterDef, filterFormValue } from '../types/filter';
import { nowString } from '../utils/date';
import { TRANSPARAMS } from '../types/filter';
import { PARAM2_MAXLENGTH } from '../types/tIo';
import { Md2Service } from '../md2//md2.service';
import { QDocService } from './qdoc.service';
import { CaseInsensitiveMap } from '../utils/map';
import { ContextService } from '../core/context.service';


const transUrl = `api/transDoc`;
const transUrlName = `api/transDocName`;

const param1Len = 250;
const param2Len = 150;
const strValueDelimiter = '|_|';

@Injectable({
  providedIn: 'root'
})
export class TDocService {

  public isLoading = false;

  // Only head information is filled in
  public dataItems: ApiIoTrans[];
  public map = new CaseInsensitiveMap<string, ApiIoTrans>();
  // public dataEmitter: EventEmitter<IoTrans[]> = new EventEmitter();

  public currTransName: string;
  public newTransSeqNum = 1;

  // To be replaced with a system table setting setup?
  private dataOutDbs = [
    'wrk_data',
    'bup_data',
  ];
  private currDataOutDbIx = 0;

  constructor(
    private repo: RepoService,
    private g: ContextService,
    // private matDialog: MatDialog,
    // private md2: Md2Service,
    public dbEng: DbEngService,
    public dataEng: DataEngService,
    public tsi: TransSourceInService,
    public tso: TransSourceOutService,
    public tc: TransCoreService,
    public qd: QDocService,
  ) { }

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

  public async uxSaveTDoc(forceDialog: boolean): Promise<boolean> {
    const tc = this.tc;
    console.log('UX Save TDoc', tc.mainTrans.dbTransName);

    const docDbName = tc.mainTrans.dbTransName;
    const docId = tc.mainTrans.id;
    const docDbNames = [];
    if (docId === 0 || forceDialog) {
      this.map.forEach(e => docDbNames.push(e.dbTransName));
    }
    return this.qd.uxSaveDoc(
      forceDialog,
      'transformer',
      docDbName,
      docId,
      docDbNames,
      this.saveTDocFromDialog,
      this.saveDfltTDoc,
    );
  }

  public newTDoc(generateNewName: boolean): void {
    this.tc.mainTrans = this.createTDoc();
    if (generateNewName) {
      this.currTransName = 'Transformer' + this.newTransSeqNum++;
      this.tc.mainTrans.dbTransName =
        `${this.dbEng.currDatabase}.${this.currTransName}`;
    }
  }

  public async saveTDoc(tdoc: TDoc): Promise<void> {
    await this.getCurrTDocStructure(tdoc);
    await this.saveTDocPrim(tdoc);
  }

  public async deleteTDoc(tdoc: TDoc): Promise<void> {
    if (!tdoc || !(tdoc.id > 0)) {
      return;
    }
    await this.deleteIoTrans(tdoc.apiIoTrans);
    await this.tsi.deleteTransSourceIn(tdoc.apiTsi);
    await this.tso.deleteTransSourceOut(tdoc.apiTso);
    if (tdoc === this.tc.mainTrans) {
      this.tc.mainTrans = undefined;
    }
    await this.getAllIoTranses();
  }

  public async getTDoc(
    id: number,
    skipIntegrity: boolean = false,
  ): Promise<TDoc> {
    const apiIoTrans = await this.getIoTrans(id);
    return this.createTDocFromIoObjec(apiIoTrans, skipIntegrity);
  }

  public async getTDocFromName(
    dbTransName: string,
    skipIntegrity: boolean = false,
  ): Promise<TDoc> {
    const apiIoTrans = await this.getIoTransFromName(dbTransName);
    return this.createTDocFromIoObjec(apiIoTrans, skipIntegrity);
  }

  public async createTDocFromIoObjec(
    apiIoTrans: ApiIoTrans,
    skipIntegrity: boolean = false,
  ): Promise<TDoc> {
    let apiTsi;
    let apiTso;
    if (!skipIntegrity) {
      apiTsi = await this.tsi.getTransSourceInFromName(apiIoTrans.dbTransName);
      apiTso = await this.tso.getTransSourceOutFromName(apiIoTrans.dbTransName);
    }
    const tdoc = this.createTDoc();
    tdoc.id = apiIoTrans.id;
    tdoc.tsiId = skipIntegrity ? -1 : apiTsi.id;
    tdoc.tsoId = skipIntegrity ? -1 : apiTso.id;
    tdoc.creator = apiIoTrans.creator;
    tdoc.created = apiIoTrans.created;
    tdoc.modifier = apiIoTrans.modifier;
    tdoc.modified = apiIoTrans.modified;
    tdoc.dbTransName = apiIoTrans.dbTransName;
    tdoc.oldDbTransName = apiIoTrans.dbTransName;
    tdoc.okDate = apiIoTrans.okDate;

    this.currTransName = tdoc.dbTransName.split('.')[1];
    tdoc.itemIds = apiIoTrans.itemIds;
    tdoc.tsiItemIds = skipIntegrity ? undefined : apiTsi.itemIds;
    tdoc.tsoItemIds = skipIntegrity ? undefined : apiTso.itemIds;

    // for delete
    tdoc.apiIoTrans = apiIoTrans;
    tdoc.apiTsi = apiTsi;
    tdoc.apiTso = apiTso;

    for (let i = 0; i < apiIoTrans.items.length; i++) {
      const ioItem = apiIoTrans.items[i];
      switch (ioItem.itemKind) {
        case 'arrow':
          tdoc.arrows.push(this.decodeApiDocArrow(ioItem));
          break;
        case 'transFilter':
        case 'transHelper':
        case 'transQuery':
        case 'transTrans':
          tdoc.transItems.push(this.decodeApiDocTransItem(ioItem));
          break;
        case 'filter':
          while (apiIoTrans.items[i].param2.length === PARAM2_MAXLENGTH
            && i + 1 < apiIoTrans.items.length
            && apiIoTrans.items[i + 1].param1 === 'continuation') {
            i += 1;
            ioItem.param2 += apiIoTrans.items[i].param2;
          }
          tdoc.filters.push(await this.decodeApiDocFilter(ioItem));
          break;
        default:
          console.log(`LoadDoc error: ItemType ${ioItem.itemKind
            } not recognized`);
      }
    }
    if (!skipIntegrity) {
      await this.tso.loadTransSourceOutIntegrity(tdoc);
    }
    return tdoc;
  }

  public copyMainFiltersToTrans(tdoc: TDoc): void {
    tdoc.filters = [];
    this.tc.mainFilters.forEach(f => {
      tdoc.filters.push(f.def);
    });
  }


  public copyTransFiltersToMain(tdoc: TDoc): void {
    this.tc.mainFilters = [];
    tdoc.filters.forEach(f => {
      this.tc.mainFilters.push({
        def: f,
      });
    });
  }

  // Get current documnent structure
  public async getCurrTDocStructure(editDoc: TDoc): Promise<TDoc> {
    const tc = this.tc;
    const tdoc = editDoc;
    tdoc.transItems = [];
    tdoc.arrows = [];

    if (tdoc.okDate.length === 0) {
      console.log('set Trans OKDATE');
      tdoc.okDate = new Date().toJSON().slice(0, 19).replace('T', ' ');
    }
    // Get query table info
    for (const tItem of tc.transMgr.items as UiTrans[]) {
      const rect = tItem.rect;
      const displayName = tItem.displayName;
      const dbItemName = tItem.dbItemName;
      const itemKind = tItem.itemKind;
      const itemIx = tItem.ix;
      const changeDate = tItem.changeDate;
      const fixDate = tItem.fixDate;

      tdoc.transItems.push({
        displayName,
        dbItemName,
        itemKind,
        itemIx,
        rect,
        changeDate,
        fixDate,
      } as TransItem);
    }
    console.log('TRANS-ITEMS', tdoc.transItems);

    for (const tArrow of tc.arrowMgr.items as UiArrow[]) {
      const from = tc.transMgr.getTItem(tArrow.fromIx);
      const to = tc.transMgr.getTItem(tArrow.toIx);
      const fromDbItemName = from.dbItemName;
      const toDbItemName = to.dbItemName;
      tdoc.arrows.push({
        fromDbItemName,
        toDbItemName,
        fromIx: tArrow.fromIx,
        toIx: tArrow.toIx,
      } as TransArrow);
    }
    console.log('TRANS-ARROWS', tdoc.arrows);

    // populate all empty parameters in main filter array
    for (const f of tc.mainFilters) {
      if (!f.def.params) {
        let fSpec = f.def.fc.name === TRANSPARAMS
          ? tc.transParams
          : tc.filterMap.get(f.def.fc.name);
        if (!fSpec) {
          fSpec = tc.helperMap.get(f.def.fc.name);
        }
        let runCode: RunCode;
        [runCode, f.def] = await fSpec.handler.paramsDefault(
          f.def.fc.itemIx);
        f.def.fc.outputDbTable =
          this.dataEng.checkDbTableName(f.def.fc.outputDbTable);
      }
    }
    this.copyMainFiltersToTrans(tdoc);

    console.log('TRANS-FILTERS', tdoc.filters);
    return tdoc;
  }

  public createTDoc(): TDoc {
    const tdoc = {
      id: 0,
      ttype: 'T' as TransItemType,    // Don't know why cast is necessary
      tsiId: 0,
      tsoId: 0,
      dbTransName: '',
      oldDbTransName: '',
      openedWithError: false,
      okDate: '',
      transItems: [],
      arrows: [],
      filters: [],
      integrityItems: [],
      itemIds: [],
      tsiItemIds: [],
      tsoItemIds: [],

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      apiIoTrans: undefined,
      apiTsi: undefined,
      apiTso: undefined,

      apiIoIx: -1,

      execMap: undefined,
      execItems: undefined,
      execOrder: undefined,
      // endPoints: undefined,
      dataOuts: undefined,
      integrityErrors: undefined,
      propagateErrors: undefined,
      selfExec: undefined,
    };
    return tdoc;
  }

  public createIoTrans(): IoTrans {
    const ioDoc = {
      id: 0,
      dbTransName: '',
      oldDbTransName: '',

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
    } as IoTrans;
    return ioDoc;
  }

  public createApiTIoDoc(): ApiIoTrans {
    const apiDoc = {
      id: 0,
      dbTransName: '',
      oldDbTransName: '',
      itemIds: [],

      creator: '',
      modifier: '',
      created: '',
      modified: '',

      items: [],
    } as ApiIoTrans;
    return apiDoc;
  }

  // Io Methods 7892123456789312345678941234567895123456789612345678971234567898

  public async getAllIoTranses(): Promise<boolean> {
    this.isLoading = true;
    const response = await this.repo.xloadAll(transUrl);
    if (!response.hasError) {
      this.dataItems = response.data as ApiIoTrans[];
      // console.log('Documents', this.dataItems);
      this.map.clear();
      for (const [i, item] of this.dataItems.entries()) {
        this.map.set(item.dbTransName, item);
        item.ix = i;
      }
      // this.dataEmitter.emit(this.dataItems);
      this.isLoading = false;
      return true;
    }
    return false;
  }

  public async getIoTrans(id: number): Promise<ApiIoTrans> {
    this.isLoading = true;
    const response = await this.repo.xget(transUrl, id);
    if (!response.hasError) {
      const ioDoc = response.data as ApiIoTrans;
      ioDoc.itemIds = [];
      ioDoc.items.forEach(e => { ioDoc.itemIds.push(e.id); });
      this.isLoading = false;
      return ioDoc;
    }
    return undefined;
  }

  public async getIoTransFromName(
    name: string
  ): Promise<ApiIoTrans> {
    this.isLoading = true;
    const response = await this.repo.xgetFromName(transUrlName, name);
    if (!response.hasError) {
      const ioDoc = response.data as ApiIoTrans;
      ioDoc.itemIds = [];
      ioDoc.items.forEach(e => { ioDoc.itemIds.push(e.id); });
      this.isLoading = false;
      return ioDoc;
    }
    return undefined;
  }

  public async saveIoTrans(ioDoc: IoTrans): Promise<IoTrans> {
    this.isLoading = true;
    if (ioDoc.id === 0) {
      // save new document
      const response = await this.repo.xcreate(transUrl, ioDoc);
      if (!response.hasError) {
        ioDoc = response.data as IoTrans;
        this.isLoading = false;
        return ioDoc;
      }
    } else {
      // save edited document
      const response = await this.repo.xupdate(transUrl, ioDoc.id, ioDoc);
      if (!response.hasError) {
        ioDoc = response.data as IoTrans;
        this.isLoading = false;
        return ioDoc;
      }
    }
    return undefined;
  }

  public async deleteIoTrans(ioDoc: IoTrans): Promise<boolean> {
    this.isLoading = true;
    if (ioDoc.id > 0) {
      // delete existing document. Note negative id.
      const response = await this.repo.xupdate(transUrl, -ioDoc.id, ioDoc);
      if (!response.hasError) {
        // ioDoc = response.data as IoTrans;
        this.isLoading = false;
        return true;
      }
    }
    return false;
  }

  // initializations routines

  public transInit = (): void => {
    this.qd.queryInit();
    this.transMakeNew();
    this.newTransSeqNum -= 1;
  };

  public transMakeNew = (): void => {
    this.clearTrans();
    this.newTDoc(true);
    this.tc.clearTDirty();
  };

  public clearTrans(): void {
    const tc = this.tc;
    tc.transMgr.itemOrder = [];
    tc.transMgr.items = [];
    tc.transMgr.currItem = undefined;
    tc.arrowMgr.items = [];
    tc.arrowMgr.currItem = undefined;
    tc.mainFilters = [];
    tc.mainTrans = undefined;
    this.qd.core.draw();
  }

  // Private methods

  private saveTDocFromDialog = async (
    formValues: SaveMd2FormElements,
  ): Promise<void> => {
    const tdoc = this.tc.mainTrans;
    tdoc.dbTransName = `${formValues.docDbSelect}.${formValues.docName}`;
    if (formValues.makeCopy) {
      tdoc.id = 0;
    }
    await this.saveTDoc(tdoc);
    await this.getAllIoTranses();
  };

  private saveDfltTDoc = async (): Promise<void> => {
    this.saveTDoc(this.tc.mainTrans);
  };

  private async saveTDocPrim(tdoc: TDoc): Promise<void> {
    const currTime = nowString();
    if (tdoc.id === 0) {
      tdoc.creator = this.g.user;
      if (!tdoc.oldDbTransName) {
        tdoc.oldDbTransName = tdoc.dbTransName;
      }
      this.newTransSeqNum += 1;
      tdoc.created = currTime;
    }
    tdoc.modifier = this.g.user;
    tdoc.modified = currTime;
    let ioDoc = this.populateIoArray(tdoc);
    let apiTs;
    if (tdoc.tsiId > -1) {
      apiTs = this.tsi.populateOutputArray(tdoc);
    }
    let apoTs;
    if (tdoc.tsoId > -1) {
      apoTs = this.tso.populateOutputArray(tdoc);
    }

    ioDoc = await this.saveIoTrans(ioDoc) as ApiIoTrans;
    if (apiTs) {
      await this.tsi.saveTransSourceIn(apiTs);
    }
    if (apoTs) {
      await this.tso.saveTransSourceOut(apoTs);
    }
    this.tc.mainTrans = await this.getTDoc(ioDoc.id);
    // ioDoc.id = this.tc.currTrans.id;
    // this.tc.mainTrans.id = ioDoc.id;
  }

  private decodeApiDocArrow(ioItem: IoTransItem): TransArrow {
    const params = JSON.parse(ioItem.param2);
    const arrow: TransArrow = {
      fromDbItemName: ioItem.itemName,
      toDbItemName: ioItem.param1,
      fromIx: params.fromIx,
      toIx: params.toIx,
    };
    return arrow;
  }

  private decodeApiDocTransItem(ioItem: IoTransItem): TransItem {
    const params = JSON.parse(ioItem.param2);
    const item: TransItem = {
      displayName: ioItem.param1,
      itemKind: ioItem.itemKind,
      itemIx: params.itemIx,
      dbItemName: ioItem.itemName,
      rect: params.rect,
      changeDate: params.changeDate,
      fixDate: params.fixDate,
    };
    return item;
  }

  private async decodeApiDocFilter(
    ioItem: IoTransItem,
  ): Promise<FilterDef> {
    const itemIx = Number(ioItem.param1);
    const fParams = JSON.parse(ioItem.param2);
    let fSpec = ioItem.itemName === TRANSPARAMS
      ? this.tc.transParams
      : this.tc.filterMap.get(ioItem.itemName);
    if (!fSpec) {
      fSpec = this.tc.helperMap.get(ioItem.itemName);
    }
    // let runCode: RunCode;
    // let filter: FilterDef;
    const [runCode, filter] = await fSpec.handler.paramsDefault(
      itemIx);
    filter.fc.displayName = fParams.displayName;
    filter.fc.inputDbTable = fParams.inputDbTable;
    filter.fc.outputDbTable = fParams.outputDbTable;
    filter.fc.isTemporary = fParams.isTemporary;
    filter.params.forEach((p, ix) => {
      if (p.tp === FilterParamType.button) {
        return; // from loop only
      }
      if (p.tp === FilterParamType.tableName) {
        p.value = this.dataEng.checkDbTableName(fParams.vals[ix]);
      } else {
        p.value = fParams.vals[ix];
      }
    });
    filter.fc.changeDate = fParams.changeDate;
    filter.fc.fixDate = fParams.fixDate;
    return filter;
  }

  private calcId(tdoc: TDoc, seqNum: number): number {
    if (seqNum < tdoc.itemIds.length) {
      return tdoc.itemIds[seqNum];
    }
    return 0;
  }

  private populateIoArray(tdoc: TDoc): IoTrans {
    const ioDoc = this.createIoTrans();
    const creator = tdoc.creator;
    const modifier = this.g.user;
    const created = tdoc.created;
    const modified = nowString();
    ioDoc.id = tdoc.id;
    ioDoc.dbTransName = tdoc.dbTransName;
    ioDoc.oldDbTransName = tdoc.oldDbTransName;
    ioDoc.okDate = tdoc.okDate;
    ioDoc.creator = creator;
    ioDoc.modifier = modifier;
    ioDoc.created = created;
    ioDoc.modified = modified;

    const transId = tdoc.id;
    let seqNum = 0;
    for (const item of tdoc.transItems) {
      if (!item.changeDate) {
        item.changeDate = tdoc.created;
      }
      if (!item.fixDate) {
        item.fixDate = tdoc.created;
      }
      let params = '{';
      params += `"itemIx":${item.itemIx}, `;
      params += `"rect":{"x":${item.rect.x}, "y":${item.rect.y
        }, "width":${item.rect.width}, "height":${item.rect.height}}, `;
      params += `"changeDate":"${item.changeDate}", `;
      params += `"fixDate":"${item.fixDate}"`;
      params += '}';
      ioDoc.items.push({
        id: this.calcId(tdoc, seqNum),
        transId,
        seqNum,
        itemKind: item.itemKind,
        itemName: item.dbItemName,
        param1: item.displayName,
        param2: params,
        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
    }

    for (const arrow of tdoc.arrows) {
      let params = '{';
      params += `"fromIx":${arrow.fromIx}, `;
      params += `"toIx":${arrow.toIx}`;
      params += '}';
      ioDoc.items.push({
        id: this.calcId(tdoc, seqNum),
        transId,
        seqNum,
        itemKind: 'arrow',
        itemName: arrow.fromDbItemName,
        param1: arrow.toDbItemName,
        param2: params,
        creator,
        modifier,
        created,
        modified,
      });
      seqNum += 1;
    }

    tdoc.filters.forEach(f => {
      if (!f.fc.changeDate) {
        f.fc.changeDate = nowString();
      }
      if (!f.fc.fixDate) {
        f.fc.fixDate = nowString();
      }
      let params = '{';
      params += `"displayName":"${f.fc.displayName}", `;
      params += `"inputDbTable":"${f.fc.inputDbTable}", `;
      params += `"outputDbTable":"${f.fc.outputDbTable}", `;
      params += `"isTemporary":${f.fc.isTemporary}, `;
      params += `"vals": [`;
      f.params.forEach((p, ix) => {
        if (p.tp === FilterParamType.button) {
          return; // from loop only
        }
        if (ix > 0) {
          params += ', ';
        }
        if (p.tp === FilterParamType.displayList) {
          params += '[';
          p.value.forEach((v, jx) => {
            if (jx > 0) {
              params += ', ';
            }
            params += `"${v}"`;
          });
          params += ']';
        } else {
          if (p.tp === FilterParamType.tableName) {
            p.value = this.dataEng.checkDbTableName(p.value);
          }
          const isStrVal = p.tp === FilterParamType.str
            || p.tp === FilterParamType.tableName
            || p.tp === FilterParamType.tablePicker
            || p.tp === FilterParamType.strDropdown;
          params += isStrVal ? `"${p.value}"` : `${p.value}`;
        }
      });
      params += '], ';
      params += `"changeDate":"${f.fc.changeDate}", `;
      params += `"fixDate":"${f.fc.fixDate}"`;
      params += '}';

      for (let i = 0; ; i++) {
        let paramsOut = params;
        if (paramsOut.length > PARAM2_MAXLENGTH) {
          paramsOut = params.slice(0, PARAM2_MAXLENGTH);
          params = params.slice(PARAM2_MAXLENGTH);
        } else {
          params = '';
        }

        ioDoc.items.push({
          id: this.calcId(tdoc, seqNum),
          transId,
          seqNum,
          itemKind: 'filter',
          itemName: f.fc.name,
          param1: i === 0 ? `${f.fc.itemIx}` : 'continuation',
          param2: paramsOut,
          creator,
          modifier,
          created,
          modified,
        });
        seqNum += 1;

        if (params.length === 0) {
          break;
        }
      }
    });

    for (let i = seqNum; i < tdoc.itemIds.length; i++) {
      ioDoc.items.push({
        id: -tdoc.itemIds[i],
        transId,
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

}
