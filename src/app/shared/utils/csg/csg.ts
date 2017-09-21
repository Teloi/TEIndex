/// <reference types="three" />

export class CSG {
  polygons: Polygon[];

  static fromPolygons(polygons: Polygon[]): CSG {
    let csg = new CSG();
    csg.polygons = polygons;
    return csg;
  }

  static fromGeometry(geom: THREE.Geometry | THREE.BufferGeometry): CSG {
    let polygons: Polygon[] = [];
    if (geom instanceof THREE.Geometry) {
      // Geometry
      if (geom.faces && geom.faces.length > 0) {
        let vertices: THREE.Vector3[] = geom.vertices;
        let v1, v2, v3, polygon;
        for (let face of geom.faces) {
          v1 = new Vector(vertices[face.a].x, vertices[face.a].y, vertices[face.a].z);
          v2 = new Vector(vertices[face.b].x, vertices[face.b].y, vertices[face.b].z);
          v3 = new Vector(vertices[face.c].x, vertices[face.c].y, vertices[face.c].z);
          polygon = new Polygon([v1, v2, v3]);
          polygons.push(polygon);
        }
      } else {
      }
    } else {
      // BufferGeometry
      let vertices = geom.getAttribute('position').array;
      let colorAtt = geom.getAttribute('color');
      let colors = colorAtt ? colorAtt.array : null;
      let v1, v2, v3, polygon;

      let createPlg = (idx1, idx2, idx3) => {
        v1 = new Vector(vertices[idx1], vertices[idx1 + 1], vertices[idx1 + 2]);
        v2 = new Vector(vertices[idx2], vertices[idx2 + 1], vertices[idx2 + 2]);
        v3 = new Vector(vertices[idx3], vertices[idx3 + 1], vertices[idx3 + 2]);
        polygon = new Polygon([v1, v2, v3]);
        if (colors) {
          polygon.shared = polygon.shared || {};
          polygon.shared.color = [colors[idx1], colors[idx1 + 1], colors[idx1 + 2]];
        }
        polygons.push(polygon);
      };

      if (geom.index && geom.index.count) {
        let indices = geom.index.array;
        for (let i = 0, len = indices.length / 3; i < len; ++i) {
          let i3 = i * 3;
          let idx1 = indices[i3] * 3, idx2 = indices[i3 + 1] * 3, idx3 = indices[i3 + 2] * 3;
          createPlg(idx1, idx2, idx3);
        }
      } else {
        for (let i = 0, len = vertices.length / 3; i < len; i += 3) {
          let idx1 = i * 3, idx2 = (i + 1) * 3, idx3 = (i + 2) * 3;
          createPlg(idx1, idx2, idx3);
        }
      }
    }
    return CSG.fromPolygons(polygons);
  }

  constructor() {
    this.polygons = [];
  }

  clone(): CSG {
    let csg = new CSG();
    csg.polygons = this.polygons.map((polygon: Polygon) => {
      return polygon.clone();
    });
    return csg;
  }

  union(csg: CSG): CSG {
    let a = new Tree(this.clone().polygons);
    let b = new Tree(csg.clone().polygons);
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    return CSG.fromPolygons(a.allPolygons());
  }

  subtract(csg: CSG): CSG {
    let a = new Tree(this.clone().polygons);
    let b = new Tree(csg.clone().polygons);
    a.invert();
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    a.invert();
    return CSG.fromPolygons(a.allPolygons());
  }

  intersect(csg: CSG): CSG {
    let a = new Tree(this.clone().polygons);
    let b = new Tree(csg.clone().polygons);
    a.invert();
    b.clipTo(a);
    b.invert();
    a.clipTo(b);
    b.clipTo(a);
    a.build(b.allPolygons());
    a.invert();
    return CSG.fromPolygons(a.allPolygons());
  }

  inverse() {
    let csg = this.clone();
    csg.polygons.map((p: Polygon) => {
      p.flip();
    });
    return csg;
  }

  toGeometry(): THREE.BufferGeometry {
    let vertices: number[] = [];
    for (let plg of this.polygons) {
      if (plg.vertices.length >= 3) {
        for (let i = 2, len = plg.vertices.length; i < len; ++i) {
          vertices.push(plg.vertices[0].x, plg.vertices[0].y, plg.vertices[0].z);
          vertices.push(plg.vertices[i - 1].x, plg.vertices[i - 1].y, plg.vertices[i - 1].z);
          vertices.push(plg.vertices[i].x, plg.vertices[i].y, plg.vertices[i].z);
        }
      }
    }
    let geom: THREE.BufferGeometry = new THREE.BufferGeometry();
    geom.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geom.computeVertexNormals();
    return geom;
  }
}

class Vector {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone(): Vector {
    return new Vector(this.x, this.y, this.z);
  }

  negated(): Vector {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  minus(a: Vector): Vector {
    this.x -= a.x;
    this.y -= a.y;
    this.z -= a.z;
    return this;
  }

  dot(a: Vector): number {
    return this.x * a.x + this.y * a.y + this.z * a.z;
  }

  lerp(a: Vector, t: number): Vector {
    return new Vector(this.x + (a.x - this.x) * t, this.y + (a.y - this.y) * t, this.z + (a.z - this.z) * t);
  }

  unit(): Vector {
    let len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    this.x /= len;
    this.y /= len;
    this.z /= len;
    return this;
  }

  cross(a: Vector): Vector {
    let tmp = [
      this.y * a.z - this.z * a.y,
      this.z * a.x - this.x * a.z,
      this.x * a.y - this.y * a.x];

    this.x = tmp[0];
    this.y = tmp[1];
    this.z = tmp[2];
    return this;
  }
}

class Plane {
  public normal: Vector;
  public w: number;

  constructor(normal: Vector, w: number) {
    this.normal = normal;
    this.w = w;
  }

  clone() {
    return new Plane(this.normal.clone(), this.w);
  }

  flip() {
    this.normal.negated();
    this.w = -this.w;
  }
}

class Polygon {
  public vertices: Vector[];
  public shared: any;
  public plane: Plane;

  constructor(vertices: Vector[], shared?: any) {
    this.vertices = vertices;
    this.shared = shared;
    let a = vertices[0], b = vertices[1], c = vertices[2];
    let n = b.clone().minus(vertices[0]).cross(c.clone().minus(a)).unit();
    this.plane = new Plane(n, n.dot(a));
  }

  clone() {
    let vertices = this.vertices.map((v) => {
      return v.clone();
    });
    return new Polygon(vertices, this.shared);
  }

  flip() {
    this.vertices.reverse();
    this.plane.flip();
  }
}

class Tree {
  public nodeArray: TreeNode[];

  static splitPolygon(plane: Plane,
                      polygon: Polygon,
                      coplanarFront: Polygon[],
                      coplanarBack: Polygon[],
                      front: Polygon[],
                      back: Polygon[]): void {

    let EPSILON = 1e-5;
    let COPLANAR = 0;
    let FRONT = 1;
    let BACK = 2;
    let SPANNING = 3;

    let types: number[] = [];
    let polygonType = 0;
    let len: number = polygon.vertices.length;
    let t: number, type: number;

    for (let i = 0; i < len; i++) {
      t = plane.normal.dot(polygon.vertices[i]) - plane.w;
      type = (t < -EPSILON) ? BACK : (t > EPSILON) ? FRONT : COPLANAR;
      polygonType |= type;
      types.push(type);
    }

    switch (polygonType) {
      case COPLANAR:
        (plane.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
        break;
      case FRONT:
        front.push(polygon);
        break;
      case BACK:
        back.push(polygon);
        break;
      case SPANNING:
        let f: Vector[] = [], b: Vector[] = [];
        let j: number, ti: number, tj: number;
        let vi: Vector, vj: Vector;
        for (let i = 0; i < len; i++) {

          j = (i + 1) % len;
          ti = types[i];
          tj = types[j];
          vi = polygon.vertices[i];
          vj = polygon.vertices[j];

          switch (ti) {
            case COPLANAR:
              f.push(vi);
              b.push(vi.clone());
              break;
            case FRONT:
              f.push(vi);
              break;
            case BACK:
              b.push(vi);
              break;
          }

          if ((ti | tj) === SPANNING) {
            let t = (plane.w - plane.normal.dot(vi)) / plane.normal.dot(vj.clone().minus(vi));
            let v = vi.lerp(vj, t);
            f.push(v);
            b.push(v.clone());
          }
        }
        if (f.length >= 3) {
          front.push(new Polygon(f, polygon.shared));
        }
        if (b.length >= 3) {
          back.push(new Polygon(b, polygon.shared));
        }
        break;
    }
  }

  constructor(polygons?: Polygon[]) {
    this.nodeArray = [];
    if (polygons) {
      this.build(polygons);
    }
  }

  clone(): Tree {
    return new Tree(this.allPolygons());
  }

  invert(): void {
    for (let i = this.nodeArray.length; i--;) {
      this.nodeArray[i].invert();
    }
  }

  clipPolygons(polygons: Polygon[], alsoRemove: boolean = false) {

    if (!this.nodeArray || !this.nodeArray.length || !this.nodeArray[0].plane) {
      return polygons.slice();
    }

    this.nodeArray[0].clipPolygons(polygons);

    for (let i = 0, len = this.nodeArray.length; i < len; ++i) {
      let node = this.nodeArray[i];
      if (node.front && node.clipFront && node.clipFront.length) {
        this.nodeArray[node.front].clipPolygons(node.clipFront, alsoRemove);
        node.clipFront = [];
      }
      if (node.back && node.clipBack && node.clipBack.length) {
        this.nodeArray[node.back].clipPolygons(node.clipBack, alsoRemove);
      }
      node.clipBack = [];
    }

    let plgs: Polygon[] = [];
    for (let j = this.nodeArray.length; j--;) {
      let node = this.nodeArray[j];
      if (node.clipFront) {
        plgs.push(...node.clipFront);
        node.clipFront = [];
      }
      if (node.clipBack) {
        plgs.push(...node.clipBack);
        node.clipBack = [];
      }
    }

    return plgs;
  }

  clipTo(bsp: Tree, alsoRemove: boolean = false): void {
    for (let i = 0, len = this.nodeArray.length; i < len; ++i) {
      let node = this.nodeArray[i];
      node.polygons = bsp.clipPolygons(node.polygons, alsoRemove);
    }
  }

  allPolygons() {
    let polygons: Polygon[] = [];
    for (let i = this.nodeArray.length; i--;) {
      polygons.push(...(this.nodeArray[i].polygons));
    }
    return polygons;
  }

  build(polygons: Polygon[]) {
    if (!polygons || !polygons.length) {
      return;
    }
    if (!this.nodeArray.length) {
      this.nodeArray.push(new TreeNode());
    }
    this.nodeArray[0].build(polygons);

    for (let i = 0; i < this.nodeArray.length; ++i) {
      let node = this.nodeArray[i];
      if (node.frontPolygons && node.frontPolygons.length) {
        if (!node.front) {
          this.nodeArray.push(new TreeNode());
          node.front = this.nodeArray.length - 1;
        }
        this.nodeArray[node.front].build(node.frontPolygons);
        node.frontPolygons = [];
      }
      if (node.backPolygons && node.backPolygons.length) {
        if (!node.back) {
          this.nodeArray.push(new TreeNode());
          node.back = this.nodeArray.length - 1;
        }
        this.nodeArray[node.back].build(node.backPolygons);
        node.backPolygons = [];
      }
    }
  }


}

class TreeNode {
  public plane: Plane;
  public front: number;
  public back: number;
  public frontPolygons: Polygon[];
  public backPolygons: Polygon[];
  public clipFront: Polygon[];
  public clipBack: Polygon[];
  public polygons: Polygon[];

  constructor() {
    this.plane = null;
    this.front = null;
    this.back = null;
    this.frontPolygons = [];
    this.backPolygons = [];
    this.clipFront = [];
    this.clipBack = [];
    this.polygons = [];
  }

  invert(): void {
    for (let i = this.polygons.length; i--; ) {
      this.polygons[i].flip();
    }
    this.plane && this.plane.flip();
    [this.front, this.back] = [this.back, this.front];
  }

  clipPolygons(polygons: Polygon[], alsoRemove: boolean = false): void {
    if (!polygons || !polygons.length) {
      return;
    }
    if (!this.plane) {
      this.clipFront = polygons.slice();
      return;
    }
    if (alsoRemove) {
      for (let i = polygons.length; i--;) {
        Tree.splitPolygon(this.plane, polygons[i], this.clipBack, this.clipBack, this.clipFront, this.clipBack);
      }
    } else {
      for (let i = polygons.length; i--;) {
        Tree.splitPolygon(this.plane, polygons[i], this.clipFront, this.clipBack, this.clipFront, this.clipBack);
      }
    }
  }

  build(polygons: Polygon[]): void {
    if (!polygons || !polygons.length) {
      return;
    }
    if (!this.plane) {
      let plg = polygons.shift();
      this.plane = plg.plane.clone();
      this.polygons.push(plg);
    }
    for (let i = polygons.length; i--;) {
      Tree.splitPolygon(this.plane, polygons[i], this.polygons, this.polygons, this.frontPolygons, this.backPolygons);
    }
  }
}

