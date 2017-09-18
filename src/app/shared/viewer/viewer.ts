/// <reference types="three" />

import {isNullOrUndefined} from 'util';

declare let $;  // JQuery
declare let ElementQueries: any;
declare let ResizeSensor: any;
declare let Stats;

export class Viewer {
  private width: any;
  private height: any;

  // Init
  private container: HTMLElement;
  private clock: THREE.Clock;

  // Element
  public scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  public camera: THREE.Camera;
  public controls: any;

  // Help
  stats: any;

  constructor(containerid: string) {
    this.container = document.getElementById(containerid);
    if (isNullOrUndefined(this.container)) {
      console.error('TEViewer:The Element is Not Initiate！');
      return;
    }
    this.width = $(this.container).width();
    this.height = $(this.container).height();
    this.clock = new THREE.Clock();
  }

  public InitScene(isControls: boolean, callback?: Function) {
    if (this.scene != null) {
      if (callback) {
        callback();
      }
      return;
    }
    try {
      this.checkWebGL();
      this.renderer = this.webGLRenderer();
      this.scene = new THREE.Scene();
      this.camera = this.perspectiveCamera();
      if (isControls) {
        this.controls = this.orbitControls(this.camera);
      }
      this.addLight(this.scene);
      this.container.appendChild(this.renderer.domElement);

      this.initResize();
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Failed to load scene: ', error, error.stack, this, arguments);
    }
  }

  private perspectiveCamera(): THREE.Camera {
    let camera: THREE.Camera;
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
    return camera;
  }

  private orbitControls(camera): THREE.OrbitControls {
    if (camera === null) {
      console.error('InitOrbitControls Error!');
    }
    let controls = new THREE.OrbitControls(camera);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.target.y = 2;
    return controls;
  }

  private webGLRenderer(): THREE.WebGLRenderer {
    let renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xbfd1e5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    return renderer;
  }

  private addLight(scene: THREE.Scene) {
    // 环境光
    let ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    // 线性光
    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 10, 5);
    light.castShadow = true;
    let d = 10;
    light.shadow.camera['left'] = -d;
    light.shadow.camera['right'] = d;
    light.shadow.camera['top'] = d;
    light.shadow.camera['bottom'] = -d;
    light.shadow.camera['near'] = 2;
    light.shadow.camera['far'] = 2;
    light.shadow.mapSize.x = 1024;
    light.shadow.mapSize.y = 1024;
    scene.add(light);
  }

  private checkWebGL() {
    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
    }
  }

  private initResize() {

    let onWindowResize = function (element: any) {
      let height = window.innerHeight;
      // height -= $('#gheader').height();
      $(element).height(height);
    }.bind(this);

    let onRanderResize = function (element: any) {
      let width = $(element).width();
      let height = $(element).height();
      if (this.camera instanceof THREE.PerspectiveCamera) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }
      if (this.renderer) {
        this.renderer.setSize(width, height);
      }
    }.bind(this);

    ElementQueries.init();
    onWindowResize(this.container);
    onRanderResize(this.container);
    new ResizeSensor($(this.container), function () {
      onWindowResize(this.container);
      onRanderResize(this.container);
    }.bind(this));
  }

  public addStats() {
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.right = '0px';
    this.stats.domElement.style.left = null;
    this.container.appendChild(this.stats.domElement);
  }

  public addSkyBox() {
    let imagePrefix = '../../../assets/img/skybox/sky';
    let directions = ['_x', '-x', '_y', '-y', '_z', '-z'];
    let imageSuffix = '.png';
    let skyGeometry = new THREE.CubeGeometry(100000, 100000, 100000);

    let materialArray = [];
    for (let i = 0; i < 6; i++) {
      materialArray.push(new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
        side: THREE.BackSide
      }));
    }

    let skyMaterial = new THREE.MultiMaterial(materialArray);
    let skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(skyBox);
  }

  public addAxisHelper(size: number) {
    let helper = new THREE.AxisHelper(size);
    this.scene.add(helper);
  }

  public addCameraHelper() {
    let helper = new THREE.CameraHelper(this.camera);
    this.scene.add(helper);
  }

  public animate() {
    let render = function () {
      let deltaTime = this.clock.getDelta();
      this.renderer.render(this.scene, this.camera);
      if (!isNullOrUndefined(this.controls)) {
        this.controls.update(deltaTime);
      }
      if (!isNullOrUndefined(this.stats)) {
        this.stats.update();
      }
    }.bind(this);

    requestAnimationFrame(this.animate.bind(this));
    render();
  }

  public addMesh(mesh: THREE.Mesh) {
    this.scene.add(mesh);
  }

  public remove(mesh: THREE.Mesh) {
    this.scene.remove(mesh);
  }

  public disposeControls() {
    if (!isNullOrUndefined(this.controls)) {
      this.controls.dispose();
    }
  }
}
