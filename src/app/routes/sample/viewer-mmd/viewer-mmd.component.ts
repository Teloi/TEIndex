/// <reference types="three" />
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MMDModel, ViewerMMD} from '../../../shared/viewer/viewer-mmd';
import {NgProgress} from 'ngx-progressbar';

@Component({
  selector: 'app-viewer-mmd',
  templateUrl: './viewer-mmd.component.html',
  styleUrls: ['./viewer-mmd.component.scss']
})
export class ViewerMmdComponent implements OnInit, OnDestroy {
  private viewer: ViewerMMD;
  private isControls: boolean;

  public percent: number;

  constructor(public ngProgress: NgProgress) {
    this.isControls = true;
  }

  plane() {
    const geo = new THREE.BoxGeometry(100, 0.1, 100);
    const textureLoader = new THREE.TextureLoader();
    const texture1 = textureLoader.load('../../../assets/img/mmd/glass.jpg');
    const mes = new THREE.MeshPhongMaterial({color: 0xffffff, map: texture1});
    texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
    texture1.repeat.set(8, 8);
    mes.transparent = true;
    mes.opacity = 0.5;
    mes.depthWrite = false;
    mes.refractionRatio = 0.98;
    const mesh = new THREE.Mesh(geo, mes);
    mesh.position.setY(0);
    mesh.receiveShadow = true;
    return mesh;
  }

  ngOnInit() {
    this.viewer = new ViewerMMD('viewer-mmd');
    this.viewer.InitScene(this.isControls,
      () => {
        this.viewer.addStatsHelper();
        this.viewer.addSkyBoxHelper('sea');
        const pmx = '../../../assets/objs/mmd/models/Alice/alice111.pmx';
        const vmd = ['../../../assets/objs/mmd/vmds/极乐净土动作数据.vmd'];
        const cameraVmd = ['../../../assets/objs/mmd/cameras/极乐净土镜头.vmd'];
        const video = '../../../assets/objs/mmd/audios/极乐净土音乐.mp3';
        const name = '初音';
        this.ngProgress.start();
        this.viewer.loadMMD(pmx, vmd, null, video, name, (model: MMDModel) => {
          this.viewer.addLight(model.mesh);
          this.viewer.modelPosition(model, new THREE.Vector3(0, 0, 0));
          this.viewer.modelAction(model, true);
          this.viewer.modelIk(model);
          this.viewer.modelPhysics(model);
          this.viewer.finishLoaded = true;
          this.ngProgress.done();
        }, (percent) => {
          this.percent = percent;
        });
        this.viewer.addMesh(this.plane());
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
