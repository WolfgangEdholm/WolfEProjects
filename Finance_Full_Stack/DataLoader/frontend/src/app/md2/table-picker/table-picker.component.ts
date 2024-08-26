import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS
} from '@angular/material/form-field';
import { DataIntegrityService } from '../../api/data-integrity.service';
import { QDoc } from '../../types/query';
import { ContextService } from '../../core/context.service';
import { Md2Service, Md2Params } from '../md2.service';
import { FilterTablePicker } from 'src/app/types/filter';
import { DbEngService } from '../../api/db-eng.service';
import { RepoService } from '../../api/repo.service';
import { Database, Table } from '../../types/db';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export type TablePickerMd2Spec = {
  tablePickerType: FilterTablePicker;
};

export type TablePickerMd2FormElements = {
  makeCopy: any;
  docName: any;
  docDbSelect: any;
};

enum DbItemType {
  none,
  query,
  filter,
  transformer,
  dir,
}

type DbItem = {
  name: string;
  tp: DbItemType;
};

type Db = {
  dbName: string;
  items: DbItem[];
};

const appearance: MatFormFieldDefaultOptions = {
  // appearance: 'legacy'
  appearance: 'standard'
  // appearance: 'fill'
  // appearance: 'outline'
};

@Component({
  selector: 'app-table-picker',
  templateUrl: './table-picker.component.html',
  styleUrls: ['./table-picker.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
  providers: [{
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }],
})
export class TablePickerMd2Component implements OnInit {
  form: FormGroup;

  modalTitle: string;
  dbsMap = new Map<string, Db>();
  allDbNames: string[] = [];
  allTableNames: string[] = [];

  currDb: string;

  item: string;
  itemType: string;

  constructor(
    private formBuilder: FormBuilder,
    private modal: Modal.ModalService,
    private modalRef: MatDialogRef<TablePickerMd2Spec>,
    private dbEng: DbEngService,
    private repo: RepoService,
    @Inject(MAT_DIALOG_DATA) public data: TablePickerMd2Spec,
    public md2: Md2Service,
    public dsi: DataIntegrityService,
    public g: ContextService,
  ) {
    this.changeDatabase(this.dbEng.currDatabase);
    const pickerType = this.data.tablePickerType;
    const tableType = (
      pickerType === FilterTablePicker.tables
      // || pickerType === FilterTablePicker.tablesReadOnly
    ) ? 'Table'
      : (
        pickerType === FilterTablePicker.queries
        // || pickerType === FilterTablePicker.queriesReadOnly
      ) ? 'Query'
      : (
        pickerType === FilterTablePicker.transformers
        // || pickerType === FilterTablePicker.transformersReadOnly
      ) ? 'Transformers'
        : (
          pickerType === FilterTablePicker.tablesAndQueries
          // || pickerType === FilterTablePicker.tablesAndQueriesReadOnly
        ) ? 'Table and Query'
          : 'Generic';
    this.modalTitle = `${tableType} Picker`;
  }

  public async ngOnInit(): Promise<void> {
    console.log('TABLE PICKER', this.data);
    this.allDbNames = await this.dbEng.getNonSystemDatabases();
  }

  public databaseSelectionChange(event: MatSelectChange): void {
    console.log('Database', event);
  }

  public tableSelectionChange(event: MatSelectChange): void {
  }

  // Private methods

  private closeCheck = async (
    clickCode: Modal.ReturnCode,
    isShiftDown: boolean,
    isAltDown: boolean,
  ): Promise<boolean> => {
    if (clickCode !== Modal.ReturnCode.ok) {
      return true;
    }
    return true;
  };

  private async changeDatabase(dbName: string): Promise<boolean> {
    this.currDb = dbName;
    const response = await this.repo.xloadAll('api/db/tables');
    if (!response.hasError) {
      this.allTableNames = [];
      const allTables = response.data as Table[];
      allTables.forEach(e => {
        this.allTableNames.push(`${e.tableName}`);
      });
      return true;
    }
    return false;
  }

}
