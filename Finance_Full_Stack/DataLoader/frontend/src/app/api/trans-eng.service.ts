import { Injectable } from '@angular/core';
import { TransCoreService } from '../core/trans-core.service';
import { QueryCoreService } from '../core/query-core.service';
import { DataEngService, Integrity } from './data-eng.service';
import { DbEngService,  } from './db-eng.service';
import { QDoc } from '../types/query';
import { TDocService } from './tdoc.service';
import { QDocService } from './qdoc.service';
import { TransService } from '../cmd/trans.service';
import { QueryService } from '../cmd/query.service';
import { minTransDisplayDelay } from '../../constants';
import { nowString } from '../utils/date';
import { RunCode } from '../types/trans';
import { TransItem, TransArrow, TDoc, XDoc, TransItemType,
  ExecItem, ReportItem, ErrorItem, } from '../types/trans';
import { FilterSpec, FilterDef, TRANSPARAMS, IN_ARROW/*, OUT_ARROW*/,
  VERIFY, DATA_IN, DATA_OUT, SKIP, SAME_AS_SOURCE,
} from '../types/filter';
import { Database, Table, DbColumn, ForeignKey } from '../types/db';
import { uctToLocalDateString } from '../utils/date';
import { StructIntegrityService } from './struct-integrity.service';

const errorCutOff = 9;

type ErrorCount = {
  errorCount: number;
};

@Injectable({
  providedIn: 'root'
})
export class TransEngService {
  // stack of transformers being run, starting with tc.mainTrans
  transStack: TDoc[] = [];
  // logs results from running the transformers
  reportItems: ReportItem[] = [];
  // logs errors encountered running the transformers
  errorItems: ErrorItem[] = [];
  // collects all errors encountered running one transformer
  runErrors: string[] = [];
  integrityErrors: string[] = [];
  stopOnErrors = false;

  constructor(
    public tc: TransCoreService,
    public td: TDocService,
    // public ts: TransService,

    public qc: QueryCoreService,
    public qd: QDocService,
    public qs: QueryService,

    public dbEng: DbEngService,
    public dataEng: DataEngService,
    public si: StructIntegrityService,
  ) {
    tc.transEng = this;
    tc.updateIntegrity = this.updateIntegrity;
  }

  public readFilterInput = async (
    inputDbTableName: string,
  ): Promise<[RunCode, number]> => {
    this.qd.clearQuery();
    this.qd.initRequestLine();
    this.qd.newQDoc(false);
    const [runCode, input] =
      await this.dbEng.getTableInfo(inputDbTableName, true);
    if (runCode !== RunCode.success) {
      return [RunCode.error, -1];
    }
    const ixColNum = input.columns.findIndex(c => c.key === 'PRI');
    await this.dataEng.readTable(input);
    return [RunCode.success, ixColNum];
  };

  public readSupportTable = async (
    supportDbTableName: string,
  ): Promise<[RunCode, any[], Table]> => {
    this.qd.clearQuery();
    this.qd.initRequestLine();
    this.qd.newQDoc(false);
    const [runCode, input] = await this.dbEng.getTableInfo(supportDbTableName);
    if (runCode !== RunCode.success) {
      return [RunCode.success, undefined, input];
    }
    const dataRows = await this.dataEng.readSupportTable(input);
    return [RunCode.success, dataRows, input];
  };

  public writeFilterOutput = async (
    outputDbTableName: string,
    ixCol: number,
  ): Promise<[RunCode, number]> => {
    this.dataEng.workDisplayUpdate();
    const rowCount = await this.dataEng.writeData(outputDbTableName, ixCol);
    this.qd.clearQuery();
    this.qc.clearQDirty();
    return [RunCode.success, rowCount];
  };

  public runFilter = async (
    tdoc: TDoc,
    filter: FilterDef,
    ei: ExecItem,
    parentTDoc: TDoc,
    parentEi: ExecItem,
  ): Promise<RunCode> => {
    const ec: ErrorCount = { errorCount: 0, };
    console.log('---------- Start Running Filter', filter.fc.name);
    const startTime = Date.now();
    const fIx = filter.fc.itemIx;
    const fName = filter.fc.name;
    const inArrows = tdoc.arrows.filter(a => a.toIx === fIx);
    let fSpec: FilterSpec;
    let runCode: RunCode;
    let ixColNum: number;
    let rowCount = 0;

    if (filter.fc.name === DATA_IN) {
      if (filter.fc.inputDbTable === IN_ARROW) {
        if (!parentTDoc) {
          this.error(ec, `No input arrow to parent transformer`);
        } else {
          const parentEix = parentEi.itemIx;
          const inParentArrows =
            parentTDoc.arrows.filter(a => a.toIx === parentEix);
          if (inParentArrows.length === 0) {
            this.error(ec, `Missing arrow to parent transformer`);
          } else {
            if (ei.inputDbTableName === IN_ARROW) {
              const fex = parentTDoc.execItems[inParentArrows[0].fromIx];
              ei.outputDbTableName = fex.outputDbTableName;
            }
          }
        }
      }
      return ec.errorCount > 0 ? RunCode.error : RunCode.success;
    }

    // arrow checks
    if (inArrows.length === 0) {
      if (filter.fc.name !== VERIFY) {
        this.error(ec, `No input arrow.`);
      }
    } else if (inArrows.length > 1) {
      this.error(ec, `Only one input table allowerd.`);
    }

    let fromEx: ExecItem;
    if (inArrows.length > 0) {
      fromEx = tdoc.execItems[inArrows[0].fromIx];
    }

    if (ec.errorCount === 0) {
      if (filter.fc.name === DATA_OUT) {
        if (ei.inputDbTableName === IN_ARROW) {
          if (tdoc.selfExec) {
            tdoc.selfExec.outputDbTableName = fromEx.outputDbTableName;
          }
        }
      }
    }

    if (ec.errorCount === 0) {
      // pre execute checking for errors

      fSpec = this.getFilterSpec(fName);

      if (!filter.fc.inputDbTable) {
        [runCode, filter] = await fSpec.handler.paramsDefault(filter.fc.itemIx);
        filter.fc.inputDbTable =
          this.dataEng.checkDbTableName(filter.fc.inputDbTable);
        filter.fc.outputDbTable =
          this.dataEng.checkDbTableName(filter.fc.outputDbTable);
      }
      let tableName = filter.fc.inputDbTable;
      if (tableName === IN_ARROW) {
        tableName = fromEx ? fromEx.outputDbTableName : '';
      }

      if (!tableName) {
        this.error(ec, `X Table name not specified.`);
      } else {
        let errors: string[];
        [runCode, errors] = await fSpec.handler.preExecute(
          this, filter, tableName);
        if (errors.length > 0) {
          this.runErrors.push(...errors);
          ec.errorCount += errors.length;
        }
      }
      if (runCode === RunCode.successRunIsDone
        || runCode === RunCode.errorContinue
        || runCode === RunCode.errorForceStop) {
        return runCode;
      }
    }

    // read supporting data
    if (ec.errorCount === 0) {
      let errors: string[];
      [runCode, errors] = await
        fSpec.handler.getSupportingData(this, filter);
      if (errors.length > 0) {
        this.runErrors.push(...errors);
        ec.errorCount += errors.length;
      }
    }
    if (ec.errorCount === 0) {
      let inputDbTable = filter.fc.inputDbTable;
      if (inputDbTable === IN_ARROW) {
        if (fromEx.ttype === 'T') {
          // a) pass trough parameter and b) no DATAOUT filter
          const fromTDoc = fromEx.xdoc as TDoc;
          let outDataError = true;
          if (fromTDoc.dataOuts?.length) {
            const fromTDocOut = fromTDoc.execItems[fromTDoc.dataOuts[0]];
            if (fromTDocOut.outputDbTableName === SAME_AS_SOURCE) {
              if (fromTDocOut.dependsOn?.length) {
                const fromSource = fromTDoc.execItems[fromTDocOut.dependsOn[0]];
                inputDbTable = fromSource.outputDbTableName;
                outDataError = false;
              }
            } else {
              inputDbTable = fromTDocOut.outputDbTableName;
            }
          }
          if (outDataError) {
            this.error(ec, `There is no data defined to pass through`);
          }
        } else {
          inputDbTable = fromEx.outputDbTableName;
        }
      }
      if (ec.errorCount === 0) {
        [runCode, ixColNum] = await this.readFilterInput(inputDbTable);
        if (runCode !== RunCode.success) {
          this.error(ec, `Reading data table '${inputDbTable}'' failed.`);
        }
      }
    }
    if (ec.errorCount === 0) {
      fSpec.handler.ixColNum = ixColNum;
      let errors: string[];
      [runCode, errors] = await fSpec.handler.editData(this, filter);
      if (errors.length > 0) {
        this.runErrors.push(...errors);
        ec.errorCount += errors.length;
      }
    }
    if (ec.errorCount === 0) {
      [runCode, rowCount] = await
        this.writeFilterOutput(filter.fc.outputDbTable, ixColNum);
      if (runCode !== RunCode.success) {
        this.error(ec, `Writing data table ${filter.fc.outputDbTable} failed.`);
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const dbTableName = filter.fc.outputDbTable === SKIP
      ? filter.fc.inputDbTable
      : filter.fc.outputDbTable;
    const reportItem = {
      dbTableName,
      status: ec.errorCount === 0 ? 'Success' : 'Error',
      rowCount,
      writtenAt: nowString(),
      duration,
      hasError: ec.errorCount > 0,
    };
    if (filter.fc.name !== DATA_IN) {
      this.reportItems.push(reportItem);
    }
    return ec.errorCount > 0 ? RunCode.error : RunCode.success;
  };

  public runQuery = async (
    qdoc: QDoc,
    ei: ExecItem,
    parentTDOc: TDoc,
  ): Promise<RunCode> => {
    console.log('---------- Start Running Query', qdoc.dbQueryName);
    const startTime = Date.now();
    this.qd.clearQuery();
    this.qd.initRequestLine();
    this.qd.newQDoc(false);

    // build display data structures necessary for write query
    await this.qs.buildQDocument(qdoc, true);
    this.qc.currQuery = qdoc;
    await this.dataEng.getData();
    this.dataEng.workDisplayUpdate();
    const rowCount = await this.dataEng.writeData();
    await this.qd.updateDataIntegrity(qdoc);
    this.qd.clearQuery();
    this.qc.clearQDirty();
    const endTime = Date.now();
    const duration = endTime - startTime;
    const reportItem = {
      dbTableName: qdoc.dbQueryName,
      status: 'Success',
      rowCount,
      writtenAt: nowString(),
      duration,
      hasError: false,
    };
    this.reportItems.push(reportItem);
    return RunCode.success;
  };

  public runTrans = async (
    tdoc: TDoc,
    parentTDoc: TDoc = undefined,
    parentEi: ExecItem = undefined,
  ): Promise<RunCode> => {
    console.log('---------- Start Running Trans', tdoc.dbTransName);
    if (tdoc === this.tc.mainTrans) {
      // await this.td.getCurrTDocStructure(tdoc);
      this.transStack = [];
      this.reportItems = [];
      this.errorItems = [];
      this.runErrors = [];
      console.log('---------- Is Main Transformer', tdoc);
    }
    this.transStack.push(tdoc);
    const runCode = await this.runTransInside(tdoc, parentTDoc, parentEi);
    if (runCode !== RunCode.success) {
      return runCode;
    }
    this.transStack.pop();
    if (this.transStack.length === 0) {
      this.qd.core.draw();
    }
    // runTrans uses the query work space. Clear it.
    this.qc.clearQDirty();
    return RunCode.success;
  };

  public calculateDependencies = async (
    tdoc: TDoc,
    skipIntegrity: boolean,
    noEarlyReturn: boolean,
  ): Promise<[ExecItem[], number[], number[]]> => {

    // if (tdoc.execMap && skipIntegrity && !noEarlyReturn) {
    //   return [tdoc.execItems, tdoc.execOrder, tdoc.dataOuts];
    // }
    if (tdoc.execItems && skipIntegrity && !noEarlyReturn) {
      return [tdoc.execItems, tdoc.execOrder, tdoc.dataOuts];
    }
    const execItems: ExecItem[] = [];
    const execOrder: number[] = [];
    const dataOuts: number[] = [];
    // Old style loop instead of map because of await in loop
    for (const ti of tdoc.transItems) {
      let xdoc: XDoc;
      let ttype: TransItemType;
      let inputDbTableName: string;
      let outputDbTableName: string;
      let canInheritErrors = true;
      const filter = tdoc.filters.find(f => f.fc.itemIx === ti.itemIx);
      inputDbTableName = filter ? filter.fc.inputDbTable : '';
      outputDbTableName = filter ? filter.fc.outputDbTable : '';
      const dbItemName = ti.dbItemName;
      if (ti.itemKind === 'transFilter' || ti.itemKind === 'transHelper') {
        ttype = ti.itemKind === 'transFilter' ? 'F' : 'H';
        // const filter = tdoc.filters.find(f => f.fc.itemIx === ti.itemIx);
        // inputDbTableName = filter.fc.inputDbTable;
        // outputDbTableName = filter.fc.outputDbTable;
        if (filter.fc.name === DATA_OUT) {
          dataOuts.push(ti.itemIx);
        }
        canInheritErrors = filter.fc.canInheritErrors;
        xdoc = filter;
      } else if (ti.itemKind === 'transQuery') {
        ttype = 'Q';
        this.qd.queryInit();
        xdoc = await this.qd.getQDocFromName(ti.dbItemName, skipIntegrity);
        if (!skipIntegrity) {
          this.qc.currQuery = xdoc;
          await this.qs.buildQDocument(xdoc, true);
          // buildQDocument sets dirty flags
          this.qc.clearQDirty();
        }
        inputDbTableName = '';
        outputDbTableName = ( xdoc as QDoc ).dbQueryName;
        canInheritErrors = false;

      } else if (ti.itemKind === 'transTrans') {
        ttype = 'T';
        xdoc = await this.td.getTDocFromName(ti.dbItemName, skipIntegrity);
        // const filter = tdoc.filters.find(f => f.fc.itemIx === ti.itemIx);
        // inputDbTableName = filter.fc.inputDbTable;
        // outputDbTableName = filter.fc.outputDbTable;
      }
      const eItem: ExecItem = {
        ttype,
        dbItemName: ti.dbItemName,
        itemIx: ti.itemIx,
        xdoc,
        dependsOn: [],
        inputDbTableName,
        outputDbTableName,
        errorCode: RunCode.success,
        integrityCode: Integrity.ok,
        canInheritErrors,
        integrityErrors: [],
      };
      if (ttype === 'T') {
        ( xdoc as TDoc ).selfExec = eItem;
      }
      execItems.push(eItem);
    }
    // calculate dependencies
    execItems.forEach(ei => {
      // let inArrowCount = 0;
      tdoc.arrows.forEach(a => {
        if (a.toIx === ei.itemIx) {
          ei.dependsOn.push(execItems.findIndex(
            e => e.itemIx === a.fromIx));
        }
      });
    });
    // calculate execution order
    execItems.forEach((ei, ix) => {
      if (ei.dependsOn.length === 0) {
        execOrder.push(ix);
      }
    });
    while (execOrder.length < execItems.length) {
      for (let i = 0; i < execItems.length; i++) {
        let skip = false;
        for (let j = execOrder.length; 0 < j--;) {
          if (execOrder[j] === i) {
            skip = true;
            break;
          }
        }
        if (!skip) {
          const arr = execItems[i].dependsOn;
          if (arr.every(p => execOrder.includes(p) || p < 0)) {
            execOrder.push(i);
          }
        }
      }
    }
    return [execItems, execOrder, dataOuts];
  };

  public getChildrenOf = (tdoc: TDoc, itemIx: number): number[] => {
    const toArr: number[] = [];
    this.getChildrenOfWrk(tdoc, itemIx, toArr);
    toArr.sort((a, b) => a - b);
    return toArr;
  };

  public propagateItemIntegrity = (
    tdoc: TDoc,
    ti: TransItem,
  ): void => {
    const arr = this.getChildrenOf(tdoc, ti.itemIx);
    const ei = tdoc.execItems[ti.itemIx];
    // eslint-disable-next-line no-bitwise
    if (ei.integrityCode & Integrity.error) {
      arr.forEach(a => {
        const cei = tdoc.execItems[a];
        if (cei.canInheritErrors) {
          // eslint-disable-next-line no-bitwise
          cei.integrityCode |= Integrity.downstreamOfError;
        }
      });
      // eslint-disable-next-line no-bitwise
    } else if (ei.integrityCode & Integrity.downstremChangesNecessary) {
      arr.forEach(a => {
        const cei = tdoc.execItems[a];
        if (cei.canInheritErrors) {
          // eslint-disable-next-line no-bitwise
          cei.integrityCode |= Integrity.errorDownstreamOfChange;
        }
      });
      // eslint-disable-next-line no-bitwise
    } else if (ei.integrityCode & Integrity.upstremChangesFixed) {
      arr.forEach(a => {
        const cei = tdoc.execItems[a];
        if (cei.canInheritErrors) {
          // eslint-disable-next-line no-bitwise
          cei.integrityCode &= ~Integrity.errorDownstreamOfChange;
        }
      });
    }
  };

  public propagateClearItemIntegrity = (
    tdoc: TDoc,
    ti: TransItem,
    integrityCode: Integrity,
    includeSource: boolean,
  ): void => {
    // eslint-disable-next-line no-bitwise
    const code = ~integrityCode;
    const arr = this.getChildrenOf(tdoc, ti.itemIx);
    const wrkArr = includeSource ? [ti.itemIx] : [];
    wrkArr.push(...arr);
    wrkArr.forEach(a => {
      const ei = tdoc.execItems[a];
      if (ei.canInheritErrors) {
        // eslint-disable-next-line no-bitwise
        ei.integrityCode &= code;
      }
    });
  };

  public updateIntegrityUi = (tdoc: TDoc): void => {
    for (let exIx = 0; exIx < tdoc.execItems.length; exIx++) {
      const ei = tdoc.execItems[tdoc.execOrder[exIx]];
      // eslint-disable-next-line no-bitwise
      const ic = ei.integrityCode & ~Integrity.hiddenMask;
      this.tc.updateUiItemIntegrity(ei.itemIx, ic);
    }
    this.qd.core.draw();
  };

  public checkTransIntegrity = async (
    tdoc: TDoc,
    parentTDoc: TDoc = undefined,
    parentEi: ExecItem = undefined,
  ): Promise<RunCode> => {
    if (tdoc === this.tc.mainTrans) {
      // await this.td.getCurrTDocStructure(tdoc);
      this.transStack = [];
      this.reportItems = [];
      this.errorItems = [];
      this.integrityErrors = [];
    }
    this.transStack.push(tdoc);
    const runCode = await this.checkTransIntegrityInside(
      tdoc, parentTDoc, parentEi);
    if (runCode !== RunCode.success) {
      return runCode;
    }
    this.transStack.pop();

    // propagate integrity status
    if (tdoc === this.tc.mainTrans) {
      tdoc.transItems.forEach(ti => this.propagateItemIntegrity(tdoc, ti));

      console.log('______ With Propagated Errors', this.errorItems);
      this.updateIntegrityUi(tdoc);
    }
    // checkTransIntegrity uses the query work space. Clear it.
    this.qc.clearQDirty();
    if (this.transStack.length === 0) {
      this.qd.core.draw();
    }

    return RunCode.success;
  };

  public checkTableStructIntegrity = async (
    inputDbTable: string,
    parentTDoc: TDoc,
    integrityErrors: string[],
  ): Promise<string[]> =>
    this.checkTableStructIntegrityPrim(inputDbTable, integrityErrors);


  public checkTableStructIntegrityPrim = async (
    inputDbTable: string,
    integrityErrors: string[],
  ): Promise<string[]> => {
    const iodoc = await this.qd.getIoQueryFromName(inputDbTable);
    if (iodoc.id === 0) {
      return [];
    }
    this.dataEng.initDataEngineData();
    this.qc.currQuery = await this.qd.createQDocFromIoObjec(iodoc, false);
    await this.qs.buildQDocument(this.qc.currQuery, true);
    this.qs.updateDataColumnsIntegrity(this.qc.currQuery, integrityErrors);
    return integrityErrors;
  };

  // public getAllFilterParameters = async (
  //   tdoc: TDoc,
  // ): Promise<RunCode> => {
  //   let runCode = RunCode.success;

  //   for (const f of tdoc.filters) {
  //     const fSpec = this.getFilterSpec(f.fc.name);
  //     const [rc, fltr] = await fSpec.handler.paramsToModal(this, f);
  //   };
  //   return runCode;
  // }

  public updateIntegrity = async (): Promise<void> => {
    await this.calculateDependencies(this.tc.mainTrans, false, true);
  };

  // Private methods

  private error = (ec: ErrorCount, newError: string): void => {
    this.runErrors.push(newError);
    ec.errorCount += 1;
  };

  private getFilterSpec = (
    name: string,
  ): FilterSpec => {
    let fSpec = name === TRANSPARAMS
      ? this.tc.transParams
      : this.tc.filterMap.get(name);
    if (!fSpec) {
      fSpec = this.tc.helperMap.get(name);
    }
    return fSpec;
  };

  private runTransInside = async (
    tdoc: TDoc,
    parentTDoc: TDoc,
    parentEi: ExecItem,
    ): Promise<RunCode> => {
    const isMain = tdoc === this.tc.mainTrans;
    const showRun = isMain && this.tc.showRun;
    // load all transformer items

    this.tc.execTrans = tdoc;

    [tdoc.execItems, tdoc.execOrder, tdoc.dataOuts] =
      await this.calculateDependencies(tdoc, true, false);
    // tdoc.endPoints = this.identifyEndpoints(tdoc);

    // execute
    for (let exIx = 0; exIx < tdoc.execItems.length; exIx++) {
      const ei = tdoc.execItems[tdoc.execOrder[exIx]];
      let hasError = false;
      ei.dependsOn.forEach(dix => {
        if (tdoc.execItems[dix].errorCode !== RunCode.success) {
          hasError = true;
        }
      });
      if (hasError) {
        ei.errorCode = RunCode.error;
        // skip rest of execution loop
        continue;
      }
      if (showRun) {
        this.tc.runItem = this.tc.transMgr.getTItem(ei.itemIx);
        this.qd.core.draw();
      }
      const delayPromise = new Promise((resolve) => {
        setTimeout(resolve, this.tc.runItem ? minTransDisplayDelay : 0, 0);
      });
      let runPromise: any;
      if (ei.ttype === 'F' || ei.ttype === 'H') {
        runPromise =
          this.runFilter(tdoc, ei.xdoc as FilterDef, ei, parentTDoc, parentEi);
      } else if (ei.ttype === 'Q') {
        runPromise = this.runQuery(ei.xdoc as QDoc, ei, tdoc);
      } else {
        runPromise = this.runTrans(ei.xdoc as TDoc, tdoc, ei);
      }
      const [runCode, _] = await Promise.all([runPromise, delayPromise]);
      if (this.runErrors.length > 0) {
        this.reformatErrors(tdoc.execItems, tdoc.execOrder, exIx);
        ei.errorCode = RunCode.error;
      }
      this.tc.runItem = undefined;
    }
    // console.log('------------- End Trans Inside');
    this.tc.execTrans = undefined;

    return RunCode.success;
  };

  private reformatErrors = (
    executeItems: ExecItem[],
    executionOrder: number[],
    exIx: number,
  ): void => {
    const eItem = executeItems[executionOrder[exIx]];
    let transItemParent: string;
    if (exIx > 0 && eItem.ttype === 'F') {
      transItemParent = executeItems[executionOrder[exIx - 1]].dbItemName;
    }
    this.runErrors.forEach(re => {
      let transPath = '';
      this.transStack.forEach((t, ix) => {
        if (ix > 0) {
          transPath += '/';
        }
        transPath += t.dbTransName;
      });
      const dbTableName = eItem.outputDbTableName === SKIP
        ? eItem.inputDbTableName
        : eItem.outputDbTableName;
      this.errorItems.push({
        transPath,
        transItemName: eItem.dbItemName,
        transItemParent,
        dbTableName,
        time: uctToLocalDateString(nowString()),
        error: re,
      });
    });
  };

  // private identifyEndpoints = (tdoc: TDoc): number[] => {
  //   const endPoints: number[] = [];
  //   const depChk = new Array(tdoc.execOrder.length).fill(0);
  //   for (let ix = tdoc.execOrder.length; 0 < ix--;) {
  //     const exIx = tdoc.execOrder[ix];
  //     const ei = tdoc.execItems[exIx];
  //     endPoints.push(exIx);
  //     depChk[exIx] = 1;
  //     ei.dependsOn.forEach(dix => {
  //       depChk[dix] = 1;
  //     });
  //     if (depChk.every(e => e > 0)) {
  //       break;
  //     }
  //   }
  //   return endPoints;
  // };

  private getChildrenOfWrk = (
    tdoc: TDoc,
    itemIx: number,
    toArr: number[],
  ): void => {
    const start = toArr.length;
    tdoc.arrows.forEach(a => {
      if (a.fromIx === itemIx) {
        toArr.push(a.toIx);
      }
    });
    const end = toArr.length;
    toArr.slice(start, end).forEach(b => {
      this.getChildrenOfWrk(tdoc, b, toArr);
    });
  };

  private checkTransIntegrityInside = async (
    tdoc: TDoc,
    parentTDoc: TDoc,
    parentEi: ExecItem,
  ): Promise<RunCode> => {
    this.tc.execTrans = tdoc;
    // load all transformer items
    [tdoc.execItems, tdoc.execOrder, tdoc.dataOuts] =
      await this.calculateDependencies(tdoc, false, false);
    // tdoc.endPoints = this.identifyEndpoints(tdoc);
    // execute
    for (let exIx = 0; exIx < tdoc.execItems.length; exIx++) {
      const ei = tdoc.execItems[tdoc.execOrder[exIx]];
      let hasError = false;
      ei.dependsOn.forEach(dix => {
        if (tdoc.execItems[dix].errorCode !== RunCode.success) {
          hasError = true;
        }
      });
      if (hasError) {
        ei.errorCode = RunCode.error;
        // skip rest of execution loop
        continue;
      }
      let runCode: RunCode;
      if (ei.ttype === 'F' || ei.ttype === 'H') {
        runCode = await this.checkTransFilterIntegrity(
          tdoc, ei.xdoc as FilterDef, parentTDoc, ei, parentEi);
      } else if (ei.ttype === 'Q') {
        runCode = await this.checkTransQueryIntegrity(
          ei.xdoc as QDoc, tdoc, ei);
      } else {
        const startLen = this.errorItems.length;
        const itemTdoc = ei.xdoc as TDoc;
        runCode = await this.checkTransIntegrity(itemTdoc, tdoc, ei);
        const endLen = this.errorItems.length;
        const errorCount = endLen - startLen;
        // if (startLen < endLen) {
        //   ei.integrityCode = Integrity.error;
        //   let errorCount = 0;
        //   itemTdoc.execItems.forEach(cei => {
        //     errorCount += cei.integrityErrors.length;
        //   });
        if (errorCount > 0 && errorCount < errorCutOff) {
          ei.integrityCode = Integrity.error;
          itemTdoc.execItems.forEach(cei => {
            if (cei.integrityErrors.length > 0) {
              cei.integrityErrors.forEach(ie => {
                ei.integrityErrors.push(
                  `'${cei.dbItemName}': ${ie}.`
                );
              });
            }
          });
        }
        // }
      }
      if (this.integrityErrors.length > 0) {
        ei.integrityCode = Integrity.error;
        ei.integrityErrors = this.integrityErrors;
        this.reformatIntegrityErrors(tdoc.execItems, tdoc.execOrder, exIx);
      }
    }
    // console.log('------------- End Trans Inside');
    this.tc.execTrans = undefined;
    return RunCode.success;
  };

  private checkTransQueryIntegrity = async (
    qdoc: QDoc,
    parentTDoc: TDoc,
    ei: ExecItem,
  ): Promise<RunCode> => {
    const runCode = RunCode.success;
    // const hasIntegrityError =
    this.qs.updateQDocIntegrity(qdoc, this.integrityErrors);
    // if (hasIntegrityError && this.tc.mainTrans === parentTDoc) {
    //   this.ts.updateUiItemIntegrity(ei.itemIx, Integrity.error);
    // }
    return runCode;
  };

  private checkTransFilterIntegrity = async (
    tdoc: TDoc,
    filter: FilterDef,
    parentTDoc: TDoc,
    ei: ExecItem,
    parentEi: ExecItem,
  ): Promise<RunCode> => {
    const fSpec = this.getFilterSpec(filter.fc.name);
    const [runCode, integrityErrors] = await fSpec.handler.checkIntegrity(
      this,
      filter,
      parentTDoc,
      ei,
    );
    if (integrityErrors.length > 0) {
      this.integrityErrors.push(...integrityErrors);
    }
    return runCode;
  };

  private reformatIntegrityErrors = (
    executeItems: ExecItem[],
    executionOrder: number[],
    exIx: number,
  ): void => {
    const eItem = executeItems[executionOrder[exIx]];
    let transItemParent: string;
    if (exIx > 0 &&
      (eItem.ttype === 'F' || eItem.ttype === 'H' || eItem.ttype === 'Q')) {
      transItemParent = executeItems[executionOrder[exIx - 1]].dbItemName;
    }
    this.integrityErrors.forEach(ie => {
      let transPath = '';
      this.transStack.forEach((t, ix) => {
        if (ix > 0) {
          transPath += '/';
        }
        transPath += t.dbTransName;
      });
      const dbTableName = eItem.outputDbTableName === SKIP
        ? eItem.inputDbTableName
        : eItem.outputDbTableName;
      this.errorItems.push({
        transPath,
        transItemName: eItem.dbItemName,
        transItemParent,
        dbTableName,
        time: uctToLocalDateString(nowString()),
        error: ie,
      });
    });
    this.integrityErrors = [];
  };

}
