import { Injectable } from '@angular/core';
import { UiJoin, UiJoinMgr } from '../ui/ui-join';
import { UiTable, UiTableMgr, UiTableClick } from '../ui/ui-table';
import { UiRequestColumn, UiRequestMgr } from '../ui/ui-request';
import { QDoc } from '../types/query';
import { Uuid } from '../api/data-eng.service';

@Injectable({
  providedIn: 'root'
})
export class QueryCoreService {
  public joinMgr: UiJoinMgr;
  public tableMgr: UiTableMgr;
  public requestMgr: UiRequestMgr;

  public uuidGen: Uuid;

  // columnMap

  public currQuery: QDoc;

  constructor(
  ) {
  }

  public setJoinDirty(): void {
    this.joinMgr.isDirty = true;
  }

  public setRequestDirty(): void {
    this.requestMgr.isDirty = true;
  }

  public setTableDirty(): void {
    this.tableMgr.isDirty = true;
  }

  public clearQDirty(): void {
    this.joinMgr.isDirty = false;
    this.requestMgr.isDirty = false;
    this.tableMgr.isDirty = false;
  }

  public isQDirty(): boolean {
    // console.log('JoinDirty', this.joinMgr.isDirty);
    // console.log('TableDirty', this.tableMgr.isDirty);
    // console.log('RequestDirty', this.requestMgr.isDirty);
    return this.joinMgr.isDirty || this.tableMgr.isDirty
      || this.requestMgr.isDirty;
  }

  public initUuidGen(): void {
    this.uuidGen = Uuid.init;
    // console.log('Resetting uuidGen');
  }

}
