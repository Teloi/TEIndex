/// <reference types="three" />

declare let Ammo;
declare let Stats;
declare let $: any;
declare let ElementQueries: any;
declare let ResizeSensor: any;
import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
  selector: 'app-gammocar',
  templateUrl: './gammocar.component.html',
  styleUrls: ['./gammocar.component.scss']
})
export class GammocarComponent implements OnInit, OnDestroy {
  container;
  stats: any;
  camera;
  controls;
  scene;
  renderer;
  textureLoader;
  clock = new THREE.Clock();

  margin = 0.05; // 边界？
  rigidBodies = [];
  physicsWorld;

  private collisionConfiguration; // 默认碰撞配置参数
  private gravityConstant = -9.8; // 重力常数
  private dispatcher; // 调度员
  private broadphase; // 粗测阶段
  private solver; // 创建解算器，用于求解约束方程。得到物体在重力等作用下的最终位置的

  transformAux1 = new Ammo.btTransform();

  time = 0;

  syncList: any[] = [];
  TRANSFORM_AUX = new Ammo.btTransform();
  DISABLE_DEACTIVATION = 4;
  ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);

  speedometer; // 速度表

  wheelMeshes = []; // 轮子
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

  constructor() {
    this.checkSup();
  }

  initGraphics() {
    this.container = document.getElementById('container');
    this.container.innerHTML = '';
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
    this.camera.position.x = -7;
    this.camera.position.y = 10;
    this.camera.position.z = 8;
    // this.controls = new THREE.OrbitControls(this.camera);
    // this.controls.maxPolarAngle = Math.PI * 0.5;
    // this.controls.target.y = 2;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xbfd1e5);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
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

    this.speedometer = document.getElementById('speedometer');
  }

  createObjects() {
    let pos = new THREE.Vector3();
    let quat = new THREE.Quaternion();
    pos.set(0, -0.5, 0);
    quat.set(0, 0, 0, 1);

    this.createFloor1(pos, quat);
    this.createWalls(pos, quat);
    this.createFixedBox();
    this.createRandomBox(pos, quat);
    this.createVehicleCar();
  }

  createVehicleCar() {
    this.createVehicle(new THREE.Vector3(0, 5, -20), this.ZERO_QUATERNION);
  }

  createFloor1(pos, quat) {
    let ground = this.createParallellepiped(100, 1, 100, 0, pos, quat, new THREE.MeshPhongMaterial({color: 0xffffff}));
    ground.castShadow = true;       // 开启投影
    ground.receiveShadow = true;    // 接受阴影(可以在表面上显示阴影)
    this.textureLoader.load('../../../../assets/img/floor.jpg', function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(40, 40);
      ground.material['map'] = texture;
      ground.material.needsUpdate = texture;
    });
  }

  createFloor2() {
    // ground
    this.createBox(new THREE.Vector3(0, -0.5, 0), this.ZERO_QUATERNION, 75, 1, 75, 0, 2);
  }

  createWalls(pos, quat) {
    let array = new Array<number>();
    array = [-50.0, -50.0, 50.0,
      50.0, -50.0, 50.0,
      50.0, 50.0, 50.0,

      50.0, 50.0, 50.0,
      -50.0, 50.0, 50.0,
      -50.0, -50.0, 50.0,

      50.0, 50.0, 50.0,
      50.0, -50.0, 50.0,
      -50.0, -50.0, 50.0,


      -50.0, -50.0, 50.0,
      -50.0, 50.0, 50.0,
      50.0, 50.0, 50.0];

    for (let i = 0; i < array.length; i += 9) {
      let ar: Array<number> = new Array<number>();
      ar.push(array[i]);
      ar.push(array[i + 1]);
      ar.push(array[i + 2]);
      ar.push(array[i + 3]);
      ar.push(array[i + 4]);
      ar.push(array[i + 5]);
      ar.push(array[i + 6]);
      ar.push(array[i + 7]);
      ar.push(array[i + 8]);
      let geometry = new THREE.BufferGeometry();
      let vertices = new Float32Array(ar);
      geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
      let material = new THREE.MeshBasicMaterial({color: 0xff0000});
      // material.alphaTest = 0; 透明
      let mesh = new THREE.Mesh(geometry, material);
      let btConvexHullShape = new Ammo.btConvexHullShape();

      for (let j = 0; j < ar.length; j += 3) {
        btConvexHullShape.addPoint(new Ammo.btVector3(ar[j], ar[j + 1], ar[j + 2]), true);
      }
      let shape = btConvexHullShape;
      shape.setMargin(this.margin);
      this.createRigidBody(mesh, shape, 0, pos, quat);
    }
  }

  createFixedBox() {
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
  }

  createRandomBox(pos, quat) {
    for (let i = 0; i < 20; i++) {
      pos.set(Math.random(), 2 * i, Math.random());
      quat.set(0, 0, 0, 1);
      this.createRondomObject(pos, quat, Math.ceil(Math.random() * 3));
    }
  }

  createParallellepiped(sx, sy, sz, mass, pos, quat, material) {
    let threeObject = new THREE.Mesh(new THREE.BoxBufferGeometry(sx, sy, sz, 1, 1, 1), material);
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
      // Ammo.DISABLE_DEACTIVATION = 40;
      body.setActivationState(4);
    }
    this.physicsWorld.addRigidBody(body);
    return body;
  }

  createBox(pos, quat, w, l, h, mass, friction?) {
    let material = this.createRendomColorObjectMeatrial();
    let shape = new THREE.BoxBufferGeometry(w, l, h, 1, 1, 1);
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
      let sync = function sync(dt) {
        let ms = body.getMotionState();
        if (ms) {
          ms.getWorldTransform(this.TRANSFORM_AUX);
          let p = this.TRANSFORM_AUX.getOrigin();
          let q = this.TRANSFORM_AUX.getRotation();
          mesh.position.set(p.x(), p.y(), p.z());
          mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
      }.bind(this);

      this.syncList.push(sync);
    }
  }

  // 绘制车轮
  createWheelMesh(radius, width) {
    let t = new THREE.CylinderBufferGeometry(radius, radius, width, 24, 1);
    t.rotateZ(Math.PI / 2);
    let mesh = new THREE.Mesh(t, this.createRendomColorObjectMeatrial());
    mesh.add(new THREE.Mesh(new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius * .25, 1, 1, 1),
      this.createRendomColorObjectMeatrial()));
    this.scene.add(mesh);
    return mesh;
  }

  // 绘制底盘
  createChassisMesh(w, l, h) {
    let shape = new THREE.BoxBufferGeometry(w, l, h, 1, 1, 1);
    let mesh = new THREE.Mesh(shape, this.createRendomColorObjectMeatrial());
    this.scene.add(mesh);
    return mesh;
  }

  // 造车
  createVehicle(pos, quat) {
    // 车辆常量
    let chassisWidth = 1.8;
    let chassisHeight = .6;
    let chassisLength = 4;
    let massVehicle = 2000; // 重力

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

    let friction = 2000;  // 摩擦力

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

    // let wheelMeshes = [];
    let wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    let wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    let addWheel = function (isFront, pos, radius, width, index) {

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
      this.wheelMeshes[index] = this.createWheelMesh(radius, width);
    }.bind(this);

    addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition),
      wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
    addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition),
      wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
    addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
      wheelRadiusBack, wheelWidthBack, BACK_LEFT);
    addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack),
      wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

    // 将键盘输入,物理和绘制同步
    let sync = function (dt) {
      let speed = vehicle.getCurrentSpeedKmHour();
      this.speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h';
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
        this.wheelMeshes[i].position.set(p.x(), p.y(), p.z());
        this.wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
      }

      // console.log(vehicle);

      tm = vehicle.getChassisWorldTransform();
      // vehicle.getChassisWorldTransform();
      p = tm.getOrigin();
      q = tm.getRotation();
      chassisMesh.position.set(p.x(), p.y(), p.z());
      chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());

    }.bind(this);

    this.syncList.push(sync);
  }

  // 基本配置
  initPhysics() {
    // bullet基本场景配置
    this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
    this.broadphase = new Ammo.btDbvtBroadphase();
    this.solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration);
    this.physicsWorld.setGravity(new Ammo.btVector3(0, this.gravityConstant, 0));
  }

  addSkyBox() {
    let imagePrefix = '../../../../assets/img/car/sky';
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

  // 生产随机Object
  createRondomObject(pos, quat, objectSize) {
    let numTypes = 4;
    let objectType = Math.ceil(Math.random() * numTypes);
    let threeObject = null;
    let shape = null;
    //  var objectSize = 3;
    switch (objectType) {

      case 1: {
        // Sphere
        let radius = 1 + Math.random() * objectSize;
        threeObject = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 20, 20), this.createRendomColorObjectMeatrial());
        shape = new Ammo.btSphereShape(radius);
        shape.setMargin(this.margin);
        break;
      }

      case 2: {
        // Box
        let sx = 1 + Math.random() * objectSize;
        let sy = 1 + Math.random() * objectSize;
        let sz = 1 + Math.random() * objectSize;
        threeObject = new THREE.Mesh(new THREE.BoxBufferGeometry(sx, sy, sz, 1, 1, 1), this.createRendomColorObjectMeatrial());
        shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
        shape.setMargin(this.margin);
        break;
      }

      case 3: {
        // Cylinder
        let radius = 1 + Math.random() * objectSize;
        let height = 1 + Math.random() * objectSize;
        threeObject = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 20, 1),
          this.createRendomColorObjectMeatrial());
        shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * 0.5, radius));
        shape.setMargin(this.margin);
        break;
      }

      default: {
        // Cone
        let radius = 1 + Math.random() * objectSize;
        let height = 2 + Math.random() * objectSize;
        threeObject = new THREE.Mesh(new THREE.CylinderBufferGeometry(0, radius, height, 20, 2), this.createRendomColorObjectMeatrial());
        shape = new Ammo.btConeShape(radius, height);
        break;
      }
    }
    let mass = objectSize * 5; // 体积越大质量越大
    this.createRigidBody(threeObject, shape, mass, pos, quat);
  }

  // 随机颜色
  createRendomColorObjectMeatrial() {
    let color = Math.floor(Math.random() * (16777216));
    return new THREE.MeshPhongMaterial({color: color});
  }

  // 更新物体位置
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
    for (let i = 0; i < this.syncList.length; i++) {
      this.syncList[i](deltaTime);
    }
    this.physicsWorld.stepSimulation(deltaTime, 10);
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
    // this.controls.update(deltaTime);
    // 从后轮看向前轮
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

    this.renderer.render(this.scene, this.camera);
    this.time += deltaTime;
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

  ngOnInit() {
    this.initGraphics();
    this.initResize();
    this.addSkyBox();
    this.initPhysics();
    this.createObjects();
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

  ngOnDestroy() {
    this.controls.dispose();
  }
}
