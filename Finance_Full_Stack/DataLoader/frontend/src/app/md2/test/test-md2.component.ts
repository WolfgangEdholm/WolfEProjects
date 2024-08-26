import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS
} from '@angular/material/form-field';
import { DataIntegrityService } from '../../api/data-integrity.service';
import { QDoc } from '../../types/query';
import { Database } from '../../types/db';
import { ContextService } from '../../core/context.service';
import { Md2Service, Md2Params } from '../md2.service';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export type TestMd2Spec = {
  modalTitle: string;
  isExisting: boolean;
  docName: string;
  docDbName: string;
  docDbs: Database[];
  docDbNames: string[];
};

export type TestMd2FormElements = {
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
  selector: 'app-test-md2',
  templateUrl: './test-md2.component.html',
  styleUrls: ['./test-md2.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
  providers: [{
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }],
})
export class TestMd2Component implements OnInit {
  form: FormGroup;

  oldOkQueryName: string;
  oldOkQueryDbName: string;

  docDbsMap = new Map<string, Db>();
  allDbNames: string[] = [];

  dataOutDbsMap = new Map<string, Db>();

  currDocDb: Db;

  docNameError = '';
  dataOutNameError = '';

  constructor(
    private formBuilder: FormBuilder,
    private modalRef: MatDialogRef<TestMd2Spec>,
    @Inject(MAT_DIALOG_DATA) public data: TestMd2Spec,
    public md2: Md2Service,
    public dsi: DataIntegrityService,
    public g: ContextService,
  ) {
    if (this.data.isExisting) {
      this.oldOkQueryName = this.data.docName;
      this.oldOkQueryDbName = this.data.docDbName;
    }
  }

  public ngOnInit(): void {
    console.log('SAVE MD2', this.data);
    if (this.data.docDbNames) {
      // Prepare files listed in listbox (listed per database)
      for (const ddn of this.data.docDbNames) {
        const [dbName, name] = ddn.split('.');
        let db = this.docDbsMap.get(dbName);
        if (!db) {
          const newDb = { dbName, items: [], } as Db;
          this.docDbsMap.set(dbName, newDb);
          console.log('ADDING TO MAP', dbName);
          db = this.docDbsMap.get(dbName);
        }
        const dbItem = { name, tp: DbItemType.query, };
        db.items.push(dbItem);
      }
      for (const [_, db] of this.docDbsMap) {
        db.items.sort((a, b) => a.name > b.name ? 1 : -1);
      }
    }
    if (this.data.docDbs) {
      // Prepare databases in database dropdown
      for (const database of this.data.docDbs) {
        const dbName = database.databaseName;
        if (dbName !== 'information_schema'
          && dbName !== 'mysql'
          && dbName !== 'performance_schema'
          && dbName !== 'sys'
          && dbName !== '_qs_sys_') {
          this.allDbNames.push(dbName);
        }
      }
      this.allDbNames.sort((a, b) => a > b ? 1 : -1);
    }
    this.form = this.formBuilder.group({
      makeCopy: [false, []],
      docName: [this.data.docName, []],
      docDbSelect: [this.data.docDbName, []],
      // dataOutName: [this.data.dataOutName, []],
      // dataOutDbSelect: [this.data.dataOutDbStr, []],
    } as TestMd2FormElements);
    this.md2.setupAutoClose(
      this.form,
      this.modalRef,
      this.closeCheck,
    );
  }

  public currDocDbHasDoc(): boolean {
    const currDbName = this.form.value.docDbSelect;
    this.currDocDb = this.docDbsMap.get(currDbName);
    if (!this.currDocDb) {
      return false;
    }
    return !!this.currDocDb
        && !!this.currDocDb.items
        && this.currDocDb.items.length > 0;
  }

  public databaseSelectionChange(event: MatSelectChange): void {
  }

  public openedChange(opened: boolean): void {
    if (!opened) {
      // this.insertIntoValues('valuesSelect', this.tempValues, true);
    }
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
    // check that name is available
    const dbName = this.form.value.docDbSelect;
    console.log('DB =', dbName);
    const docName = this.form.value.docName;
    const db = this.docDbsMap.get(dbName);
    console.log('DB struct', db);
    if (dbName === this.oldOkQueryDbName && docName === this.oldOkQueryName) {
      this.form.patchValue({
        makeCopy: false,
      });
    } else {
      if (db && db.items.find((e: DbItem) => e.name === docName)) {
        this.docNameError = 'QDoc name not available';
        return false;
      }
    }
    this.docNameError = '';
    return true;
  };

}
