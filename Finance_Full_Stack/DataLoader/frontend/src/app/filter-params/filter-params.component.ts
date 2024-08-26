import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { map, startWith } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog,
 } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as Modal from '../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS
} from '@angular/material/form-field';
import { DataEngService, Integrity } from '../api/data-eng.service';
import { DataIntegrityService } from '../api/data-integrity.service';
import { QDoc } from '../types/query';
import { ContextService } from '../core/context.service';
import { Md2Service, Md2Params } from '../md2/md2.service';
import { TransCoreService } from '../core/trans-core.service';
import { TransService } from '../cmd/trans.service';
import { TransEngService } from '../api/trans-eng.service';
import { FilterSpec, FilterFunc, FilterDef, RunFilterDef, FilterRequest,
  RunFilterParam, FilterParamType, filterFormValue, FilterTablePicker,
  SKIP, IN_ARROW, IN_ARROW_PRETTY, SAME_AS_SOURCE, SAME_AS_SOURCE_PRETTY,
} from '../types/filter';
import { nowString } from '../utils/date';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TRANSPARAMS } from '../types/filter';
import { TransItemType, RunCode, TDoc, ExecItem, } from '../types/trans';
import { TablePickerMd2Component, TablePickerMd2Spec,
} from '../md2/table-picker/table-picker.component';
import { DbEngService } from '../api/db-eng.service';
import { RepoService } from '../api/repo.service';
import { Database, Table } from '../types/db';
import { TDocService } from '../api/tdoc.service';


// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export type FilterParamsSpec = {
  tdoc: TDoc;
  filterType: TransItemType;
  filterName: string;
  transItemIx: number;        // position in transItem array
  filterIx: number;           // position in filter array
  transName: string;
};

export type FilterParamsFormElements = {
  addNewColumns: any;
  columnSpec: any;
  inputDbTableName: any;
  outputDbTableName: any;
  isOutputTemporary: any;
};

export type ButtonClickData = {
  buttonIx: number;
  paramIx: number;
  errorMsg: string;
  header: string;
  data: any;
  dataType: FilterParamType;
};

export type DisplayList = {
  items: string[];
};

const appearance: MatFormFieldDefaultOptions = {
  // appearance: 'legacy'
  appearance: 'standard'
  // appearance: 'fill'
  // appearance: 'outline'
};

@Component({
  selector: 'app-filter-params',
  templateUrl: './filter-params.component.html',
  styleUrls: ['./filter-params.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
  providers: [{
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }],
})
export class FilterParamsComponent implements OnInit, OnDestroy {
  initialized = false;
  form: FormGroup;
  subscriptions = new Subscription();

  columnSpecError = '';
  outputDbTableNameError = '';

  fSpec: FilterSpec;
  rFilter: RunFilterDef;

  isTP: boolean;

  title: string;
  displayName: string;
  isTemporary: boolean;
  downstreamChanges = false;

  inputDbTableLabel: string;

  useInputDbTablePicker: boolean;
  inputDbTablePicker: FilterTablePicker;
  inputDbTableType: string;
  inputDbTableDatabaseControl: string;
  isInputTableArrowOk = false;

  allDbNames: string[] = [];
  currDb: string = this.dbEng.currDatabase;
  allTableNames: string[] = [];

  skipOutputDbTable: boolean;
  outputDbTableLabel: string;

  isTemporaryLabel: string;
  hideIsTemporary: boolean;
  hasFixUpstream: boolean;

  fixUpstreamChanges = false;

  buttons: string[] = [];
  buttonLabels: string[] = [];
  buttonErrors: string[] = [];
  buttonToParamIx: number[] = [];

  listHeaders: string[] = [];
  listHeaderTables: string[] = [];
  lists: DisplayList[] = [];
  listLabels: string[] = [];
  listToParamIx: number[] = [];

  paramHeaders: string[] = [];
  paramTableNames: string[][] = [];

  displayNameError: string;
  inputDbTableError: string;
  outputDbTableError: string;

  execItem: ExecItem;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  DISPLAYNAME = 'displayName';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  INPUTTABLE = 'inputTable';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  OUTPUTTABLE = 'outputTable';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ISTEMPORARY = 'isTemporary';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DOWNSTREAMCHANGES = 'downstreamChanges';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FIXUPSTREAMCHANGES = 'fixUpstreamChanges';

  constructor(
    private formBuilder: FormBuilder,
    private modalRef: MatDialogRef<FilterParamsSpec>,
    private repo: RepoService,
    private dbEng: DbEngService,
    private dataEng: DataEngService,
    @Inject(MAT_DIALOG_DATA) public data: FilterParamsSpec,
    public md2: Md2Service,
    public tc: TransCoreService,
    public td: TDocService,
    public ts: TransService,
    public te: TransEngService,
    public de: DataEngService,
  ) {
    this.changeDatabase(this.dbEng.currDatabase, false);
    this.inputDbTableDatabaseControl = this.INPUTTABLE + 'Database';
  }

  public async ngOnInit(): Promise<void> {
    console.log('FILTER MODAL', this.data, this.tc.mainTrans);
    this.td.copyMainFiltersToTrans(this.tc.mainTrans);
    this.isTP = this.data.filterName === TRANSPARAMS;
    let runCode: number;
    let filter: FilterDef;
    this.fSpec = this.isTP
      ? this.tc.transParams
      : this.data.filterType === 'F'
        ? this.tc.filterMap.get(this.data.filterName)
        : this.tc.helperMap.get(this.data.filterName);
    if (!this.tc.mainFilters[this.data.filterIx]?.def?.params) {
      [runCode, filter] = await this.fSpec.handler.paramsDefault(
        this.data.transItemIx);
    } else {
      [runCode, filter] = await this.fSpec.handler.paramsToModal(
        this.te, this.tc.mainFilters[this.data.filterIx].def);
    }

    const tdoc = this.data.tdoc;
    if (!tdoc.execItems || tdoc.execItems.length === 0) {
      [tdoc.execItems, tdoc.execOrder, tdoc.dataOuts] =
        await this.te.calculateDependencies(tdoc, false, true);
    }
    this.execItem = tdoc.execItems[this.data.transItemIx];

    const tablePicker = filter.fc.inputDbTablePicker;
    this.allDbNames = [];
    if (tablePicker === FilterTablePicker.allIn
      || tablePicker === FilterTablePicker.tablesIn
    ) {
      this.isInputTableArrowOk = true;
      this.allDbNames.push(IN_ARROW_PRETTY);
    }
    this.allDbNames.push(...await this.dbEng.getNonSystemDatabases());

    this.displayName = filter.fc.displayName
      ? filter.fc.displayName
      : filter.fc.dfltDisplayName;
    this.title = this.isTP
      ? this.data.transName + ' Parameters'
      : this.displayName + ' Filter';
    // const displayName = filter.fc.displayName !== ''
    //   ? filter.fc.displayName
    //   : filter.fc.dfltDisplayName;
    this.inputDbTableLabel = filter.fc.inputDbTableLabel
      ? filter.fc.inputDbTableLabel
      : 'Input table name';

    const tableType = (
      tablePicker === FilterTablePicker.tables
      // || tablePicker === FilterTablePicker.tablesReadOnly
    ) ? 'Table'
      : (
        tablePicker === FilterTablePicker.queries
      ) ? 'Query'
      : (
        tablePicker === FilterTablePicker.transformers
      ) ? 'Transformers'
        : (
          tablePicker === FilterTablePicker.tablesAndQueries
        ) ? 'Table or Query'
          : (
            tablePicker === FilterTablePicker.allIn
            // || tablePicker === FilterTablePicker.all
            // || tablePicker === FilterTablePicker.allOut
          ) ? 'Table, Query, or Transformer'
            : 'No';
    this.inputDbTableType = tableType;
    this.useInputDbTablePicker = tablePicker !== FilterTablePicker.no;
    if (this.useInputDbTablePicker) {
      this.inputDbTablePicker = tablePicker;
      // this.pickerReadOnly = (
      //   tablePicker === FilterTablePicker.tablesReadOnly
      //   || tablePicker === FilterTablePicker.queriesReadOnly
      //   || tablePicker === FilterTablePicker.transformersReadOnly
      //   || tablePicker === FilterTablePicker.tablesAndQueriesReadOnly
      //   ) ? true : false;
    }
    this.outputDbTableLabel = filter.fc.outputDbTableLabel
      ? filter.fc.outputDbTableLabel
      : 'Output table name';
    this.isTemporaryLabel = 'Is Output Table Temporary?';
    this.hideIsTemporary = filter.fc.hideIsTemporary;
    const inputDbTablePar = filter.fc.inputDbTable.trim();
    const inputDbTable = this.de.checkDbTableName(inputDbTablePar);
    this.isTemporary = filter.fc.isTemporary;

    let fields = '{';
    fields += `"${this.DISPLAYNAME}":["${this.displayName}", []]`;
    if (this.useInputDbTablePicker) {
      const [db, tbl] = inputDbTable
        ? inputDbTable === IN_ARROW
          ? [IN_ARROW_PRETTY, IN_ARROW_PRETTY]
          : inputDbTable.split('.')
        : [this.currDb, ''];
      fields += `, "${this.inputDbTableDatabaseControl}":["${db}", []]`;
      fields += `, "${this.INPUTTABLE}":["${tbl}", []]`;
    } else {
      fields += `, "${this.INPUTTABLE}":["${inputDbTable}", []]`;
    }
    const outputDbTablePar = filter.fc.outputDbTable.trim();
    let outputDbTable = this.de.checkDbTableName(outputDbTablePar);
    this.skipOutputDbTable = outputDbTable === SKIP;
    if (!this.skipOutputDbTable) {
      if (outputDbTable === SAME_AS_SOURCE) {
        outputDbTable = SAME_AS_SOURCE_PRETTY;
      }
      fields += `, "${this.OUTPUTTABLE}":["${outputDbTable}", []]`;
    }
    if (!filter.fc.hideIsTemporary) {
      fields += `, "${this.ISTEMPORARY}":[${this.isTemporary}, []]`;
      fields += `, "${this.DOWNSTREAMCHANGES}":[${this.downstreamChanges}, []]`;
    }
    this.hasFixUpstream =
      // eslint-disable-next-line no-bitwise
      (this.execItem.integrityCode & Integrity.errorDownstreamOfChange) > 0;
    if (this.hasFixUpstream) {
      fields += `, "${this.FIXUPSTREAMCHANGES}":[${
        this.fixUpstreamChanges}, []]`;
    }

    // filter.params.forEach((p, ix) => {
    for (let ix = 0; ix < filter.params.length; ix++) {
      const p = filter.params[ix];
      this.paramTableNames.push([]);
      let header = '';
      if (p.tp === FilterParamType.displayList) {
        const lh = p.displayName;
        // const tablePos = lh.indexOf('(inDbTable)');
        // if (tablePos > -1) {
        //   lh = lh.slice(0, tablePos);
        // }
        this.listHeaders.push(lh);
        this.listHeaderTables.push('ot');
        this.lists.push({ items: p.value });
      } else if (p.tp === FilterParamType.button) {
        this.buttons.push(p.name);
        this.buttonLabels.push(p.displayName);
        this.buttonErrors.push('');
        this.buttonToParamIx.push(ix);
      // } else if (p.tp === FilterParamType.stringDropdown
      //   || p.tp === FilterParamType.numberDropdown) {
      //   fields += `, "${p.name}":[${filterFormValue(p.value, p.tp)}, []]`;
      } else if (p.tp === FilterParamType.tableName) {
        const tableName = this.de.checkDbTableName(p.value);
        fields += `, "${p.name}":[${filterFormValue(tableName, p.tp)}, []]`;
      } else if (p.tp === FilterParamType.tablePicker) {
        const tableName = this.de.checkDbTableName(p.value);
        const [db, tbl] = tableName.trim()
          ? tableName.split('.')
          : [this.currDb, ''];
        const dbfc = `${p.name}_db`;
        this.paramDatabaseChange(ix, db);
        header = `Database of ${p.displayName.toLowerCase()}`;
        fields += `, "${dbfc}":[${filterFormValue(db, p.tp)}, []]`;
        fields += `, "${p.name}":[${filterFormValue(tbl, p.tp)}, []]`;
      } else {
        fields += `, "${p.name}":[${filterFormValue(p.value, p.tp)}, []]`;
      }
      this.paramHeaders.push(header);
    }
    fields += '}';
    this.rFilter = {
      fc: filter.fc,
      rParams: [],
    };
    filter.params.forEach(p => {
      this.rFilter.rParams.push({
        fp: p,
        error: undefined,
      });
    });
    console.log('JSON', fields);
    const formParams = JSON.parse(fields);
    this.form = this.formBuilder.group(
      formParams as FilterParamsFormElements);

    this.subscriptions.add(this.form.get(this.INPUTTABLE).valueChanges
      .pipe(distinctUntilChanged())
      // makes sure the value has actually changed.
      .subscribe(tableName => this.inputTableChange(tableName)));
    // this.fiteredTables = this.form.get(this.OUTPUTTABLE).valueChanges.pipe(
    //   startWith(''), map(value => this.tableFilter(value)),
    // );
    this.md2.setupAutoClose(
      this.form,
      this.modalRef,
      this.closeCheck,
    );
    this.initialized = true;
    console.log('Modal ngOnInit Done');
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public isTemporaryChange(event: MatCheckboxChange): void {
    this.isTemporary = event.checked;
  }

  public buttonClass(ix: number): string {
    return ix > 0 ? 'tmarg' : '';
  }

  public async buttonClick(
    buttonIx: number,
    event: MouseEvent,
): Promise<void> {
    this.buttonErrors[buttonIx] = '';
    const clickData = {
      buttonIx,
      paramIx: this.buttonToParamIx[buttonIx],
      errorMsg: undefined,
      header: undefined,
      data: undefined,
      dataType: FilterParamType.undef,
    };
    const [runCode, clickResult] =  await this.fSpec.handler.buttonClick(
      this.te, this.rFilter, this.form, clickData,
      );
    if (runCode !== RunCode.success) {
      this.buttonErrors[buttonIx] = clickResult.errorMsg;
      return;
    }
    if (clickResult.dataType === FilterParamType.displayList) {
      const listIx = clickResult.paramIx;
      if (clickResult.header) {
        this.listHeaders[listIx] = clickResult.header;
      }
      while (this.lists.length <= listIx) {
        this.lists.push(undefined);
      }
      this.lists[listIx] = { items: clickResult.data };
    }
  }

  public getString(val: string | string[]): string {
    return val as string;
  }

  public getStringArr(val: string | string[]): string[] {
    return val as string[];
  }

  public async databaseSelectionChange(event: MatSelectChange): Promise<void> {
    const error = await this.changeDatabase(
      event.value, this.isInputTableArrowOk);
    if (error) {
      this.inputDbTableError = error;
    }
  }

  public inputTableChange(tableName: string): void {
    if (IN_ARROW_PRETTY === tableName) {
      this.form.patchValue({
        [this.inputDbTableDatabaseControl]: IN_ARROW_PRETTY,
      });
    } else if (this.useInputDbTablePicker) {
      const db = this.form.get(this.inputDbTableDatabaseControl).value;
      this.rFilter.fc.inputDbTable = `${db}.${tableName}`;
    } else {
      this.rFilter.fc.inputDbTable =
        this.dataEng.checkDbTableName(tableName);
    }
  }

  public paramDatabaseSelectionChange(
    ix: number,
    event: MatSelectChange,
  ): void {
    this.paramDatabaseChange(ix, event.value);
  }

  // private methods

  private async changeDatabase(
    dbName: string,
    isInArrowOk: boolean,
  ): Promise<string> {
    if (dbName === IN_ARROW_PRETTY) {
      if (!isInArrowOk) {
        return `In arrow specification is not allowed here.`;
      }
      this.form.patchValue({
        [this.INPUTTABLE]: IN_ARROW_PRETTY,
      });
      return ``;
    }
    let errorMessage = `Error reading tables.`;
    const currDb = this.dbEng.currDatabase;
    this.dbEng.setCurrentDatabase(dbName);
    const response = await this.repo.xloadAll('api/db/tables');
    if (!response.hasError) {
      this.allTableNames = [];
      if (this.inputDbTablePicker === FilterTablePicker.allIn
        || this.inputDbTablePicker === FilterTablePicker.tablesIn
      ) {
        this.allTableNames.push(IN_ARROW_PRETTY);
      }
      const allTables = response.data as Table[];
      allTables.forEach(e => {
        this.allTableNames.push(`${e.tableName}`);
      });
      errorMessage = ``;
    }
    this.dbEng.setCurrentDatabase(currDb);
    return errorMessage;
  }

  private closeCheck = async (
    clickCode: Modal.ReturnCode,
    isShiftDown: boolean,
    isAlttDown: boolean,
  ): Promise<boolean> => {
    if (clickCode !== Modal.ReturnCode.ok) {
      return true;
    }
    // check that input is ok
    let hasError = false;
    if (!this.isTP) {
      this.rFilter.fc.displayName = this.form.get(this.DISPLAYNAME).value;
    }
    if (this.useInputDbTablePicker) {
      const db = this.form.get(this.inputDbTableDatabaseControl).value;
      const tbl = this.form.get(this.INPUTTABLE).value;
      if (tbl === IN_ARROW_PRETTY) {
        this.rFilter.fc.inputDbTable = IN_ARROW;
      } else {
        this.rFilter.fc.inputDbTable = `${db}.${tbl}`;
      }
    } else {
      this.rFilter.fc.inputDbTable = this.form.get(this.INPUTTABLE).value;
    }
    this.rFilter.fc.outputDbTable = this.skipOutputDbTable
      ? SKIP
      : this.form.get(this.OUTPUTTABLE).value;
    if (!this.rFilter.fc.hideIsTemporary) {
      this.rFilter.fc.isTemporary = this.form.get(this.ISTEMPORARY).value;
    }
    const tdoc = this.data.tdoc;
    const ei = tdoc.execItems[this.data.transItemIx];
    const ti = tdoc.transItems[this.data.transItemIx];
    if (!this.rFilter.fc.isTemporary
      && !this.rFilter.fc.hideIsTemporary
      && this.form.get(this.DOWNSTREAMCHANGES).value) {
      this.rFilter.fc.changeDate = nowString();
      // eslint-disable-next-line no-bitwise
      ei.integrityCode |= Integrity.downstremChangesNecessary;
      this.te.propagateItemIntegrity(tdoc, ti);
      this.te.updateIntegrityUi(tdoc);
    }
    if (this.hasFixUpstream
      && this.form.get(this.FIXUPSTREAMCHANGES).value) {
      this.rFilter.fc.fixDate = nowString();
      // eslint-disable-next-line no-bitwise
      ei.integrityCode &= ~Integrity.downstremChangesNecessary;
      this.te.propagateClearItemIntegrity(
        tdoc, ti, Integrity.errorDownstreamOfChange, true);
      this.te.updateIntegrityUi(tdoc);
    }

    // handle params
    this.rFilter.rParams.forEach(p => {
      if (p.fp.tp === FilterParamType.displayList
        || p.fp.tp === FilterParamType.button) {
        return;
      }
      if (p.fp.tp === FilterParamType.tableName) {
        p.fp.value = this.dataEng.checkDbTableName(p.fp.value);
      } else if (p.fp.tp === FilterParamType.tablePicker) {
        const dbInput = `${p.fp.name}_db`;
        const db = this.form.get(dbInput).value;
        p.fp.value = `${db}.${this.form.get(p.fp.name).value}`;
      } else {
        p.fp.value = this.form.get(p.fp.name).value;
      }
    });

    let runCode: RunCode;
    [runCode, this.rFilter] = await this.fSpec.handler.paramsFromModal(
      this.te, this.rFilter);
    if (runCode !== RunCode.success) {
      return false;
    }
    this.rFilter.rParams.forEach(p => {
      if (p.error) {
        hasError = true;
      }
    });
    if (hasError) {
      return false;
    }
    // Save changes in main array
    const mainFilter = this.tc.mainFilters[this.data.filterIx];
    this.rFilter.fc.inputDbTable =
      this.de.checkDbTableName(this.rFilter.fc.inputDbTable);
    this.rFilter.fc.outputDbTable =
      this.de.checkDbTableName(this.rFilter.fc.outputDbTable);
    mainFilter.def.fc = this.rFilter.fc;
    mainFilter.def.params = [];
    this.rFilter.rParams.forEach(rp => {
      mainFilter.def.params.push(rp.fp);
    });
    const itemIx = this.rFilter.fc.itemIx;
    if (!this.isTP) {
      this.ts.setTransItemDisplayName(itemIx, this.rFilter.fc.displayName);
    }

    await this.te.checkTransIntegrity(this.tc.mainTrans);

    return true;
  };

  private paramDatabaseChange(
    ix: number,
    dbName: string,
  ): void {
    this.paramChangeDatabase(ix, dbName).then();
  }

  private async paramChangeDatabase(
    ix: number,
    dbName: string,
  ): Promise<boolean> {
    let success = false;
    const currDb = this.dbEng.currDatabase;
    this.dbEng.setCurrentDatabase(dbName);
    const response = await this.repo.xloadAll('api/db/tables');
    if (!response.hasError) {
      this.paramTableNames[ix] = [];
      const allTables = response.data as Table[];
      allTables.forEach(e => {
        this.paramTableNames[ix].push(`${e.tableName}`);
      });
      success = true;
    }
    this.dbEng.setCurrentDatabase(currDb);
    return success;
  }

}
