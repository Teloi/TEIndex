import {Component, OnDestroy, OnInit} from '@angular/core';
import {Viewer} from '../../../shared/viewer/viewer';
import {TE} from '../../../shared/utils/octree/octree';
/// <reference types="three" />
@Component({
  selector: 'app-viewer-octree',
  templateUrl: './viewer-octree.component.html',
  styleUrls: ['./viewer-octree.component.scss']
})

export class ViewerOctreeComponent implements OnInit, OnDestroy {
  private viewer: Viewer;
  private isControls: boolean;

  private octree: TE.Octree;

  constructor() {
    this.isControls = true;
  }

  ngOnInit() {
    this.viewer = new Viewer('viewer-octree');
    this.viewer.InitScene(this.isControls,
      () => {
        this.viewer.addStats();
        this.viewer.addSkyBox();
        // octree
        this.initOCtree();
        let mesh = this.newBox();
        let polygens = this.splitGeometryPoints(mesh.geometry);
        this.mergeGeometrysAppendTree(polygens);
        // octree
        this.viewer.animate();
      }
    );
  }

  /* Octree Page Functions  */
  initOCtree() {
    this.octree = new TE.Octree({
      scene: this.viewer.scene,
      undeferred: false,
      depthMax: Infinity,
      objectsThreshold: 8,
      overlapPct: 0.15
    });
  }

  newBox(): THREE.Mesh {
    let boxGeometry = new THREE.BoxGeometry(20, 20, 20, 10, 10, 10);
    let boxMaterial = new THREE.MeshBasicMaterial({color: 0x00FFFF, wireframe: true, opacity: 0.5});
    let boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    return boxMesh;
  }

  splitGeometryPoints(geometry) {
    let points: any[] = [];
    if (geometry instanceof THREE.Geometry) {
      if (geometry.faces && geometry.faces.length > 0) {
        let vertices: THREE.Vector3[] = geometry.vertices;
        let v1, v2, v3, point;
        for (let face of geometry.faces) {
          v1 = new THREE.Vector3(vertices[face.a].x, vertices[face.a].y, vertices[face.a].z);
          v2 = new THREE.Vector3(vertices[face.b].x, vertices[face.b].y, vertices[face.b].z);
          v3 = new THREE.Vector3(vertices[face.c].x, vertices[face.c].y, vertices[face.c].z);
          point = [v1, v2, v3];
          points.push(point);
        }
      }
    }
    return points;
  }

  mergeGeometrysAppendTree(points) {
    for (let plg of points) {
      let vertices: number[] = [];
      if (plg.length >= 3) {
        for (let i = 2, len = plg.length; i < len; ++i) {
          vertices.push(plg[0].x, plg[0].y, plg[0].z);
          vertices.push(plg[i - 1].x, plg[i - 1].y, plg[i - 1].z);
          vertices.push(plg[i].x, plg[i].y, plg[i].z);
        }
      }
      let trianglesGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
      trianglesGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      trianglesGeometry.computeVertexNormals();
      let trianglesMaterial = new THREE.MeshLambertMaterial({color: 0x00FFFF, wireframe: false, opacity: 0.5});
      this.treeAppend(trianglesGeometry, trianglesMaterial);
    }
  }

  treeAppend(geometry, material) {
    let mesh;
    if (geometry) {
      mesh = new THREE.Mesh(geometry, material);
      // NOTE: octree object insertion is deferred until after the next render cycle
      this.octree.add(mesh, {useFaces: false, useVertices: false});
      this.viewer.addMesh(mesh);
      this.octree.update();
    }
  }

  // TODO:Search

  /**
   * Dispose the Control When this page Destroyed
   */
  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.disposeControls();
    }
    this.octree = null;
  }

}
