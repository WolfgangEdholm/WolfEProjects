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

export type ReportRow = {
  ici: QueryIntegrityCheckItem;
  // ici has to be 'opened up' to make table sorting work
  // dbQueryName: string;
  // requestColumn: string;
  // dbTblColSource: string;
  // type: string;

  changeTime: Date;
  changeTimeString: string;
  changeFixedTime: Date;
  changeFixedTimeString: string;
  isOutOfDate: boolean;
};

@Component({
  selector: 'app-read3-report',
  templateUrl: './read3-report.component.html',
  styleUrls: ['./read3-report.component.scss']
})
export class Read3ReportComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource = new MatTableDataSource<ReportRow>();
  public data: ReportRow[];

  public displayedColumns = [
    WorkData.rowNum,
    'ici.dbTblColSource',
    'ici.dbQueryName',
    'ici.requestColumn',
    'ici.type',
    'changeTimeString',
    'changeFixedTimeString'
  ];

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
        this.data = [];
        this.dsi.qsItems.forEach(e => {
          const changeTime = new Date(e.changeDate);
          const changeFixedTime = new Date(e.fixDate);
          this.data.push({
            ici: e,
            // dbQueryName: e.dbQueryName,
            // requestColumn: e.requestColumn,
            // dbTblColSource: e.dbTblColSource,
            // type: e.type,

            changeTime,
            changeTimeString: uctToLocalDateString(e.changeDate),
            changeFixedTime,
            changeFixedTimeString: uctToLocalDateString(e.fixDate),
            isOutOfDate: changeTime > changeFixedTime,
          });
        });
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'ici.dbQueryName': return item.ici.dbQueryName;
            case 'ici.requestColumn': return item.ici.requestColumn;
            case 'ici.dbTblColSource': return item.ici.dbTblColSource;
            case 'ici.type': return item.ici.type;
            default: return item[property];
          }
        };
        this.dataSource.data = this.data;
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public customSort(event: Sort): void {
    console.log('sort log', event);
  }

  public doFilter(event: KeyboardEvent): void {
    this.dataSource.filter =
      (event.target as HTMLInputElement).value.trim().toLocaleLowerCase();
  }

  public indexStyle(rowIx: number, row: ReportRow): string {
    if (row.isOutOfDate) {
      return 'cellError';
    }
    return '';
  }

  public cellStyle(row: ReportRow): string {
    if (row.isOutOfDate) {
      return 'cellError';
    }
    return '';
  }

}
