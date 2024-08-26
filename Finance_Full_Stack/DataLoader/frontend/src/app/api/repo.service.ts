import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, lastValueFrom } from 'rxjs';
//import { ErrorHandlerService } from '../services/error-handler.service';
import { RequestReturn } from '../types/shared';
import { logIo } from '../../constants';
import { RunCode } from '../types/trans';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterService } from '../core/register.service';

export type ErrorHandler = (error: HttpErrorResponse) => void | undefined;

@Injectable({
  providedIn: 'root'
})
export class RepoService {

  //errorHandler: ErrorHandler;

  constructor(
    private http: HttpClient,
    private reg: RegisterService,
  ) {
  }

  // Start -- Higher level repo calls with built in error handling.

  public async xloadAll(
    dataUrl: string,
  ): Promise<RequestReturn> {
    return this.requestIdReturnWrapper(dataUrl, 0, null, this.get);
  }

  public async xget(
    dataUrl: string,
    id: number,
  ): Promise<RequestReturn> {
    if (logIo) {
      console.log('API Getting one data item:');
    }
    return this.requestIdReturnWrapper(dataUrl, id, null, this.get);
  }

  public async xgetFromName(
    dataUrl: string,
    name: string,
  ): Promise<RequestReturn> {
    if (logIo) {
      console.log('API Getting one data item from name:');
    }
    return this.requestNameReturnWrapper(dataUrl, name, null, this.getFromName);
  }

  public async xgetFromNameWithError(
    dataUrl: string,
    name: string,
    isErrorsAllowed: boolean,
  ): Promise<RequestReturn> {
    if (logIo) {
      console.log('API Getting one data item from name:');
    }
    return this.requestNameReturnWrapperWithError(
      dataUrl, name, null, this.getFromName, isErrorsAllowed);
  }

  public async xcreate(
    dataUrl: string,
    data: any,
  ): Promise<RequestReturn> {
    if (logIo) {
      console.log('API Creating:', data);
    }
    return this.requestIdReturnWrapper(dataUrl, 0, data, this.post);
  }

  public async xupdate(
    dataUrl: string,
    id: number,
    data: any,
  ): Promise<RequestReturn> {
    if (logIo) {
      console.log('API Updating:', data);
    }
    return this.requestIdReturnWrapper(dataUrl, id, data, this.put);
  }

    // For simple data structures, data can be ommitted
  public async xdelete(
    dataUrl: string,
    id: number,
    data: any = null,
  ): Promise<RequestReturn> {
    if (logIo) {
      console.log('API Deleting data item id:', id, 'Data =', data);
    }
    if (data) {
      if (id > 0) {
        id = -id;
      }
      return this.requestIdReturnWrapper(dataUrl, id, data, this.put);
    }
    return this.requestIdReturnWrapper(dataUrl, id, data, this.delete);
  }

  // End -- Higher level repo calls with built in error handling.

  // Start -- Standard http functions.
  // They are coded as arrow functions so they can be passes as variables.

  public get = (
    route: string,
    id: number = 0,
    data: any = null,
  ): Observable<any> => {
    // data is ignored
    const dataUrl = (id > 0) ? `${route}/${id}` : route;
    const url = this.route(dataUrl, environment.urlAddress);
    if (logIo) {
      console.log('GETTING', url);
    }
    return this.http.get(url);
  };

  public getFromName = (
    route: string,
    name: string,
    data: any = null,
  ): Observable<any> => {
    // data is ignored
    const dataUrl = `${route}/${name}`;
    const url = this.route(dataUrl, environment.urlAddress);
    if (logIo) {
      console.log(`GETTING FROM NAME url='${url}'`);
    }
    return this.http.get(url);
  };

  public post = (
    route: string,
    id: number = 0,
    data: any,
  ): Observable<any> => {
    // id is ignored
    const url = this.route(route, environment.urlAddress);
    if (logIo) {
      console.log('POSTING', url);
    }
    return this.http.post(url, data, this.headers());
  };

  public put = (
    route: string,
    id: number,
    data: any,
  ): Observable<any> => {
    const dataUrl = `${route}/${id}`;
    const url = this.route(dataUrl, environment.urlAddress);
    if (logIo) {
      console.log('PUTTING', url, data);
    }
    return this.http.put(url, data, this.headers());
  };

  public delete = (
    route: string,
    id: number,
    data: any = null,
  ): Observable<any> => {
    // data is ignored
    const dataUrl = `${route}/${id}`;
    const url = this.route(dataUrl, environment.urlAddress);
    if (logIo) {
      console.log('DELETING', url);
    }
    return this.http.delete(url);
  };

  // End -- Higher level repo calls with built in error handling.

  // Support functions

  private async requestIdReturnWrapper(
    dataUrl: string,
    id: number,
    data: any,
    repoFunction: (
      dataUrl: string,
      id: number,
      data: any
    ) => Observable<any>,
  ): Promise<RequestReturn> {
    const reqReturn = await lastValueFrom(repoFunction(dataUrl, id, data))
      .then(res => {
        if (logIo) {
          console.log('Success res =', res);
        }
        return { hasError: false, data: res };
      }).catch(error => {
        console.log('Error =', error);
        if (this.reg.errorHandler) {
          this.reg.errorHandler!(error);
        }
        return { hasError: true, data: null };
      });
    return reqReturn;
  }

  private async requestNameReturnWrapper(
    dataUrl: string,
    name: string,
    data: any,
    repoFunction: (
      dataUrl: string,
      name: string,
      data: any,
    ) => Observable<any>,
  ): Promise<RequestReturn> {
    const reqReturn = await lastValueFrom(repoFunction(dataUrl, name, data))
      .then(res => {
        if (logIo) {
          console.log('Success res =', res);
        }
        return { hasError: false, data: res };
      }).catch(error => {
        console.log('Error =', error);
        if (this.reg.errorHandler) {
          this.reg.errorHandler!(error);
        }
        return { hasError: true, data: null };
      });
    return reqReturn;
  }

  private async requestNameReturnWrapperWithError(
    dataUrl: string,
    name: string,
    data: any,
    repoFunction: (
      dataUrl: string,
      name: string,
      data: any,
    ) => Observable<any>,
    isErrorAllowed: boolean,
  ): Promise<RequestReturn> {
    const reqReturn = await lastValueFrom(repoFunction(dataUrl, name, data))
      .then(res => {
        if (logIo) {
          console.log('Success res =', res);
        }
        return { hasError: false, data: res };
      }).catch(error => {
        if (isErrorAllowed) {
          console.log('Allowed Error =', error);
          return { hasError: true, data: RunCode.error };
        }
        console.log('Error =', error);
        if (this.reg.errorHandler) {
          this.reg.errorHandler!(error);
        }
        return { hasError: true, data: null };
      });
    return reqReturn;
  }

  private route(
    route: string,
    envAddress: string,
  ): string {
    return `${envAddress}/${route}`;
  }

  private headers(
  ): { headers: HttpHeaders } {
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: new HttpHeaders({'Content-Type': 'application/json'}),
    };
  }
}
