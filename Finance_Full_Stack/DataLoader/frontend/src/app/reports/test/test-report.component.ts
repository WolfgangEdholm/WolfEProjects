import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CssService } from '../../ui-engine/ui-css.service';
import { DataIntegrityService } from '../../api/data-integrity.service';
import { QueryIntegrityCheckItem } from '../../types/integrity';
import * as Modal from '../../services/modal.service';
import { RepoService } from '../../api/repo.service';
import { WorkData } from '../../api/data-eng.service';

import { uctToLocalDateString, userLocale, userTimeZone
} from '../../utils/date';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

@Component({
  selector: 'app-test-report',
  templateUrl: './test-report.component.html',
  styleUrls: ['./test-report.component.scss']
})
export class TestReportComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  public tableSource = new MatTableDataSource();

  public fixedColumns: string[];

  public displayedColumns: string[];

  selectedColCd = -1;

  keys: string[];

  constructor(
    private router: Router,
    private modal: Modal.ModalService,

    private repo: RepoService,
    public dsi: DataIntegrityService,
    public css: CssService,

  ) { }

  ngOnInit(): void {
    this.dsi.loadAllDataIntegrityItems().then(success => {
      if (success) {

        this.keys = Object.keys(this.dsi.qsItems[0]).slice(0, -4);
        this.fixedColumns = [...this.keys];
        this.displayedColumns = [WorkData.rowNum, ...this.keys];

        this.tableSource.data = this.dsi.qsItems;
      }
    });
  }

  ngAfterViewInit(): void {
    this.tableSource.sort = this.sort;
    this.tableSource.paginator = this.paginator;
  }

  public customSort(event: Sort): void {
    console.log('sort log', event);
  }

  public doFilter(event: KeyboardEvent): void {
    this.tableSource.filter =
      (event.target as HTMLInputElement).value.trim().toLocaleLowerCase();
  }

  public indexStyle(rowIx: number, row: any): string {
    return '';
  }

  public cellStyle(row: any): string {
    return '';
  }

  public headerClass(colIx: number): string {
    return '';
  }

  public cellClass(colIx: number): string {
    return '';
  }

  public onSelectColumn(colIx: number): void {

  }

  public cellIsNumber(colIx: number): boolean {
    return false;
  }

  public cellValue(row: any, columnIx: number): string {
    return `${row[this.keys[columnIx]]}`;
  }
}
