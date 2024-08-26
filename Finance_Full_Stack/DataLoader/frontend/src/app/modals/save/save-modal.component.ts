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

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export type DbSaveModalSpec = {
  modalTitle: string;
  isExisting: boolean;
  docName: string;
  docDbName: string;
  docDbs: Database[];
  docDbNames: string[];
};

export type DbSaveModalFormElements = {
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
  selector: 'app-save-modal',
  templateUrl: './save-modal.component.html',
  styleUrls: ['./save-modal.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
  providers: [{
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }],
})
export class DbSaveModalComponent implements OnInit {
  form: FormGroup;

  oldOkQueryName: string;
  oldOkQueryDbName: string;

  isShiftDown: boolean;
  isAltDown: boolean;

  docDbsMap = new Map<string, Db>();
  allDbNames: string[] = [];

  dataOutDbsMap = new Map<string, Db>();

  currDocDb: Db;

  docNameError = '';
  dataOutNameError = '';

  constructor(
    private formBuilder: FormBuilder,
    private modal: Modal.ModalService,
    private modalRef: MatDialogRef<DbSaveModalSpec>,
    @Inject(MAT_DIALOG_DATA) public data: DbSaveModalSpec,
    public dsi: DataIntegrityService,
    public g: ContextService,
  ) {
    if (this.data.isExisting) {
      this.oldOkQueryName = this.data.docName;
      this.oldOkQueryDbName = this.data.docDbName;
    }
    this.getValues();
  }

  public ngOnInit(): void {
    console.log('SAVE MODAL', this.data);
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
    // if (this.data.dataOutDbNames) {
    //   // Prepare files listed in listbox (listed per database)
    //   for (const don of this.data.dataOutDbNames) {
    //     const [dbName, name] = don.split('.');
    //     let db = this.dataOutDbsMap.get(dbName);
    //     if (!db) {
    //       const newDb = { dbName, items: [], } as DB;
    //       this.dataOutDbsMap.set(dbName, newDb);
    //       console.log('ADDING TO OUTMAP', dbName);
    //       db = this.dataOutDbsMap.get(dbName);
    //     }
    //     const dbItem = { name, tp: DBItemType.query, };
    //     db.items.push(dbItem);
    //   }
    //   for (const [_, db] of this.dataOutDbsMap) {
    //     db.items.sort((a, b) => a.name > b.name ? 1 : -1);
    //   }
    // }
    this.form = this.formBuilder.group({
      makeCopy: [false, []],
      docName: [this.data.docName, []],
      docDbSelect: [this.data.docDbName, []],
      // dataOutName: [this.data.dataOutName, []],
      // dataOutDbSelect: [this.data.dataOutDbStr, []],
    } as DbSaveModalFormElements);
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

  // public currDataOutDbHasDoc(): boolean {
  //   const currDbName = this.form.value.dataOutDbSelect;
  //   this.currDataOutDb = this.dataOutDbsMap.get(currDbName);
  //   if (!this.currDataOutDb) {
  //     return false;
  //   }
  //   return !!this.currDataOutDb
  //       && !!this.currDataOutDb.items
  //       && this.currDataOutDb.items.length > 0;
  // }

  public closeModal(cd: Modal.ReturnCode = 0): void {
    const dialogReturn = {
      code: cd,
      isShiftDown: this.isShiftDown,
      isAltDown: this.isAltDown,
      values: cd === Modal.ReturnCode.ok ? this.form.value : null
    } as Modal.Return;
    this.modalRef.close(dialogReturn);
  }

  public deleteClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    this.closeModal(Modal.ReturnCode.other);
  }

  public cancelClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    this.closeModal(Modal.ReturnCode.cancel);
  }

  public okClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
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
        return;
      }
    }
    this.docNameError = '';
    this.closeModal(Modal.ReturnCode.ok);
  }

  public databaseSelectionChange(event: MatSelectChange): void {
  }

  // public valueSelectionChange(event: MatSelectChange): void {
  //   if (this.isMultiple) {
  //     //this.tempValues = event.value;
  //   } else {
  //     //this.insertIntoValues('valuesSelect', event.value, false);
  //   }
  // }

  public openedChange(opened: boolean): void {
    if (!opened) {
      // this.insertIntoValues('valuesSelect', this.tempValues, true);
    }
  }

  // Private methods

  private getValues = async (): Promise<void> => {
  };

}
