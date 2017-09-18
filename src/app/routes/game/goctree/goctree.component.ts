/// <reference types="three" />

import {CSG} from '../../../shared/utils/csg/escsg';

declare let Ammo;
declare let Stats;
declare let $: any;
declare let ElementQueries: any;
declare let ResizeSensor: any;
declare let dat: any;
// declare let THREE;
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ES} from '../../../shared/utils/octree/loctree';

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
  ///////

  octree: ES.Octree;
  baseColor = 0x333333;

  // 射线查找
  mouse = new THREE.Vector2();
  raycaster = new ES.ESRaycaster();

  // 上次射线所找到的结点
  intersected;
  intersections;
  // 射线找到的颜色
  intersectColor = 0x00D66B;
  private octreeObjects: any;

  constructor() {
    this.checkSup();
  }


  modifyOctree(geometry, material, useFaces, useVertices, randomPosition?, randomRotation?, randomScale?) {
    let mesh;
    if (geometry) {
      mesh = new THREE.Mesh(geometry, material);
      // add new object to octree and scene
      // NOTE: octree object insertion is deferred until after the next render cycle
      this.octree.add(mesh, {useFaces: useFaces, useVertices: useVertices});
      // this.scene.add(mesh);
      // store object
      // this.objects.push(mesh);
    }

  }

  initOCtree() {
    this.octree = new ES.Octree({
      // scene: this.scene,
      undeferred: false,
      depthMax: Infinity,
      objectsThreshold: 8,
      overlapPct: 0.15
    });

    let geom = new THREE.PlaneGeometry(500, 500, 10, 10);
    this.scene.add(new THREE.Mesh(geom, new THREE.MeshLambertMaterial({
      color: 0x778877, wireframe: true,
      opacity: 0.5
    })));
    geom.computeBoundingBox();
    let polygons: any[] = [];
    if (geom instanceof THREE.Geometry) {
      if (geom.faces && geom.faces.length > 0) {
        let vertices: THREE.Vector3[] = geom.vertices;
        let v1, v2, v3, polygon;
        for (let face of geom.faces) {
          v1 = new THREE.Vector3(vertices[face.a].x, vertices[face.a].y, vertices[face.a].z);
          v2 = new THREE.Vector3(vertices[face.b].x, vertices[face.b].y, vertices[face.b].z);
          v3 = new THREE.Vector3(vertices[face.c].x, vertices[face.c].y, vertices[face.c].z);
          polygon = [v1, v2, v3];
          polygons.push(polygon);
        }
      }
    }
    for (let plg of polygons) {
      let vertices: number[] = [];
      if (plg.length >= 3) {
        for (let i = 2, len = plg.length; i < len; ++i) {
          vertices.push(plg[0].x, plg[0].y, plg[0].z);
          vertices.push(plg[i - 1].x, plg[i - 1].y, plg[i - 1].z);
          vertices.push(plg[i].x, plg[i].y, plg[i].z);
        }
      }
      let geomitem: THREE.BufferGeometry = new THREE.BufferGeometry();
      geomitem.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geomitem.computeVertexNormals();
      this.modifyOctree(geomitem, new THREE.MeshLambertMaterial({color: 0x333333, wireframe: false, opacity: 0.5}), false, false);
    }

  }

  onDocumentMouseMove(event) {
    event.preventDefault();
    this.mouse.setX(( event.clientX / window.innerWidth ) * 2 - 1);
    this.mouse.setY(-( event.clientY / window.innerHeight ) * 2 + 1);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.octreeObjects = [];
    this.intersections = [];
    this.octreeObjects = this.octree.search(this.raycaster.ray.origin, this.raycaster.far, true, this.raycaster.ray.direction);
    this.intersections = this.raycaster.intersectOctreeObjects(this.octreeObjects);
    if (this.intersections.length > 0) {
      if (this.intersected !== this.intersections[0].object) {
        if (this.intersected) {
          this.intersected.material.color.setHex(this.baseColor);
        }
        this.intersected = this.intersections[0].object;
        this.intersected.material.color.setHex(this.intersectColor);
      }
      document.body.style.cursor = 'pointer';
    }
    else if (this.intersected) {
      this.intersected.material.color.setHex(this.baseColor);
      this.intersected = null;
      document.body.style.cursor = 'auto';
    }
  }

  onDocumentClick(event) {
    if (this.intersections.length > 0) {
      this.intersections[0].object.geometry.computeBoundingSphere();
      let mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(this.intersections[0].object.geometry.boundingSphere.radius),
        new THREE.MeshLambertMaterial({
          color: 0x444444,
          wireframe: true,
          opacity: 0.5
        }));
      mesh.position.set(this.intersections[0].object.geometry.boundingSphere.center.x,
        this.intersections[0].object.geometry.boundingSphere.center.y,
        this.intersections[0].object.geometry.boundingSphere.center.z);

      let geooo = new THREE.BufferGeometry();
      let vet = [];
      let geos = <THREE.BufferGeometry>mesh.geometry;
      let pos = geos.getAttribute('position').array;
      let inde = geos.getIndex();
      let x = this.intersections[0].object.geometry.boundingSphere.center.x;
      let y = this.intersections[0].object.geometry.boundingSphere.center.y;
      let z = this.intersections[0].object.geometry.boundingSphere.center.z;
      for (let i = 0; i < pos.length; i += 3) {
        vet.push(pos[i] + x);
        vet.push(pos[i + 1] + y);
        vet.push(pos[i + 2] + z);
      }
      geooo.setIndex(inde);
      geooo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vet), 3));
      geooo.computeVertexNormals();

      let rayCaster = new ES.ESRaycaster(new THREE.Vector3().copy(this.intersections[0].object.geometry.boundingSphere.center),
        new THREE.Vector3(1, 1, 1).normalize());
      let meshesSearch = this.octree.search(rayCaster.ray.origin, this.intersections[0].object.geometry.boundingSphere.radius,
        true);
      let geo = new THREE.BufferGeometry();
      let vertices = [];
      for (let i of meshesSearch) {
        for (let j = 0; j < i.object.geometry.attributes.position.array.length; j += 3) {
          let point = new THREE.Vector3(i.object.geometry.attributes.position.array[j],
            i.object.geometry.attributes.position.array[j + 1],
            i.object.geometry.attributes.position.array[j + 2]);
          if (this.intersections[0].object.geometry.boundingSphere.containsPoint(point)) {
            for (let t of i.object.geometry.attributes.position.array) {
              vertices.push(t);
            }
            break;
          }
        }
      }
      geo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geo.computeVertexNormals();


      let plan = CSG.fromGeometry(geo);
      let shp = CSG.fromGeometry(geooo);

      let geometrynew = plan.union(shp).toGeometry();

      let materialnew = new THREE.MeshLambertMaterial({color: 0x3f3f3f, wireframe: false, opacity: 0.5});
      let meshsss = new THREE.Mesh(geometrynew, materialnew);

      this.scene.add(meshsss);
    }
  }

  ngOnInit() {
    this.initGraphics();
    this.initOCtree();
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
    this.renderer.shadowMap.enabled = true;
    this.scene = new THREE.Scene();
    let ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
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
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.right = '0px';
    this.stats.domElement.style.left = null;
    this.container.appendChild(this.stats.domElement);
    this.renderer.domElement.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
    this.renderer.domElement.addEventListener('click', this.onDocumentClick.bind(this), false);
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

