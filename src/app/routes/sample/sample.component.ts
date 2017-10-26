import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss']
})
export class SampleComponent implements OnInit {
  private router: Router;
  private location: Location;
  public isShowHome: boolean;

  constructor(router: Router, location: Location) {
    this.router = router;
    this.location = location;
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      this.isShowHome = (event['url'] !== '/sample');
    });
  }
}
