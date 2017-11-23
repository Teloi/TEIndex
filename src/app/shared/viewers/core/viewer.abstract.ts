/// <reference types="three" />
import {isNullOrUndefined} from 'util';
import {IViewer} from './viewer.interface';

declare const $;
declare let ElementQueries: any;
declare let ResizeSensor: any;
declare let Stats;

export abstract class Viewer implements IViewer {
  protected _width: number;
  protected _height: number;

  private _container: HTMLElement;
  private _clock: THREE.Clock;
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _camera: THREE.Camera;
  private _light: THREE.Light;
  private _control: THREE.OrbitControls;
  private _stats: any;

  constructor(containerId: string) {
    this._container = document.getElementById(containerId);
    if (!isNullOrUndefined(this._container)) {
      this._width = $(this.container).width();
      this._height = $(this.container).height();
      this._clock = new THREE.Clock();
      this.checkWebGL();
    } else {
      console.error('TEViewer:The Element is Not Initiate！');
      return;
    }
  }

  get container(): HTMLElement {
    return this._container;
  }

  get clock(): THREE.Clock {
    return this._clock;
  }

  get renderer(): THREE.WebGLRenderer {
    return this._renderer;
  }

  get scene(): THREE.Scene {
    return this._scene;
  }

  get camera(): THREE.Camera {
    return this._camera;
  }

  get light(): THREE.Light {
    return this._light;
  }

  get control(): THREE.OrbitControls {
    return this._control;
  }

  get stats(): any {
    return this._stats;
  }

  set renderer(renderer: THREE.WebGLRenderer) {
    this._renderer = renderer;
  }

  set scene(scene: THREE.Scene) {
    this._scene = scene;
  }

  set camera(camera: THREE.Camera) {
    this._camera = camera;
  }

  set light(light: THREE.Light) {
    this._light = light;
  }

  set control(control: THREE.OrbitControls) {
    this._control = control;
  }

  set stats(stats: any) {
    this._stats = stats;
  }

  // Init
  abstract initWebGLRenderer(): THREE.WebGLRenderer;

  abstract initScene(): THREE.Scene;

  abstract initCamera(): THREE.Camera;

  abstract initAmbientLight(): THREE.Light;

  abstract initLight(): THREE.Light;

  abstract initControl(camera: THREE.Camera): THREE.OrbitControls;

  // Viewer
  protected addInitViewer() {
    return;
  }

  public initViewer(callback: Function) {
    this._container.appendChild(this._renderer.domElement);
    this.initResize();
    this.addInitViewer();
    if (callback) {
      callback();
    }
  }

  // Animate
  protected addAnimate(deltaTime: number) {
    return;
  }

  public animate(callback?: Function) {
    const render = () => {
      const deltaTime = this._clock.getDelta();
      this._renderer.render(this._scene, this._camera);
      if (!isNullOrUndefined(this._control)) {
        this._control.update();
      }
      if (!isNullOrUndefined(this._stats)) {
        this._stats.update();
      }
      if (callback) {
        callback(this._clock);
      }
    };
    requestAnimationFrame(() => {
      this.animate(callback);
    });
    render();
  }

  // Mesh
  public addMesh(mesh: THREE.Object3D) {
    this._scene.add(mesh);
  }

  public removeMesh(mesh: THREE.Object3D) {
    this._scene.remove(mesh);
  }

  // Helper
  public addStatsHelper() {
    this._stats = new Stats();
    this._stats.domElement.style.position = 'absolute';
    this._stats.domElement.style.top = '0px';
    this._stats.domElement.style.right = '0px';
    this._stats.domElement.style.left = null;
    this._container.appendChild(this._stats.domElement);
  }

  public addSkyBoxHelper(filePath?: string) {
    const path = filePath ? filePath : 'Park3Med/';
    const r = '../../../assets/img/skyboxs/' + path;
    const urls = [
      r + '/sky_x.png', r + '/sky-x.png',
      r + '/sky_y.png', r + '/sky-y.png',
      r + '/sky_z.png', r + '/sky-z.png',
    ];
    new THREE.CubeTextureLoader().load(urls, (textureCube) => {
      textureCube.mapping = THREE.CubeRefractionMapping;
      this._scene.background = textureCube;
    });
  }

  public addAxisHelper(size: number) {
    const helper = new THREE.AxisHelper(size);
    this._scene.add(helper);
  }

  public addCameraHelper() {
    const helper = new THREE.CameraHelper(this.camera);
    this._scene.add(helper);
  }

  // Utils
  private initResize() {
    const onWindowResize = (element: HTMLElement) => {
      const height = window.innerHeight;
      $(element).height(height);
    };
    const onRanderResize = (element: HTMLElement) => {
      const width = $(element).width();
      const height = $(element).height();
      if (this._camera instanceof THREE.PerspectiveCamera) {
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
      }
      if (this._renderer) {
        this._renderer.setSize(width, height);
      }
    };
    ElementQueries.init();
    onWindowResize(this._container);
    onRanderResize(this._container);
    const temp = new ResizeSensor($(this._container), () => {
      onWindowResize(this._container);
      onRanderResize(this._container);
    });
  }

  private checkWebGL(): void {
    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
    }
  }

  // Dispose
  public disposeControls() {
    if (!isNullOrUndefined(this._control)) {
      this._control.dispose();
    }
  }

}
