/// <reference types="three" />
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ViewerBase} from '../../../shared/viewers/viewer.base';
import {Sun, TimeInfo} from '../../../shared/viewers/utils/utils';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {

  private viewer: ViewerBase;
  private time: TimeInfo;

  constructor() {
    this.time = new TimeInfo();
  }

  createBox() {
    const geometry = new THREE.BoxGeometry(2, 10, 2);
    const material = new THREE.MeshPhongMaterial({'color': 0xF0F8FF});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.setY(5);
    mesh.castShadow = true;
    return mesh;
  }

  ngOnInit() {
    this.viewer = new ViewerBase('viewer');
    this.viewer.renderer = this.viewer.initWebGLRenderer();
    this.viewer.scene = this.viewer.initScene();
    this.viewer.camera = this.viewer.initCamera();
    this.viewer.control = this.viewer.initControl(this.viewer.camera);
    const areaLight = this.viewer.initAmbientLight();
    const light = this.viewer.initLight();
    const lightHelper = new THREE.DirectionalLightHelper(light, 1);
    this.viewer.scene.add(areaLight);
    this.viewer.scene.add(light);
    this.viewer.scene.add(lightHelper);
    this.viewer.initViewer(() => {
      this.viewer.addSkyBoxHelper('dark');
      this.viewer.addStatsHelper();
      this.viewer.addAxisHelper(10);
      const box = this.createBox();
      this.viewer.addMesh(box);
      this.viewer.animate((clock) => {
        this.lightChanged(light);
        this.boxChanged(box);
      });
    });
  }

  boxChanged(mesh) {
    mesh.rotation.x = Date.now() * 0.001 * 0.25;
    mesh.rotation.y = Date.now() * 0.001 * 0.5;
  }

  lightChanged(light: THREE.Light) {
    const pos = Sun.sunPosition(this.time, 31.05, 121.76);
    Sun.updateLightPosition(pos[0], pos[1], 100, light);
  }

  ngOnDestroy() {
    this.viewer.disposeControls();
  }
}
