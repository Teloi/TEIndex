export class CSG {
  public polygons: CSG.Polygon[];

  static fromPolygons(polygons) {
    let csg = new CSG();
    csg.polygons = polygons;
    return csg;
  };

  static fromGeometry(geom: THREE.Geometry | THREE.BufferGeometry): CSG {
    let polygons: CSG.Polygon[] = [];
    if (geom instanceof THREE.Geometry) {
      if (geom.faces && geom.faces.length > 0) {
        let vertices: THREE.Vector3[] = geom.vertices;
        let v1, v2, v3, polygon;
        for (let face of geom.faces) {
          v1 = new CSG.Vector(vertices[face.a].x, vertices[face.a].y, vertices[face.a].z);
          v2 = new CSG.Vector(vertices[face.b].x, vertices[face.b].y, vertices[face.b].z);
          v3 = new CSG.Vector(vertices[face.c].x, vertices[face.c].y, vertices[face.c].z);
          polygon = new CSG.Polygon([v1, v2, v3]);
          polygons.push(polygon);
        }
      } else {
      }
    } else {
      let vertices = geom.getAttribute('position').array;
      let colorAtt = geom.getAttribute('color');
      let colors = colorAtt ? colorAtt.array : null;
      let v1, v2, v3, polygon;

      let createPlg = (idx1, idx2, idx3) => {
        v1 = new CSG.Vector(vertices[idx1], vertices[idx1 + 1], vertices[idx1 + 2]);
        v2 = new CSG.Vector(vertices[idx2], vertices[idx2 + 1], vertices[idx2 + 2]);
        v3 = new CSG.Vector(vertices[idx3], vertices[idx3 + 1], vertices[idx3 + 2]);
        polygon = new CSG.Polygon([v1, v2, v3]);
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

  clone() {
    let csg = new CSG();
    csg.polygons = this.polygons.map(function (p) {
      return p.clone();
    });
    return csg;
  };

  toPolygons() {
    return this.polygons;
  };

  // Return a new CSG solid representing space in either this solid or in the
  // solid `csg`. Neither this solid nor the solid `csg` are modified.
  //
  //     A.union(B)
  //
  //     +-------+            +-------+
  //     |       |            |       |
  //     |   A   |            |       |
  //     |    +--+----+   =   |       +----+
  //     +----+--+    |       +----+       |
  //          |   B   |            |       |
  //          |       |            |       |
  //          +-------+            +-------+
  //
  union(csg) {
    let a = new CSG.Node(this.clone().polygons);
    let b = new CSG.Node(csg.clone().polygons);
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    return CSG.fromPolygons(a.allPolygons());
  };

  // Return a new CSG solid representing space in this solid but not in the
  // solid `csg`. Neither this solid nor the solid `csg` are modified.
  //
  //     A.subtract(B)
  //
  //     +-------+            +-------+
  //     |       |            |       |
  //     |   A   |            |       |
  //     |    +--+----+   =   |    +--+
  //     +----+--+    |       +----+
  //          |   B   |
  //          |       |
  //          +-------+
  //
  subtract(csg) {
    let a = new CSG.Node(this.clone().polygons);
    let b = new CSG.Node(csg.clone().polygons);
    a.invert();
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    a.invert();
    return CSG.fromPolygons(a.allPolygons());
  };

  // Return a new CSG solid representing space both this solid and in the
  // solid `csg`. Neither this solid nor the solid `csg` are modified.
  //
  //     A.intersect(B)
  //
  //     +-------+
  //     |       |
  //     |   A   |
  //     |    +--+----+   =   +--+
  //     +----+--+    |       +--+
  //          |   B   |
  //          |       |
  //          +-------+
  //
  intersect(csg) {
    let a = new CSG.Node(this.clone().polygons);
    let b = new CSG.Node(csg.clone().polygons);
    a.invert();
    b.clipTo(a);
    b.invert();
    a.clipTo(b);
    b.clipTo(a);
    a.build(b.allPolygons());
    a.invert();
    return CSG.fromPolygons(a.allPolygons());
  };

  // Return a new CSG solid with solid and empty space switched. This solid is
  // not modified.
  inverse() {
    let csg = this.clone();
    csg.polygons.map(function (p) {
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

export namespace CSG {
  // # class Vector
  // Represents a 3D vector.
  //
  // Example usage:
  //
  //     new CSG.Vector(1, 2, 3);
  //     new CSG.Vector([1, 2, 3]);
  //     new CSG.Vector({ x: 1, y: 2, z: 3 });
  export class Vector {
    x: number;
    y: number;
    z: number;

    constructor(x, y?, z?) {
      if (arguments.length === 3) {
        this.x = x;
        this.y = y;
        this.z = z;
      } else if ('x' in x) {
        this.x = x.x;
        this.y = x.y;
        this.z = x.z;
      } else {
        this.x = x[0];
        this.y = x[1];
        this.z = x[2];
      }
    };

    clone() {
      return new CSG.Vector(this.x, this.y, this.z);
    };

    negated() {
      return new CSG.Vector(-this.x, -this.y, -this.z);
    };

    plus(a) {
      return new CSG.Vector(this.x + a.x, this.y + a.y, this.z + a.z);
    };

    minus(a) {
      return new CSG.Vector(this.x - a.x, this.y - a.y, this.z - a.z);
    };

    times(a) {
      return new CSG.Vector(this.x * a, this.y * a, this.z * a);
    };

    dividedBy(a) {
      return new CSG.Vector(this.x / a, this.y / a, this.z / a);
    };

    dot(a) {
      return this.x * a.x + this.y * a.y + this.z * a.z;
    };

    lerp(a, t) {
      return this.plus(a.minus(this).times(t));
    };

    length() {
      return Math.sqrt(this.dot(this));
    };

    unit() {
      return this.dividedBy(this.length());
    };

    cross(a) {
      return new CSG.Vector(
        this.y * a.z - this.z * a.y,
        this.z * a.x - this.x * a.z,
        this.x * a.y - this.y * a.x
      );
    };
  }

  // # class Vertex
  // Represents a vertex of a polygon. Use your own vertex class instead of this
  // one to provide additional features like texture coordinates and vertex
  // colors. Custom vertex classes need to provide a `pos` property and `clone()`,
  // `flip()`, and `interpolate()` methods that behave analogous to the ones
  // defined by `CSG.Vertex`. This class provides `normal` so convenience
  // functions like `CSG.sphere()` can return a smooth vertex normal, but `normal`
  // is not used anywhere else.
  export class Vertex {
    pos;
    normal;

    constructor(pos, normal) {
      this.pos = new CSG.Vector(pos);
      this.normal = new CSG.Vector(normal);
    };

    clone() {
      return new CSG.Vertex(this.pos.clone(), this.normal.clone());
    };

    // Invert all orientation-specific data (e.g. vertex normal). Called when the
    // orientation of a polygon is flipped.
    flip() {
      this.normal = this.normal.negated();
    };

    // Create a new vertex between this vertex and `other` by linearly
    // interpolating all properties using a parameter of `t`. Subclasses should
    // override this to interpolate additional properties.
    interpolate(other, t) {
      return new CSG.Vertex(
        this.pos.lerp(other.pos, t),
        this.normal.lerp(other.normal, t)
      );
    };
  }

  // # class Plane
  // Represents a plane in 3D space.
  export class Plane {
    static EPSILON = 1e-5;
    public normal;
    public w;

    static fromPoints(a, b: CSG.Vector, c: CSG.Vector) {
      let n = b.minus(a).cross(c.minus(a)).unit();
      return new CSG.Plane(n, n.dot(a));
    };

    constructor(normal, w) {
      this.normal = normal;
      this.w = w;
    };

    clone() {
      return new CSG.Plane(this.normal.clone(), this.w);
    };

    flip() {
      this.normal = this.normal.negated();
      this.w = -this.w;
    };

    // Split `polygon` by this plane if needed, then put the polygon or polygon
    // fragments in the appropriate lists. Coplanar polygons go into either
    // `coplanarFront` or `coplanarBack` depending on their orientation with
    // respect to this plane. Polygons in front or in back of this plane go into
    // either `front` or `back`.
    splitPolygon(polygon, coplanarFront, coplanarBack, front, back) {
      let COPLANAR = 0;
      let FRONT = 1;
      let BACK = 2;
      let SPANNING = 3;

      // Classify each point as well as the entire polygon into one of the above
      // four classes.
      let polygonType = 0;
      let types = [];
      for (let i = 0; i < polygon.vertices.length; i++) {
        let t = this.normal.dot(polygon.vertices[i].pos) - this.w;
        let type = (t < -CSG.Plane.EPSILON) ? BACK : (t > CSG.Plane.EPSILON) ? FRONT : COPLANAR;
        polygonType |= type;
        types.push(type);
      }

      // Put the polygon in the correct list, splitting it when necessary.
      switch (polygonType) {
        case COPLANAR:
          (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
          break;
        case FRONT:
          front.push(polygon);
          break;
        case BACK:
          back.push(polygon);
          break;
        case SPANNING:
          let f = [], b = [];
          for (let i = 0; i < polygon.vertices.length; i++) {
            let j = (i + 1) % polygon.vertices.length;
            let ti = types[i], tj = types[j];
            let vi = polygon.vertices[i], vj = polygon.vertices[j];
            if (ti !== BACK) {
              f.push(vi);
            }
            if (ti !== FRONT) {
              b.push(ti !== BACK ? vi.clone() : vi);
            }
            if ((ti | tj) === SPANNING) {
              let t = (this.w - this.normal.dot(vi.pos)) / this.normal.dot(vj.pos.minus(vi.pos));
              let v = vi.interpolate(vj, t);
              f.push(v);
              b.push(v.clone());
            }
          }
          if (f.length >= 3) {
            front.push(new CSG.Polygon(f, polygon.shared));
          }
          if (b.length >= 3) {
            back.push(new CSG.Polygon(b, polygon.shared));
          }
          break;
      }
    }

  }

  // # class Polygon
  // Represents a convex polygon. The vertices used to initialize a polygon must
  // be coplanar and form a convex loop. They do not have to be `CSG.Vertex`
  // instances but they must behave similarly (duck typing can be used for
  // customization).
  // Each convex polygon has a `shared` property, which is shared between all
  // polygons that are clones of each other or were split from the same polygon.
  // This can be used to define per-polygon properties (such as surface color).
  export class Polygon {
    vertices;
    shared;
    plane;

    constructor(vertices, shared?) {
      this.vertices = vertices;
      this.shared = shared;
      this.plane = CSG.Plane.fromPoints(vertices[0].pos, vertices[1].pos, vertices[2].pos);
    };

    clone() {
      let vertices = this.vertices.map(function (v) {
        return v.clone();
      });
      return new CSG.Polygon(vertices, this.shared);
    };

    flip() {
      this.vertices.reverse().map(function (v) {
        v.flip();
      });
      this.plane.flip();
    };
  }

  // # class Node
  // Holds a node in a BSP tree. A BSP tree is built from a collection of polygons
  // by picking a polygon to split along. That polygon (and all other coplanar
  // polygons) are added directly to that node and the other polygons are added to
  // the front and/or back subtrees. This is not a leafy BSP tree since there is
  // no distinction between internal and leaf nodes.
  export class Node {
    plane: any;
    front: any;
    back: any;
    polygons: CSG.Polygon[];

    constructor(polygons?) {
      this.plane = null;
      this.front = null;
      this.back = null;
      this.polygons = [];
      if (this.polygons) {
        this.build(this.polygons);
      }
    };

    clone() {
      let node = new CSG.Node();
      node.plane = this.plane && this.plane.clone();
      node.front = this.front && this.front.clone();
      node.back = this.back && this.back.clone();
      node.polygons = this.polygons.map(function (p) {
        return p.clone();
      });
      return node;
    };

    // Convert solid space to empty space and empty space to solid space.
    invert() {
      for (let i = 0; i < this.polygons.length; i++) {
        this.polygons[i].flip();
      }
      this.plane.flip();
      if (this.front) {
        this.front.invert();
      }
      if (this.back) {
        this.back.invert();
      }
      let temp = this.front;
      this.front = this.back;
      this.back = temp;
    };

    // Recursively remove all polygons in `polygons` that are inside this BSP
    // tree.
    clipPolygons(polygons) {
      if (!this.plane) {
        return polygons.slice();
      }
      let front = [], back = [];
      for (let i = 0; i < polygons.length; i++) {
        this.plane.splitPolygon(polygons[i], front, back, front, back);
      }
      if (this.front) {
        front = this.front.clipPolygons(front);
      }
      if (this.back) {
        back = this.back.clipPolygons(back);
      }
      else {
        back = [];
      }
      return front.concat(back);
    };

    // Remove all polygons in this BSP tree that are inside the other BSP tree
    // `bsp`.
    clipTo(bsp) {
      this.polygons = bsp.clipPolygons(this.polygons);
      if (this.front) {
        this.front.clipTo(bsp);
      }
      if (this.back) {
        this.back.clipTo(bsp);
      }
    };

    // Return a list of all polygons in this BSP tree.
    allPolygons() {
      let polygons = this.polygons.slice();
      if (this.front) {
        polygons = polygons.concat(this.front.allPolygons());
      }
      if (this.back) {
        polygons = polygons.concat(this.back.allPolygons());
      }
      return polygons;
    };

    // Build a BSP tree out of `polygons`. When called on an existing tree, the
    // new polygons are filtered down to the bottom of the tree and become new
    // nodes there. Each set of polygons is partitioned using the first polygon
    // (no heuristic is used to pick a good split).
    build(polygons) {
      if (!polygons.length) {
        return;
      }
      if (!this.plane) {
        this.plane = polygons[0].plane.clone();
      }
      let front = [], back = [];
      for (let i = 0; i < polygons.length; i++) {
        this.plane.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
      }
      if (front.length) {
        if (!this.front) {
          this.front = new CSG.Node();
        }
        this.front.build(front);
      }
      if (back.length) {
        if (!this.back) {
          this.back = new CSG.Node();
        }
        this.back.build(back);
      }
    }
  }
}
