export class ESOctree {

  private parent_node: ESOctree;
  private children_nodes: ESOctree[];

  private oringePosition: THREE.Vector3;
  private halfX: number;
  private halfY: number;
  private halfZ: number;

  public depth: number;

  // Entities
  private entities: THREE.Mesh[];
  private _to_update: THREE.Mesh[]; // TO Update Entities?
  // 叶子？叶节点
  private _leaves: any;

  private _need_leaves_update: boolean;
  private _need_all_entities_update: boolean;

  private BoxGeo: THREE.Geometry;
  public BoxMesh: THREE.Mesh;

  entities_per_node = 1;
  max_depth = 5;


  constructor(parent: ESOctree, origin, halfwidth, halfheight, halfdepth) {
    this.oringePosition = origin;
    this.halfX = halfwidth;
    this.halfY = halfheight;
    this.halfZ = halfdepth;

    this.depth = parent === null ? 0 : parent.depth + 1;

    // 设置当前树内无实体
    this.entities = new Array();
    // 父子节点
    this.parent_node = parent;
    this.children_nodes = new Array();

    this._to_update = parent === null ? new Array() : parent._to_update;

    this._leaves = new Array();
    this._leaves.push(this);

    this._need_leaves_update = false;
    this._need_all_entities_update = false;

    // 视觉感受
    this.BoxGeo = new THREE.CubeGeometry(this.halfX * 2, this.halfY * 2, this.halfZ * 2);
    this.BoxMesh = new THREE.Mesh(this.BoxGeo, new THREE.MeshBasicMaterial({color: 0x0, opacity: 1, wireframe: true}));
    this.BoxMesh.position = this.oringePosition.clone();

    if (parent !== null) {
      this.BoxMesh.position.sub(parent.oringePosition);
      parent.BoxMesh.add(this.BoxMesh);
    }
  }

  // 当实体位置改变
  onEntityPoseChanged(entity) {
    if (this._to_update.indexOf(entity) === -1) {
      this._to_update.push(entity);
    }
  }

  // 判断交叉
  intersects(entity) {
    return this.contains(entity.position);
  };

  // 是否包含
  contains(point) {
    let diff = new THREE.Vector3();
    // subVectors方法用来将三维向量的(x,y,z)坐标值分别于参数(a,b)的(x,y,z)相减.并返回新的坐标值的三维向量.
    diff.subVectors(point, this.oringePosition);
    return Math.abs(diff.x) <= this.halfX
      && Math.abs(diff.y) <= this.halfY
      && Math.abs(diff.z) <= this.halfZ;
  };

  // 子节点更新
  needLeavesUpdate = function () {
    let iter = this;
    while (iter !== null) {
      iter._need_leaves_update = true;
      iter = iter.parent_node;
    }
  };

  remove = function (entity) {
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i] === entity) {
        this.entities.splice(i, 1);
        break;
      }
    }

    let iter = this;
    while (iter !== null) {
      iter._need_all_entities_update = true;
      iter = iter.parent_node;
    }
  };

  // 再细分
  subdivide() {
    /*       _____________
         /  4   /  5   /|        y
        /_____ /______/ |        |
         /      /      /| |        |___ x
      /_____ / _____/ |/|       /
      |   0  |  1   | |7|      /
      |_____ |_____ |/|/       z
      |   2  |  3   | /
      |_____ |_____ |/ (lol)
    */

    if (this.depth >= this.max_depth) {
      return;
    }

    this.needLeavesUpdate();

    let qwidth = this.halfX / 2;
    let qheight = this.halfY / 2;
    let qdepth = this.halfZ / 2;

    this.children_nodes[0] = new ESOctree(this, new THREE.Vector3(this.oringePosition.x - qwidth,
      this.oringePosition.y + qheight,
      this.oringePosition.z + qdepth),
      qwidth, qheight, qdepth);

    this.children_nodes[1] = new ESOctree(this, new THREE.Vector3(this.oringePosition.x + qwidth,
      this.oringePosition.y + qheight,
      this.oringePosition.z + qdepth),
      qwidth, qheight, qdepth);

    this.children_nodes[2] = new ESOctree(this, new THREE.Vector3(this.oringePosition.x - qwidth,
      this.oringePosition.y - qheight,
      this.oringePosition.z + qdepth),
      qwidth, qheight, qdepth);

    this.children_nodes[3] = new ESOctree(this, new THREE.Vector3(this.oringePosition.x + qwidth,
      this.oringePosition.y - qheight,
      this.oringePosition.z + qdepth),
      qwidth, qheight, qdepth);

    this.children_nodes[4] = new ESOctree(this, new THREE.Vector3(this.oringePosition.x - qwidth,
      this.oringePosition.y + qheight,
      this.oringePosition.z - qdepth),
      qwidth, qheight, qdepth);

    this.children_nodes[5] = new ESOctree(this, new THREE.Vector3(this.oringePosition.x + qwidth,
      this.oringePosition.y + qheight,
      this.oringePosition.z - qdepth),
      qwidth, qheight, qdepth);

    this.children_nodes[6] = new ESOctree(this, new THREE.Vector3(this.oringePosition.x - qwidth,
      this.oringePosition.y - qheight,
      this.oringePosition.z - qdepth),
      qwidth, qheight, qdepth);

    this.children_nodes[7] = new ESOctree(this, new THREE.Vector3(this.oringePosition.x + qwidth,
      this.oringePosition.y - qheight,
      this.oringePosition.z - qdepth),
      qwidth, qheight, qdepth);
  };

  add(entity) {

    let addToThis = function () {
      let iter = this;
      while (iter !== null) {
        iter._need_all_entities_update = true;
        iter = iter.parent_node;
      }
      this.entities.push(entity);
      this.BoxMesh.visible = true;
    }.bind(this);

    // 如果不包含=>返回
    // 也就是说如果新增的Mesh 不在大Mesh中，不进行查找
    if (!this.intersects(entity)) {
      return;
    }

    if (this.depth >= this.max_depth) {
      addToThis();
    }
    else if (this.children_nodes.length === 0) {
      if (this.entities.length < this.entities_per_node) {
        addToThis();
      }
      else {
        this.subdivide();

        if (this.entities.length !== 0) {
          let entities_tmp = this.entities.slice();
          this.entities.length = 0;
          while (entities_tmp.length > 0) {
            let ent = entities_tmp.pop();
            this.remove(ent);
            this.add(ent);
          }
        }

        this.add(entity);
      }
    }
    else {
      // check if the obb intersects multiple children
      let child_id = -1;
      let multiple_intersect = false;
      for (let i = 0; i < this.children_nodes.length; i++) {
        if (this.children_nodes[i].intersects(entity)) {
          if (child_id !== -1) {
            multiple_intersect = true;
            break;
          }
          child_id = i;
        }
      }

      if (multiple_intersect) {
        addToThis();
      }
      else {
        this.children_nodes[child_id].add(entity);
      }
    }
  }

  empty() {
    if (this.entities.length > 0) {
      return false;
    }

    for (let i = 0; i < this.children_nodes.length; i++) {
      if (!this.children_nodes[i].empty()) {
        return false;
      }
    }
    return true;
  };


}
