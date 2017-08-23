import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';

import {TEHttpService} from '../../shared/services/http.service';

@Injectable()
export class BindexService {

  constructor(private httpclient: TEHttpService) {

  }

  getNotice() {
    return this.httpclient.httpGet('services/app/notice/GetNotice');
  }

}
