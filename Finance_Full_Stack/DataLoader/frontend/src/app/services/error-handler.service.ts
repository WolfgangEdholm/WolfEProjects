import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorModalComponent } from './std-modals/error/error-modal.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ErrorHandler } from '../api/repo.service';


@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  public errorCode = 0;
  public errorTitle = '';
  public errorMessages: string[] = [];
  public dialogConfig: MatDialogConfig;

  constructor(
    private dialog: MatDialog,
    //private repo: RepoService,

  ) {
    //repo.errorHandler = this.handleError;

    this.dialogConfig = {
      height: '250px',
      width: '700px',
      disableClose: true,
      data: { },
    } ;
  }

  public registerErrorHandler = (): ErrorHandler => {
    return this.handleError;
  }

  public handleError = (error: HttpErrorResponse): void => {
    // Add special error processing here
    this.handleOtherError(error);
  }

  private handleOtherError = (httpResponse: HttpErrorResponse): void => {
    this.createErrorMessage(httpResponse);
    this.dialogConfig.data = {
      errorCode: this.errorCode,
      errorTitle: this.errorTitle,
      errorMessages: this.errorMessages,
    };
    this.dialog.open(ErrorModalComponent, this.dialogConfig);
  }

  private createErrorMessage = (httpResponse: HttpErrorResponse): void => {
    this.errorCode = httpResponse.status;
    this.errorTitle = httpResponse.statusText;
    const messages = httpResponse.error;
    this.errorMessages = [];
    console.log('Error.error =', httpResponse.error, 'isArray',
      Array.isArray(httpResponse.error));
    if (messages && Array.isArray(httpResponse.error) && messages.length > 0) {
      for (const message of messages) {
        const errorLines = message.split('\n');
        this.errorMessages.push(...errorLines);
      }
    } else {
      // this.errorMessages.push(httpResponse.statusText);
      this.errorMessages.push(httpResponse.error);
    }
    this.dialogConfig.height = (190 + this.errorMessages.length * 40) + 'px';
  }
}
