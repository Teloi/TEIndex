/// <reference types="three" />

export interface IViewer {
  initWebGLRenderer(): THREE.WebGLRenderer;

  initScene(): THREE.Scene;

  initCamera(): THREE.Camera;

  initAmbientLight(): THREE.Light;

  initLight(): THREE.Light;

  initControl(camera: THREE.Camera): THREE.OrbitControls;
}

export interface IViewerExtend {
  addInitViewer(): void;
}
