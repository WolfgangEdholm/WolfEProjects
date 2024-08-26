import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS
} from '@angular/material/form-field';
import { DataIntegrityService } from '../../api/data-integrity.service';
import { ContextService } from '../../core/context.service';
import { Md2Service, Md2Params } from '../md2.service';
import { DbEngService } from '../../api/db-eng.service';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export type SaveMd2Spec = {
  modalTitle: string;
  isExisting: boolean;
  docName: string;
  dbName: string;
  docDbNames: string[];
  docType: string;
};

export type SaveMd2FormElements = {
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

export type SaveFromDialogFunc = (values: SaveMd2FormElements) => Promise<void>;
export type SaveFunc = () => Promise<void>;

const appearance: MatFormFieldDefaultOptions = {
  // appearance: 'legacy'
  appearance: 'standard'
  // appearance: 'fill'
  // appearance: 'outline'
};

@Component({
  selector: 'app-save-md2',
  templateUrl: './save-md2.component.html',
  styleUrls: ['./save-md2.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
  providers: [{
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }],
})
export class SaveMd2Component implements OnInit {
  form: FormGroup;

  oldOkQueryName: string;
  oldOkQueryDbName: string;

  docDbsMap = new Map<string, Db>();

  dataOutDbsMap = new Map<string, Db>();

  currDocDb: Db;

  dbs: string[];

  docNameError = '';
  dataOutNameError = '';

  formIsReady = false;

  constructor(
    private formBuilder: FormBuilder,
    private modal: Modal.ModalService,
    private modalRef: MatDialogRef<SaveMd2Spec>,
    @Inject(MAT_DIALOG_DATA) public data: SaveMd2Spec,
    public dbEng: DbEngService,
    public md2: Md2Service,
    public dsi: DataIntegrityService,
    public g: ContextService,
  ) {
    if (this.data.isExisting) {
      this.oldOkQueryName = this.data.docName;
      this.oldOkQueryDbName = this.data.dbName;
    }
  }

  public async ngOnInit(): Promise<void> {
    console.log('SAVE MD2', this.data);
    this.dbs = await this.dbEng.getNonSystemDatabases();
    if (this.data.docDbNames) {
      // Prepare files listed in listbox (listed per database)
      for (const ddn of this.data.docDbNames) {
        const [dbName, name] = ddn.split('.');
        let db = this.docDbsMap.get(dbName);
        if (!db) {
          const newDb = { dbName, items: [], } as Db;
          this.docDbsMap.set(dbName, newDb);
          db = this.docDbsMap.get(dbName);
        }
        const dbItem = { name, tp: DbItemType.query, };
        db.items.push(dbItem);
      }
      // for (const [_, db] of this.docDbsMap) {
      //   db.items.sort((a, b) => a.name > b.name ? 1 : -1);
      // }
    }
    this.form = this.formBuilder.group({
      makeCopy: [false, []],
      docName: [this.data.docName, []],
      docDbSelect: [this.data.dbName, []],
      // dataOutName: [this.data.dataOutName, []],
      // dataOutDbSelect: [this.data.dataOutDbStr, []],
    } as SaveMd2FormElements);
    this.md2.setupAutoClose(
      this.form,
      this.modalRef,
      this.closeCheck,
    );
    this.formIsReady = true;
  }

  // True if
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
    console.log('databaseSelectionChange', event);
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
    this.g.updateDocName(docName);
    return true;
  };

}
