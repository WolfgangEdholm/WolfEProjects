import { EventEmitter, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as Modal from '../services/modal.service';
import { RequestReturn } from '../types/shared';
import { UIEng } from '../ui-engine/ui-eng.service';
import { User } from '../types/user';
import { RepoService } from './repo.service';


@Injectable({
  providedIn: 'root'
})
export class UserEng {

  // Required fields

  public isLoading = false;
  public dataItems: User[];
  public map = new Map<number, User>();
  public dataEmitter: EventEmitter<User[]> = new EventEmitter();


  // Extension fields

  // Holds the concatenations of first, middle, last, and suffix
  public fullName: string;

  // Dropdown support
  public permissionList = [
    'Can Login',
  ];
  public roleList = [
    'Is Admin',
    'Is Standard User',
  ];

  private dataUrl = `api/user`;
  // 0 ~ add, > 0 ~ edit
  private currDataId = -1;

  constructor(
    private modal: Modal.ModalService,
    public uie: UIEng,
    public repo: RepoService,
  ) { }

  // Getters and setters

  public get userCount(): number {
    return this.dataItems?.length ?? 0;
  }

  public get userId(): number {
    return this.currDataId;
  }

  public set userId(id: number) {
    this.currDataId = id;
  }

  // Start of main functions

  public findUser(id: number): User | undefined {
    if ((this.dataItems?.length ?? 0) === 0) {
      return undefined;
    }
    return this.dataItems.find(user => user.id === id);
  }

  public async loadAll(): Promise<boolean> {
    this.isLoading = true;
    const response = await this.repo.xloadAll(this.dataUrl);
    if (!response.hasError) {
      this.dataItems = response.data as User[];
      this.map.clear();
      for (const item of this.dataItems) {
        this.map.set(item.id, item);
      }
      this.dataEmitter.emit(this.dataItems);
      this.isLoading = false;
      return true;
    }
    return false;
  }

  public async add(): Promise<User | undefined> {
    if (this.currDataId >= 0) {
      const ok = await this.editsExist();
      if (ok) {
        return this.doAdd();
      }
      return undefined;
    }
    return this.doAdd();
  }

  public async delete(): Promise<boolean> {
    if (this.currDataId <= 0) {
      return false;
    }
    const deleteRet = await this.repo.xdelete(this.dataUrl, this.currDataId);
    return true;
  }

  public async deleteAndLoad(): Promise<boolean> {
    const deleted = await this.delete();
    await this.loadAll();
    return deleted;
  }

  // Checks if there is a current, unfinished edit process.
  // If so, asks if the current changes should be saved.
  public async checkOkToEdit(dataItem: User): Promise<User | undefined> {
    if (this.currDataId >= 0) {
      const ok = await this.editsExist();
      if (ok) {
        return this.doEdit(dataItem);
      }
      return undefined;
    } else {
      return this.doEdit(dataItem);
    }
  }

  public async editsExist(): Promise<boolean> {
    let goOn = true;
    if (this.uie.forms[0] && !this.uie.forms[0].pristine) {
      goOn = await this.modal.confirmEditExit()
        .then((resp: Modal.CodeReturn) =>
          resp.code === Modal.ReturnCode.ok);
    }
    return Promise.resolve(goOn);
  }

  public async submit(): Promise<boolean> {
    let requestReturn: RequestReturn;
    const user = this.fromForm();
    if (this.currDataId > 0) {
      requestReturn = await this.repo.xupdate(this.dataUrl,
        this.currDataId, user);
    } else {
      requestReturn = await this.repo.xcreate(this.dataUrl, user);
    }
    if (!requestReturn.hasError) {
      this.loadAll();
      this.currDataId = requestReturn.data.id;
      this.doEdit(requestReturn.data);
    }
    return !requestReturn.hasError;
  }

  // End of main functions

  // Start of record specific functions that may not exist for other records

  public calcFullName(user: User): string {
    this.fullName = user.firstName;
    this.fullName += (user.middleName.length > 0 ? ' ' : '') + user.middleName;
    this.fullName += (user.lastName.length > 0 ? ' ' : '') + user.lastName;
    this.fullName += user.suffix;
    return this.fullName;
  }

  // End of Record specific functions that may not exist for other records

  // Private functions

  // Start of standard form functions

  private toForm(user: User): UIEng {
    if (!user) {
      return this.uie;
    }
    const roleSelections = this.rolesToForm(user);
    const permissionSelections = this.permissionsToForm(user);

    this.uie.forms.push(new FormGroup({
      firstName: new FormControl(
        user.firstName, {
        validators: [
          Validators.required,
          Validators.maxLength(50)]
      }),
      middleName: new FormControl(
        user.middleName, {
        validators: [Validators.maxLength(50)]
      }),
      lastName: new FormControl(
        user.lastName, {
        validators: [
          Validators.required,
          Validators.maxLength(50)]
      }),
      suffix: new FormControl(
        user.suffix, {
        validators: [Validators.maxLength(10)]
      }),
      notificationEmail: new FormControl(
        user.notificationEmail, {
        validators: [
          Validators.maxLength(50),
          Validators.email],
        updateOn: 'blur'
      }),
      email: new FormControl({
        value: user.email,
        disabled: user.id > 0
      }, {
        validators: [
          Validators.required,
          Validators.email,
          Validators.maxLength(50)],
        updateOn: 'blur'
      }),
      phoneNumber: new FormControl(
        user.phoneNumber, {
        validators: [Validators.maxLength(50)],
        updateOn: 'blur'
      }),
      dateJoined: new FormControl(new Date(
        user.dateJoined), {
        validators: [Validators.required],
        updateOn: 'blur'
      }),
      roles: new FormControl(
        roleSelections, {
        validators: [Validators.required],
        updateOn: 'blur'
      }),
      permissions: new FormControl(
        permissionSelections, {
        updateOn: 'blur'
      }),
    }));
    // this.form = this.uie.form;
    this.uie.errorMessage = '';
    return this.uie;
  }

  private fromForm(): User {
    const formValues = this.uie.forms[0].getRawValue();
    // console.log('FORM FIELDS', formValues);
    const user: User = {
      id: this.currDataId,
      firstName: formValues.firstName,
      middleName: formValues.middleName,
      lastName: formValues.lastName,
      suffix: formValues.suffix,
      dateJoined: formValues.dateJoined.toISOString().slice(0, 10),
      email: formValues.email,
      notificationEmail: formValues.notificationEmail,
      phoneNumber: formValues.phoneNumber,
      // Fields set by dropdown (below)
      isAdmin: false,
      canLogin: false,
      notifications: false,
      // Not used fields
      isActive: true,
    };
    this.permissionsFromForm(user, formValues.permissions);
    this.rolesFromForm(user, formValues.roles);
    this.uie.forms[0] = undefined;
    // console.log('USER VALUES', user);
    return user;
  }

  // End of standard form functions

  private doAdd(): User {
    this.currDataId = 0;
    this.fullName = 'New User';
    const user = this.newDataRecord();
    user.dateJoined = new Date('1998-02-22').toString();
    user.isActive = true;
    user.canLogin = true;
    user.notifications = true;
    this.uie.clearForms();
    this.toForm(user);
    console.log('NEW USER');
    return user;
  }

  private doEdit(dataItem: User): User {
    this.currDataId = dataItem.id;
    this.calcFullName(dataItem);
    this.uie.clearForms();
    this.toForm(dataItem);
    return dataItem;
  }

  private permissionsToForm(user: User): string[] {
    const permissionSelections = [];
    if (user.canLogin) {
      console.log('CAN LOGIN');
      permissionSelections.push('Can Login');
    }
    if (user.notifications) {
      permissionSelections.push('Receives Notifications');
    }
    return permissionSelections;
  }

  private permissionsFromForm(user: User, permissionSelections: string[]):
      void {
    console.log('FROM FORM', permissionSelections);
    user.canLogin = false;
    user.notifications = false;
    for (const selection of permissionSelections) {
      if (selection === 'Can Login') {
        user.canLogin = true;
      } else if (selection === 'Receives Notifications') {
        user.notifications = true;
      }
    }
  }

  private rolesToForm(user: User): string[] {
    const roleSelections = [];
    if (user.isAdmin) {
      roleSelections.push('Is Admin');
    }
    return roleSelections;
  }

  private rolesFromForm(user: User, roleSelections: string[]): void {
    user.isAdmin = false;
    for (const selection of roleSelections) {
      if (selection === 'Is Admin') {
        user.isAdmin = true;
      }
    }
  }

  private newDataRecord(): User {
    const user: User = {
      id: 0,
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      dateJoined: '',
      email: '',
      notificationEmail: '',
      phoneNumber: '',
      isActive: false,
      isAdmin: false,
      canLogin: false,
      notifications: false,
    };
    return user;
  }
}
