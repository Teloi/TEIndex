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
  private renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.Camera;
  public controls: any;
  public light: any;
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
      console.error('Init OrbitControls Error!');
    }
    const controls = new THREE.OrbitControls(camera);
    return controls;
  }

  private webGLRenderer(): THREE.WebGLRenderer {
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

  public addLight(target?: THREE.Object3D) {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
    this.scene.add(ambientLight);
    // 线性光
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.light.position.set(-10, 50, 50);
    this.light.castShadow = true;
    // const helper = new THREE.DirectionalLightHelper(this.light, 10);
    // this.scene.add(helper);

    // 舞台光
    // this.light = new THREE.SpotLight(0xFFFFFF, 1, 0, 0.20, 0, 2);
    // this.light.position.set(-10, 50, 50);
    // this.light.castShadow = true;
    // if (target) {
    //   this.light.target = target;
    // }
    // end

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
    this.scene.add(this.light);
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

  /**
   * 为Scene开启的继承接口
   */
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

  // Camera

  /**
   * updateLightPosition By angel
   * From Sun.ts
   * @param lat elevation
   * @param lon azimuth
   */
  public updateLightPosition(lat: number, lon: number) {
    if (!isNullOrUndefined(this.light)) {

      const theta = lat * (Math.PI / 180);
      const phi = lon * (Math.PI / 180);

      this.light.position.x = 15 * Math.cos(theta) * Math.sin(phi);
      this.light.position.y = 15 * Math.sin(theta);
      this.light.position.z = 15 * Math.cos(theta) * Math.cos(phi);
      this.light.castShadow = true;
    }
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
      // r + 'px.jpg', r + 'nx.jpg',
      // r + 'py.jpg', r + 'ny.jpg',
      // r + 'pz.jpg', r + 'nz.jpg'
      r + '/sky_x.png', r + '/sky-x.png',
      r + '/sky_y.png', r + '/sky-y.png',
      r + '/sky_z.png', r + '/sky-z.png',
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
