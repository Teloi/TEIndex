import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {isNullOrUndefined} from 'util';
import {Environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';

export class AbpValidationError {
  private message: string;
  private members: string[];
}

export class AbpError {
  code = 0;
  message: string;
  details: string;
  validationErrors: AbpValidationError[];
}

export class AbpResultT<T> {
  result: T;
  targetUrl = '';
  success = true;
  error: AbpError;
  unAuthorizedRequest = true;
  __abp = true;
}

export class AbpResult extends AbpResultT<any> {
}

@Injectable()
export class TEHttpService {
  private urlPrefix = Environment.serverApiUrl;  // URL to web api
  private headers = null;

  constructor(private http: HttpClient) {

  }

  httpGet(url: string, params?: any, ignoreError?: boolean) {
    let urlEx = TEHttpService.buildUrl(params);
    return this.http.get(this.urlPrefix + url + urlEx, {headers: this.headers})
      .map((response: AbpResult) => {
        // this.refreshToken();
        return response;
      })
      .catch((error) => {
        if (ignoreError === true) {
          return Observable.throw(error);
        } else {
          // return scope.handleError(error);
          console.error(error.message);
          return;
        }
      });
  }


  static buildUrl(params: any): string {
    if (isNullOrUndefined(params)) {
      return '';
    }
    let url = '';
    let isFirst = true;
    // tslint:disable-next-line
    for (let key in params) {
      if (isFirst) {
        url += '?';
        isFirst = false;
      } else {
        url += '&';
      }
      url += key + '=' + params[key];
    }
    return url;
  }

}
