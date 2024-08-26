import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../types/user';
import { UserEng } from '../api/user-eng.service';
import { UIEng } from '../ui-engine/ui-eng.service';
import { CssService } from '../ui-engine/ui-css.service';
import { SidePanelService, SidePanelLoadReturn,
} from '../sidepanel/side-panel.service';
import { FullNamePipe } from '../standard/full-name.pipe';
import * as Modal from '../services/modal.service';
import { SidePanelComponent } from '../sidepanel/side-panel.component';
//import { ErrorHandlerService } from '../services/error-handler.service';

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})
export class UserEditorComponent implements OnInit {
  @ViewChild('userList') userList: SidePanelComponent;

  spTopIx = -1;
  leftColumnSize = 25;
  rightColumnSize = 75;

  // workspace for full name
  private currentUser: User | undefined;

  constructor(
    private modal: Modal.ModalService,

    // // loading ErrorHandlerService updates repo to display error modals.
    // // Don't remove
    // private _: ErrorHandlerService,

    public eng: UserEng,
    public css: CssService,
    public sp: SidePanelService,
    public fnp: FullNamePipe,

  ) { }

  // Start of standard accessor functions

  public get currentUserId(): number { return this.eng.userId; }
  public get fullName(): string { return this.eng.fullName; }
  public get permissionList(): string[] { return this.eng.permissionList; }
  public get roleList(): string[] { return this.eng.roleList; }
  public get uie(): UIEng { return this.eng.uie; }

  public set setCurrentUserId(id: number) {
    this.eng.userId = id;
  }

  // End of standard accessor functions

  public async ngOnInit(): Promise<void> {
    console.log('----------------------------- User Screen');
    this.eng.dataEmitter.subscribe(() => this.onLoadData());
    await this.eng.loadAll();
    if (this.eng.userCount > 0) {
      this.onEdit(0);
    } else {
      this.onAdd();
    }
  }

  public onLoadData(): void {
    console.log('User Data Loaded');
    this.buildLeftList();
  }

  // Start of main command functions

  public async onAdd(): Promise<void> {
    const user = await this.eng.add();
    if (user) {
      this.currentUser = user;
    }
  }

  public async onEdit(ix: number): Promise<void>  {
    let user = this.eng.dataItems[ix];
    user = await this.eng.checkOkToEdit(user);
    if (user) {
      this.currentUser = user;
    }
  }

  public async onDelete(): Promise<void> {
    if (!this.currentUserId) {
      this.userList.selectTopItem(0);
    } else {
      const message = `Are you sure you want to delete ${
        this.eng.calcFullName(this.currentUser)}?`;
      this.modal.confirm({
        title: 'Warning', message, okButton: 'Delete',
        cancelButton: 'Cancel'
      }).then ((rc: Modal.CodeReturn) => {
        if (rc.code === Modal.ReturnCode.ok) {
          this.eng.deleteAndLoad();
          this.onEdit(0);
        }
      });
    }
  }

  public onSubmit(): void {
    this.eng.uie.touchForm();
    if (this.eng.uie.forms[0].valid) {
      this.eng.submit();
    }
  }

  // End of main command functions

  onInputChange(change: [string, any]): void {
    const valueName = change[0];
    const value = change[1];
    this.currentUser[valueName] = value;
    this.eng.calcFullName(this.currentUser);
  }

  userLoader = (
    itemIx: number,
    items: User[],
    childIx: number = -1,
  ): SidePanelLoadReturn => {
    const displayName = this.fnp.transform(items[itemIx]);
    return {
      displayName,
      isTopLevel: true,
      childCount: 0,
      item: items[itemIx],
      itemIx,
      childIx: -1,
    } as SidePanelLoadReturn;
  };

  userRebuild = (): void => {
    this.spTopIx = this.sp.rebuildSidePane(
      this.spTopIx, this.eng.dataItems, this.userLoader);
  };

  userSelectItem = (itemIx: number): void => {
    console.log('select user');
    this.onEdit(itemIx);
  };

  // Private methods

  private buildLeftList(): void {
    console.log('REBUILD');
    this.userRebuild();
  }

}
