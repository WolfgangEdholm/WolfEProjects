
import { RunCode, TDoc, ExecItem } from '../types/trans';
import { FilterFunc, FilterRequest, FilterDef, FilterParamType,
  RunFilterDef, FilterTablePicker, IN_ARROW,
} from '../types/filter';
import { TransEngService } from '../api/trans-eng.service';
import { FormGroup } from '@angular/forms';
import { ButtonClickData } from '../filter-params/filter-params.component';


export class Filter {
  ixColNum: number;
  constructor() {}

  public paramsDefault = async (
    itemIx: number
  ): Promise<[RunCode, FilterDef]> => {
    const filterDef: FilterDef = {
      fc: {
        name: 'filter',
        itemIx,
        dfltDisplayName: 'Display name',
        displayName: 'Actual display name',
        inputDbTableLabel: '',
        inputDbTable: 'Input table name',
        inputDbTablePicker: FilterTablePicker.tables,
        outputDbTableLabel: '',
        outputDbTable: 'Output table name',
        hideIsTemporary: false,
        isTemporary: false,
        canInheritErrors: true,
        changeDate: undefined,
        fixDate: undefined,
      },
      params: [{
        displayName: 'Filter parameter 1',
        name: 'param1',
        tp: FilterParamType.bool,
        value: true,
        placeholder: '',
      }],
    };
    return [RunCode.success, filterDef];
  };

  public paramsToModal = async (
    te: TransEngService,
    filterIn: FilterDef,
  ): Promise<[RunCode, FilterDef]> => {
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

    return [runCode, filterOut];
  };

  // // created to work around the problem that async methods can't be called
  // // using super
  // public superParamsToModal = async (
  //   te: TransEngService,
  //   filterIn: FilterDef,
  // ): Promise<[RunCode, FilterDef]> => {
  //   return this.paramsToModal(te, filterIn);
  // }

  public buttonClick = async (
    te: TransEngService,
    runFilter: RunFilterDef,
    form: FormGroup,
    data: ButtonClickData,
  ): Promise<[RunCode, ButtonClickData]> =>
    [RunCode.success, data];

  public paramsFromModal = async (
    te: TransEngService,
    runFilter: RunFilterDef,
  ): Promise<[RunCode, RunFilterDef]> =>
    [RunCode.success, runFilter];

  public checkIntegrity = async (
    te: TransEngService,
    filter: FilterDef,
    parentTDoc: TDoc,
    ei: ExecItem,
  ): Promise<[RunCode, string[]]> => {
    let integrityErrors: string[] = [];

    const inputDbTable = filter.fc.inputDbTable;
    if (inputDbTable && inputDbTable !== IN_ARROW) {
      integrityErrors = await te.checkTableStructIntegrity(
        inputDbTable, parentTDoc, integrityErrors);
    }
    // don't know if I need to communicate result
    return [RunCode.success, integrityErrors];
  };

  public preExecute = async (
    te: TransEngService,
    filter: FilterDef,
    dbTableName: string,
  ): Promise<[RunCode, string[]]> =>
    [RunCode.success, []];

  public getSupportingData = async (
    te: TransEngService,
    def: FilterDef,
  ): Promise<[RunCode, string[]]> =>
    [RunCode.success, []];

  public editData = async (
    te: TransEngService,
    def: FilterDef,
  ): Promise<[RunCode, string[]]> =>
    [RunCode.success, []];

}
