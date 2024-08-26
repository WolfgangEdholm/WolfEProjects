
import { RunCode } from '../types/trans';
import { Filter } from './filter';
import { TransEngService } from '../api/trans-eng.service';
import { DataEngService, DataColumnDef, ComputedColumnDef,
} from '../api/data-eng.service';
import { FilterSpec, FilterDef, FilterTablePicker, IN_ARROW, SAME_AS_SOURCE,
} from '../types/filter';


export class DataOutFilter extends Filter {

  constructor() {
    super();
  }

  public paramsDefault = async (
    itemIx: number
  ): Promise<[RunCode, FilterDef]> => {
    const filterDef: FilterDef = {
      fc: {
        name: 'dataOut',
        itemIx,
        dfltDisplayName: 'Data Out',
        displayName: '',
        inputDbTableLabel: 'Source Table Name',
        inputDbTable: IN_ARROW,
        inputDbTablePicker: FilterTablePicker.allIn,
        outputDbTableLabel: 'Output Table Name',
        outputDbTable: SAME_AS_SOURCE,
        hideIsTemporary: false,
        isTemporary: false,
        canInheritErrors: true,
        changeDate: undefined,
        fixDate: undefined,
      },
      params: [],
    };
    return [RunCode.success, filterDef];
  };

  public preExecute = async (
    te: TransEngService,
    filter: FilterDef,
    inputDbTable: string,
  ): Promise<[RunCode, string[]]> => {
    if (filter.fc.inputDbTable === IN_ARROW) {
      // the transfordmer logic assumes that output files are hard coded
      filter.fc.inputDbTable = inputDbTable;
    }
    if (inputDbTable === filter.fc.inputDbTable) {
      return [RunCode.successRunIsDone, []];
    }
    return [RunCode.success, []];
  };

}
