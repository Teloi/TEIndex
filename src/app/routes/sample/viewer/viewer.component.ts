import {Component, OnDestroy, OnInit} from '@angular/core';
import {Viewer} from '../../../shared/viewer/viewer';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {
  viewer: Viewer;
  isControls: boolean;

  constructor() {
    this.isControls = true;
  }

  ngOnInit() {
    this.viewer = new Viewer('viewer');
    this.viewer.InitScene(this.isControls,
      () => {
        this.viewer.addStats();
        this.viewer.addSkyBox();
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
