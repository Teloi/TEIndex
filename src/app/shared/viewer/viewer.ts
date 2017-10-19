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
    let controls = new THREE.OrbitControls(camera);
    // controls.maxPolarAngle = Math.PI * 0.5;
    // controls.target.y = 2;
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
    let render = function () {
      let deltaTime = this.clock.getDelta();
      this.renderer.render(this.scene, this.camera);
      if (!isNullOrUndefined(this.controls)) {
        this.controls.update(deltaTime);
      }
      if (!isNullOrUndefined(this.stats)) {
        this.stats.update();
      }
      this.addAnimate(deltaTime);
    }.bind(this);
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
    let path = filePath ? filePath : 'Park3Med/';
    let r = '../../../assets/img/skyboxs/' + path;
    let urls = [
      r + 'px.jpg', r + 'nx.jpg',
      r + 'py.jpg', r + 'ny.jpg',
      r + 'pz.jpg', r + 'nz.jpg'
    ];

    new THREE.CubeTextureLoader().load(urls, function (textureCube) {
      textureCube.mapping = THREE.CubeRefractionMapping;
      this.scene.background = textureCube;
      this.skyBoxtexture = textureCube;
      // 透明玻璃材质测试
      // let test = new THREE.BoxGeometry(4, 4, 4);
      // let me = new THREE.MeshPhongMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.98 });
      // let box = new THREE.Mesh(test, me);
      // this.scene.add(box);
    }.bind(this));


    // 旧的天空盒
    // if (isNullOrUndefined(filePath)) {
    //   filePath = 'dark';
    // }
    // let imagePrefix = '../../../assets/img/skyboxs/' + filePath + '/sky';
    // let directions = ['_x', '-x', '_y', '-y', '_z', '-z'];
    // let imageSuffix = '.png';
    // let skyGeometry = new THREE.CubeGeometry(100000, 100000, 100000);
    //
    // let materialArray = [];
    // for (let i = 0; i < 6; i++) {
    //   materialArray.push(new THREE.MeshBasicMaterial({
    //     map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
    //     side: THREE.BackSide
    //   }));
    // }
    //
    // let skyMaterial = new THREE.MultiMaterial(materialArray);
    // let skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    // this.scene.add(skyBox);

  }

  public addAxisHelper(size: number) {
    let helper = new THREE.AxisHelper(size);
    this.scene.add(helper);
  }

  public addCameraHelper() {
    let helper = new THREE.CameraHelper(this.camera);
    this.scene.add(helper);
  }

  public disposeControls() {
    if (!isNullOrUndefined(this.controls)) {
      this.controls.dispose();
    }
  }
}
