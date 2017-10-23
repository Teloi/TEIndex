/// <reference types="three" />
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Viewer} from '../../../shared/viewer/viewer';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {
  private viewer: Viewer;
  private isControls: boolean;

  endplane: any;
  endbox: any;

  constructor() {
    this.isControls = true;
  }

  test() {
    let material = new THREE.LineBasicMaterial({color: 0xff0099});
    let geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(3, 1, 4));
    geometry.vertices.push(new THREE.Vector3(10, 10, 10));
    let line = new THREE.Line(geometry, material);
    return line;
  }

  plane() {
    let a = new THREE.Vector3(3, 1, 4);
    let b = new THREE.Vector3(10, 10, 10);
    // 水平面
    let plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    // 其中一个点的映射
    let point2 = plane.projectPoint(a);
    // 通过三个点确定一个平面
    plane.setFromCoplanarPoints(a, point2, b);
    // 这个平面的法线与原始向量的叉乘 为垂直于这两个向量的向量
    let normal = plane.normal.cross(new THREE.Line3(a, b).delta());
    plane.setFromNormalAndCoplanarPoint(normal, a);
    let material = new THREE.LineBasicMaterial({color: 0xff0099});
    let geometry = new THREE.Geometry();
    geometry.vertices.push(a);
    geometry.vertices.push(plane.normal);
    this.endplane = plane;
    let line = new THREE.Line(geometry, material);
    return line;
  }

  boundingtest() {
    let geometryS = new THREE.Geometry();
    geometryS.vertices.push(new THREE.Vector3(3, 1, 4));
    geometryS.vertices.push(new THREE.Vector3(10, 10, 10));
    geometryS.computeBoundingBox();

    let box = geometryS.boundingBox;
    this.endbox = box;
    let geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array([
      box.min.x, box.min.y, box.min.z,
      box.max.x, box.min.y, box.min.z,
      box.min.x, box.min.y, box.max.z,

      box.max.x, box.min.y, box.min.z,
      box.max.x, box.min.y, box.max.z,
      box.min.x, box.min.y, box.max.z,
    ]);
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    let material = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  test2() {
    let p1 = new THREE.Vector3(this.endbox.min.x, this.endbox.min.y, this.endbox.min.z);
    let point_one = new THREE.Vector3(p1.x, this.meterY(p1.x, p1.z, this.endplane), p1.z);

    let p3 = new THREE.Vector3(this.endbox.max.x, this.endbox.min.y, this.endbox.min.z);
    let point_two = new THREE.Vector3(p3.x, this.meterY(p3.x, p3.z, this.endplane), p3.z);

    let p5 = new THREE.Vector3(this.endbox.min.x, this.endbox.min.y, this.endbox.max.z);
    let point_three = new THREE.Vector3(p5.x, this.meterY(p5.x, p5.z, this.endplane), p5.z);

    let p7 = new THREE.Vector3(this.endbox.max.x, this.endbox.min.y, this.endbox.max.z);
    let point_four = new THREE.Vector3(p7.x, this.meterY(p7.x, p7.z, this.endplane), p7.z);

    let material = new THREE.LineBasicMaterial({color: 0xff0099});
    let geometry = new THREE.Geometry();
    geometry.vertices.push(point_one);
    geometry.vertices.push(point_two);
    geometry.vertices.push(point_three);
    geometry.vertices.push(point_four);
    let line = new THREE.Line(geometry, material);
    this.viewer.addMesh(line);
  }

  meterY(x, z, plane: THREE.Plane) {
    let normal = plane.normal;
    return ((-plane.constant) - normal.x * x - normal.z * z) / normal.y;
  }

  ngOnInit() {
    this.viewer = new Viewer('viewer');
    this.viewer.InitScene(this.isControls,
      () => {
        this.viewer.addStatsHelper();
        this.viewer.addSkyBoxHelper();
        this.viewer.addAxisHelper(30);
        this.viewer.addMesh(this.test());
        this.viewer.addMesh(this.plane());
        this.viewer.addMesh(this.boundingtest());
        this.test2();

        let geometry = new THREE.BufferGeometry();
        let vertices = new Float32Array([
          1, 0, 0,
          0, 0, 0,
          0, 1, 0,

          1, 0, 0,
          0, 0, 6,
          0, 0, 0,

          0, 0, 0,
          0, 0, 6,
          0, 1, 0,

          1, 0, 0,
          0, 1, 0,
          0, 0, 6
        ]);
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        // console.log(this.computeVolume(geometry));
        // console.log(this.computeVolume_BufferGeometry_NoIndex(geometry));
        this.viewer.animate();
      }
    );
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.disposeControls();
    }
  }

  // Utils

  /**
   * compute the geometry volume
   * @param geometry
   * @returns {number}
   */
  private computeVolume(geometry) {

    if (geometry instanceof THREE.BufferGeometry) {
      geometry = new THREE.Geometry().fromBufferGeometry(geometry);
    }

    let volume = 0;
    for (let f = 0, fl = geometry.faces.length; f < fl; f++) {
      let face = geometry.faces[f];

      let vA = geometry.vertices[face.a];
      let vB = geometry.vertices[face.b];
      let vC = geometry.vertices[face.c];

      let x1 = vA.x,
        x2 = vB.x,
        x3 = vC.x;
      let y1 = vA.y,
        y2 = vB.y,
        y3 = vC.y;
      let z1 = vA.z,
        z2 = vB.z,
        z3 = vC.z;
      let V = (-x3 * y2 * z1 + x2 * y3 * z1 + x3 * y1 * z2 - x1 * y3 * z2 - x2 * y1 * z3 + x1 * y2 * z3) / 6;
      volume += V;
    }

    return volume;

  };

  /**
   * compute the buffergeometry volume
   * @param geometry
   * @returns {number}
   */
  private computeVolume_BufferGeometry_NoIndex(geometry) {

    let points = [];
    let positions = geometry.getAttribute('position').array;
    for (let i = 0; i < positions.length; i += 3) {
      points.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
    }
    let volume = 0;
    for (let i = 2; i < points.length; i += 3) {
      let vA = points[i - 2];
      let vB = points[i - 1];
      let vC = points[i];

      let x1 = vA.x,
        x2 = vB.x,
        x3 = vC.x;
      let y1 = vA.y,
        y2 = vB.y,
        y3 = vC.y;
      let z1 = vA.z,
        z2 = vB.z,
        z3 = vC.z;
      let V = (-x3 * y2 * z1 + x2 * y3 * z1 + x3 * y1 * z2 - x1 * y3 * z2 - x2 * y1 * z3 + x1 * y2 * z3) / 6;
      volume += V;
    }
    return volume;
  };
}
