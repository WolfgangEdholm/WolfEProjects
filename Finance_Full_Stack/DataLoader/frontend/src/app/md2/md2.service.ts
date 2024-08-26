import { Injectable/*, Inject*/ } from '@angular/core';
import * as Modal from '../services/modal.service';
import { MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

const MODAL_TOP = '10rem';

export type Md2CloseCheck = (
  clickCode: Modal.ReturnCode,
  isShiftDown: boolean,
  isAltDown: boolean,
) => Promise<boolean>;

export type Md2Params = {
  form: any;
  modalRef: MatDialogRef<any>;
  closeCheck?: Md2CloseCheck;
};

@Injectable({
  providedIn: 'root'
})
export class Md2Service {
  isShiftDown: boolean;
  isAltDown: boolean;
  paramsStack: Md2Params[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private modal: Modal.ModalService,
    // private modalRef: MatDialogRef<Md2Param>,
    // @Inject(MAT_DIALOG_DATA) public md2Params: Md2Param,
  ) {
  }

  public setupAutoClose(
    form: any,
    modalRef: MatDialogRef<any>,
    closeCheck?: Md2CloseCheck,
  ): void {
    this.paramsStack.push({form, modalRef, closeCheck});
  }

  public closeModal(cd: Modal.ReturnCode = Modal.ReturnCode.ok): void {
    const tos = this.paramsStack.length - 1;
    const values = cd === Modal.ReturnCode.ok
      ? this.paramsStack[tos].form?.value : undefined;
    const dialogReturn = {
      code: cd,
      isShiftDown: this.isShiftDown,
      isAltDown: this.isAltDown,
      values,
    } as Modal.Return;
    this.paramsStack[tos].modalRef.close(dialogReturn);
    this.paramsStack.pop();
  }

  public deleteClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    const clickCode = Modal.ReturnCode.other;
    const params = this.paramsStack[this.paramsStack.length - 1];
    const goOn = !params.closeCheck ? true :
      params.closeCheck(
        clickCode,
        this.isShiftDown,
        this.isAltDown,
        // this.params.form,
        // this.params.userParams.
      );
    if (goOn) {
      this.closeModal(clickCode);
    }
  }

  public cancelClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    const clickCode = Modal.ReturnCode.cancel;
    const params = this.paramsStack[this.paramsStack.length - 1];
    const goOn = !params.closeCheck ? true :
      params.closeCheck(
        clickCode,
        this.isShiftDown,
        this.isAltDown,
        // this.params.form,
        // this.params.userParams.
      );
    if (goOn) {
      this.closeModal(clickCode);
    }
  }

  public async okClick(event: MouseEvent): Promise<void> {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    const clickCode = Modal.ReturnCode.ok;
    let hasError = false;
    const params = this.paramsStack[this.paramsStack.length - 1];
    if (params?.closeCheck) {
      hasError = ! await params.closeCheck(
        clickCode,
        this.isShiftDown,
        this.isAltDown,
      );
    }
    if (!hasError) {
      this.closeModal(clickCode);
    }
  }

  public modalSetup(data: any, top: string = MODAL_TOP): MatDialogConfig {
    return {
      maxWidth: window.innerWidth + 'px',
      maxHeight: window.innerHeight + 'px',
      position: { top, left: '', bottom: '', right: '' },
      disableClose: true,
      panelClass: 'x-mat-container',
      data,
    };
  }
}
