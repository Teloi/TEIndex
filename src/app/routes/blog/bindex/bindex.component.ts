import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';

export class HomeArt {
  title: string;
  contentTitle: string;
  content: string;
}

@Component({
  selector: 'app-bindex',
  templateUrl: './bindex.component.html',
  styleUrls: ['./bindex.component.scss']
})
export class BindexComponent implements OnInit {

  homeArts: HomeArt[];
  result: any;

  constructor(private http: HttpClient) {
    this.homeArts = [];
    let item = new HomeArt();
    item.title = '测试';
    item.contentTitle = 'angular';
    item.content = 'asdd';
    this.homeArts.push(item);

    this.http.get('http://localhost:4299/api/services/app/notice/GetNotice').subscribe(data => {
      // Read the result field from the JSON response.
      this.result = data['results'];
    });
  }

  ngOnInit() {

  }

}
