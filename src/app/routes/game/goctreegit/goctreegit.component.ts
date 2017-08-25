/// <reference types="three" />

import {forEach} from '@angular/router/src/utils/collection';

declare let Ammo;
declare let Stats;
declare let $: any;
declare let ElementQueries: any;
declare let ResizeSensor: any;
declare let dat: any;
// declare let Octree;
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ESOctree} from '../../../shared/utils/octree/octree';

@Component({
  selector: 'app-goctreegit',
  templateUrl: './goctreegit.component.html',
  styleUrls: ['./goctreegit.component.scss']
})
export class GoctreegitComponent implements OnInit, OnDestroy {

  container;
  stats: any;
  camera;
  controls;
  scene;
  renderer;
  clock = new THREE.Clock();

  octree;
  dim = {x: 500, y: 500, z: 500};
  spheres = [];

  constructor() {
    this.checkSup();
  }

  ngOnInit() {
    this.initGraphics();
    this.initResize();
    this.animate();
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


    this.octree = new ESOctree(null, new THREE.Vector3(0, 0, 0), this.dim.x, this.dim.y, this.dim.z);
    this.scene.add(this.octree.BoxMesh);

    for (let i = 0; i < 20; i++) {
      let sphere = this.createSphere(
        (Math.random() - 0.5) * this.dim.x * 2,
        (Math.random() - 0.5) * this.dim.y * 2,
        (Math.random() - 0.5) * this.dim.z * 2);

      sphere['dir'] = new THREE.Vector3();			// for animating
      sphere['changeFreq'] = Math.random() * 10000;	// for animating
      sphere['timeAtLastChange'] = (new Date()).getTime();	// for animating
      this.spheres.push(sphere);
      this.octree.add(sphere);
      this.scene.add(sphere);
    }

  }

  createSphere(x, y, z) {
    let geo = new THREE.SphereGeometry(10, 20, 20);
    let material = new THREE.MeshBasicMaterial({color: 0x2C590A, wireframe: false, opacity: 0.5});
    let sphere = new THREE.Mesh(geo, material);
    sphere.position.set(x, y, z);
    return sphere;
  }

  onWindowResize(elementId: string) {
    let height = window.innerHeight;
    // height -= $('#gheader').height();
    $('#' + elementId).height(height);
  }

  onRanderResize(elementId: string) {
    let width = $('#' + elementId).width();
    let height = $('#' + elementId).height();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }

  initResize() {
    let scope = this;
    ElementQueries.init();
    this.onWindowResize('container');
    this.onRanderResize('container');
    new ResizeSensor($('#container'), function () {
      scope.onWindowResize('container');
      scope.onRanderResize('container');
    });
  }

  animate() {
    let now = (new Date()).getTime();
    let scope = this;
    requestAnimationFrame(scope.animate.bind(scope));
    if (this.spheres) {
      for (let sphere of this.spheres) {
        let timeSinceLastChange = now - sphere.timeAtLastChange;
        if (timeSinceLastChange > sphere.changeFreq) {
          sphere.dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
          sphere.dir.normalize();
          sphere.timeAtLastChange = (new Date()).getTime();
        }
        let pos = (new THREE.Vector3()).addVectors(sphere.position, sphere.dir);

        if (this.octree.contains(pos)) {
          sphere.position.set(pos.x, pos.y, pos.z);
          this.octree.onEntityPoseChanged(sphere);
        }
        else {
          sphere.dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        }
      }
    }

    this.octree.update();
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

  ngOnDestroy() {
    this.controls.dispose();
  }
}
