
/// <reference types="three" />

declare let Ammo;
declare let Stats;
declare let $: any;
declare let ElementQueries: any;
declare let ResizeSensor: any;

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gdemo',
  templateUrl: './gdemo.component.html',
  styleUrls: ['./gdemo.component.scss']
})
export class GdemoComponent implements OnInit {
  container;
  stats: any;
  camera;
  controls;
  scene;
  renderer;
  clock = new THREE.Clock();

  constructor() {
    this.checkSup();
  }

  createObjects() {
    let floorTexture: THREE.Texture = THREE.ImageUtils.loadTexture('../../../../assets/img/car/sand.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);
    let floorMaterial = new THREE.MeshBasicMaterial({map: floorTexture, side: THREE.DoubleSide});
    let floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    this.scene.add(floor);

    let geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array([
      -100.0, -100.0, 100.0,
      100.0, -100.0, 100.0,
      100.0, 100.0, 100.0
    ]);
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    let material = new THREE.MeshBasicMaterial({color: 0xff0000});
    let mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }

  initGraphics() {
    this.container = document.getElementById('container');
    this.container.innerHTML = '';
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
    this.camera.position.x = -700;
    this.camera.position.y = 1000;
    this.camera.position.z = 800;
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxPolarAngle = Math.PI * 0.5;
    this.controls.target.y = 2;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xbfd1e5);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer.shadowMap.enabled = true;
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
    // this.addSkyBox();
    // this.initPhysics();
    this.createObjects();
    this.animate();
  }

  animate() {
    let scope = this;
    requestAnimationFrame(scope.animate.bind(scope));
    this.render();
    this.stats.update();
  }

  render() {
    let deltaTime = this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
    this.controls.update(deltaTime);
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
