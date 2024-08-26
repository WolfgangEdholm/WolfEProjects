
import { RunCode } from '../types/trans';
import { Filter } from './filter';
import { FilterFunc, FilterRequest, FilterDef, FilterParamType,
  RunFilterDef, FilterTablePicker, IN_ARROW/*, OUT_ARROW*/,
} from '../types/filter';
import { isNumeric } from '../utils/string-to-num';
import { DataEngService, DataColumnDef, ComputedColumnDef,
} from '../api/data-eng.service';
import { Value, ValueType, Val, dbTypeToValueType } from '../types/compute';
import { TransEngService } from '../api/trans-eng.service';
import { columnDefIsNullAllowed, Table } from '../types/db';
import { valueTypeToStrJS, dbDataTypeToStrJS } from '../types/compute';

const MATCHTABLE = 'matchTable';
const MATCHCOLUMN = 'matchColumn';
const CHECKEDCOLUMN = 'checkedColumn';

const matchTableFIx = 0;
const matchColumnFIx = 1;
const checkedColumnFIx = 2;

export class IncludeFilter extends Filter {
  matchData: any[];
  matchTableInfo: Table;
  matchTypes: ValueType[];
  matchArr: any[];

  invert = false;

  constructor() {
    super();
  }

  public paramsDefault = async (
    itemIx: number
  ): Promise<[RunCode, FilterDef]> => {

    const filterDef: FilterDef = {
      fc: {
        name: 'include',
        itemIx,
        dfltDisplayName: 'Include',
        displayName: '',
        inputDbTableLabel: 'Source Table Name',
        inputDbTable: IN_ARROW,
        inputDbTablePicker: FilterTablePicker.allIn,
        outputDbTableLabel: '',
        outputDbTable: 'Result1',
        hideIsTemporary: false,
        isTemporary: false,
        canInheritErrors: true,
        changeDate: undefined,
        fixDate: undefined,
      },
      params: [{
        displayName: 'Table with include values',
        name: MATCHTABLE,
        tp: FilterParamType.tablePicker,
        value: 'matchTable',
        placeholder: 'TableName',
      }, {
        displayName: 'Column with include values',
        name: MATCHCOLUMN,
        tp: FilterParamType.str,
        value: 'columnName',
        placeholder: 'Column name or 0 based column number',
      }, {
        displayName: 'Column with values to be checked',
        name: CHECKEDCOLUMN,
        tp: FilterParamType.str,
        value: 'columnName',
        placeholder: 'column name or 0 based column number',
      }],
    };

    return [RunCode.success, filterDef];
  };

  public paramsFromModal = async (
    te: TransEngService,
    runFilter: RunFilterDef
  ): Promise<[RunCode, RunFilterDef]> => {
    runFilter.rParams.forEach(p => {
      if (p.fp.name === MATCHCOLUMN || p.fp.name === CHECKEDCOLUMN) {
        const value = p.fp.value;
        const num = (isNumeric(value)) ? Number(value) : undefined;
        if (num < 0) {
          p.error = 'column number must be larger than -1';
        } else {
          p.error = undefined;
        }
      }
    });
    return [RunCode.success, runFilter];
  };

  public getSupportingData = async (
    te: TransEngService,
    def: FilterDef,
  ): Promise<[RunCode, string[]]> => {
    let runCode: RunCode;
    const matchTable = def.params[matchTableFIx].value.trim();
    [runCode, this.matchData, this.matchTableInfo] = await
      te.readSupportTable(matchTable);
    const errors = [];
    if (runCode !== RunCode.success) {
      errors.push(`Error reading match table '${matchTable}'`);
    } else {
      this.matchTypes =
        this.matchTableInfo.columns.map(c => dbTypeToValueType(c.type));
    }
    return [runCode, errors];
  };

  public editData = async (
    te: TransEngService,
    def: FilterDef,
  ): Promise<[RunCode, string[]]> => {
    const de = te.dataEng;
    const errors: string[] = [];
    let errorCount = 0;

    const matchTable: string = def.params[matchTableFIx].value.trim();
    const matchColumn: string = def.params[matchColumnFIx].value.trim();
    const matchColumnField = def.params[matchColumnFIx].displayName;
    let matchColIx = -1;

    if (isNumeric(matchColumn)) {
      const num = Number(matchColumn);
      if (num < 0 || num >= de.dataColumnDefs.length) {
        errors.push(`Parameter '${matchColumnField}'s input '${
          num}' is out of bounds.`);
        errorCount += 1;
      } else {
        matchColIx = num;
      }
    } else {
      matchColIx = de.dataColumnDefs.findIndex(dc =>
        dc.displayName === matchColumn);
      if (matchColIx === -1) {
        errors.push(`Parameter '${matchColumnField}'s input '${matchColumn
          }' matches no column.`);
        errorCount += 1;
      }
    }

    const checkedColumn: string = def.params[checkedColumnFIx].value.trim();
    const checkedColumnField = def.params[checkedColumnFIx].displayName;

    let checkedColIx = -1;

    if (isNumeric(checkedColumn)) {
      const num = Number(checkedColumn);
      if (num < 0 || num >= de.dataColumnDefs.length) {
        errors.push(`Parameter '${checkedColumnField}'s input '${num
          }' is out of bounds.`);
        errorCount += 1;
      } else {
        checkedColIx = num;
      }
    } else {
      checkedColIx = de.dataColumnDefs.findIndex(dc =>
        dc.displayName === checkedColumn);
      if (checkedColIx === -1) {
        errors.push(`Parameter '${checkedColumnField}'s input '${checkedColumn
          }' matches no column.`);
        errorCount += 1;
      }
    }

    if (matchColIx > -1 && checkedColIx > -1) {
      if (this.matchTypes[matchColIx] !==
        de.dataColumnDefs[checkedColIx].type) {
        const matchTp = valueTypeToStrJS(this.matchTypes[matchColIx]);
        const checkedTp =
          valueTypeToStrJS(de.dataColumnDefs[checkedColIx].type);
        errors.push(`Column '${matchColumnField}'s type '${matchTp
          }' is not compatible with match column '${matchColumnField
          }'s' type '${checkedTp}'.`);
        errorCount += 1;
      }
    }

    if (errorCount > 0) {
      return [RunCode.error, errors];
    }

    let filteredData: any[];
    if (this.matchTypes[matchColIx] === ValueType.str) {
      // add temporary column to checked dtable
      const newCheckedIx = de.compColumnDefs.length;
      const newColName = `capitalized_${
        de.dataColumnDefs[checkedColIx].displayName}`;
      const computed = de.addComputedColumn(newColName, false);
      computed.type = ValueType.str;
      de.checkAllocatedComputeSpace();
      // capitalize checkedCol in new col
      const cName = de.dataColumnDefs[checkedColIx].sourceName;
      const compCol = de.computedColumns[newCheckedIx];
      de.dataRows.forEach((row, rowIx) => {
        const stringVal = row[cName] as string;
        const compCell = compCol[rowIx];
        compCell.val = stringVal.toUpperCase();
        compCell.type = ValueType.str;
      });
      // capitalize match column in matchtable
      const mName = this.matchTableInfo.columns[matchColIx].columnName;
      this.matchArr = [];
      this.matchData.forEach(row => {
        const stringVal = row[mName] as string;
        this.matchArr.push(stringVal.toUpperCase());
      });
      // enable subclassing here
      filteredData = de.dataRows.filter((v, ix) => {
        const matched = this.matchArr.includes(compCol[ix].val);
        return  this.invert ? !matched : matched;
      });
    } else {
      const mName = this.matchTableInfo.columns[matchColIx].columnName;
      this.matchArr = [];
      this.matchData.forEach(row => {
        const val = row[mName];
        this.matchArr.push(val);
      });
      const cName = de.dataColumnDefs[checkedColIx].sourceName;
      // enable subclassing here
      filteredData = de.dataRows.filter((v, ix) => {
        const matched = this.matchArr.includes(v[cName]);
        return this.invert ? !matched : matched;
      });
    }
    de.dataRows = filteredData;
    de.sortDataRows = Array.from(Array(filteredData.length).keys());

    return [RunCode.success, errors];
  };
}
