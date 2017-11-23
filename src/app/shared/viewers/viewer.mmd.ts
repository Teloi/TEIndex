/// <reference types="three" />
import {Viewer} from './core/viewer.abstract';
import {IViewer, IViewerExtend} from './core/viewer.interface';

export class ViewerMmd extends Viewer implements IViewer, IViewerExtend {
  constructor(containerId: string) {
    super(containerId);
  }

  // Extend Viewer
  addInitViewer() {

  }

  // IViewer
  initWebGLRenderer() {
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

  initScene() {
    return new THREE.Scene();
  }

  initCamera() {
    let camera: THREE.Camera;
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(20, -20, 20);
    return camera;
  }

  initAmbientLight() {
    // 环境光
    return new THREE.AmbientLight(0xFFFFFF, 0.1);
  }

  initLight(target?: THREE.Object3D) {
    // 线性光
    // this.light = new THREE.DirectionalLight(0xffffff, 1);
    // this.light.position.set(-10, 20, 5);
    // this.light.castShadow = true;
    // const helper = new THREE.DirectionalLightHelper(this.light, 10);
    // this.scene.add(helper);


    const light = new THREE.SpotLight(0xFFFFFF, 1, 0, 0.20, 0, 2);
    light.position.set(-10, 50, 50);
    light.castShadow = true;
    if (target) {
      light.lookAt(target.position);
    }

    // const helper = new THREE.SpotLightHelper(this.light);
    // this.scene.add(helper);

    // const d = 10;
    // light.shadow.camera['left'] = -d;
    // light.shadow.camera['right'] = d;
    // light.shadow.camera['top'] = d;
    // light.shadow.camera['bottom'] = -d;
    // light.shadow.camera['near'] = 2;
    // light.shadow.camera['far'] = 2;
    // this.light.shadow.mapSize.x = 2024;
    // this.light.shadow.mapSize.y = 2024;
    return light;
  }

  initControl(camera: THREE.Camera) {
    if (camera === null) {
      console.error('Init OrbitControls Error!');
    }
    const control = new THREE.OrbitControls(camera);
    return control;
  }

}
