/// <reference types="three" />

export class ESOctree {

  // 父&子树
  private parent_node: any;
  private children_nodes: ESOctree[];

  // 原点
  private oringePosition: THREE.Vector3;
  private halfX: number;
  private halfY: number;
  private halfZ: number;

  // 树深度
  public depth: number;

  // 内部实体
  private entities: any[];

  private _all_entities = new Array();
  private _to_update: THREE.Mesh[];
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
    this.BoxMesh = new THREE.Mesh(this.BoxGeo, new THREE.MeshBasicMaterial({ color: 0x0, opacity: 1, wireframe: true }));
    this.BoxMesh.position.set(this.oringePosition.clone().x, this.oringePosition.clone().y, this.oringePosition.clone().z);

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
  }

  // 是否包含
  contains(point) {
    const diff = new THREE.Vector3();
    // subVectors方法用来将三维向量的(x,y,z)坐标值分别于参数(a,b)的(x,y,z)相减.并返回新的坐标值的三维向量.
    diff.subVectors(point, this.oringePosition);
    return Math.abs(diff.x) <= this.halfX
      && Math.abs(diff.y) <= this.halfY
      && Math.abs(diff.z) <= this.halfZ;
  }

  // 子节点更新
  needLeavesUpdate() {
    let iter = this;
    while (iter !== null) {
      iter._need_leaves_update = true;
      iter = iter.parent_node;
    }
  }

  // 将实体从当前节点中删除，并将当前this指向根节点
  remove(entity) {
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i] === entity) {
        this.entities.splice(i, 1);
        break;
      }
    }
    // 删除过后将当前this指向根结点
    let iter = this;
    while (iter !== null) {
      iter._need_all_entities_update = true;
      iter = iter.parent_node;
    }
  }

  // 细分
  subdivide() {
    /*       _____________
         /  4   /  5   /   |         y
        /_____ /______/ |  |         |
       /      /      /  |  |         |___ x
      /_____ / _____/   |/ |        /
      |   0  |  1   |  |/7 /       /
      |_____ |_____ |/ | /       z
      |   2  |  3   | |/
      |_____ |_____ |/ (lol)
    */

    if (this.depth >= this.max_depth) {
      return;
    }

    this.needLeavesUpdate();

    const qwidth = this.halfX / 2;
    const qheight = this.halfY / 2;
    const qdepth = this.halfZ / 2;

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
  }

  add(entity) {

    const _this = this;

    function addToThis() {
      let iter = _this;
      while (iter !== null) {
        iter._need_all_entities_update = true;
        iter = iter.parent_node;
      }
      _this.entities.push(entity);
      _this.BoxMesh.visible = true;
    }

    // 如果不包含=>返回
    // 也就是说如果新增的Mesh 不在大Mesh中，不进行查找
    if (!this.intersects(entity)) {
      return;
    }

    if (this.depth >= this.max_depth) {
      addToThis();
    } else if (this.children_nodes.length === 0) {
      // ↑小于最大深度&没有子节点并且它里面没有实体的时候
      // ↓每个节点中的数量小于规定要求
      if (this.entities.length < this.entities_per_node) {
        addToThis();
      } else {
        // 如果它里面有实体，则拆分
        this.subdivide();
        // 拆分过后，如果内部有实体，则从这个节点中删除，并重新对所有实体做add动作（通过this值的变化）
        if (this.entities.length !== 0) {
          const entities_tmp = this.entities.slice();
          this.entities.length = 0;
          while (entities_tmp.length > 0) {
            const ent = entities_tmp.pop();
            this.remove(ent);
            this.add(ent);
          }
        }
        // 然后再将这个节点添加到指定位置
        this.add(entity);
      }
    } else {
      // ↑如果它当前有节点，已经分成八份
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
      // 把当前结点放入制定的位置中
      if (multiple_intersect) {
        addToThis();
      } else {
        // 放入0节点中
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
  }

  countChildrenIntersections(max, entity) {
    const children_idx = new Array();
    for (let j = 0; j < this.children_nodes.length; j++) {
      if (this.children_nodes[j].intersects(entity)) {
        children_idx.push(j);
      }
      if (children_idx.length === max) {
        break;
      }
    }
    return children_idx;
  }

  // updates children entities reference
  updateChildrenEntities() {
    if (this._need_all_entities_update) {
      this._all_entities.length = 0;
      for (let i = 0; i < this.children_nodes.length; i++) {
        this.children_nodes[i].updateChildrenEntities();
        this._all_entities = this._all_entities.concat(this.children_nodes[i]._all_entities);
      }

      for (let i = 0; i < this.entities.length; i++) {
        this._all_entities.push([this.entities[i], this]);
      }
    }
  }

  // updates leaves reference
  updateLeaves() {
    if (this._need_leaves_update) {
      this._leaves.length = 0;
      for (let i = 0; i < this.children_nodes.length; i++) {

        this.children_nodes[i].updateLeaves();
        this._leaves = this._leaves.concat(this.children_nodes[i]._leaves);
      }

      if (this.children_nodes.length === 0) {
        this._leaves.push(this);
      }

      this._need_leaves_update = false;
    }
  }

  update() {
    const _this = this;
    _this.updateChildrenEntities();
    const entities_tmp = this._all_entities.slice();
    entities_tmp.forEach(function (element) {
      const entity = element[0];

      for (let i = 0; i < _this._to_update.length; i++) {
        if (entity === _this._to_update[i]) {
          let octree;
          let intersections;

          // check if multiple intersection with children
          // if yes do same recursively with parents till we can fit it entirely
          // in one node, and add it to this node
          octree = element[1];
          while (octree !== null) {
            intersections = octree.countChildrenIntersections(2, entity);

            if (intersections.length === 1) {
              // don't perform any operation if no update is required
              if (element[1] === octree.children_nodes[intersections[0]]) {
                break;
              }
              element[1].remove(entity);
              octree.children_nodes[intersections[0]].add(entity);
              break;
            } else if (octree.parent_node === null && intersections.length > 0) {
              element[1].remove(entity);
              octree.add(entity);
              break;
            } else {
              octree = octree.parent_node;
            }
          }
          _this._to_update.splice(i, 1);
          break;
        }
      }
    });

    // update _all_entities arrays
    _this.updateChildrenEntities();

    // get rid of dead leaves
    _this.updateLeaves();

    function pruneUp(node) {
      if (node._all_entities.length <= 1) {
        // remove the children from the leaves array and detach their mesh from parents
        const removeChildrenNodes = function (nodes) {
          for (let i = 0; i < nodes.children_nodes.length; i++) {
            removeChildrenNodes(nodes.children_nodes[i]);
            const idx = _this._leaves.indexOf(nodes.children_nodes[i]);
            if (idx !== -1) {
              _this._leaves.splice(idx, 1);
            }
            nodes.BoxMesh.remove(nodes.children_nodes[i].BoxMesh);
          }
        };

        removeChildrenNodes(node);

        node.needLeavesUpdate();
        node.children_nodes.length = 0;

        if (node._all_entities.length === 1 && (node._all_entities[0])[1] !== node) {
          // if the entity was in a one of the child, put it in current node
          node._all_entities[0][1] = node;	// will update this ref for parents node too
          node.add(node._all_entities[0][0]);
        }
        if (node.parent_node !== null) {
          pruneUp(node.parent_node);
        }
      }
    }

    this._leaves.forEach(function (node) {
      pruneUp(node);
    });
  }

}
