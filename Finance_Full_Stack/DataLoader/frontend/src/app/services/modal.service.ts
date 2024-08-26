import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PromptModalComponent, PromptModalSpec
} from './std-modals/prompt/prompt-modal.component';
import { AlertComponent, AlertSpec } from './std-modals/alert/alert.component';

// export const okCode = 1;
// export const otherCode = 2;
// export const cancelCode = 3;
// export type ReturnCode = okCode as okCode | otherCode | cancelCode;
// export type RCode = 'okCode' | 'otherCode' | 'cancelCode';
// export type RrCode = 1 | 2 | 3;

export enum ReturnCode {
  undef,
  ok,
  cancel,
  other,
}

export interface CodeReturn {
  code: ReturnCode;
  isShiftDown: boolean;
  isAltDown: boolean;
}

export interface Return {
  code: ReturnCode;
  isShiftDown: boolean;
  isAltDown: boolean;
  values: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private matDialog: MatDialog,
  ) { }

  public async alert({
    width,
    disableClose,
    title,
    message,
    okButton,
  }: {
    width?: string;
    disableClose?: boolean;
    title?: string;         // Alert title
    message?: string;       // Alert message
    okButton?: string;      // OK button text
  }): Promise<void> {
    this.confirm({width, disableClose, title, message, okButton });
    return;
  }

  public async confirm({
    width,
    disableClose,
    title,
    message,
    okButton,
    cancelButton,
    otherButton,
  }: {
    width?: string;         // Dialog width,
    disableClose?: boolean; // Turn off backdrop click close
    title?: string;         // Aler title
    message?: string;       // Alert message
    okButton?: string;      // OK button text
    otherButton?: string;   // Other button text
    cancelButton?: string;  // Cancel button text
  }): Promise<CodeReturn> {
    const modalReturn = await this.prompt({width, disableClose, title,
      message, okButton, cancelButton, otherButton});
    return {
      code: modalReturn.code,
      isShiftDown: modalReturn.isShiftDown,
      isAltDown: modalReturn.isAltDown,
    };
  }

  public async prompt({
    width,
    disableClose,
    title,
    message,
    placeholder1,
    initial1,
    placeholder2,
    initial2,
    okButton,
    cancelButton,
    otherButton,
  }: {
    width?: string;
    disableClose?: boolean;
    title?: string;
    message?: string;
    placeholder1?: string;
    initial1?: string;
    placeholder2?: string;
    initial2?: string;
    okButton?: string;
    otherButton?: string;
    cancelButton?: string;
  }): Promise<Return> {
    const modalRef = this.matDialog.open(PromptModalComponent, {
      width: width ? width : '',
      disableClose: disableClose ?? true,
      data: {
        title: title ?? '',
        message: message ?? '',
        placeholder1: placeholder1 ?? '',
        initial1: initial1 ?? '',
        placeholder2: placeholder2 ?? '',
        initial2: initial2 ?? '',
        okButton: okButton ?? 'OK',
        otherButton: otherButton ?? '',
        cancelButton: cancelButton ?? '',
      } as PromptModalSpec,
    });
    return lastValueFrom(modalRef.afterClosed()).then(result => result);
  }

  public message = async (msg: string): Promise<void> => {
    const modalRef = this.matDialog.open(AlertComponent, {
      // minWidth: '400px',
      disableClose: false,
      data: {
        message: msg,
      } as AlertSpec,
    });
    return lastValueFrom(modalRef.afterClosed()).then(result => result);
  };

  public confirmDelete = async (): Promise<CodeReturn> => {
    const codeReturn = await this.confirm({
      title: 'Warning: Delete Requested',
      message: 'Are you sure you want to continue?',
      okButton: 'Continue',
      cancelButton: 'Cancel',
    });
    console.log('confirmDelete code =', codeReturn);
    return codeReturn;
  };

  public confirmEditExit = async (): Promise<CodeReturn> => {
    const codeReturn = await this.confirm({
      title: 'Warning: there are edits on the current screen',
      message: 'Continuing will discard edits',
      okButton: 'Continue',
      cancelButton: 'Cancel',
    });
    console.log('confirmEditExit code =', codeReturn);
    return codeReturn;
  };
}
