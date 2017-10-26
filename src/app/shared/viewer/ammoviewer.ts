/// <reference types="three" />
declare let $;  // JQuery
declare let ElementQueries: any;
declare let ResizeSensor: any;
declare let Stats;
declare let Ammo;
declare let Detector;

import {isNullOrUndefined} from 'util';

export class AMMOViewer {

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

  // Physics Base Config
  private TRANSFORM_AUX;
  private DISABLE_DEACTIVATION; // 弹性？ 待定
  private margin; // 刚体外边缘

  // Physices Element
  private physicsWorld; // 物理场景
  private rigidBodies;  // 刚体 简单的
  private syncList; // 刚体 自带运动计算的 类似车等
  private wheelMeshes; // 轮子
  private speedometer; // 速度表
  private actions; // 动作
  private keysActions; // 按键

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
        this.initPhysicsConfig();
        this.initPhysics();
      }

      this.initResize();
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Failed to load scene: ', error, error.stack, this, arguments);
    }
  }

  /*****************************Function***************************/

  public buildPlane() {
    const floorTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../../../../assets/img/floor.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);
    const floorMaterial = new THREE.MeshBasicMaterial({map: floorTexture, side: THREE.DoubleSide});
    const floorGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = 0;
    floor.rotation.x = Math.PI / 2;
    this.scene.add(floor);
  }

  public animate() {
    const render = function () {
      const deltaTime = this.clock.getDelta();
      this.renderer.render(this.scene, this.camera);
      if (!isNullOrUndefined(this.physicsWorld)) {
        this.updatePhysics(deltaTime);
      }
      if (!isNullOrUndefined(this.controls)) {
        this.controls.update(deltaTime);
      } else {
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
    render();
  }

  /*****************************Base Component***************************/

  private perspectiveCamera(): THREE.Camera {
    let camera: THREE.Camera;
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.x = -70;
    camera.position.y = 100;
    camera.position.z = 80;
    return camera;
  }

  private orbitControls(camera): THREE.OrbitControls {
    if (camera === null) {
      console.error('InitOrbitControls Error!');
    }
    const controls = new THREE.OrbitControls(camera);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.target.y = 2;
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

  /*****************************IF Physics Public***************************/

  public addRigidBodyObjects(threeObject, body, mass) {
    if (isNullOrUndefined(this.physicsWorld)) {
      console.error('Is Not Init physicsWorld,Create Body Error!');
      return;
    }
    this.scene.add(threeObject);
    if (mass > 0) {
      this.rigidBodies.push(threeObject);
    }
    this.physicsWorld.addRigidBody(body);
  }

  buildRigidBodyBoxbyo(pos, quat, w, l, h, mass, color, friction?) {
    const material = new THREE.MeshPhongMaterial({color: color});
    const shape = new THREE.BoxBufferGeometry(w, l, h, 1, 1, 1);
    const geometry = new Ammo.btBoxShape(new Ammo.btVector3(w * 0.5, l * 0.5, h * 0.5));
    if (!mass) {
      mass = 0;
    }
    if (!friction) {
      friction = 1;
    }
    const mesh = new THREE.Mesh(shape, material);
    mesh.position.copy(pos);
    mesh.quaternion.copy(quat);
    this.scene.add(mesh);
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);
    const localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(mass, localInertia);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, geometry, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    body.setFriction(friction);

    this.physicsWorld.addRigidBody(body);
    if (mass > 0) {
      body.setActivationState(this.DISABLE_DEACTIVATION);
      // 同步物理场景和绘图空间
      const sync = function (dt) {
        const ms = body.getMotionState();
        if (ms) {
          ms.getWorldTransform(this.TRANSFORM_AUX);
          const p = this.TRANSFORM_AUX.getOrigin();
          const q = this.TRANSFORM_AUX.getRotation();
          mesh.position.set(p.x(), p.y(), p.z());
          mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
      }.bind(this);

      this.syncList.push(sync);
    }
  }

  buildVehicle(pos, quat) {
    // 绘制车轮
    const createWheelMesh = function (radius, width) {
      const t = new THREE.CylinderBufferGeometry(radius, radius, width, 24, 1);
      t.rotateZ(Math.PI / 2);
      const mesh = new THREE.Mesh(t, this.createRendomColorObjectMeatrial());
      mesh.add(new THREE.Mesh(new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius * .25, 1, 1, 1),
        this.createRendomColorObjectMeatrial()));
      this.scene.add(mesh);
      return mesh;
    }.bind(this);

    // 绘制底盘
    const createChassisMesh = function (w, l, h) {
      const shape = new THREE.BoxBufferGeometry(w, l, h, 1, 1, 1);
      const mesh = new THREE.Mesh(shape, this.createRendomColorObjectMeatrial());
      this.scene.add(mesh);
      return mesh;
    }.bind(this);

    // 车辆常量
    const chassisWidth = 1.8;
    const chassisHeight = .6;
    const chassisLength = 4;
    const massVehicle = 2000; // 重力

    const wheelAxisPositionBack = -1;
    const wheelRadiusBack = .4;
    const wheelWidthBack = .3;
    const wheelHalfTrackBack = 1;
    const wheelAxisHeightBack = .3;
    const wheelAxisFrontPosition = 1.7;
    const wheelHalfTrackFront = 1;
    const wheelAxisHeightFront = .3;
    const wheelRadiusFront = .35;
    const wheelWidthFront = .2;

    const friction = 2000;  // 摩擦力

    const suspensionStiffness = 20.0; // 悬挂刚性
    const suspensionDamping = 2.3;    // 悬挂阻尼
    const suspensionCompression = 4.4; // 悬挂压缩
    const suspensionRestLength = 0.6; // 悬挂能恢复的长度

    const rollInfluence = 0.2;
    const steeringIncrement = .04;
    const steeringClamp = .5;
    const maxEngineForce = 2000;
    const maxBreakingForce = 100;

    // 底盘
    const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);
    const localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(massVehicle, localInertia);
    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia));
    body.setActivationState(this.DISABLE_DEACTIVATION);
    this.physicsWorld.addRigidBody(body);
    const chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);
    // Raycast Vehicle
    let engineForce = 0;
    let vehicleSteering = 0;
    let breakingForce = 0;
    const tuning = new Ammo.btVehicleTuning(); // 保存车辆参数配置
    const rayCaster = new Ammo.btDefaultVehicleRaycaster(this.physicsWorld);
    const vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
    vehicle.setCoordinateSystem(0, 1, 2);
    this.physicsWorld.addAction(vehicle);

    // 车轮
    const FRONT_LEFT = 0;
    const FRONT_RIGHT = 1;
    const BACK_LEFT = 2;
    const BACK_RIGHT = 3;

    // let wheelMeshes = [];
    const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    const addWheel = function (isFront, position, radius, width, index) {

      const wheelInfo = vehicle.addWheel(
        position,
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
      this.wheelMeshes[index] = createWheelMesh(radius, width);
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
    const sync = function (dt) {
      const speed = vehicle.getCurrentSpeedKmHour();
      if (!isNullOrUndefined(this.speedometer)) {
        this.speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h';
      }
      breakingForce = 0;
      engineForce = 0;
      if (this.actions.acceleration) {
        if (speed < -1) {
          breakingForce = maxBreakingForce;
        } else {
          engineForce = maxEngineForce;
        }
      }
      if (this.actions.braking) {
        if (speed > 1) {
          breakingForce = maxBreakingForce;
        } else {
          engineForce = -maxEngineForce / 2;
        }
      }
      if (this.actions.left) {
        if (vehicleSteering < steeringClamp) {
          vehicleSteering += steeringIncrement;
        }
      } else {
        if (this.actions.right) {
          if (vehicleSteering > -steeringClamp) {
            vehicleSteering -= steeringIncrement;
          }
        } else {
          if (vehicleSteering < -steeringIncrement) {
            vehicleSteering += steeringIncrement;
          } else {
            if (vehicleSteering > steeringIncrement) {
              vehicleSteering -= steeringIncrement;
            } else {
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
      const n = vehicle.getNumWheels();
      for (i = 0; i < n; i++) {
        vehicle.updateWheelTransform(i, true);
        tm = vehicle.getWheelTransformWS(i);
        p = tm.getOrigin();
        q = tm.getRotation();
        this.wheelMeshes[i].position.set(p.x(), p.y(), p.z());
        this.wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
      }

      tm = vehicle.getChassisWorldTransform();
      p = tm.getOrigin();
      q = tm.getRotation();
      chassisMesh.position.set(p.x(), p.y(), p.z());
      chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());

    }.bind(this);

    this.syncList.push(sync);
  }

  /*****************************IF Physics Private***************************/
  updatePhysics(deltaTime) {
    for (let i = 0, iL = this.rigidBodies.length; i < iL; i++) {
      const objThree = this.rigidBodies[i];
      const objPhys = objThree.userData.physicsBody;
      const ms = objPhys.getMotionState();
      if (ms) {
        ms.getWorldTransform(this.TRANSFORM_AUX);
        const p = this.TRANSFORM_AUX.getOrigin();
        const q = this.TRANSFORM_AUX.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
    }
    for (let i = 0; i < this.syncList.length; i++) {
      this.syncList[i](deltaTime);
    }
    this.physicsWorld.stepSimulation(deltaTime, 10);
  }

  private initPhysicsConfig() {
    this.DISABLE_DEACTIVATION = 4;
    this.TRANSFORM_AUX = new Ammo.btTransform();
    this.margin = 0.05; // 没有间隙

    this.rigidBodies = [];
    this.syncList = [];

    // 车辆相关
    this.wheelMeshes = [];

    this.actions = {
      'acceleration': false,
      'braking': false,
      'left': false,
      'right': false
    };
    this.keysActions = {
      'KeyW': 'acceleration',
      'KeyS': 'braking',
      'KeyA': 'left',
      'KeyD': 'right'
    };
  }

  private initPhysics() {
    // 默认碰撞配置参数
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    // 调度员
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    // 粗测阶段
    const broadphase = new Ammo.btDbvtBroadphase();
    // 创建解算器，用于求解约束方程。得到物体在重力等作用下的最终位置的
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    // 重力常数
    const gravityConstant = -9.8;
    this.physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
    // About Car
    this.speedometer = document.getElementById('speedometer');
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

  /*****************************Help Tools***************************/

  private checkWebGL() {
    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
    }
  }

  private initResize() {

    const onWindowResize = function (element: any) {
      const height = window.innerHeight;
      // height -= $('#gheader').height();
      $(element).height(height);
    }.bind(this);

    const onRanderResize = function (element: any) {
      const width = $(element).width();
      const height = $(element).height();
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
    const temp = new ResizeSensor($(this.container), function () {
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
    const helper = new THREE.AxisHelper(size);
    this.scene.add(helper);
  }

  public addCameraHelper() {
    const helper = new THREE.CameraHelper(this.camera);
    this.scene.add(helper);
  }

  public createRendomColorObjectMeatrial() {
    const color = Math.floor(Math.random() * (16777216));
    return new THREE.MeshPhongMaterial({color: color});
  }

  public disposeControls() {
    if (!isNullOrUndefined(this.controls)) {
      this.controls.dispose();
    }
  }
}
