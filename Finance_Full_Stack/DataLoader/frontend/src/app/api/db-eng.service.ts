import { EventEmitter, Injectable } from '@angular/core';
import { Database, Table, DbColumn, ForeignKey } from '../types/db';
import { RepoService } from './repo.service';
import { logIo } from '../../constants';
import { RunCode } from '../types/trans';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898


const dataUrl = `api/db`;

@Injectable({
  providedIn: 'root'
})
export class DbEngService {
  // Required fields

  public isLoading = false;

  public currDatabase: string;
  public areTablesLoaded = false;

  public dataItems: Table[];
  public map = new Map<string, Table>();
  public dataEmitter: EventEmitter<Table[]> = new EventEmitter();
  public currDataItem?: Table;
  public currItemId = '';

  public databases: Database[];

  public foreignKeys: ForeignKey[];

  constructor(
    // private modal: Modal.ModalService,
    public repo: RepoService,
  ) { }

  // Start of main functions

  public async loadAllTables(forceNewLoad?: boolean): Promise<boolean> {
    if (this.areTablesLoaded && !forceNewLoad) {
      // console.log('loadAllTables: EARLY RETURN');
      return true;
    }
    this.isLoading = true;
    await this.loadAllForeignKeys();
    const response = await this.repo.xloadAll(dataUrl + '/tables');
    if (!response.hasError) {
      this.dataItems = response.data as Table[];
      this.dataItems.forEach(e => {
        e.dbTableName = `${this.currDatabase}.${e.tableName}`;
      });
      this.map.clear();
      for (const item of this.dataItems) {
        this.map.set(item.dbTableName, item);
      }
      this.dataEmitter.emit(this.dataItems);
      this.isLoading = false;
      this.areTablesLoaded = true;
      return true;
    }
    return false;
  }

  public async getTableInfo(
    dbTableName: string,
    isErrorAllowed: boolean = false,
  ): Promise<[RunCode, Table]> {
    this.isLoading = true;
    const response = await
      this.repo.xgetFromNameWithError(
        dataUrl + '/tableInfo', dbTableName, isErrorAllowed);
    if (!response.hasError) {
      const [db, tbl] = dbTableName.split('.');
      const table = {
        dbTableName,
        isOpen: false,
        hasDataSourceInfo: true,
        tableName: tbl,
        columns: response.data as DbColumn[],
      };
      table.columns.forEach(e => e.hasDataSourceInfo = true);
      this.isLoading = false;
      return [RunCode.success, table];
    }
    return [RunCode.error, undefined];
  }

  public async loadAllForeignKeys(): Promise<boolean> {
    this.isLoading = true;
    if (logIo) {
      console.log('DB ENGINE: getForeignKeys dbName =', this.currDatabase);
    }
    const response = await this.repo.xloadAll(dataUrl + '/foreignKeys/' +
      this.currDatabase);
    if (!response.hasError) {
      this.foreignKeys = response.data as ForeignKey[];
      // console.log('ForeignKeys', this.foreignKeys);
      // this.map.clear();
      // for (const item of this.databases) {
      //   this.map.set(item.id, item);
      // }
      // this.dataEmitter.emit(this.dataItems);
      this.isLoading = false;
      return true;
    }
    return false;
  }

  public async loadAllDatabases(): Promise<boolean> {
    this.isLoading = true;
    const response = await this.repo.xloadAll(dataUrl + '/databases');
    if (!response.hasError) {
      this.databases = response.data as Database[];
      // this.map.clear();
      // for (const item of this.databases) {
      //   this.map.set(item.id, item);
      // }
      // this.dataEmitter.emit(this.dataItems);
      this.isLoading = false;
      return true;
    }
    return false;
  }

  public async getNonSystemDatabases(): Promise<string[]> {
    if (!this.databases) {
      await this.loadAllDatabases();
    }
    // const dbs: { name: string, sort: string }[] = [];
    const sorted: string[] = [];
    this.databases.forEach(db => {
      if (db.databaseName !== 'information_schema'
        && db.databaseName !== 'mysql'
        && db.databaseName !== 'performance_schema'
        && db.databaseName !== 'sys'
        && db.databaseName !== '_ds_sys_'
        && db.databaseName !== '_ts_sys_'
        // dbg dbs
        && db.databaseName !== '_ds_sys_1'
        && db.databaseName !== '_ods_sys_'
      ) {
        sorted.push(db.databaseName);
        // dbs.push({
        //   name: db.databaseName,
        //   sort: db.databaseName.toLowerCase(),
        // });
      }
    });
    // dbs.sort((a, b) => a.sort > b.sort ? 1 : -1);
    // const sorted = dbs.map(e => e.name);
    return sorted;
  }

  public async setCurrentDatabase(database: string): Promise<boolean> {
    if (database === this.currDatabase) {
      // console.log('setCurrentDatabase: EARLY RETURN');
      return true;
    }
    this.isLoading = true;
    const response = await this.repo.xloadAll(dataUrl + '/setCurrentDatabase/' +
      database);
    if (!response.hasError) {
      this.currDatabase = database;
      // clear any old tables
      this.dataItems = [];
      this.isLoading = false;
      return true;
    }
    return false;
  }

  public selectForeignKeys(table: Table): ForeignKey[] {
    if (!this.foreignKeys) {
      return [];
    }
    return this.foreignKeys.filter(key => table.tableName === key.tableName);
  }

  public selectReferenceKeys(table: Table): ForeignKey[] {
    if (!this.foreignKeys) {
      return [];
    }
    return this.foreignKeys.filter(key => table.tableName === key.refTableName);
  }
}
