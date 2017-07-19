import {Location} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  router: Router;
  location: Location;
  isShowHome: boolean;

  constructor(router: Router, location: Location) {
    this.router = router;
    this.location = location;
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event['url'] !== '/game') {
        this.isShowHome = true;
      }
      else {
        this.isShowHome = false;
      }
    });
  }


}
