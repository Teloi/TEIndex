import {Component, OnDestroy, OnInit} from '@angular/core';
import {Viewer} from '../../../shared/viewer/viewer';
import {CSG} from '../../../shared/utils/csg/csg';
/// <reference types="three" />
@Component({
  selector: 'app-viewer-csg',
  templateUrl: './viewer-csg.component.html',
  styleUrls: ['./viewer-csg.component.scss']
})
export class ViewerCsgComponent implements OnInit, OnDestroy {

  private viewer: Viewer;
  private isControls: boolean;

  constructor() {
    this.isControls = true;
  }

  ngOnInit() {
    this.viewer = new Viewer('viewer-csg');
    this.viewer.InitScene(this.isControls,
      () => {
        this.viewer.addStats();
        this.viewer.addSkyBox();
        this.viewer.addMesh(this.Demo1());
        this.viewer.animate();
      }
    );
  }

  private Demo1() {
    let geometrycube = new THREE.BoxBufferGeometry(8, 8, 8);
    let geometrysphere = new THREE.SphereBufferGeometry(5, 32, 32);
    let csgcube = CSG.fromGeometry(geometrycube);
    let csgsphere = CSG.fromGeometry(geometrysphere);
    let geometrynew = csgcube.subtract(csgsphere).toGeometry();
    let materialnew = new THREE.MeshBasicMaterial({color: 0xfefefe, wireframe: false, opacity: 0.5});
    let mesh = new THREE.Mesh(geometrynew, materialnew);
    return mesh;
  }

  private Demo2() {
    let geometry = this.BuildBoxGeometryFromMeshCenter(new THREE.Vector3(0, 0, -2), 10, 5, 0);
    let planeGeo = new THREE.BoxBufferGeometry(30, 30, 1);
    let csgcube = CSG.fromGeometry(planeGeo);
    let csgsphere = CSG.fromGeometry(geometry);
    let geometrynew = csgcube.subtract(csgsphere).toGeometry();
    let materialnew = new THREE.MeshLambertMaterial({color: 0xfefefe, wireframe: false, opacity: 0.5});
    let mesh = new THREE.Mesh(geometrynew, materialnew);
    return mesh;
  }

  private BuildBoxGeometryFromMeshCenter(vector: THREE.Vector3, width, height, hl) {
    let x = vector.x;
    let y = vector.y;
    let z = vector.z + hl;
    let geometry = new THREE.BufferGeometry();
    // 下上左右前后 下面对应当前的坐标
    let vertices = new Float32Array([
      x - width, y - width, z,
      x - width, y + width, z,
      x + width, y + width, z,
      x - width, y - width, z,
      x + width, y + width, z,
      x + width, y - width, z,

      x - width, y - width, z + height,
      x + width, y + width, z + height,
      x - width, y + width, z + height,
      x - width, y - width, z + height,
      x + width, y - width, z + height,
      x + width, y + width, z + height,

      x - width, y - width, z,
      x - width, y + width, z + height,
      x - width, y + width, z,
      x - width, y - width, z,
      x - width, y - width, z + height,
      x - width, y + width, z + height,

      x + width, y - width, z,
      x + width, y + width, z,
      x + width, y + width, z + height,
      x + width, y - width, z,
      x + width, y + width, z + height,
      x + width, y - width, z + height,

      x - width, y - width, z,
      x + width, y - width, z,
      x + width, y - width, z + height,
      x - width, y - width, z,
      x + width, y - width, z + height,
      x - width, y - width, z + height,

      x - width, y + width, z + height,
      x + width, y + width, z + height,
      x - width, y + width, z,
      x - width, y + width, z,
      x + width, y + width, z + height,
      x + width, y + width, z,
    ]);
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.disposeControls();
    }
  }

}
