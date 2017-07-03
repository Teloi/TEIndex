import {Component, OnInit} from '@angular/core';
import {simAnim} from '../../shared/animations/sim-anim';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  animations: [simAnim]
})

export class IndexComponent implements OnInit {

  staticIn: string;

  constructor() {
    this.staticIn = 'zoomOut';
  }

  ngOnInit() {
  }

  togglePosition() {
    if (this.staticIn === 'zoomOut') {
      this.staticIn = 'zoomIn';
    } else {
      this.staticIn = 'zoomOut';
    }
  }
}
