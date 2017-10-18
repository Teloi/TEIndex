/// <reference types="three" />
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MMDViewer} from '../../../shared/viewer/mmdviewer';
@Component({
  selector: 'app-viewer-mmd',
  templateUrl: './viewer-mmd.component.html',
  styleUrls: ['./viewer-mmd.component.scss']
})
export class ViewerMmdComponent implements OnInit, OnDestroy {
  private viewer: MMDViewer;
  private isControls: boolean;

  constructor() {
    this.isControls = true;
  }

  ngOnInit() {
    this.viewer = new MMDViewer('viewer-mmd');
    this.viewer.InitScene(this.isControls,
      () => {
        this.viewer.addStats();
        this.viewer.addSkyBox();
        this.viewer.loadMMD('../../../assets/objs/mmd/miku/miku_v2.pmd', '../../../assets/objs/mmd/vmds/wavefile_v2.vmd');
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
