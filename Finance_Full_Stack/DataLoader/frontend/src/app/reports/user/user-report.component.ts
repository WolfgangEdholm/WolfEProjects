import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CssService } from '../../ui-engine/ui-css.service';
import { UserEng } from '../../api/user-eng.service';
import { User } from '../../types/user';
import * as Modal from '../../services/modal.service';
import { RepoService } from '../../api/repo.service';
import { WorkData } from '../../api/data-eng.service';


@Component({
  selector: 'app-user-report',
  templateUrl: './user-report.component.html',
  styleUrls: ['./user-report.component.scss']
})
export class UserReportComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource = new MatTableDataSource<User>();

  public displayedColumns = [
    WorkData.rowNum,
    'fullName',
    'firstName',
    'middleName',
    'lastName',
    'suffix',
    'email',
  ];

  constructor(
    private router: Router,
    private modal: Modal.ModalService,

    private repo: RepoService,
    public eng: UserEng,
    public css: CssService,

  ) { }

  ngOnInit(): void {
    this.eng.loadAll().then(success => {
      if (success) {
        this.dataSource.data = this.eng.dataItems;
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public customSort(event): void {
    console.log(event);
  }

  public doFilter(event: KeyboardEvent): void {
    this.dataSource.filter =
      (event.target as HTMLInputElement).value.trim().toLocaleLowerCase();
  }

  // async gotoDelete(id: number): Promise<void> {
  //   console.log('gotoDelete id =', id);
  //   const user = this.eng.findUser(id);
  //   console.log('gotoDelete user =', user);
  //   if (!user) {
  //     return;
  //   }
  //   const message = `Are you sure you want to delete ${
  //     this.eng.calcFullName(user)}?`;
  //   const dialogReturn = await this.modal.confirm({
  //     title: 'Warning', message, okButton: 'Delete',
  //     cancelButton: 'Cancel'
  //   }).then(response => response);

  //   if (dialogReturn === Modal.ReturnCode.ok) {
  //     console.log('DELETING');
  //     //this.eng.userId = id;
  //     const reqReturn =
  //       await this.repo.xdelete('api/users', id).then(rqRet => rqRet);
  //     if (!reqReturn.hasError) {
  //       this.eng.loadAll().then(success => {
  //         if (success) {
  //           this.dataSource.data = this.eng.dataItems;
  //         }
  //       });
  //     }
  //   }
  // }


  // gotoDetails(id: number): void {
  //   this.router.navigate(['details', id]);
  // }

  // gotoUpdate(id: number): void {
  //   //this.router.navigate(['update', id]);
  // }
}
