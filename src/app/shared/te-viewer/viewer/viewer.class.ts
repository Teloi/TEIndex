/// <reference types="three" />

import {Viewer} from './viewer.abstract';
import {isNullOrUndefined} from 'util';

export class TEViewer extends Viewer {

  constructor(containerId: string) {
    if (!isNullOrUndefined(document.getElementById(containerId))) {
      super(containerId);
    } else {
      console.error('TEViewer:The Element is Not Initiate！');
      return;
    }
  }

  public InitScene(callback: Function): void {
    if (this.scene != null) {
      if (callback) {
        callback();
      }
      return;
    }
    try {
      this.renderer = this.webGLRenderer();
      this.scene = new THREE.Scene();
      this.camera = this.perspectiveCamera();
      // isControls ? this.controls = this.orbitControls(this.camera) : this.controls = null;
      // this.container.appendChild(this.renderer.domElement);
      // this.addInitScene();
      // this.initResize();
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Failed to load scene: ', error, error.stack, this, arguments);
    }
  }

  public webGLRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      // 抗锯齿
      antialias: true
    });
    renderer.setClearColor(0xbfd1e5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    return renderer;
  }

}
