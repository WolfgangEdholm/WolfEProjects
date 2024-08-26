
import { RunCode } from '../types/trans';
import { Filter } from './filter';
import { FilterDef, FilterParamType, RunFilterDef, FilterTablePicker,
  IN_ARROW, DONT_ERASE_TEMPS, DONT_ERASE_TEMPS_PRETTY, TRANSPARAMS,
  SAME_AS_SOURCE, SAME_AS_SOURCE_PRETTY,
} from '../types/filter';
import { TransEngService } from '../api/trans-eng.service';


export class TransParamsFilter extends Filter {

  constructor() {
    super();
  }

  public paramsDefault = async (
    itemIx: number
  ): Promise<[RunCode, FilterDef]> => {
    const filterDef: FilterDef = {
      fc: {
        name: TRANSPARAMS,
        itemIx,
        dfltDisplayName: 'Parameters',
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
      params: [{
        displayName: DONT_ERASE_TEMPS_PRETTY,
        name: DONT_ERASE_TEMPS,
        tp: FilterParamType.bool,
        value: false,
        placeholder: '',
      }],
    };
    return [RunCode.success, filterDef];
  };

  public paramsFromModal = async (
    te: TransEngService,
    runFilter: RunFilterDef
  ): Promise<[RunCode, RunFilterDef]> => {
    runFilter.rParams.forEach(p => {
      if (p.fp.name === DONT_ERASE_TEMPS) {
      }
    });
    return [RunCode.success, runFilter];
  };

}
