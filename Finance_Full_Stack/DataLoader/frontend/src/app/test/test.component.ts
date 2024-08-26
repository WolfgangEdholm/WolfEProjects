import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import * as Modal from '../services/modal.service';
import { Md2Service, Md2Params } from '../md2/md2.service';
import { DbSaveModalComponent, DbSaveModalSpec,
} from '../modals/save/save-modal.component';
import { SvModalComponent, SvModalSpec,
} from '../modals/sv/sv-modal.component';
import { GrowModalComponent, GrowModalSpec,
} from '../modals/grow/grow-modal.component';
import { TestMd2Component, TestMd2Spec,
} from '../md2/test/test-md2.component';
import { DbEngService } from '../api/db-eng.service';
import { TransResultsMd2Component, TransResultsMd2Spec,
} from '../md2/trans-results-md2/trans-results-md2.component';
import { ReportItem } from '../types/trans';
import { ShowTableMd2Component, ShowTableMd2Spec,
} from '../md2/show-table-md2/show-table-md2.component';
import { ShowTable2Md2Component, ShowTable2Md2Spec,
} from '../md2/show-table2-md2/show-table2-md2.component';

const MODAL_TOP = '10rem';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  result: string;

  constructor(
    private matDialog: MatDialog,
    public modal: Modal.ModalService,
    public md2: Md2Service,
    public dbEng: DbEngService,
  ) { }

  ngOnInit(): void {
    // this.saveTest({
    //   modalHeader: 'a',
    //   tableName: 'b',
    //   path: 'c',
    // });
  }

  public test(): void {
    this.modal.prompt({
      title: 'New Title',
      message: 'New Message',
      placeholder1: 'New Field 1',
      initial1: 'Initial1',
      placeholder2: 'New Field 2',
      initial2: 'Initial2',
      okButton: 'IsOK?',
      cancelButton: 'Forget about it',
      otherButton: 'I am hungry',
    }).then(res => {
      console.log('Modal results', res);
    });
  }

  public confirm(): void {
    this.modal.confirm({
      title: 'New Title',
      message: 'New Message',
      okButton: 'IsOK?',
      cancelButton: 'Forget about it',
      otherButton: 'I am hungry',
    }).then(res => {
      console.log('Modal results', res);
    });
  }

  public alert(): void {
    this.modal.alert({
      // title: 'New Title',
      message: 'New Message',
      okButton: 'IsOK?',
    }).then(res => {
      console.log('Modal results', res);
    });
  }

  public message(): void {
    this.modal.message('Everything went well')
    .then(res => {
      console.log('Modal results', res);
    });
  }

  public async saveTest({
    modalTitle,
    docName,
    database,
  }: {
    modalTitle?: string;
    docName?: string;
    database?: string;
  }): Promise<Modal.Return> {
    const modalRef = this.matDialog.open(DbSaveModalComponent, {
      width: '',
      disableClose: true,
      panelClass: 'x-mat-container',
      data: {
        modalTitle: modalTitle ?? '',
        docName: docName ?? '',
        docDbName: database ?? '',
      } as DbSaveModalSpec,
    });
    return lastValueFrom(modalRef.afterClosed()).then(result =>
      Promise.resolve(result));
  }

  public async svTest({
    modalTitle,
    docName,
    database,
  }: {
    modalTitle?: string;
    docName?: string;
    database?: string;
  }): Promise<Modal.Return> {
    const modalRef = this.matDialog.open(SvModalComponent, {
      width: '',
      disableClose: true,
      panelClass: 'x-mat-container',
      data: {
        modalTitle: modalTitle ?? '',
        docName: docName ?? '',
        docDbName: database ?? '',
      } as DbSaveModalSpec,
    });
    return lastValueFrom(modalRef.afterClosed()).then(result =>
      Promise.resolve(result));
  }

  public async growTest(): Promise<Modal.Return> {
    const modalRef = this.matDialog.open(GrowModalComponent, {
      width: '',
      disableClose: true,
      panelClass: 'x-mat-container',
      data: {
      } as GrowModalSpec,
    });
    return lastValueFrom(modalRef.afterClosed()).then(result =>
      Promise.resolve(result));
  }

  public async margTest(): Promise<Modal.Return> {
    const docName = 'Doc3';
    const docDbName = `trans.${docName}`;
    const docDbNames = [
      'trans.Doc1',
      'trans.Doc2',
    ];

    const modalRef = this.matDialog.open(TestMd2Component, {
      // width: '25rem',
      width: '',
      disableClose: true,
      panelClass: 'x-mat-container',
      data: {
        modalTitle: 'Save As:',
        isExisting: false,
        docName,
        docDbName,
        docDbs: this.dbEng.databases,
        docDbNames,
      } as TestMd2Spec,
    });
    return lastValueFrom(modalRef.afterClosed()).then(result =>
      Promise.resolve(result));
  }

  public async transResultsTest(): Promise<void> {

    const reportItems: ReportItem[] = [
      {
        dbTableName: 'table1',
        status: 'success',
        rowCount: 1023,
        writtenAt: '12/24/2021 19:32:31',
        duration: 2.3,
        hasError: false,
      }, {
        dbTableName: 'table2',
        status: 'success',
        rowCount: 2023,
        writtenAt: '12/24/2021 19:42:31',
        duration: 20.3,
        hasError: false,
      }
    ];

    const width = '60%';

    const modalRef = this.matDialog.open(TransResultsMd2Component, {
      maxWidth: window.innerWidth + 'px',
      maxHeight: window.innerHeight + 'px',
      minWidth: width,
      position: { top: MODAL_TOP, left: '', bottom: '', right: '' },
      disableClose: true,
      panelClass: 'x-mat-container',
      data: {
        dbTransName: 'trans..testTrans',
        reportItems,
      } as TransResultsMd2Spec,
    });
    lastValueFrom(modalRef.afterClosed()).then((resp: Modal.Return) => {
      if (resp.code === Modal.ReturnCode.other) {
      } else if (resp.code === Modal.ReturnCode.ok) {
      }
    });
   }

  public showTableTest(): void {
    const modalRef = this.matDialog.open(
      ShowTableMd2Component,
      this.md2.modalSetup({
        dbTableName: 'trans.Query1',
      } as ShowTableMd2Spec),
    );
    lastValueFrom(modalRef.afterClosed()).then((resp: Modal.Return) => {
    });
  }

  public showTable2Test(): void {
    const modalRef = this.matDialog.open(
      ShowTable2Md2Component,
      this.md2.modalSetup({
        dbTableName: 'trans.Query1',
      } as ShowTable2Md2Spec),
    );
    lastValueFrom(modalRef.afterClosed()).then((resp: Modal.Return) => {
    });
  }

}
