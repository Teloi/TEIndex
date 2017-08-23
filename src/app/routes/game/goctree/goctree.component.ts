/// <reference types="three" />

declare let Ammo;
declare let Stats;
declare let $: any;
declare let ElementQueries: any;
declare let ResizeSensor: any;
declare let dat: any;
import {Component, OnDestroy, OnInit} from '@angular/core';


@Component({
  selector: 'app-goctree',
  templateUrl: './goctree.component.html',
  styleUrls: ['./goctree.component.scss']
})
export class GoctreeComponent implements OnInit, OnDestroy {
  container;
  stats: any;
  camera;
  controls;
  scene;
  renderer;
  clock = new THREE.Clock();


  octree: any;
  geometry = new THREE.BoxGeometry(2, 2, 2);
  radius = 500;
  radiusMax = this.radius * 10;
  radiusMaxHalf = this.radiusMax * 0.5;
  radiusSearch = 400;
  searchMesh;
  meshesSearch = [];

  rayCaster = new THREE.Raycaster();
  origin = new THREE.Vector3();
  direction = new THREE.Vector3();


  constructor() {
    this.checkSup();
  }


  ngOnInit() {
    this.initGraphics();
    this.searchMesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.radiusSearch),
      new THREE.MeshBasicMaterial({color: 0x00FF00, transparent: true, opacity: 0.4})
    );
    this.scene.add(this.searchMesh);
    this.octree = new THREE.Octree({
      // when undeferred = true, objects are inserted immediately
      // instead of being deferred until next octree.update() call
      // this may decrease performance as it forces a matrix update
      undeferred: false,
      // set the max depth of tree
      depthMax: Infinity,
      // max number of objects before nodes split or merge
      objectsThreshold: 8,
      // percent between 0 and 1 that nodes will overlap each other
      // helps insert objects that lie over more than one node
      overlapPct: 0.15,
      // pass the scene to visualize the octree
      scene: this.scene
    });
    this.initResize();
    this.animate();
  }

  modifyOctree() {
    let mesh = new THREE.Line(this.geometry, new THREE.LineBasicMaterial({color: 0xff00ff}));
    // give new object a random position in radius
    mesh.position.set(
      Math.random() * this.radiusMax - this.radiusMaxHalf,
      Math.random() * this.radiusMax - this.radiusMaxHalf,
      Math.random() * this.radiusMax - this.radiusMaxHalf
    );
    this.octree.add(mesh);
    this.scene.add(mesh);
  }

  searchOctree() {
    let i, il;
    // revert previous search objects to base color
    for (i = 0, il = this.meshesSearch.length; i < il; i++) {
      this.meshesSearch[i].object.material.color.copy(new THREE.Color(0xff00ff));
    }
    // new search position
    this.searchMesh.position.set(
      Math.random() * this.radiusMax - this.radiusMaxHalf,
      Math.random() * this.radiusMax - this.radiusMaxHalf,
      Math.random() * this.radiusMax - this.radiusMaxHalf
    );
    // search octree from search mesh position with search radius
    // optional third parameter: boolean, if should sort results by object when using faces in octree
    // optional fourth parameter: vector3, direction of search when using ray (assumes radius is distance/far of ray)
    this.origin.copy(this.searchMesh.position);
    this.direction.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
    this.rayCaster.set(this.origin, this.direction);
    this.meshesSearch = this.octree.search(this.rayCaster.ray.origin, this.radiusSearch, true, this.rayCaster.ray.direction);
    // set color of all meshes found in search
    for (i = 0, il = this.meshesSearch.length; i < il; i++) {
      this.meshesSearch[i].object.material.color.copy(new THREE.Color(0x00ff00));
    }
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
    let scope = this;
    requestAnimationFrame(scope.animate.bind(scope));
    this.modifyOctree();
    this.searchOctree();
    this.render();
    this.octree.update();
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

