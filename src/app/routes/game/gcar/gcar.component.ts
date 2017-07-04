/// <reference types="three" />

import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-gcar',
  templateUrl: './gcar.component.html',
  styleUrls: ['./gcar.component.scss']
})
export class GcarComponent implements OnInit {

  keyDown: any;

  camera: any;
  scene: any;
  renderer: any;
  geometry: any;
  material: any;
  mesh: any;
  car: any;
  skin: any;
  loader: any;
  pointLight: any;

  speed: number;

  constructor() {
  }

  ngOnInit() {
    this.gameInit();
  }

  gameInit() {
    this.loader = new THREE.ColladaLoader();
    this.scene = new THREE.Scene();
    this.loader.options.convertUpAxis = true;
    this.loader.load('../../../../assets/objs/collada/car/car.dae', function (collada) {

      this.car = collada.scene;
      this.skin = collada.skins[0];

      this.car.scale.x = this.car.scale.y = this.car.scale.z = 2;
      this.car.updateMatrix();

      this.init();
      this.render();
    }.bind(this));

    this.speed = 0;
    this.keyDown = new Array();
    for (let i = 0; i < 300; i++) {
      this.keyDown[i] = false;
    }

    document.onkeydown = function (event) {
      this.keyDown[event.keyCode] = true;
    }.bind(this);

    document.onkeyup = function (event) {
      this.keyDown[event.keyCode] = false;
    }.bind(this);
  }


  init() {

    this.addCamera();

    this.addFloor();

    this.addSkyBox();

    this.addLight();

    this.addBuildings();

    this.scene.add(this.car);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);
  }

  addCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth
      / window.innerHeight, 1, 100000);
    this.camera.position.y = 5000;
    this.camera.position.z = -5000;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  addLight() {
    this.pointLight = new THREE.PointLight(0xffffff);
    this.pointLight.position.set(new THREE.Vector3(0, 10000, 0));
    this.scene.add(this.pointLight);
  }

  addFloor() {
    let floorTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../../../../assets/img/car/sand.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);
    let floorMaterial = new THREE.MeshBasicMaterial({map: floorTexture, side: THREE.DoubleSide});
    let floorGeometry = new THREE.PlaneGeometry(100000, 100000, 100, 100);
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    this.scene.add(floor);
  }

  addSkyBox() {
    let imagePrefix = '../../../../assets/img/car/sky';
    let directions = ['+x', '-x', '+y', '-y', '+z', '-z'];
    let imageSuffix = '.png';
    let skyGeometry = new THREE.CubeGeometry(100000, 100000, 100000);

    let materialArray = [];
    for (let i = 0; i < 6; i++) {
      materialArray.push(new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
        side: THREE.BackSide
      }));
    }

    let skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    let skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(skyBox);
  }

  addBuildings() {
    let geometry = new THREE.CubeGeometry(1000, 2000, 1000);
    let crateMaterial = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('../../../../assets/img/car/crate.jpg')});
    let sandMaterial = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('../../../../assets/img/car/sand.jpg')});
    let murMaterial = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('../../../../assets/img/car/mur.jpg')});
    let woodMaterial = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('../../../../assets/img/car/wood.jpg')});

    let moveZ = 6000;
    let moveY = 2000;
    let moveX = 2000;
    for (let i = 0; i < 5; i++) {
      let building = new THREE.Mesh(geometry, crateMaterial);
      building.position.z = moveZ;
      building.position.y = moveY;
      building.position.x = moveX;

      moveX += 1000;
      moveY += 500;
      moveZ += -100;
      this.scene.add(building);
    }

    // Using wireframe materials to illustrate shape details.
    let wireframeMaterial = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true, transparent: true});
    let prismMultiMaterial = [murMaterial, wireframeMaterial];
    let sandMultiMaterial = [sandMaterial, wireframeMaterial];
    let woodMultiMaterial = [woodMaterial, wireframeMaterial];

    // prism
    let shape = THREE.SceneUtils.createMultiMaterialObject(
      // radiusAtTop, radiusAtBottom, height, segmentsAroundRadius, segmentsAlongHeight,
      new THREE.CylinderGeometry(200, 600, 1500, 10, 10),
      prismMultiMaterial);
    shape.position.set(4500, 4500, -1000);
    this.scene.add(shape);

    // cone - truncated
    shape = THREE.SceneUtils.createMultiMaterialObject(
      // radiusAtTop, radiusAtBottom, height, segmentsAroundRadius, segmentsAlongHeight,
      new THREE.CylinderGeometry(500, 800, 1400, 20, 4),
      woodMultiMaterial);
    shape.position.set(-4000, 4000, -1000);
    this.scene.add(shape);

    // pyramid - truncated
    shape = THREE.SceneUtils.createMultiMaterialObject(
      // radiusAtTop, radiusAtBottom, height, segmentsAroundRadius, segmentsAlongHeight,
      new THREE.CylinderGeometry(500, 1000, 1300, 6, 4),
      sandMultiMaterial);
    shape.position.set(-1000, 5000, -200);
    this.scene.add(shape);
  }

  render() {
    let scope = this;
    requestAnimationFrame(scope.render.bind(scope));

    if (this.keyDown[38]) {
      if (this.speed < 130) {
        this.speed += 1;
      }
    } else if (this.keyDown[40]) {
      if (this.speed > 0) {
        this.speed -= 2;
      }
    } else {
      this.speed -= 1;
      if (this.speed < 0) {
        this.speed = 0;
      }
    }
    if (this.speed > 0) {
      if (this.keyDown[37]) {
        this.car.rotation.y += 0.05;
      }
      if (this.keyDown[39]) {
        this.car.rotation.y -= 0.05;
      }
    }

    this.car.position.x += this.speed * Math.sin(this.car.rotation.y);
    this.car.position.z += this.speed * Math.cos(this.car.rotation.y);

    this.camera.lookAt(this.car.position);

    this.renderer.render(this.scene, this.camera);
  }

}
