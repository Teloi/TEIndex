import {Component, OnInit} from '@angular/core';

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

  constructor() {
  }

  ngOnInit() {

  }

}
