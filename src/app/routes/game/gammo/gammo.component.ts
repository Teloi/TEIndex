/// <reference types="three" />

declare let Ammo;
declare let Stats;
declare let $: any;
declare let ElementQueries: any;
declare let ResizeSensor: any;
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-gammo',
  templateUrl: './gammo.component.html',
  styleUrls: ['./gammo.component.scss']
})
export class GammoComponent implements OnInit {

  container;
  stats: any;
  camera;
  controls;
  scene;
  renderer;
  textureLoader;
  clock = new THREE.Clock();

  gravityConstant = -9.8;
  collisionConfiguration;
  dispatcher;
  broadphase;
  solver;
  physicsWorld;
  rigidBodies = [];
  margin = 0.05;
  transformAux1 = new Ammo.btTransform();

  time = 0;


  // 鼠标输入相关
  mouseCoords = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  ballMaterial = new THREE.MeshPhongMaterial({color: 0x202020});

  constructor() {
    this.checkSup();
  }


  resizeViewer(elementId: string) {
    let height = window.innerHeight;
    // height -= $('#gheader').height();
    $('#' + elementId).height(height);
  }

  onWindowResize() {
    this.resizeViewer('container');
  }

  onRanderResize() {
    let width = $(this.container).width();
    let height = $(this.container).height();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }

  initResize() {
    let scope = this;
    ElementQueries.init();
    this.onWindowResize();
    this.onRanderResize();
    new ResizeSensor($('#container'), function () {
      scope.onWindowResize();
      scope.onRanderResize();
    });
  }


  init() {
    this.initGraphics();
    this.initResize();
    this.initPhysics();
    this.createObjects();
    this.initInput();
  }

  initGraphics() {
    // three.js基本场景配置
    this.container = document.getElementById('container');
    this.container.innerHTML = '';
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 10;
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.target.y = 2;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xbfd1e5);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.textureLoader = new THREE.TextureLoader();
    // 场景
    this.scene = new THREE.Scene();
    // 环境光
    let ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
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
    this.scene.add(light);
    this.container.appendChild(this.renderer.domElement);
    // 显示帧数
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.right = '0px';
    this.stats.domElement.style.left = null;
    this.container.appendChild(this.stats.domElement);
  }

  initPhysics() {
    // bullet基本场景配置
    this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
    this.broadphase = new Ammo.btDbvtBroadphase();
    this.solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration);
    this.physicsWorld.setGravity(new Ammo.btVector3(0, this.gravityConstant, 0));
  }

  createObjects() {
    let pos = new THREE.Vector3();
    let quat = new THREE.Quaternion();
    // 创建地面
    pos.set(0, -0.5, 0);
    quat.set(0, 0, 0, 1);
    let ground = this.createParallellepiped(400, 1, 400, 0, pos, quat, new THREE.MeshPhongMaterial({color: 0xffffff}));
    ground.castShadow = true;       // 开启投影
    ground.receiveShadow = true;    // 接受阴影(可以在表面上显示阴影)
    this.textureLoader.load('../../../../assets/img/floor.jpg', function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(40, 40);
      ground.material['map'] = texture;
      ground.material.needsUpdate = texture;
    });

    ///Others
    // let floorTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../../../../assets/img/car/sand.jpg');
    // floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    // floorTexture.repeat.set(10, 10);
    // let floorMaterial = new THREE.MeshBasicMaterial({map: floorTexture, side: THREE.DoubleSide});
    // let floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    // let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    // floor.position.y = -0.5;
    // floor.rotation.x = Math.PI / 2;
    // this.scene.add(floor);
  }

  createParallellepiped(sx, sy, sz, mass, pos, quat, material) {
    let threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
    let shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
    shape.setMargin(this.margin);
    this.createRigidBody(threeObject, shape, mass, pos, quat);
    return threeObject;
  }

  createRigidBody(threeObject, physicsShape, mass, pos, quat) {
    threeObject.position.copy(pos);
    threeObject.quaternion.copy(quat);
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);
    let localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);
    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);
    threeObject.userData.physicsBody = body;
    this.scene.add(threeObject);
    if (mass > 0) {
      this.rigidBodies.push(threeObject);
      // Disable deactivation
      // 防止物体弹力过快消失
      // Ammo.DISABLE_DEACTIVATION = 4
      body.setActivationState(4);
    }
    this.physicsWorld.addRigidBody(body);

    return body;
  }

  animate() {
    let scope = this;
    requestAnimationFrame(scope.animate.bind(scope));
    this.render();
    this.stats.update();
  }

  render() {
    let deltaTime = this.clock.getDelta();
    this.updatePhysics(deltaTime);
    this.controls.update(deltaTime);
    this.renderer.render(this.scene, this.camera);
    this.time += deltaTime;
  }

  updatePhysics(deltaTime) {
    this.physicsWorld.stepSimulation(deltaTime);
    // 更新物体位置
    for (let i = 0, iL = this.rigidBodies.length; i < iL; i++) {
      let objThree = this.rigidBodies[i];
      let objPhys = objThree.userData.physicsBody;
      let ms = objPhys.getMotionState();
      if (ms) {
        ms.getWorldTransform(this.transformAux1);
        let p = this.transformAux1.getOrigin();
        let q = this.transformAux1.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
    }
  }

  ngOnInit() {
    this.init();
    this.animate();
  }

  initInput() {
    window.addEventListener('mousedown', function (event) {
      this.mouseCoords.set(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        -( event.clientY / window.innerHeight ) * 2 + 1
      );
      this.raycaster.setFromCamera(this.mouseCoords, this.camera);
      // Creates a ball and throws it
      let ballMass = 35;
      let ballRadius = 0.4;
      let ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 14, 10), this.ballMaterial);
      ball.castShadow = true;
      ball.receiveShadow = true;
      let ballShape = new Ammo.btSphereShape(ballRadius);
      ballShape.setMargin(this.margin);
      let pos = new THREE.Vector3();
      let quat = new THREE.Quaternion();
      pos.copy(this.raycaster.ray.direction);
      pos.add(this.raycaster.ray.origin);
      quat.set(0, 0, 0, 1);
      let ballBody = this.createRigidBody(ball, ballShape, ballMass, pos, quat);
      pos.copy(this.raycaster.ray.direction);
      pos.multiplyScalar(20);
      ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));
    }.bind(this), false);
  }

  checkSup() {
    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
      console.log('WebGL Error!');
    }
    else {
      console.log('WebGL Actice!');
    }
  }


}
