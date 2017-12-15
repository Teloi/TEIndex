import {Component, OnInit} from '@angular/core';
import {BindexService} from '../../../services/blog/bindex.service';
import {AbpResult} from '../../../shared/services/http.service';
import {BIndexArticles} from '../../../services/blog/bindex.class';

@Component({
  selector: 'app-bindex',
  templateUrl: './bindex.component.html',
  styleUrls: ['./bindex.component.scss']
})
export class BIndexComponent implements OnInit {

  public notice: string;
  public articles: BIndexArticles[];

  constructor(private bindexService: BindexService) {
    this.articles = [];
  }

  loadNotice() {
    this.bindexService.getNotice().subscribe((response: AbpResult) => {
      if (response.success) {
        this.notice = response.result;
      } else {
        console.error(response.error.message, response.error.details);
      }
    });
  }

  loadArticles() {
    this.articles = [
      {
        title: '你好',
        introduction: '一套框架，多种平台,同时适用手机与桌面',
        background: '../../../../assets/img/sample/sample-viewer-mmd.png',
        backgroundColor: 'yellow',
      },
      {
        title: '你好',
        introduction: '一套框架，多种平台,同时适用手机与桌面',
        background: '../../../../assets/img/sample/sample-viewer-mmd.png',
        backgroundColor: 'yellow',
      },
      {
        title: '你好',
        introduction: '一套框架，多种平台,同时适用手机与桌面',
        background: '../../../../assets/img/sample/sample-viewer-mmd.png',
        backgroundColor: 'yellow',
      },
      {
        title: '你好',
        introduction: '一套框架，多种平台,同时适用手机与桌面',
        background: '../../../../assets/img/sample/sample-viewer-mmd.png',
        backgroundColor: 'yellow',
      },
      {
        title: '你好',
        introduction: '一套框架，多种平台,同时适用手机与桌面',
        background: '../../../../assets/img/sample/sample-viewer-mmd.png',
        backgroundColor: 'yellow',
      },
      {
        title: '你好',
        introduction: '一套框架，多种平台,同时适用手机与桌面',
        background: '../../../../assets/img/sample/sample-viewer-mmd.png',
        backgroundColor: 'yellow',
      },
      {
        title: '你好',
        introduction: '一套框架，多种平台,同时适用手机与桌面',
        background: '../../../../assets/img/sample/sample-viewer-mmd.png',
        backgroundColor: 'yellow',
      }
    ];
  }

  ngOnInit() {
    this.loadNotice();
    this.loadArticles();
  }

}
