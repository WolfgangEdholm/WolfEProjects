import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { QDocService } from '../api/qdoc.service';
import { QueryCoreService } from '../core/query-core.service';
import { QueryService } from '../cmd/query.service';
import { ContextService } from '../core/context.service';
import { TransCoreService } from '../core/trans-core.service';
import { TDocService } from '../api/tdoc.service';
import { TransService } from '../cmd/trans.service';
import * as Modal from '../services/modal.service';
import { TransEngService } from '../api/trans-eng.service';


@Injectable({
  providedIn: 'root'
})
export class AppService {
  public errorCode = 0;
  public errorTitle = '';

  constructor(
    private router: Router,
    public g: ContextService,
    public qc: QueryCoreService,
    public qd: QDocService,
    public qs: QueryService,
    public tc: TransCoreService,
    public td: TDocService,
    public ts: TransService,
    public te: TransEngService,
    public modal: Modal.ModalService,
  ) {
  }

  // Query functions

  public queryEdit = async (
    id: number,
    dbQueryName: string,
  ): Promise<void> => {
    if (await this.checkForDirtyQueryOk()) {
      this.router.navigate( [ '/query' ] );
      this.g.docName = dbQueryName;
      this.qd.queryInit();
      this.qd.newQuerySeqNum -= 1;
      this.qc.currQuery = await this.qd.getQDoc(id);
      await this.qs.buildQDocument(this.qc.currQuery, false);

      this.qc.clearQDirty();
    }
  };

  public checkForDirtyQueryOk = async (): Promise<boolean> => {
    let goOn = true;
    if (this.qc.isQDirty()) {
      console.log('QUERY IS DIRTY');
      this.router.navigate( [ '/query' ] );
      const message =
        'The current query has unsaved edits that will be lost unless you save';
      goOn = await this.modal.confirm({
        title: 'Save Query',
        message,
        okButton: 'Save',
        cancelButton: 'Cancel',
        otherButton: `Don't Save`,
      }).then(async (resp: Modal.CodeReturn) => {
        if (resp.code === Modal.ReturnCode.ok) {
          await this.qd.uxSaveQDoc(resp.isShiftDown || resp.isAltDown);
          return true;
        } else if (resp.code === Modal.ReturnCode.other) {
          this.qc.clearQDirty();
          return true;
        }
        return false;
      });
    }
    return goOn;
  };

  public queryNew = async (): Promise<void> => {
    console.log('Query New');
    if (await this.checkForDirtyQueryOk()) {
      this.router.navigate( [ '/query' ] );
      this.qd.queryMakeNew();
    }
  };

  // Transformer functions

  public transEdit = async (
    id: number,
    dbTransName: string,
  ): Promise<void> => {
    if (await this.checkForDirtyTransOk()) {
      if (await this.checkForDirtyQueryOk()) {
        this.router.navigate( [ '/trans' ] );
        this.g.docName = dbTransName;
        this.td.transInit();
        this.tc.mainTrans = await this.td.getTDoc(id);
        this.tc.execTrans = this.tc.mainTrans;
        await this.ts.buildTDocumentUi(this.tc.mainTrans);
        this.td.copyTransFiltersToMain(this.tc.mainTrans);
        await this.te.checkTransIntegrity(this.tc.mainTrans);
        this.tc.execTrans = undefined;
        this.tc.clearTDirty();
      }
    }
  };

  public checkForDirtyTransOk = async (): Promise<boolean> => {
    let goOn = true;
    if (this.tc.isTDirty()) {
      console.log('TRANS IS DIRTY');
      this.router.navigate( [ '/query' ] );
      const message =
        // eslint-disable-next-line max-len
        'The current transformer has unsaved edits that will be lost unless you save';
      goOn = await this.modal.confirm({
        title: 'Save Transformer',
        message,
        okButton: 'Save',
        cancelButton: 'Cancel',
        otherButton: `Don't Save`,
      }).then(async (resp: Modal.CodeReturn) => {
        if (resp.code === Modal.ReturnCode.ok) {
          await this.td.uxSaveTDoc(resp.isShiftDown || resp.isAltDown);
          return true;
        } else if (resp.code === Modal.ReturnCode.other) {
          this.tc.clearTDirty();
          return true;
        }
        return false;
      });
    }
    return goOn;
  };

  public transNew = async (): Promise<void> => {
    if (await this.checkForDirtyTransOk()) {
      if (await this.checkForDirtyQueryOk()) {
        this.router.navigate( [ '/trans' ] );
        this.td.transMakeNew();
        this.g.docName = 'New unsaved transformer';
      }
    }
  };

}
