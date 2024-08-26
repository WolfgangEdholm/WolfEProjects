
import { RunCode, TDoc, ExecItem } from '../types/trans';
import { Filter } from './filter';
import { FilterFunc, FilterRequest, FilterDef, FilterParamType,
  RunFilterDef, FilterTablePicker, SKIP, IN_ARROW,
} from '../types/filter';
import { isNumeric } from '../utils/string-to-num';
import { DataEngService, DataColumnDef, ComputedColumnDef,
} from '../api/data-eng.service';
import { Value, ValueType, Val, dbTypeToValueType } from '../types/compute';
import { TransEngService } from '../api/trans-eng.service';
import { columnDefIsNullAllowed, Table } from '../types/db';
import { valueTypeToStrJS, dbDataTypeToStrJS } from '../types/compute';
import { FormGroup } from '@angular/forms';
import { ButtonClickData, DisplayList,
} from '../filter-params/filter-params.component';
import * as Modal from '../services/modal.service';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';


const OUT_OF_SYNC_ACTION = 'outOfSyncAction';
const TABLE_COLUMNS = 'tableColumns';
const TAKE_SNAPSHOT = 'takeSnapshot';

const SNAPSHOT = 'Snapshot';

const outOfSyncActionFIx = 0;
const tableColumnsFIx = 1;
const loadTableInfoFIx = 2;

export class VerifyFilter extends Filter {
  tableSnapShot: Table;

  stopIfError: boolean;

  constructor(
    public modal: Modal.ModalService,
  ) {
    super();
  }

  public paramsDefault = async (
    itemIx: number
  ): Promise<[RunCode, FilterDef]> => {
    const filterDef: FilterDef = {
      fc: {
        name: 'verify',
        itemIx,
        dfltDisplayName: 'Verify',
        displayName: '',
        inputDbTableLabel: 'Table to verify',
        inputDbTable: '',
        inputDbTablePicker: FilterTablePicker.tablesIn,
        outputDbTableLabel: SKIP,
        outputDbTable: SKIP,
        hideIsTemporary: true,
        isTemporary: false,
        canInheritErrors: false,
        changeDate: undefined,
        fixDate: undefined,
      },
      params: [{
        displayName: 'Action when out of sync',
        name: OUT_OF_SYNC_ACTION,
        tp: FilterParamType.strDropdown,
        value: 'Continue with warning',
        placeholder: [  // For a stringDropdown: option values
          'Continue with warning',
          'Stop with error',
        ],
      }, {
        displayName: SNAPSHOT,
        name: TABLE_COLUMNS,
        tp: FilterParamType.displayList,
        value: [],
        placeholder: '!!db.tableName!!',  // edited to see where it shows up
      }, {
        displayName: 'Take Table Snapshot',
        name: TAKE_SNAPSHOT,
        tp: FilterParamType.button,
        value: TABLE_COLUMNS,
        placeholder: '',
      // }, {
      //   displayName: 'button 2',
      //   name: LOADTABLEINFO,
      //   tp: FilterParamType.button,
      //   value: '',
      //   placeholder: '',
      }],
    };

    return [RunCode.success, filterDef];
  };

  public paramsToModal = async (
    te: TransEngService,
    filterIn: FilterDef,
  ): Promise<[RunCode, FilterDef]> => {
    // copy of filter.paramsToModal
    // can't call async fucntion using super

    const [runCode, filterOut] = await this.paramsDefault(filterIn.fc.itemIx);

    filterOut.fc.changeDate = filterIn.fc.changeDate;
    filterOut.fc.fixDate = filterIn.fc.fixDate;
    filterOut.fc.displayName = filterIn.fc.displayName;
    filterOut.fc.inputDbTable = filterIn.fc.inputDbTable;
    filterOut.fc.outputDbTable = filterIn.fc.outputDbTable;
    filterOut.fc.isTemporary = filterIn.fc.isTemporary;

    filterIn.params.forEach((p, ix) => {
      filterOut.params[ix].value = p.value;
    });
    // end of filter.paramsToModal

    if (filterOut.fc.inputDbTable) {
      filterOut.params[tableColumnsFIx].displayName =
        `${SNAPSHOT} ${filterOut.fc.inputDbTable}`;
    }

    return [runCode, filterOut];
  };

  public buttonClick = async (
    te: TransEngService,
    runFilter: RunFilterDef,
    form: FormGroup,
    data: ButtonClickData,
  ): Promise<[RunCode, ButtonClickData]> => {
    const dbTableName = te.dataEng.checkDbTableName(runFilter.fc.inputDbTable);
    let runCode: RunCode;
    [runCode, this.tableSnapShot] =
      await te.dbEng.getTableInfo(dbTableName, true);
    if (runCode !== RunCode.success) {
      if (dbTableName.trim() === '') {
        data.errorMsg = `Table not specified`;
      } else {
        data.errorMsg = `Error reading '${dbTableName}'.`;
      }
      return [runCode, data];
    }
    const list: string[] = [];
    this.tableSnapShot.columns.forEach(c => {
      list.push(`${c.columnName} - ${c.type}`);
    });
    runFilter.rParams[tableColumnsFIx].fp.value = list;
    data.paramIx = 0;
    data.header = `${SNAPSHOT} of '${dbTableName}'`;
    data.data = list;
    data.dataType = FilterParamType.displayList;
    return [RunCode.success, data];
  };

  public paramsFromModal = async (
    te: TransEngService,
    runFilter: RunFilterDef
  ): Promise<[RunCode, RunFilterDef]> => {
    if (runFilter.rParams[tableColumnsFIx].fp.value.length === 0) {
      const modalRet: Modal.CodeReturn = await this.modal.confirm({
        title: 'OK to exit without a table snapshot?',
        message: '',
        okButton: 'OK',
        cancelButton: 'Cancel',
      });
      if (modalRet.code === Modal.ReturnCode.cancel) {
        return [RunCode.error, runFilter];
      }
    }
    return [RunCode.success, runFilter];
  };

  public checkIntegrity = async (
    te: TransEngService,
    filter: FilterDef,
    parentTDoc: TDoc,
    ei: ExecItem,
  ): Promise<[RunCode, string[]]> => {
    let runCode: number;
    let integrityErrors: string[];

    let dbTableName = filter.fc.inputDbTable;
    if (dbTableName) {
      dbTableName = dbTableName.trim();
    }
    if (dbTableName) {
      [runCode, integrityErrors] =
        await this.preExecute(te, filter, dbTableName);
    } else {
      runCode = RunCode.error;
      integrityErrors = ['Table name not spacified.'];
    }
    return [runCode, integrityErrors];
  };

  public preExecute = async (
    te: TransEngService,
    filter: FilterDef,
    dbTableName: string,
  ): Promise<[RunCode, string[]]> => {
    let runCode: RunCode;
    let currTable: Table;
    // eslint-disable-next-line prefer-const
    [runCode, currTable] = await te.dbEng.getTableInfo(dbTableName, true);
    const errors: string[] = [];
    errors.push(`Verification of table '${dbTableName}' foud integrity error:`);
    if (runCode !== RunCode.success) {
      errors.push(`Error reading '${dbTableName}'.`);
      runCode = this.stopIfError ? RunCode.errorForceStop : RunCode.error;
      return [runCode, errors];
    }
    const currColumnList: string[] = [];
    currTable.columns.forEach(c => {
      currColumnList.push(`${c.columnName} - ${c.type}`);
    });
    const snapShotList = filter.params[tableColumnsFIx].value;
    snapShotList.forEach((c: string, ix: number) => {
      if (c !== currColumnList[ix]) {
        errors.push(`Table '${dbTableName}' column ${ix}: '${currColumnList[ix]
          }' used to be '${c}'.`);
      }
    });
    const colStr = Math.abs(snapShotList.length - currColumnList.length) === 1
      ? 'column'
      : 'columns';
    if (snapShotList.length > currColumnList.length) {
      errors.push(`The current version of table '${dbTableName}' lost ${
        snapShotList.length - currColumnList.length} ${colStr}.`);
    }
    if (snapShotList.length < currColumnList.length) {
      errors.push(`The current version of table '${dbTableName}' added ${
        currColumnList.length - snapShotList.length} ${colStr}.`);
    }
    if (errors.length === 1) {
      // no error
      errors.pop();
    }
    runCode = errors.length === 0 ? RunCode.successRunIsDone
      : this.stopIfError ? RunCode.errorForceStop
      : RunCode.error;

    return [runCode, errors];
  };
}
