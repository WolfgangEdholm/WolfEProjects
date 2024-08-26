import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS
} from '@angular/material/form-field';
import { TransCoreService } from '../../core/trans-core.service';
import { WorkData } from '../../api/data-eng.service';
import { ReportItem } from '../../types/trans';
import { QDoc } from '../../types/query';
import { Database } from '../../types/db';
import { ContextService } from '../../core/context.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { uctToLocalDateString, narrowDurationString } from '../../utils/date';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898


export type TransResultsModalSpec = {
  dbTransName: string;
  reportItems: ReportItem[];
};

export type ReportRow = {
  ri: ReportItem;
  writtenAtString: string;
  duration: string;
};

const appearance: MatFormFieldDefaultOptions = {
  // appearance: 'legacy'
  appearance: 'standard'
  // appearance: 'fill'
  // appearance: 'outline'
};

@Component({
  selector: 'app-trans-results-modal',
  templateUrl: './trans-results-modal.component.html',
  styleUrls: ['./trans-results-modal.component.scss'],
    // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
  providers: [{
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }],
})
export class TransResultsModalComponent implements OnInit {
  isShiftDown: boolean;
  isAltDown: boolean;

  public dataSource = new MatTableDataSource<ReportRow>();
  public reportData: ReportRow[];

  displayedColumns = [
    WorkData.rowNum,
    'dbTableName',
    'status',
    'rowCount',
    'writtenAt',
    'duration',
  ];

  constructor(
    private modal: Modal.ModalService,
    private modalRef: MatDialogRef<TransResultsModalSpec>,
    @Inject(MAT_DIALOG_DATA) public data: TransResultsModalSpec,
  ) { }

  public ngOnInit(): void {
    console.log('Transformer Results', this.data);
    this.reportData = [];
    this.data.reportItems.forEach(e => {
      this.reportData.push({
        ri: e,
        writtenAtString: uctToLocalDateString(e.writtenAt),
        duration: narrowDurationString(e.duration),
      });
    });
    this.dataSource.data = this.reportData;
  }

  public closeModal(cd: Modal.ReturnCode = 0): void {
    const dialogReturn = {
      code: cd,
      isShiftDown: this.isShiftDown,
      isAltDown: this.isAltDown,
      values: undefined,
    } as Modal.Return;
    this.modalRef.close(dialogReturn);
  }

  // public deleteClick(event: MouseEvent): void {
  //   this.isShiftDown = event.shiftKey;
  //   this.closeModal(Modal.ReturnCode.other);
  // }

  // public cancelClick(event: MouseEvent): void {
  //   this.isShiftDown = event.shiftKey;
  //   this.closeModal(Modal.ReturnCode.cancel);
  // }

  public okClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    this.closeModal(Modal.ReturnCode.ok);
  }

}
