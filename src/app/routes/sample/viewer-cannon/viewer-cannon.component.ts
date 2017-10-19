/// <reference types="three" />
import {Component, OnDestroy, OnInit} from '@angular/core';
import {CAViewer} from '../../../shared/viewer/cannonviewer';

@Component({
  selector: 'app-viewer-cannon',
  templateUrl: './viewer-cannon.component.html',
  styleUrls: ['./viewer-cannon.component.scss']
})
export class ViewerCannonComponent implements OnInit, OnDestroy {

  private viewer: CAViewer;
  private isControls: boolean;
  private isPhysics: boolean;

  constructor() {
    this.isControls = true;
    this.isPhysics = true;
  }

  ngOnInit() {
    this.viewer = new CAViewer('viewer-cannon');
    this.viewer.InitScene(this.isControls,
      () => {
        this.viewer.addStatsHelper();
        this.viewer.addAxisHelper(100);
        this.viewer.addSkyBoxHelper();
        // 后续拆分
        this.viewer.addObject();
        this.viewer.addCaObject();
        this.viewer.animate();
      }
    );
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.disposeControls();
    }
  }
}
