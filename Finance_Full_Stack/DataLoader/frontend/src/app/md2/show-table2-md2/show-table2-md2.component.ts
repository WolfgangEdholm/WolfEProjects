import { Component, OnInit, AfterViewInit, Inject, ViewEncapsulation,
  ViewChild, ElementRef, ViewChildren, QueryList,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS
} from '@angular/material/form-field';
import { DataEngService, WorkData } from '../../api/data-eng.service';
import { TransCoreService } from '../../core/trans-core.service';
import { TransEngService } from '../../api/trans-eng.service';
import { RunCode } from '../../types/trans';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortable, MatSortHeader, Sort,
} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { uctToLocalDateString, narrowDurationString } from '../../utils/date';
import { Md2Service, Md2Params } from '../md2.service';
import { Subscription } from 'rxjs';

import { Value, ValueType, Val, dbTypeToValueType } from '../../types/compute';
import { Table } from '../../types/db';


// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export type ShowTable2Md2Spec = {
  dbTableName: string;
};

const appearance: MatFormFieldDefaultOptions = {
  // appearance: 'legacy'
  appearance: 'standard'
  // appearance: 'fill'
  // appearance: 'outline'
};

@Component({
  selector: 'app-show-table2-md2',
  templateUrl: './show-table2-md2.component.html',
  styleUrls: ['./show-table2-md2.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  // encapsulation: ViewEncapsulation.None,
  // providers: [{
  //     provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
  //     useValue: appearance
  //   }],
})
export class ShowTable2Md2Component implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChildren(MatSort) sortQuery: QueryList<ElementRef>;

  public tableSource = new MatTableDataSource();
  public tableRows: any[];
  public tableInfo: Table;
  public tableTypes: ValueType[];

  public fixedColumns: string[];        // data columns
  public displayedColumns: string[];   // # + data columns

  selectedColCd = -1;

  private subscriptions = new Subscription();

  constructor(
    private modal: Modal.ModalService,
    private modalRef: MatDialogRef<ShowTable2Md2Spec>,
    @Inject(MAT_DIALOG_DATA) public data: ShowTable2Md2Spec,
    public md2: Md2Service,

    public de: DataEngService,
    public tc: TransCoreService,
    public te: TransEngService,
  ) { }

  public async ngOnInit(): Promise<void> {
    let runCode: RunCode;
    [runCode, this.tableRows, this.tableInfo] = await
      this.te.readSupportTable(this.data.dbTableName);
    if (runCode !== RunCode.success) {
      return;
    }

    this.fixedColumns = this.tableInfo.columns.map(c => c.columnName);
    this.displayedColumns = [WorkData.rowNum, ...this.fixedColumns];

    this.tableTypes =
      this.tableInfo.columns.map(c => dbTypeToValueType(c.type));

    this.tableSource.data = this.tableRows;

    this.md2.setupAutoClose(
      undefined,
      this.modalRef,
      undefined,
    );
  }

  public ngAfterViewInit(): void {
    this.tableSource.sort = this.sort;
    this.tableSource.paginator = this.paginator;
  }

  public onSelectColumn(columnIx: number): void {
    console.log('SELECT COLUMN', columnIx);
    this.selectedColCd = columnIx === 0 ? -999 : columnIx;
  }

  public sortChange(event: Sort): void {
    // console.log('SORTCHANGE', event);
  }

  public cellIsNumber(columnIx: number): boolean {
    return this.tableTypes[columnIx] === ValueType.num;
  }

  public cellValue(row: any, columnIx: number): string {
    return `${row[this.fixedColumns[columnIx]]}`;
  }

  public indexStyle(rowIx: number, row: any): string {
    return '';
  }

  // Should only deal with colors and the like
  // Headers should always be centered
  public headerClass(columnIx: number): string {
    if (this.cellIsNumber(columnIx)) {
      return '';
    }
    return '';
  }

  public cellClass(columnIx: number): any {
    let classesStr = '';
    classesStr += this.cellIsNumber(columnIx)
      ? 'cell-right'
      : '';
    return classesStr;
  }

}
