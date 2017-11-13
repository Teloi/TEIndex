/// <reference types="three" />
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Viewer} from '../../../shared/viewer/viewer';
import {ThreeExt} from '../../../shared/utils/three.util';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {
  private viewer: Viewer;
  private isControls: boolean;

  private pos: any[] = [];
  private hour: number;
  private currentTime: Date;

  constructor() {
    this.isControls = true;
    this.hour = 0;
    this.currentTime = new Date();
  }

  change() {
    this.pos = [];
    this.hour += 1;
    const list = ThreeExt.sunPosition(2012, 16, 8, this.hour, 10, 10, 31.05, 121.76);
    this.pos.push(list[0], list[1]);
    this.viewer.updateLightPosition(this.pos[0], this.pos[1]);
  }

  box() {
    const geo = new THREE.BoxGeometry(2, 10, 2);
    const mes = new THREE.MeshPhongMaterial({'color': 0xF0F8FF});
    const mesh = new THREE.Mesh(geo, mes);
    mesh.position.setY(5);
    mesh.castShadow = true;
    return mesh;
  }

  plane() {
    const geo = new THREE.BoxGeometry(100, 1, 100);
    const mes = new THREE.MeshPhongMaterial({'color': 0xFFFFFF});
    const mesh = new THREE.Mesh(geo, mes);
    mesh.receiveShadow = true;
    return mesh;
  }

  ngOnInit() {
    this.viewer = new Viewer('viewer');
    this.viewer.InitScene(this.isControls,
      () => {
        this.viewer.addStatsHelper();
        // this.viewer.addSkyBoxHelper();
        this.viewer.addAxisHelper(30);
        this.viewer.addMesh(this.box());
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
