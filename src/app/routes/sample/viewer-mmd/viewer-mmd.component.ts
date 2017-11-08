/// <reference types="three" />
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MMDModel, ViewerMMD} from '../../../shared/viewer/viewer-mmd';

@Component({
  selector: 'app-viewer-mmd',
  templateUrl: './viewer-mmd.component.html',
  styleUrls: ['./viewer-mmd.component.scss']
})
export class ViewerMmdComponent implements OnInit, OnDestroy {
  private viewer: ViewerMMD;
  private isControls: boolean;

  constructor() {
    this.isControls = true;
  }

  ngOnInit() {
    this.viewer = new ViewerMMD('viewer-mmd');
    this.viewer.InitScene(this.isControls,
      () => {
        this.viewer.addStatsHelper();
        this.viewer.addSkyBoxHelper();
        const pmx = '../../../assets/objs/mmd/models/miku/miku_v2.pmd';
        const vmd = ['../../../assets/objs/mmd/vmds/极乐净土动作数据.vmd'];
        const name = '初音';
        this.viewer.loadMMD(pmx, vmd, name,
          (model: MMDModel) => {
            this.viewer.modelPosition(model, new THREE.Vector3(0, -10, 0));
            this.viewer.modelAction(model, false);
            this.viewer.modelIk(model);
            this.viewer.modelPhysics(model);
            this.viewer.finishLoaded = true;
          },
          (percent) => {
            // progress-bar
          });
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
