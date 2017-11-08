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
  public clock: THREE.Clock;

  // Element
  public scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  public camera: THREE.Camera;
  public controls: any;
  public skyBoxtexture: THREE.CubeTexture;

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

  private perspectiveCamera(): THREE.Camera {
    let camera: THREE.Camera;
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(20, -20, 20);
    return camera;
  }

  private orbitControls(camera): THREE.OrbitControls {
    if (camera === null) {
      console.error('InitOrbitControls Error!');
    }
    const controls = new THREE.OrbitControls(camera);
    // controls.maxPolarAngle = Math.PI * 0.5;
    // controls.target.y = 2;
    return controls;
  }

  private webGLRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xbfd1e5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    return renderer;
  }

  private addLight(scene: THREE.Scene) {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    // 线性光
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 10, 5);
    light.castShadow = true;
    const d = 10;
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
    const onWindowResize = (element: HTMLElement) => {
      const height = window.innerHeight;
      // height -= $('#gheader').height();
      $(element).height(height);
    };
    const onRanderResize = (element: HTMLElement) => {
      const width = $(element).width();
      const height = $(element).height();
      if (this.camera instanceof THREE.PerspectiveCamera) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }
      if (this.renderer) {
        this.renderer.setSize(width, height);
      }
    };
    ElementQueries.init();
    onWindowResize(this.container);
    onRanderResize(this.container);
    const temp = new ResizeSensor($(this.container), () => {
      onWindowResize(this.container);
      onRanderResize(this.container);
    });
  }

  // init
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
      isControls ? this.controls = this.orbitControls(this.camera) : this.controls = null;
      this.addLight(this.scene);
      this.container.appendChild(this.renderer.domElement);
      this.addInitScene();
      this.initResize();
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Failed to load scene: ', error, error.stack, this, arguments);
    }
  }

  public addInitScene() {
    return;
  }

  public animate() {
    const render = () => {
      const deltaTime = this.clock.getDelta();
      this.renderer.render(this.scene, this.camera);
      if (!isNullOrUndefined(this.controls)) {
        this.controls.update(deltaTime);
      }
      if (!isNullOrUndefined(this.stats)) {
        this.stats.update();
      }
      this.addAnimate(deltaTime);
    };
    requestAnimationFrame(this.animate.bind(this));
    render();
  }

  public addAnimate(deltaTime: number) {
    return;
  }

  // Mesh
  public addMesh(mesh: THREE.Object3D) {
    this.scene.add(mesh);
  }

  public removeMesh(mesh: THREE.Object3D) {
    this.scene.remove(mesh);
  }

  // Helper
  public addStatsHelper() {
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.right = '0px';
    this.stats.domElement.style.left = null;
    this.container.appendChild(this.stats.domElement);
  }

  public addSkyBoxHelper(filePath?: string) {
    /*
    *   MilkyWay/dark-s_
    *   Park3Med/
    */
    const path = filePath ? filePath : 'Park3Med/';
    const r = '../../../assets/img/skyboxs/' + path;
    const urls = [
      r + 'px.jpg', r + 'nx.jpg',
      r + 'py.jpg', r + 'ny.jpg',
      r + 'pz.jpg', r + 'nz.jpg'
    ];

    new THREE.CubeTextureLoader().load(urls, (textureCube) => {
      textureCube.mapping = THREE.CubeRefractionMapping;
      this.scene.background = textureCube;
      this.skyBoxtexture = textureCube;
    });
  }

  public addAxisHelper(size: number) {
    const helper = new THREE.AxisHelper(size);
    this.scene.add(helper);
  }

  public addCameraHelper() {
    const helper = new THREE.CameraHelper(this.camera);
    this.scene.add(helper);
  }

  public disposeControls() {
    if (!isNullOrUndefined(this.controls)) {
      this.controls.dispose();
    }
  }
}
