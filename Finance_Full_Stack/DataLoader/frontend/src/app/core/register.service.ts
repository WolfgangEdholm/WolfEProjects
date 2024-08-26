import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '../services/error-handler.service';
import { ErrorHandler } from '../api/repo.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  errorHandler: ErrorHandler;

  constructor(
    public eh: ErrorHandlerService,
  ) {
    this.errorHandler = eh.registerErrorHandler();
  }

}
