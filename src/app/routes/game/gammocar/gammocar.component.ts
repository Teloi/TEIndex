/// <reference types="three" />

declare let Ammo;
declare let Stats;
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-gammocar',
  templateUrl: './gammocar.component.html',
  styleUrls: ['./gammocar.component.scss']
})
export class GammocarComponent implements OnInit {

  // 绘图相关变量
  container;
  stats;
  camera;
  controls;
  scene;
  renderer;
  textureLoader;
  clock = new THREE.Clock();
  terrainMesh;
  // 物理引擎相关变量
  gravityConstant = -9.8;
  collisionConfiguration;
  dispatcher;
  broadphase;
  solver;
  physicsWorld;
  rigidBodies = [];
  margin = 0.05;
  transformAux1 = new Ammo.btTransform();
  //
  time = 0;
  // 鼠标输入相关
  mouseCoords = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  ballMaterial = new THREE.MeshPhongMaterial({color: 0x202020});
  // bul内置宏
  DISABLE_DEACTIVATION = 4;
  TRANSFORM_AUX = new Ammo.btTransform();
  ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);
  // 车辆系统辅助
  speedometer;
  syncList = []; // 车辆系统用syncList保存事件列表,不再使用rigidBodies变量.存放用于绘制和同步物理场景的方法
  // 键盘相关
  actions = {
    'acceleration': false,
    'braking': false,
    'left': false,
    'right': false
  };
  keysActions = {
    'KeyW': 'acceleration',
    'KeyS': 'braking',
    'KeyA': 'left',
    'KeyD': 'right'
  };
  maxNumObjectss = 30;

  constructor() {
    this.checkSup();
  }

  init() {
    this.initGraphics();

    this.initPhysics();
    this.createObjects();

    this.initInput();
  }

  initGraphics() {
    // three.js基本场景配置
    this.container = document.getElementById('container');
    //this.container['innerHTML'] = '';
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.x = -7;
    this.camera.position.y = 5;
    this.camera.position.z = 8;
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
    this.stats.domElement.style.top = 'absolute';
    this.container.appendChild(this.stats.domElement);
    // 添加窗口大小变化监听
    window.addEventListener('resize', this.onWindowResize, false);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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
    this.createBox(new THREE.Vector3(0, -0.5, 0), this.ZERO_QUATERNION, 75, 1, 75, 0, 2);
    let quaternion = new THREE.Quaternion(0, 0, 0, 1);
    quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 18);
    this.createBox(new THREE.Vector3(0, -1.5, 0), quaternion, 8, 4, 10, 0);
    let size = .75;
    let nw = 8;
    let nh = 6;
    for (let j = 0; j < nw; j++) {
      for (let i = 0; i < nh; i++) {
        this.createBox(new THREE.Vector3(size * j - (size * (nw - 1)) / 2, size * i, 10), this.ZERO_QUATERNION, size, size, size, 10);
      }
    }
    this.createVehicle(new THREE.Vector3(0, 4, -20), this.ZERO_QUATERNION);
  }

  // 生成随机形状的物体
  createRondomObject(pos, quat, objectSize) {
    let numTypes = 4;
    let objectType = Math.ceil(Math.random() * numTypes);
    let threeObject = null;
    let shape = null;
    let radius;
//        var objectSize = 3;
    switch (objectType) {
      case 1:
        // Sphere
        radius = 1 + Math.random() * objectSize;
        threeObject = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 20), this.createRendomColorObjectMeatrial());
        shape = new Ammo.btSphereShape(radius);
        shape.setMargin(this.margin);
        break;
      case 2:
        // Box
        let sx = 1 + Math.random() * objectSize;
        let sy = 1 + Math.random() * objectSize;
        let sz = 1 + Math.random() * objectSize;
        threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), this.createRendomColorObjectMeatrial());
        shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
        shape.setMargin(this.margin);
        break;
      case 3: {
        // Cylinder
        radius = 1 + Math.random() * objectSize;
        let height = 1 + Math.random() * objectSize;
        threeObject = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 20, 1),
          this.createRendomColorObjectMeatrial());
        shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * 0.5, radius));
        shape.setMargin(this.margin);
        break;
      }
      default: {
        // Cone
        radius = 1 + Math.random() * objectSize;
        let height = 2 + Math.random() * objectSize;
        threeObject = new THREE.Mesh(new THREE.CylinderGeometry(0, radius, height, 20, 2),
          this.createRendomColorObjectMeatrial());
        shape = new Ammo.btConeShape(radius, height);
        break;
      }
    }
    let mass = objectSize * 5; // 体积越大质量越大
    this.createRigidBody(threeObject, shape, mass, pos, quat);
  }

  // 生成随机颜色材质
  createRendomColorObjectMeatrial() {
    let color = Math.floor(Math.random() * (1 << 24));
    return new THREE.MeshPhongMaterial({color: color});
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
    // physicsWorld.stepSimulation(deltaTime);
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
    for (let i = 0; i < this.syncList.length; i++) {
      this.syncList[i](deltaTime);
    }
    this.physicsWorld.stepSimulation(deltaTime, 10);
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
      pos.multiplyScalar(24);
      ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));
    }.bind(this), false);

    window.addEventListener('keydown', function (e) {
      if (this.keysActions[e.code]) {
        this.actions[this.keysActions[e.code]] = true;
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }.bind(this));

    window.addEventListener('keyup', function (e) {
      if (this.keysActions[e.code]) {
        this.actions[this.keysActions[e.code]] = false;
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }.bind(this));
  }

  /**
   * 车辆系统相关函数部分
   */
  createBox(pos, quat, w, l, h, mass, friction?) {
    let material = this.createRendomColorObjectMeatrial();
    let shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);
    let geometry = new Ammo.btBoxShape(new Ammo.btVector3(w * 0.5, l * 0.5, h * 0.5));
    if (!mass) {
      mass = 0;
    }
    if (!friction) {
      friction = 1;
    }
    let mesh = new THREE.Mesh(shape, material);
    mesh.position.copy(pos);
    mesh.quaternion.copy(quat);
    this.scene.add(mesh);
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);
    let localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(mass, localInertia);
    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, geometry, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);
    body.setFriction(friction);
    this.physicsWorld.addRigidBody(body);
    if (mass > 0) {
      body.setActivationState(this.DISABLE_DEACTIVATION);
      // 同步物理场景和绘图空间
      this.syncList.push(this.sync(body, mesh));
    }
  }

  sync(body, mesh) {
    let ms = body.getMotionState();
    if (ms) {
      ms.getWorldTransform(this.TRANSFORM_AUX);
      let p = this.TRANSFORM_AUX.getOrigin();
      let q = this.TRANSFORM_AUX.getRotation();
      mesh.position.set(p.x(), p.y(), p.z());
      mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
    }
  }

  // 绘制车轮
  createWheelMesh(radius, width) {
    let t = new THREE.CylinderGeometry(radius, radius, width, 24, 1);
    t.rotateZ(Math.PI / 2);
    let mesh = new THREE.Mesh(t, this.createRendomColorObjectMeatrial());
    mesh.add(new THREE.Mesh(new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius * .25, 1, 1, 1),
      this.createRendomColorObjectMeatrial()));
    this.scene.add(mesh);
    return mesh;
  }

  // 绘制底盘
  createChassisMesh(w, l, h) {
    let shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);
    let mesh = new THREE.Mesh(shape, this.createRendomColorObjectMeatrial());
    this.scene.add(mesh);
    return mesh;
  }

  createVehicle(pos, quat) {
    // 车辆常量
    let chassisWidth = 1.8;
    let chassisHeight = .6;
    let chassisLength = 4;
    let massVehicle = 800;
    let wheelAxisPositionBack = -1;
    let wheelRadiusBack = .4;
    let wheelWidthBack = .3;
    let wheelHalfTrackBack = 1;
    let wheelAxisHeightBack = .3;
    let wheelAxisFrontPosition = 1.7;
    let wheelHalfTrackFront = 1;
    let wheelAxisHeightFront = .3;
    let wheelRadiusFront = .35;
    let wheelWidthFront = .2;
    let friction = 1000;
    let suspensionStiffness = 20.0; // 悬挂刚性
    let suspensionDamping = 2.3;    // 悬挂阻尼
    let suspensionCompression = 4.4; // 悬挂压缩
    let suspensionRestLength = 0.6; // 悬挂能恢复的长度
    let rollInfluence = 0.2;
    let steeringIncrement = .04;
    let steeringClamp = .5;
    let maxEngineForce = 2000;
    let maxBreakingForce = 100;
    // 底盘
    let geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);
    let localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(massVehicle, localInertia);
    let body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia));
    body.setActivationState(this.DISABLE_DEACTIVATION);
    this.physicsWorld.addRigidBody(body);
    let chassisMesh = this.createChassisMesh(chassisWidth, chassisHeight, chassisLength);
    // Raycast Vehicle
    let engineForce = 0;
    let vehicleSteering = 0;
    let breakingForce = 0;
    let tuning = new Ammo.btVehicleTuning(); // 保存车辆参数配置
    let rayCaster = new Ammo.btDefaultVehicleRaycaster(this.physicsWorld);
    let vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
    vehicle.setCoordinateSystem(0, 1, 2);
    this.physicsWorld.addAction(vehicle);
    // 车轮
    let FRONT_LEFT = 0;
    let FRONT_RIGHT = 1;
    let BACK_LEFT = 2;
    let BACK_RIGHT = 3;
    let wheelMeshes = [];
    let wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    let wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    this.addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition),
      wheelRadiusFront, wheelWidthFront, FRONT_LEFT, vehicle, wheelDirectionCS0, wheelAxleCS, suspensionRestLength,
      tuning, suspensionStiffness, suspensionDamping, suspensionCompression, friction, rollInfluence, wheelMeshes);
    this.addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition),
      wheelRadiusFront, wheelWidthFront, FRONT_RIGHT, vehicle, wheelDirectionCS0, wheelAxleCS, suspensionRestLength,
      tuning, suspensionStiffness, suspensionDamping, suspensionCompression, friction, rollInfluence, wheelMeshes);
    this.addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
      wheelRadiusBack, wheelWidthBack, BACK_LEFT, vehicle, wheelDirectionCS0, wheelAxleCS, suspensionRestLength,
      tuning, suspensionStiffness, suspensionDamping, suspensionCompression, friction, rollInfluence, wheelMeshes);
    this.addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
      wheelRadiusBack, wheelWidthBack, BACK_RIGHT, vehicle, wheelDirectionCS0, wheelAxleCS, suspensionRestLength,
      tuning, suspensionStiffness, suspensionDamping, suspensionCompression, friction, rollInfluence, wheelMeshes);
    // 将键盘输入,物理和绘制同步

    this.syncList.push(this.sync_Key(vehicle, breakingForce, engineForce,
      maxBreakingForce, maxEngineForce, vehicleSteering, steeringClamp,
      steeringIncrement, BACK_LEFT, BACK_RIGHT, FRONT_LEFT, FRONT_RIGHT, wheelMeshes, chassisMesh));
  }

  sync_Key(vehicle, breakingForce, engineForce,
           maxBreakingForce, maxEngineForce, vehicleSteering, steeringClamp,
           steeringIncrement, BACK_LEFT, BACK_RIGHT, FRONT_LEFT, FRONT_RIGHT, wheelMeshes, chassisMesh) {
    let speed = vehicle.getCurrentSpeedKmHour();
    // this.speedometer['innerHTML'] = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h';
    breakingForce = 0;
    engineForce = 0;
    if (this.actions.acceleration) {
      if (speed < -1) {
        breakingForce = maxBreakingForce;
      }
      else {
        engineForce = maxEngineForce;
      }
    }
    if (this.actions.braking) {
      if (speed > 1) {
        breakingForce = maxBreakingForce;
      }
      else {
        engineForce = -maxEngineForce / 2;
      }
    }
    if (this.actions.left) {
      if (vehicleSteering < steeringClamp) {
        vehicleSteering += steeringIncrement;
      }
    }
    else {
      if (this.actions.right) {
        if (vehicleSteering > -steeringClamp) {
          vehicleSteering -= steeringIncrement;
        }
      }
      else {
        if (vehicleSteering < -steeringIncrement) {
          vehicleSteering += steeringIncrement;
        }
        else {
          if (vehicleSteering > steeringIncrement) {
            vehicleSteering -= steeringIncrement;
          }
          else {
            vehicleSteering = 0;
          }
        }
      }
    }
    vehicle.applyEngineForce(engineForce, BACK_LEFT);
    vehicle.applyEngineForce(engineForce, BACK_RIGHT);
    vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
    vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
    vehicle.setBrake(breakingForce, BACK_LEFT);
    vehicle.setBrake(breakingForce, BACK_RIGHT);
    vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
    vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);
    let tm, p, q, i;
    let n = vehicle.getNumWheels();
    for (i = 0; i < n; i++) {
      vehicle.updateWheelTransform(i, true);
      tm = vehicle.getWheelTransformWS(i);
      p = tm.getOrigin();
      q = tm.getRotation();
      wheelMeshes[i].position.set(p.x(), p.y(), p.z());
      wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
    }
    console.log(vehicle);
    // tm = vehicle.getChassisWorldTransform();
    // vehicle.getChassisWorldTransform();
    p = tm.getOrigin();
    q = tm.getRotation();
    chassisMesh.position.set(p.x(), p.y(), p.z());
    chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
  }

  addWheel(isFront, pos, radius, width, index, vehicle, wheelDirectionCS0, wheelAxleCS,
           suspensionRestLength, tuning,
           suspensionStiffness, suspensionDamping, suspensionCompression, friction, rollInfluence, wheelMeshes) {
    let wheelInfo = vehicle.addWheel(
      pos,
      wheelDirectionCS0,
      wheelAxleCS,
      suspensionRestLength,
      radius,
      tuning,
      isFront
    );
    wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
    wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
    wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
    wheelInfo.set_m_frictionSlip(friction);
    wheelInfo.set_m_rollInfluence(rollInfluence);
    wheelMeshes[index] = this.createWheelMesh(radius, width);
  }


  ngOnInit() {
    this.init();
    this.animate();
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
