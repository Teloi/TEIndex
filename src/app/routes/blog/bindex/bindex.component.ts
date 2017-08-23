import {Component, OnInit} from '@angular/core';
import {BindexService} from '../../../services/blog/bindex.service';
import {AbpResult} from '../../../shared/services/http.service';

@Component({
  selector: 'app-bindex',
  templateUrl: './bindex.component.html',
  styleUrls: ['./bindex.component.scss']
})
export class BindexComponent implements OnInit {

  public notice = '';

  constructor(private bindexService: BindexService) {
  }

  ngOnInit() {
    this.bindexService.getNotice().subscribe((response: AbpResult) => {
      if (response.success) {
        this.notice = response.result;
      }
    });
  }

}
