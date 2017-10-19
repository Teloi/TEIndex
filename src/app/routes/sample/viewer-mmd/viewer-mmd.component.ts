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
        this.viewer.addStatsHelper();
        this.viewer.addSkyBoxHelper();
        // this.viewer.loadMMD(
        //   '../../../assets/objs/mmd/miku/miku_v2.pmd',
        //   ['../../../assets/objs/mmd/vmds/wavefile_v2.vmd'],
        //   10, -10, 0
        // );
        this.viewer.loadMMD(
          '../../../assets/objs/mmd/models/lewd/Hentai/MMD R-18 Model DL/Alice Nude/alice ver111.pmx',
          ['../../../assets/objs/mmd/vmds/极乐净土动作数据.vmd'],
          -10, -10, 0
        );
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
