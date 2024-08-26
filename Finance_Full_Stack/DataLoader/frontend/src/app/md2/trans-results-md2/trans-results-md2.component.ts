import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS
} from '@angular/material/form-field';
import { TransCoreService } from '../../core/trans-core.service';
import { WorkData } from '../../api/data-eng.service';
import { ReportItem, ErrorItem } from '../../types/trans';
import { QDoc } from '../../types/query';
import { Database } from '../../types/db';
import { ContextService } from '../../core/context.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { uctToLocalDateString, narrowDurationString } from '../../utils/date';
import { Md2Service, Md2Params } from '../md2.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ShowTable2Md2Component, ShowTable2Md2Spec,
} from '../show-table2-md2/show-table2-md2.component';
import { DATA_IN, VERIFY } from '../../types/filter';
import { QueryCoreService } from '../../core/query-core.service';


// 45678911234567892123456789312345678941234567895123456789612345678971234567898


export type TransResultsMd2Spec = {
  dbTransName: string;
  reportItems: ReportItem[];
  errorItems: ErrorItem[];
};

type ReportRow = {
  ri: ReportItem;
  writtenAtString: string;
  duration: string;
};

type ErrorRow = {
  message: string;
};

const appearance: MatFormFieldDefaultOptions = {
  // appearance: 'legacy'
  appearance: 'standard'
  // appearance: 'fill'
  // appearance: 'outline'
};

@Component({
  selector: 'app-trans-results-md2',
  templateUrl: './trans-results-md2.component.html',
  styleUrls: ['./trans-results-md2.component.scss'],
    // Encapsulation None for changing size of MatSelect dropdown
  // encapsulation: ViewEncapsulation.None,
  // providers: [{
  //     provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
  //     useValue: appearance
  //   }],
})
export class TransResultsMd2Component implements OnInit {

  public reportSource = new MatTableDataSource<ReportRow>();
  public reportData: ReportRow[];

  reportColumns = [
    WorkData.rowNum,
    'dbTableName',
    'status',
    'rowCount',
    'writtenAt',
    'duration',
    'showTable'
  ];

  public errorListSource = new MatTableDataSource<ErrorRow>();
  public errorListData: ErrorRow[];

  errorListColumns = [
    WorkData.rowNum,
    'message',
  ];

  constructor(
    private matDialog: MatDialog,
    private modalRef: MatDialogRef<TransResultsMd2Spec>,
    @Inject(MAT_DIALOG_DATA) public data: TransResultsMd2Spec,
    public md2: Md2Service,
    public qc: QueryCoreService,
  ) { }

  public ngOnInit(): void {
    this.reportData = [];
    this.data.reportItems.forEach(ri => {
      this.reportData.push({
        ri,
        writtenAtString: uctToLocalDateString(ri.writtenAt),
        duration: narrowDurationString(ri.duration),
      });
    });
    this.reportSource.data = this.reportData;

    this.errorListData = [];
    this.data.errorItems.forEach(ei => {
      const isDataSource = ei.transItemName === DATA_IN;
      const isVerify = ei.transItemName === VERIFY;
      const itemTp = ei.transItemParent || isDataSource ? 'filter ' : 'query ';
      const parent = ei.transItemParent
        ? ` following '${ei.transItemParent}'` : '';
      const header1 = `Transformer path: '${ei.transPath}' in ${itemTp
        }'${ei.transItemName}'${parent}`;
      const verb = isDataSource ? 'reading' :
        isVerify ? 'verifying' : 'building';
      const header2 = `Error ${verb} '${ei.dbTableName}' at ${ei.time}:`;
      const message = ei.error;
      this.errorListData.push({ message: header1 });
      this.errorListData.push({ message: header2 });
      this.errorListData.push({ message });
    });
    this.errorListSource.data = this.errorListData;

    this.md2.setupAutoClose(
      undefined,
      this.modalRef,
      undefined,
    );
  }

  public errnum(lineNum: number): string {
    const rem = lineNum % 3;
    if (rem === 0) {
      return Math.round(lineNum / 3 + 1).toString();
    }
    return '';
  }

  public showTable(row: ReportRow): void {
    const modalRef = this.matDialog.open(
      ShowTable2Md2Component,
      this.md2.modalSetup({
        dbTableName: row.ri.dbTableName,
      } as ShowTable2Md2Spec),
    );
    lastValueFrom(modalRef.afterClosed()).then((resp: Modal.Return) => {
      // showTable builds a new query
      this.qc.clearQDirty();
    });
  }

  public showTableDisabled(row: ReportRow): boolean {
    return row.ri.hasError;
  }

}

