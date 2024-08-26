
import { RunCode } from '../types/trans';
import { Filter } from './filter';
import { FilterDef, FilterParamType, RunFilterDef, FilterTablePicker,
  IN_ARROW, SAME_AS_SOURCE,
} from '../types/filter';
import { TransEngService } from '../api/trans-eng.service';


export class DataInFilter extends Filter {

  constructor() {
    super();
  }

  public paramsDefault = async (
    itemIx: number
  ): Promise<[RunCode, FilterDef]> => {

    const filterDef: FilterDef = {
      fc: {
        name: 'dataIn',
        // name: DATAIN,
        itemIx,
        dfltDisplayName: 'Data In',
        displayName: '',
        inputDbTableLabel: 'Source Table Name',
        inputDbTable: IN_ARROW,
        inputDbTablePicker: FilterTablePicker.allIn,
        outputDbTableLabel: 'Output Table Name',
        outputDbTable: SAME_AS_SOURCE,
        hideIsTemporary: true,
        isTemporary: false,
        canInheritErrors: true,
        changeDate: undefined,
        fixDate: undefined,
      },
      params: [],
    };

    return [RunCode.success, filterDef];
  };

}
