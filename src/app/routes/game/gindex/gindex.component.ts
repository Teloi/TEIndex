import {Component, OnInit} from '@angular/core';
import {simAnim} from '../../../shared/animations/sim-anim';

@Component({
  selector: 'app-gindex',
  templateUrl: './gindex.component.html',
  styleUrls: ['./gindex.component.scss'],
  animations: [simAnim]
})
export class GindexComponent implements OnInit {

  staticIn: string;

  constructor() {
    this.staticIn = 'zoomIn';
  }

  ngOnInit() {
  }

}
