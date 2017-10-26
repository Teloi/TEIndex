/// <reference types="three" />
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Viewer} from '../../../shared/viewer/viewer';
import {CSG} from '../../../shared/utils/csg/csg';

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
        this.viewer.addStatsHelper();
        this.viewer.addSkyBoxHelper();
        this.viewer.addMesh(this.Demo1());
        this.viewer.animate();
      }
    );
  }

  private Demo1() {
    const geometrycube = new THREE.BoxBufferGeometry(8, 8, 8);
    const geometrysphere = new THREE.SphereBufferGeometry(5, 32, 32);
    const csgcube = CSG.fromGeometry(geometrycube);
    const csgsphere = CSG.fromGeometry(geometrysphere);
    const geometrynew = csgcube.subtract(csgsphere).toGeometry();
    const materialnew = new THREE.MeshBasicMaterial({color: 0xfefefe, wireframe: true, opacity: 0.5});
    const mesh = new THREE.Mesh(geometrynew, materialnew);
    return mesh;
  }

  private Demo2() {
    const geometry = this.BuildBoxGeometryFromMeshCenter(new THREE.Vector3(0, 0, -2), 10, 5, 0);
    const planeGeo = new THREE.BoxBufferGeometry(30, 30, 1);
    const csgcube = CSG.fromGeometry(planeGeo);
    const csgsphere = CSG.fromGeometry(geometry);
    const geometrynew = csgcube.subtract(csgsphere).toGeometry();
    const materialnew = new THREE.MeshLambertMaterial({color: 0xfefefe, wireframe: false, opacity: 0.5});
    const mesh = new THREE.Mesh(geometrynew, materialnew);
    return mesh;
  }

  private BuildBoxGeometryFromMeshCenter(vector: THREE.Vector3, width, height, hl) {
    const x = vector.x;
    const y = vector.y;
    const z = vector.z + hl;
    const geometry = new THREE.BufferGeometry();
    // 下上左右前后 下面对应当前的坐标
    const vertices = new Float32Array([
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
