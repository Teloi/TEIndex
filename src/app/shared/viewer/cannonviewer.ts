/// <reference types="three" />

import {isNullOrUndefined} from 'util';

declare let $;  // JQuery
declare let ElementQueries: any;
declare let ResizeSensor: any;
declare let Stats;
declare let CANNON;

export class CAViewer {
  // Html Element
  private width: any;
  private height: any;

  // Init
  private container: HTMLElement;
  private clock: THREE.Clock;

  // Element
  private scene: THREE.Scene;
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

  public InitScene(isControls: boolean, isPhysicalEnvironment: boolean, callback?: Function) {
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

      if (isPhysicalEnvironment) {
        this.initCannon();
      }

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
    camera.position.x = -7;
    camera.position.y = 10;
    camera.position.z = 8;
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
      if (!isNullOrUndefined(this.physicsWorld)) {
        this.updatePhysics(deltaTime);
      }
      if (!isNullOrUndefined(this.controls)) {
        this.controls.update(deltaTime);
      }
      else {
        if (this.wheelMeshes.length !== 0) {
          this.camera.position.set((this.wheelMeshes[3].position.x + this.wheelMeshes[2].position.x)
            - (this.wheelMeshes[0].position.x + this.wheelMeshes[1].position.x) / 2,
            (this.wheelMeshes[3].position.y + this.wheelMeshes[2].position.y)
            - (this.wheelMeshes[0].position.y + this.wheelMeshes[1].position.y) / 2 + 1 + 3,
            ((this.wheelMeshes[3].position.z + this.wheelMeshes[2].position.z) / 2) * 2
            - ((this.wheelMeshes[0].position.z + this.wheelMeshes[1].position.z) / 2));
          this.camera.lookAt(new THREE.Vector3((this.wheelMeshes[0].position.x + this.wheelMeshes[1].position.x) / 2,
            (this.wheelMeshes[0].position.y + this.wheelMeshes[1].position.y) / 2 + 2,
            (this.wheelMeshes[0].position.z + this.wheelMeshes[1].position.z) / 2));
        }
      }
      if (!isNullOrUndefined(this.stats)) {
        this.stats.update();
      }
    }.bind(this);
    requestAnimationFrame(this.animate.bind(this));
    this.updatePhysics();
    render();
  }


  // cannon
  world;

  initCannon() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, 0); // 重力
    this.world.broadphase = new CANNON.NaiveBroadphase(); // 粗测阶段
    this.world.solver.iterations = 10; // 迭代次数
  }

  mesh;

  addObject() {
    let geometry = new THREE.BoxGeometry(2, 2, 2);
    let material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: false});
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  body;

  addCaObject() {
    let shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    // let mass = 1;
    this.body = new CANNON.Body({
      mass: 1
    });
    this.body.addShape(shape);
    this.body.angularVelocity.set(0, 10, 0); // 角度转速
    this.body.angularDamping = 0.5; // 阻尼
    this.world.addBody(this.body);
  }

  updatePhysics() {
    let deltaTime = this.clock.getDelta();
    // Step the physics world
    this.world.step(deltaTime);
    // Copy coordinates from Cannon.js to Three.js
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }

  public disposeControls() {
    if (!isNullOrUndefined(this.controls)) {
      this.controls.dispose();
    }
  }
}
