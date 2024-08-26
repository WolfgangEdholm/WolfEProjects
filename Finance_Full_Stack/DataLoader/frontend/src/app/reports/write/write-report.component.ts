
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


@Component({
  selector: 'app-write-report',
  templateUrl: './write-report.component.html',
  styleUrls: ['./write-report.component.scss']
})
export class WriteReportComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource = new MatTableDataSource<QueryIntegrityCheckItem>();

  public displayedColumns = [
    WorkData.rowNum,
    'dbTblColSource',
    'dbQueryName',
    'requestColumn',
    'type',
    'modified'
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
        this.dataSource.data = this.dsi.qsItems;
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public customSort(event: Sort): void {
    console.log(event);
  }

  public doFilter(event: KeyboardEvent): void {
    this.dataSource.filter =
      (event.target as HTMLInputElement).value.trim().toLocaleLowerCase();
  }

}
