
import { RunCode } from '../types/trans';
import { Filter } from './filter';
import { FilterFunc, FilterRequest, FilterDef, FilterParamType,
  RunFilterDef, FilterTablePicker, IN_ARROW,
} from '../types/filter';
import { isNumeric } from '../utils/string-to-num';
import { DataEngService, DataColumnDef, ComputedColumnDef,
} from '../api/data-eng.service';
import { Value, ValueType, Val, dbTypeToValueType } from '../types/compute';
import { TransEngService } from '../api/trans-eng.service';


export class CapitalizeFilter extends Filter {

  constructor() {
    super();
  }

  public paramsDefault = async (
    itemIx: number
  ): Promise<[RunCode, FilterDef]> => {

    const filterDef: FilterDef = {
      fc: {
        name: 'capitalize',
        itemIx,
        dfltDisplayName: 'Capitalize',
        displayName: '',
        inputDbTableLabel: '',
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
        displayName: 'Add New Columns',
        name: 'addCols',
        tp: FilterParamType.bool,
        value: false,
        placeholder: '',
      }, {
        displayName: 'Columns(s)',
        name: 'colSpec',
        tp: FilterParamType.str,
        value: 'all',
        placeholder: '0, 1, all, all including dates',
      }],
    };

    return [RunCode.success, filterDef];
  };

  public paramsFromModal = async (
    te: TransEngService,
    runFilter: RunFilterDef
  ): Promise<[RunCode, RunFilterDef]> => {
    runFilter.rParams.forEach(p => {
      if (p.fp.name === 'colSpec') {
        const value = p.fp.value;
        // if (value === 'all')
        // if (value === 'all including dates')
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

  public editData = async (
    te: TransEngService,
    def: FilterDef,
  ): Promise<[RunCode, string[]]> => {
    const de = te.dataEng;
    const errors: string[] = [];
    let errorCount = 0;
    const workIxs: number[] = [];
    const addCols: boolean = def.params[0].value;
    const paramIx = 1;
    const colSpec = def.params[1].value.trim();
    const aggCode = (colSpec === 'all' ? 1 : 0) +
      (colSpec === 'all including dates' ? 2 : 0);
    if (aggCode) {
      de.dataColumnDefs.forEach((dc, ix) => {
        if (dc.type === ValueType.str) {
          workIxs.push(ix);
        }
      });
    } else {
      const pars: string[] = colSpec.split(',');
      pars.forEach(p => {
        const par = p.trim();
        if (isNumeric(par)) {
          const num = Number(par);
          if (num < 0 || num >= de.dataColumnDefs.length) {
            errors.push(`Parameter '${def.params[paramIx].displayName
              }'s input '${num}' is out of bounds.`);
            errorCount += 1;
          } else if (de.dataColumnDefs[num].type !== ValueType.str) {
            errors.push(`Parameter '${def.params[paramIx].displayName
            }'s input '${num}' is not a string column.`);
          } else {
            workIxs.push(num);
          }
        } else {
          let trimmed = par;
          if ((par[0] === `'` && par[par.length - 1] === `'`)
            || (par[0] === `"` && par[par.length - 1] === `"`)) {
            trimmed = par.slice(1, -1);
          }
          const ix = de.dataColumnDefs.findIndex(dc =>
            dc.displayName === trimmed);
          if (ix === -1) {
            errors.push(`Parameter '${def.params[paramIx].displayName
              }'s input '${trimmed}' matches no column.`);
            errorCount += 1;
          } else if (de.dataColumnDefs[ix].type !== ValueType.str) {
            errors.push(`Parameter '${def.params[paramIx].displayName
              }'s input '${trimmed}' is not a string column.`);
            errorCount += 1;
          } else {
            workIxs.push(ix);
          }
        }
      });
    }
    if (errorCount > 0) {
      return [RunCode.error, errors];
    }

    if (addCols) {
      const computedStart = de.compColumnDefs.length;
      workIxs.forEach(ix => {
        const newColName = `capitalized_${de.dataColumnDefs[ix].displayName}`;
        const computed = de.addComputedColumn(newColName, true);
        computed.type = ValueType.str;
      });
      de.checkAllocatedComputeSpace();
      workIxs.forEach((colIx, i) => {
        const name = de.dataColumnDefs[colIx].sourceName;
        const compCol = de.computedColumns[computedStart + i];
        de.dataRows.forEach((row, rowIx) => {
          const stringVal = row[name] as string;
          const compCell = compCol[rowIx];
          compCell.val = stringVal.toUpperCase();
          compCell.type = ValueType.str;
        });
      });
    } else {
      de.dataRows.forEach((row, rowIx) => {
        workIxs.forEach(colIx => {
          const name = de.dataColumnDefs[colIx].sourceName;
          const stringVal = row[name] as string;
          row[name] = stringVal.toUpperCase();
        });
      });
    }

    return [RunCode.success, errors];
  };

}
