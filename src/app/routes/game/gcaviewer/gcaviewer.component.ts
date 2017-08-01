import {Component, OnInit} from '@angular/core';
import {CAViewer} from '../../../shared/viewer/cannonviewer';

@Component({
  selector: 'app-gcaviewer',
  templateUrl: './gcaviewer.component.html',
  styleUrls: ['./gcaviewer.component.scss']
})
export class GcaviewerComponent implements OnInit {
  viewer: CAViewer;
  pointArray: Array<number>;

  isControls: boolean;
  isPhysics: boolean;

  constructor() {
    this.isControls = true;
    this.isPhysics = true;
  }

  ngOnInit() {
    this.viewer = new CAViewer('tecaviewer');
    this.viewer.InitScene(this.isControls, this.isPhysics,
      () => {
        this.viewer.addStats();
        this.viewer.addAxisHelper(100);
        this.viewer.addObject();
        this.viewer.addCaObject();
        this.viewer.animate();
      }
    );
  }
}
