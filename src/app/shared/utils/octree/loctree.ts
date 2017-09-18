/// <reference types="three" />

export namespace ES {

  export class Octree {

    scene: THREE.Scene; // 加载场景,用来展示八叉树节点数据
    depthMax: number; // 八叉树最大深度
    undeferred: boolean; // 是否延迟渲染
    overlapPct: number; // 松散程度0-1
    objectsThreshold: number; // 结点内最大元素个数
    root: any; // 根节点

    // 子节点个数
    nodeCount: number; // 节点数量,在节点添加的时候自增

    // 可见边框 原始为1-1-1的正方体
    visualGeometry: THREE.CubeGeometry;
    visualMaterial: THREE.MeshBasicMaterial;

    objects: any[]; // 节点内所有元素 外部结构 例如BufferGeometry
    objectsMap: {}; // 用来检索元素，存放元素guid索引表，{uuid：**,object:**}
    objectsData: any[]; // 内部结构，指定的元素结构
    objectsDeferred: any[]; // 待渲染的元素数据

    // 未知*******
    utilVec31Search: THREE.Vector3;
    utilVec32Search: THREE.Vector3;

    INDEX_INSIDE_CROSS: any;
    INDEX_OUTSIDE_OFFSET: any;

    INDEX_OUTSIDE_NEG_Z: any;
    INDEX_OUTSIDE_POS_Z: any;
    INDEX_OUTSIDE_NEG_Y: any;
    INDEX_OUTSIDE_POS_Y: any;
    INDEX_OUTSIDE_NEG_X: any;
    INDEX_OUTSIDE_POS_X: any;

    private INDEX_OUTSIDE_MAP: any;
    private FLAG_POS_X: number;
    private FLAG_NEG_X: number;
    private FLAG_POS_Y: number;
    private FLAG_NEG_Y: number;
    private FLAG_POS_Z: number;
    private FLAG_NEG_Z: number;

    constructor(parameters) {
      // handle parameters 处理参数
      parameters = parameters || {};
      parameters.tree = this;

      // static properties ( modification is not recommended )
      // 静态参数，不建议修改
      this.nodeCount = 0; // 初始化元素内节点个数
      this.INDEX_INSIDE_CROSS = -1;
      this.INDEX_OUTSIDE_OFFSET = 2;

      this.INDEX_OUTSIDE_POS_X = Util.isNumber(parameters.INDEX_OUTSIDE_POS_X) ? parameters.INDEX_OUTSIDE_POS_X : 0;
      this.INDEX_OUTSIDE_NEG_X = Util.isNumber(parameters.INDEX_OUTSIDE_NEG_X) ? parameters.INDEX_OUTSIDE_NEG_X : 1;
      this.INDEX_OUTSIDE_POS_Y = Util.isNumber(parameters.INDEX_OUTSIDE_POS_Y) ? parameters.INDEX_OUTSIDE_POS_Y : 2;
      this.INDEX_OUTSIDE_NEG_Y = Util.isNumber(parameters.INDEX_OUTSIDE_NEG_Y) ? parameters.INDEX_OUTSIDE_NEG_Y : 3;
      this.INDEX_OUTSIDE_POS_Z = Util.isNumber(parameters.INDEX_OUTSIDE_POS_Z) ? parameters.INDEX_OUTSIDE_POS_Z : 4;
      this.INDEX_OUTSIDE_NEG_Z = Util.isNumber(parameters.INDEX_OUTSIDE_NEG_Z) ? parameters.INDEX_OUTSIDE_NEG_Z : 5;

      this.INDEX_OUTSIDE_MAP = [];
      this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_POS_X] = {index: this.INDEX_OUTSIDE_POS_X, count: 0, x: 1, y: 0, z: 0};
      this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_NEG_X] = {index: this.INDEX_OUTSIDE_NEG_X, count: 0, x: -1, y: 0, z: 0};
      this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_POS_Y] = {index: this.INDEX_OUTSIDE_POS_Y, count: 0, x: 0, y: 1, z: 0};
      this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_NEG_Y] = {index: this.INDEX_OUTSIDE_NEG_Y, count: 0, x: 0, y: -1, z: 0};
      this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_POS_Z] = {index: this.INDEX_OUTSIDE_POS_Z, count: 0, x: 0, y: 0, z: 1};
      this.INDEX_OUTSIDE_MAP[this.INDEX_OUTSIDE_NEG_Z] = {index: this.INDEX_OUTSIDE_NEG_Z, count: 0, x: 0, y: 0, z: -1};

      this.FLAG_POS_X = 1 << ( this.INDEX_OUTSIDE_POS_X + 1 );
      this.FLAG_NEG_X = 1 << ( this.INDEX_OUTSIDE_NEG_X + 1 );
      this.FLAG_POS_Y = 1 << ( this.INDEX_OUTSIDE_POS_Y + 1 );
      this.FLAG_NEG_Y = 1 << ( this.INDEX_OUTSIDE_NEG_Y + 1 );
      this.FLAG_POS_Z = 1 << ( this.INDEX_OUTSIDE_POS_Z + 1 );
      this.FLAG_NEG_Z = 1 << ( this.INDEX_OUTSIDE_NEG_Z + 1 );

      this.utilVec31Search = new THREE.Vector3();
      this.utilVec32Search = new THREE.Vector3();

      this.scene = parameters.scene;

      if (this.scene) {
        // Red wireframe
        this.visualGeometry = new THREE.CubeGeometry(1, 1, 1);
        this.visualMaterial = new THREE.MeshBasicMaterial({color: 0xFF0066, wireframe: true, wireframeLinewidth: 1});
      }

      this.objects = [];
      this.objectsMap = {};
      this.objectsData = [];
      this.objectsDeferred = [];


      // 递归深度
      // Infinity 属性用于存放表示正无穷大的数值。
      this.depthMax = Util.isNumber(parameters.depthMax) ? parameters.depthMax : Infinity;
      this.objectsThreshold = Util.isNumber(parameters.objectsThreshold) ? parameters.objectsThreshold : 8;
      this.overlapPct = Util.isNumber(parameters.overlapPct) ? parameters.overlapPct : 0.15;
      this.undeferred = parameters.undeferred || false;
      // 树的Root属性代表Node 在new一个树的过程中执行new OctreeNode并将属性传入
      this.root = parameters.root instanceof OctreeNode ? parameters.root : new OctreeNode(parameters);
    }

    /**
     * 将待整合的内容在渲染时填到树节点
     */
    public update() {
      // add any deferred objects that were waiting for render cycle
      // 添加任何延迟对象，等待渲染循环
      if (this.objectsDeferred.length > 0) {
        for (let i = 0, il = this.objectsDeferred.length; i < il; i++) {
          let deferred = this.objectsDeferred[i];
          this.addDeferred(deferred.object, deferred.options);
        }
        this.objectsDeferred.length = 0;
      }
    }

    /**
     * 仅仅从节点数据中删除
     * @param object
     */
    public removeOnly(object) {
      let index;
      object = object.object;
      // index = this.objects.indexOf(object);
      index = Util.indexOfValue(this.objects, object);
      if (index !== -1) {
        this.objects.splice(index, 1);
      }
    }

    /**
     * 删除元素
     * @param object
     */
    public remove(object) {

      let i, l,
        objectData = object,
        index,
        objectsDataRemoved;
      // ensure object is not object data for index search
      // Some ERROR
      if (object instanceof OctreeObjectData) {

      }
      else {
        object = object.object;
      }

      // check uuid
      // 检查uuid
      if (this.objectsMap[object.uuid]) {
        this.objectsMap[object.uuid] = undefined;
        // check and remove from objects, nodes, and data lists
        // 检查并从对象、节点和数据列表中删除
        index = this.objects.indexOf(object);
        // index = Util.indexOfValue(this.objects, object);
        if (index !== -1) {
          this.objects.splice(index, 1);
          // remove from nodes
          objectsDataRemoved = this.root.removeObject(objectData);
          // remove from objects data list
          for (i = 0, l = objectsDataRemoved.length; i < l; i++) {
            objectData = objectsDataRemoved[i];
            index = Util.indexOfValue(this.objectsData, objectData);
            if (index !== -1) {
              this.objectsData.splice(index, 1);
            }
          }
        }
      } else if (this.objectsDeferred.length > 0) {
        // check and remove from deferred
        // 检查并清除延迟
        index = Util.indexOfPropertyWithValue(this.objectsDeferred, 'object', object);
        if (index !== -1) {
          this.objectsDeferred.splice(index, 1);
        }
      }
    }

    /**
     * 立即添加
     * @param object 对象信息
     * @param options 参数
     */
    public add(object, options) {
      // add immediately
      if (this.undeferred) {
        this.updateObject(object);
        this.addDeferred(object, options);
      } else {
        // 添加元素直到下次octree Update
        this.objectsDeferred.push({object: object, options: options});
      }
    }

    private addDeferred(object, options) {
      let i, l,
        geometry,
        faces,
        useFaces,
        vertices,
        useVertices;

      // ensure object is not object data
      // 确保对象不是对象数据
      if (object instanceof OctreeObjectData) {
        object = object.object;
      }
      // check uuid to avoid duplicates
      // 检查UUID避免重复
      if (!object.uuid) {
        object.uuid = THREE.Math.generateUUID();
      }

      if (!this.objectsMap[object.uuid]) {
        // 树节点添加object,并且添加索引
        this.objects.push(object);
        this.objectsMap[object.uuid] = object;
        // 检查选项 是geometry 还是 BufferGeometry
        if (options) {
          useFaces = options.useFaces;
          useVertices = options.useVertices;
        }
        if (useVertices === true) {
          geometry = object.geometry;
          vertices = geometry.vertices;
          for (i = 0, l = vertices.length; i < l; i++) {
            this.addObjectData(object, vertices[i]);
          }
        } else if (useFaces === true) {
          geometry = object.geometry;
          faces = geometry.faces;
          for (i = 0, l = faces.length; i < l; i++) {
            this.addObjectData(object, faces[i]);
          }
        } else {
          // Buffer geometry
          this.addObjectData(object);
        }
      }
    }

    private addObjectData(object, part?) {
      let objectData = new OctreeObjectData(object, part);
      // add to tree objects data list
      // 添加到树中的对象的数据列表
      this.objectsData.push(objectData);
      // add to nodes
      // 添加到节点数据中
      this.root.addObject(objectData);
    }

    /**
     * 合并
     * @param octree 八叉树
     */
    extend(octree) {
      let i, l, objectsData, objectData;
      if (octree instanceof Octree) {
        objectsData = octree.objectsData;
        for (i = 0, l = objectsData.length; i < l; i++) {
          objectData = objectsData[i];
          this.add(objectData, {useFaces: objectData.faces, useVertices: objectData.vertices});
        }
      }
    }

    /**
     * 重建
     */
    rebuild() {

      let i, l,
        node,
        objectData,
        indexOctant,
        indexOctantLast,
        objectsUpdate = [];

      // check all object data for changes in position
      // assumes all object matrices are up to date
      for (i = 0, l = this.objectsData.length; i < l; i++) {
        objectData = this.objectsData[i];
        node = objectData.node;
        // update object
        objectData.update();
        // if position has changed since last organization of object in tree
        if (node instanceof OctreeNode && !objectData.positionLast.equals(objectData.position)) {
          // get octant index of object within current node
          indexOctantLast = objectData.indexOctant;
          indexOctant = node.getOctantIndex(objectData);
          // if object octant index has changed
          if (indexOctant !== indexOctantLast) {
            // add to update list
            objectsUpdate.push(objectData);
          }
        }
      }
      // update changed objects
      for (i = 0, l = objectsUpdate.length; i < l; i++) {
        objectData = objectsUpdate[i];
        // remove object from current node
        objectData.node.removeObject(objectData);
        // add object to tree root
        this.root.addObject(objectData);
      }
    }

    updateObject(object) {
      let i, l,
        parentCascade = [object],
        parent,
        parentUpdate;
      // search all parents between object and root for world matrix update
      parent = object.parent;
      while (parent) {
        parentCascade.push(parent);
        parent = parent.parent;
      }
      for (i = 0, l = parentCascade.length; i < l; i++) {
        parent = parentCascade[i];
        if (parent.matrixWorldNeedsUpdate === true) {
          parentUpdate = parent;
        }
      }
      // update world matrix starting at uppermost parent that needs update
      if (typeof parentUpdate !== 'undefined') {
        parentUpdate.updateMatrixWorld();
      }
    }

    search(position, radius, organizeByObject, direction?) {

      let i, l,
        node: OctreeNode,
        objects,
        objectData,
        object,
        results,
        resultData,
        resultsObjectsIndices,
        resultObjectIndex,
        directionPct;
      // add root objects
      objects = [].concat(this.root.objects);
      // 半径大于0
      // ensure radius (i.e. distance of ray) is a number
      if (!( radius > 0 )) {
        radius = Number.MAX_VALUE;
      }
      // if direction passed, normalize and find pct
      // 如果方向通过，规范和发现PCT
      if (direction instanceof THREE.Vector3) {
        direction = this.utilVec31Search.copy(direction).normalize();
        directionPct = this.utilVec32Search.set(1, 1, 1).divide(direction);
      }
      // search each node of root
      for (i = 0, l = this.root.nodesIndices.length; i < l; i++) {
        node = this.root.nodesByIndex[this.root.nodesIndices[i]];
        objects = node.search(position, radius, objects, direction, directionPct);
      }
      // if should organize results by object
      // 如果要按对象组织结果
      if (organizeByObject === true) {
        results = [];
        resultsObjectsIndices = [];
        // for each object data found
        for (i = 0, l = objects.length; i < l; i++) {
          objectData = objects[i];
          object = objectData.object;
          resultObjectIndex = Util.indexOfValue(resultsObjectsIndices, object);
          // if needed, create new result data
          if (resultObjectIndex === -1) {
            resultData = {
              object: object,
              faces: [],
              vertices: []
            };
            results.push(resultData);
            resultsObjectsIndices.push(object);
          } else {
            resultData = results[resultObjectIndex];
          }

          // object data has faces or vertices, add to list
          if (objectData.faces) {
            resultData.faces.push(objectData.faces);
          } else if (objectData.vertices) {
            resultData.vertices.push(objectData.vertices);
          }
        }
      } else {
        results = objects;
      }
      return results;
    }

    /**
     * 找到最近的顶点
     * @param position 位置
     * @param radius 半径
     * @returns {THREE.Vector3} 向量位置
     */
    findClosestVertex(position, radius): THREE.Vector3 {

      let search = this.search(position, radius, true);
      if (!search[0]) {
        return null;
      }

      let object = search[0].object,
        vertices = search[0].vertices;
      if (vertices.length === 0) {
        return null;
      }

      let distance,
        vertex = null,
        localPosition = object.worldToLocal(position.clone());

      for (let i = 0, il = vertices.length; i < il; i++) {
        distance = vertices[i].distanceTo(localPosition);
        if (distance > radius) {
          continue;
        }
        // use distance in new comparison to find the closest point
        radius = distance;
        vertex = vertices[i];
      }
      if (vertex === null) {
        return null;
      }
      return object.localToWorld(vertex.clone());
    }

    /**
     * 为当前树设置父结点
     * @param root
     */
    setRoot(root) {
      if (root instanceof OctreeNode) {
        // store new root
        this.root = root;
        // update properties
        this.root.updateProperties();
      }
    }

    /**
     * 获得当前根节点深度
     * @returns {any | number}
     */
    getDepthEnd() {
      return this.root.getDepthEnd();
    }

    /**
     * 当前树根节点子结点个数
     * @returns {any | number}
     */
    getNodeCountEnd() {
      return this.root.getNodeCountEnd();
    }

    /**
     * 获得当前根节点下元素个数
     * @returns {any | number}
     */
    getObjectCountEnd() {
      return this.root.getObjectCountEnd();
    }

    /**
     * 根节点详细信息输出
     */
    toConsole() {
      this.root.toConsole();
    }
  }

  export class OctreeNode {
    // Node 节点的属性
    tree: any; // 八叉树
    parent: any; // 父亲节点
    visual: THREE.Mesh; // 可见的Mesh 用来在scene中做展示

    objects: any[]; // 这个Node节点中的元素
    nodesByIndex: any; // 子节点数组
    nodesIndices: any; // 子节点Index数组

    overlap: number; // 松散程度
    radiusOverlap: any;// 节点内最大元素个数

    right: number;
    left: number;
    bottom: number;
    top: number;
    back: number;
    front: number;

    depth: number;

    indexOctant: any;
    radius: any;
    position: any; // 如果是根Node,则它的Position 为树的位置，否则new Vector3
    id: number; // this.tree.nodeCount

    utilVec31Expand: THREE.Vector3;
    utilVec31Ray: THREE.Vector3;
    utilVec31Branch: THREE.Vector3;

    /**
     * 参数来自OCtree
     * @param parameters
     */
    constructor(parameters) {
      // 帮助
      // 这里的this代表Root,即Node节点

      this.utilVec31Branch = new THREE.Vector3();
      this.utilVec31Expand = new THREE.Vector3();
      this.utilVec31Ray = new THREE.Vector3();
      // 静态参数
      parameters = parameters || {};

      // store or create tree
      // 存储或创建树
      if (parameters.tree instanceof Octree) {
        this.tree = parameters.tree;
      }
      else if (parameters.parent instanceof OctreeNode !== true) {
        // 如果根树没有被定义，则将根树新建，将当前结点设置为root Node 节点
        parameters.root = this;
        this.tree = new ES.Octree(parameters);
      }

      // basic properties
      // 基本属性
      this.id = this.tree.nodeCount++;
      this.position = parameters.position instanceof THREE.Vector3 ? parameters.position : new THREE.Vector3();
      this.radius = parameters.radius > 0 ? parameters.radius : 1;
      this.indexOctant = parameters.indexOctant;
      this.depth = 0;
      // reset and assign parent
      // Node 初始化
      this.reset();
      // 如果有父Node,则进行分配
      this.setParent(parameters.parent);
      // additional properties
      // 附加属性
      this.overlap = this.radius * this.tree.overlapPct;
      // 扩大后的半径
      this.radiusOverlap = this.radius + this.overlap;
      // 形成每个Node 中的稀疏正方体
      this.left = this.position.x - this.radiusOverlap;
      this.right = this.position.x + this.radiusOverlap;
      this.bottom = this.position.y - this.radiusOverlap;
      this.top = this.position.y + this.radiusOverlap;
      this.back = this.position.z - this.radiusOverlap;
      this.front = this.position.z + this.radiusOverlap;

      // visual
      // 如果scene存在，则将当前Node的包围正方体放入
      if (this.tree.scene) {
        this.visual = new THREE.Mesh(this.tree.visualGeometry, this.tree.visualMaterial);
        this.visual.scale.set(this.radiusOverlap * 2, this.radiusOverlap * 2, this.radiusOverlap * 2);
        this.visual.position.copy(this.position);
        this.tree.scene.add(this.visual);
      }
    }

    /**
     * 为Node节点重新寻找父Node
     * @param parent
     */
    setParent(parent) {
      // store new parent
      if (parent !== this && this.parent !== parent) {
        this.parent = parent;
        // update properties
        this.updateProperties();
      }
    }

    /**
     * 更新内部属性为最新
     */
    updateProperties() {
      let i, l;
      // properties
      if (this.parent instanceof OctreeNode) {
        this.tree = this.parent.tree;
        this.depth = this.parent.depth + 1;
      } else {
        this.depth = 0;
      }
      // cascade
      for (i = 0, l = this.nodesIndices.length; i < l; i++) {
        this.nodesByIndex[this.nodesIndices[i]].updateProperties();
      }
    }

    /**
     * 初始化内部元素以及属性
     * @param cascade
     * @param removeVisual
     */
    reset(cascade?, removeVisual?) {
      let i, l,
        node,
        nodesIndices = this.nodesIndices || [],
        nodesByIndex = this.nodesByIndex;
      // 初始化内置属性，无元素，无子节点
      this.objects = [];
      this.nodesIndices = [];
      this.nodesByIndex = {};
      // unset parent in nodes
      for (i = 0, l = nodesIndices.length; i < l; i++) {
        node = nodesByIndex[nodesIndices[i]];
        node.setParent(undefined);
        if (cascade === true) {
          node.reset(cascade, removeVisual);
        }
      }
      // visual
      if (removeVisual === true && this.visual && this.visual.parent) {
        this.visual.parent.remove(this.visual);
      }
    }

    // 添加结点
    addNode(node, indexOctant) {
      node.indexOctant = indexOctant;
      // 如果当前结点index存在，则替换
      if (Util.indexOfValue(this.nodesIndices, indexOctant) === -1) {
        this.nodesIndices.push(indexOctant);
      }
      this.nodesByIndex[indexOctant] = node;
      if (node.parent !== this) {
        node.setParent(this);
      }
    }

    /**
     * 删除结点
     * @param indexOctant
     * @param _node
     */
    removeNode(indexOctant, _node?) {
      let index;
      let node;
      index = Util.indexOfValue(this.nodesIndices, indexOctant);
      this.nodesIndices.splice(index, 1);
      node = _node || this.nodesByIndex[indexOctant];
      delete this.nodesByIndex[indexOctant];
      if (node.parent === this) {
        node.setParent(undefined);
      }
    }

    /**
     * 添加元素
     * @param object
     */
    addObject(object) {
      let index;
      let indexOctant;
      let node;
      // get object octant index
      // 获取对象偏移指数,象限
      indexOctant = this.getOctantIndex(object);
      // if object fully contained by an octant, add to subtree
      // 如果对象完全包含在一个卦限，并且该节点有子Node
      if (indexOctant > -1 && this.nodesIndices.length > 0) {
        node = this.branch(indexOctant);
        node.addObject(object);
      }
      else if (indexOctant < -1 && this.parent instanceof OctreeNode) {
        // if object lies outside bounds, add to parent node
        // 如果对象位于边界之外，则添加到父节点
        this.parent.addObject(object);
      }
      else {
        // 当前Node,没有子Node
        // add to this objects list
        index = this.objects.indexOf(object);
        //index = Util.indexOfValue(this.objects, object);
        if (index === -1) {
          this.objects.push(object);
        }
        // node reference
        // 设置元素属性
        object.node = this;
        // check if need to expand, split, or both
        // 检查是否需要展开、拆分或合并
        this.checkGrow();
      }
    }

    /**
     * 添加元素并不检查当前结点是否溢出
     * @param objects
     */
    addObjectWithoutCheck(objects) {
      let i, l,
        object;
      for (i = 0, l = objects.length; i < l; i++) {
        object = objects[i];
        this.objects.push(object);
        object.node = this;
      }
    }

    removeObject(object) {
      let i, l,
        nodesRemovedFrom,
        removeData;
      // cascade through tree to find and remove object
      removeData = this.removeObjectRecursive(object, {
        searchComplete: false,
        nodesRemovedFrom: [],
        objectsDataRemoved: []
      });
      // if object removed, try to shrink the nodes it was removed from
      nodesRemovedFrom = removeData.nodesRemovedFrom;
      if (nodesRemovedFrom.length > 0) {
        for (i = 0, l = nodesRemovedFrom.length; i < l; i++) {
          nodesRemovedFrom[i].shrink();
        }
      }
      return removeData.objectsDataRemoved;
    }

    // 递归删除元素
    removeObjectRecursive(object, removeData) {

      let i, l,
        index = -1,
        objectData,
        node,
        objectRemoved;

      // find index of object in objects list

      // search and remove object data (fast)
      if (object instanceof OctreeObjectData) {
        // remove from this objects list
        index = Util.indexOfValue(this.objects, object);
        if (index !== -1) {
          this.objects.splice(index, 1);
          object.node = undefined;
          removeData.objectsDataRemoved.push(object);
          removeData.searchComplete = objectRemoved = true;
        }
      } else {
        // search each object data for object and remove (slow)
        for (i = this.objects.length - 1; i >= 0; i--) {
          objectData = this.objects[i];
          if (objectData.object === object) {
            this.objects.splice(i, 1);
            objectData.node = undefined;
            removeData.objectsDataRemoved.push(objectData);
            objectRemoved = true;
            if (!objectData.faces && !objectData.vertices) {
              removeData.searchComplete = true;
              break;
            }
          }
        }
      }
      // if object data removed and this is not on nodes removed from
      if (objectRemoved === true) {
        removeData.nodesRemovedFrom.push(this);
      }
      // if search not complete, search nodes
      if (removeData.searchComplete !== true) {
        for (i = 0, l = this.nodesIndices.length; i < l; i++) {
          node = this.nodesByIndex[this.nodesIndices[i]];
          // try removing object from node
          removeData = node.removeObjectRecursive(object, removeData);
          if (removeData.searchComplete === true) {
            break;
          }
        }
      }
      return removeData;
    }

    /**
     * 检查是否达到做大上限
     */
    checkGrow() {
      // if object count above max
      if (this.objects.length > this.tree.objectsThreshold && this.tree.objectsThreshold > 0) {
        this.grow();
      }
    }

    /**
     * 生长
     */
    grow() {
      let indexOctant,
        object,
        objectsExpand = [],
        objectsExpandOctants = [],
        objectsSplit = [],
        objectsSplitOctants = [],
        objectsRemaining = [],
        i, l;
      // for each object
      for (i = 0, l = this.objects.length; i < l; i++) {
        object = this.objects[i];
        // get object octant index
        indexOctant = this.getOctantIndex(object);
        // if lies within octant
        if (indexOctant > -1) {
          objectsSplit.push(object);
          objectsSplitOctants.push(indexOctant);
        } else if (indexOctant < -1) {
          // lies outside radius
          objectsExpand.push(object);
          objectsExpandOctants.push(indexOctant);
        } else {
          // lies across bounds between octants
          objectsRemaining.push(object);
        }
      }

      // if has objects to split
      if (objectsSplit.length > 0) {
        objectsRemaining = objectsRemaining.concat(this.split(objectsSplit, objectsSplitOctants));
      }
      // if has objects to expand
      if (objectsExpand.length > 0) {
        objectsRemaining = objectsRemaining.concat(this.expand(objectsExpand, objectsExpandOctants));
      }
      // store remaining
      this.objects = objectsRemaining;
      // merge check
      this.checkMerge();
    }

    /**
     * 剔除
     * @param objects
     * @param octants
     * @returns {any}
     */
    split(objects, octants) {

      let i, l,
        indexOctant,
        object,
        node,
        objectsRemaining;
      // if not at max depth
      if (this.depth < this.tree.depthMax) {
        objects = objects || this.objects;
        octants = octants || [];
        objectsRemaining = [];
        // for each object
        for (i = 0, l = objects.length; i < l; i++) {
          object = objects[i];
          // get object octant index
          indexOctant = octants[i];
          // if object contained by octant, branch this tree
          if (indexOctant > -1) {
            node = this.branch(indexOctant);
            node.addObject(object);
          } else {
            objectsRemaining.push(object);
          }
        }
        // if all objects, set remaining as new objects
        if (objects === this.objects) {
          this.objects = objectsRemaining;
        }
      } else {
        objectsRemaining = this.objects;
      }
      return objectsRemaining;
    }

    /**
     * 分支
     * @param indexOctant
     * @returns {any}
     */
    branch(indexOctant) {

      let node,
        overlap,
        radius,
        radiusOffset,
        offset,
        position;

      // node exists
      if (this.nodesByIndex[indexOctant] instanceof OctreeNode) {
        node = this.nodesByIndex[indexOctant];
      } else {
        // properties
        radius = ( this.radiusOverlap ) * 0.5;
        overlap = radius * this.tree.overlapPct;
        radiusOffset = radius - overlap;
        offset = this.utilVec31Branch.set(indexOctant & 1 ? radiusOffset : -radiusOffset,
          indexOctant & 2 ? radiusOffset : -radiusOffset, indexOctant & 4 ? radiusOffset : -radiusOffset);
        position = new THREE.Vector3().addVectors(this.position, offset);
        // node
        node = new OctreeNode({
          tree: this.tree,
          parent: this,
          position: position,
          radius: radius,
          indexOctant: indexOctant
        });
        // store
        this.addNode(node, indexOctant);
      }
      return node;
    }

    /**
     * 扩大
     * @param objects
     * @param octants
     * @returns {any}
     */
    expand(objects, octants) {

      let i, l,
        object,
        objectsRemaining,
        objectsExpand,
        indexOctant,
        flagsOutside,
        indexOctantInverse,
        iom = this.tree.INDEX_OUTSIDE_MAP,
        indexOutsideCounts,
        infoIndexOutside1,
        infoIndexOutside2,
        infoIndexOutside3,
        indexOutsideBitwise1,
        indexOutsideBitwise2,
        infoPotential1,
        infoPotential2,
        infoPotential3,
        indexPotentialBitwise1,
        indexPotentialBitwise2,
        octantX, octantY, octantZ,
        overlap,
        radius,
        radiusOffset,
        radiusParent,
        overlapParent,
        offset = this.utilVec31Expand,
        position,
        parent;

      // handle max depth down tree
      if (this.tree.root.getDepthEnd() < this.tree.depthMax) {
        objects = objects || this.objects;
        octants = octants || [];
        objectsRemaining = [];
        objectsExpand = [];
        // reset counts
        for (i = 0, l = iom.length; i < l; i++) {
          iom[i].count = 0;
        }
        // for all outside objects, find outside octants containing most objects
        for (i = 0, l = objects.length; i < l; i++) {
          object = objects[i];
          // get object octant index
          indexOctant = octants[i];
          // if object outside this, include in calculations
          if (indexOctant < -1) {
            // convert octant index to outside flags
            flagsOutside = -indexOctant - this.tree.INDEX_OUTSIDE_OFFSET;
            // check against bitwise flags
            // x
            if (flagsOutside & this.tree.FLAG_POS_X) {
              iom[this.tree.INDEX_OUTSIDE_POS_X].count++;
            } else if (flagsOutside & this.tree.FLAG_NEG_X) {
              iom[this.tree.INDEX_OUTSIDE_NEG_X].count++;
            }
            // y
            if (flagsOutside & this.tree.FLAG_POS_Y) {
              iom[this.tree.INDEX_OUTSIDE_POS_Y].count++;
            } else if (flagsOutside & this.tree.FLAG_NEG_Y) {
              iom[this.tree.INDEX_OUTSIDE_NEG_Y].count++;
            }
            // z
            if (flagsOutside & this.tree.FLAG_POS_Z) {
              iom[this.tree.INDEX_OUTSIDE_POS_Z].count++;
            } else if (flagsOutside & this.tree.FLAG_NEG_Z) {
              iom[this.tree.INDEX_OUTSIDE_NEG_Z].count++;
            }
            // store in expand list
            objectsExpand.push(object);
          } else {
            objectsRemaining.push(object);
          }
        }
        // if objects to expand
        if (objectsExpand.length > 0) {
          // shallow copy index outside map
          indexOutsideCounts = iom.slice(0);
          // sort outside index count so highest is first
          indexOutsideCounts.sort(function (a, b) {
            return b.count - a.count;
          });
          // get highest outside indices
          // first is first
          infoIndexOutside1 = indexOutsideCounts[0];
          indexOutsideBitwise1 = infoIndexOutside1.index | 1;
          // second is ( one of next two bitwise OR 1 ) that is not opposite of ( first bitwise OR 1 )

          infoPotential1 = indexOutsideCounts[1];
          infoPotential2 = indexOutsideCounts[2];

          infoIndexOutside2 = ( infoPotential1.index | 1 ) !== indexOutsideBitwise1 ? infoPotential1 : infoPotential2;
          indexOutsideBitwise2 = infoIndexOutside2.index | 1;

          // third is ( one of next three bitwise OR 1 ) that is not opposite of ( first or second bitwise OR 1 )

          infoPotential1 = indexOutsideCounts[2];
          infoPotential2 = indexOutsideCounts[3];
          infoPotential3 = indexOutsideCounts[4];

          indexPotentialBitwise1 = infoPotential1.index | 1;
          indexPotentialBitwise2 = infoPotential2.index | 1;

          infoIndexOutside3 = indexPotentialBitwise1 !== indexOutsideBitwise1 &&
          indexPotentialBitwise1 !== indexOutsideBitwise2 ? infoPotential1 :
            indexPotentialBitwise2 !== indexOutsideBitwise1 &&
            indexPotentialBitwise2 !== indexOutsideBitwise2 ? infoPotential2 : infoPotential3;

          // get this octant normal based on outside octant indices

          octantX = infoIndexOutside1.x + infoIndexOutside2.x + infoIndexOutside3.x;
          octantY = infoIndexOutside1.y + infoIndexOutside2.y + infoIndexOutside3.y;
          octantZ = infoIndexOutside1.z + infoIndexOutside2.z + infoIndexOutside3.z;

          // get this octant indices based on octant normal

          indexOctant = this.getOctantIndexFromPosition(octantX, octantY, octantZ);
          indexOctantInverse = this.getOctantIndexFromPosition(-octantX, -octantY, -octantZ);

          // properties

          overlap = this.overlap;
          radius = this.radius;

          // radius of parent comes from reversing overlap of this, unless overlap percent is 0

          radiusParent = this.tree.overlapPct > 0 ?
            overlap / ( ( 0.5 * this.tree.overlapPct ) * ( 1 + this.tree.overlapPct ) ) : radius * 2;
          overlapParent = radiusParent * this.tree.overlapPct;

          // parent offset is difference between radius + overlap of parent and child

          radiusOffset = ( radiusParent + overlapParent ) - ( radius + overlap );
          offset.set(indexOctant & 1 ? radiusOffset : -radiusOffset, indexOctant & 2 ? radiusOffset : -radiusOffset,
            indexOctant & 4 ? radiusOffset : -radiusOffset);
          position = new THREE.Vector3().addVectors(this.position, offset);

          // parent
          parent = new OctreeNode({
            tree: this.tree,
            position: position,
            radius: radiusParent
          });
          // set self as node of parent
          parent.addNode(this, indexOctantInverse);
          // set parent as root
          this.tree.setRoot(parent);
          // add all expand objects to parent
          for (i = 0, l = objectsExpand.length; i < l; i++) {
            this.tree.root.addObject(objectsExpand[i]);
          }
        }
        // if all objects, set remaining as new objects
        if (objects === this.objects) {
          this.objects = objectsRemaining;
        }
      } else {
        objectsRemaining = objects;
      }
      return objectsRemaining;
    }

    /**
     * 收缩
     */
    shrink() {
      // merge check
      this.checkMerge();
      // contract check
      this.tree.root.checkContract();
    }

    /**
     * 检查合并
     */
    checkMerge() {
      let nodeParent = this;
      let nodeMerge;
      // traverse up tree as long as node + entire subtree's object count is under minimum
      while (nodeParent.parent instanceof OctreeNode &&
      nodeParent instanceof OctreeNode && nodeParent.getObjectCountEnd() < this.tree.objectsThreshold) {
        nodeMerge = nodeParent;
        nodeParent = nodeParent.parent;
      }
      // if parent node is not this, merge entire subtree into merge node
      if (nodeParent !== this) {
        nodeParent.merge(nodeMerge);
      }

    }

    /**
     * 合并
     * @param nodes
     */
    merge(nodes) {
      let i, l,
        node;
      // handle nodes
      nodes = Util.toArray(nodes);
      for (i = 0, l = nodes.length; i < l; i++) {
        node = nodes[i];
        // gather node + all subtree objects
        this.addObjectWithoutCheck(node.getObjectsEnd());
        // reset node + entire subtree
        node.reset(true, true);
        // remove node
        this.removeNode(node.indexOctant, node);
      }
      // merge check
      this.checkMerge();
    }

    checkContract() {

      let i, l,
        node,
        nodeObjectsCount,
        nodeHeaviest,
        nodeHeaviestObjectsCount,
        outsideHeaviestObjectsCount;
      // find node with highest object count
      if (this.nodesIndices.length > 0) {
        nodeHeaviestObjectsCount = 0;
        outsideHeaviestObjectsCount = this.objects.length;
        for (i = 0, l = this.nodesIndices.length; i < l; i++) {
          node = this.nodesByIndex[this.nodesIndices[i]];

          nodeObjectsCount = node.getObjectCountEnd();
          outsideHeaviestObjectsCount += nodeObjectsCount;

          if (nodeHeaviest instanceof OctreeNode === false || nodeObjectsCount > nodeHeaviestObjectsCount) {
            nodeHeaviest = node;
            nodeHeaviestObjectsCount = nodeObjectsCount;
          }
        }
        // subtract heaviest count from outside count
        outsideHeaviestObjectsCount -= nodeHeaviestObjectsCount;
        // if should contract
        if (outsideHeaviestObjectsCount < this.tree.objectsThreshold && nodeHeaviest instanceof OctreeNode) {
          this.contract(nodeHeaviest);
        }
      }
    }

    contract(nodeRoot) {
      let i, l, node;
      // handle all nodes
      for (i = 0, l = this.nodesIndices.length; i < l; i++) {
        node = this.nodesByIndex[this.nodesIndices[i]];
        // if node is not new root
        if (node !== nodeRoot) {
          // add node + all subtree objects to root
          nodeRoot.addObjectWithoutCheck(node.getObjectsEnd());
          // reset node + entire subtree
          node.reset(true, true);
        }
      }

      // add own objects to root
      nodeRoot.addObjectWithoutCheck(this.objects);
      // reset self
      this.reset(false, true);
      // set new root
      this.tree.setRoot(nodeRoot);
      // contract check on new root
      nodeRoot.checkContract();
    }

    /**
     * 获取对象偏移指数
     * @param objectData
     * @returns {any}
     */
    getOctantIndex(objectData) {

      let positionObj,
        radiusObj,
        position = this.position,
        radiusOverlap = this.radiusOverlap,
        overlap = this.overlap,
        deltaX, deltaY, deltaZ,
        distX, distY, distZ,
        distance,
        indexOctant = 0;

      // handle type

      if (objectData instanceof OctreeObjectData) {

        radiusObj = objectData.radius;

        positionObj = objectData.position;

        // update object data position last

        objectData.positionLast.copy(positionObj);

      } else if (objectData instanceof OctreeNode) {

        positionObj = objectData.position;

        radiusObj = 0;

      }

      // find delta and distance

      deltaX = positionObj.x - position.x;
      deltaY = positionObj.y - position.y;
      deltaZ = positionObj.z - position.z;

      distX = Math.abs(deltaX);
      distY = Math.abs(deltaY);
      distZ = Math.abs(deltaZ);
      distance = Math.max(distX, distY, distZ);

      // if outside, use bitwise flags to indicate on which sides object is outside of
      // 如果外，使用位标志表明在这方面对象之外
      if (distance + radiusObj > radiusOverlap) {

        // x

        if (distX + radiusObj > radiusOverlap) {

          indexOctant = indexOctant ^ ( deltaX > 0 ? this.tree.FLAG_POS_X : this.tree.FLAG_NEG_X );

        }

        // y

        if (distY + radiusObj > radiusOverlap) {

          indexOctant = indexOctant ^ ( deltaY > 0 ? this.tree.FLAG_POS_Y : this.tree.FLAG_NEG_Y );

        }

        // z

        if (distZ + radiusObj > radiusOverlap) {

          indexOctant = indexOctant ^ ( deltaZ > 0 ? this.tree.FLAG_POS_Z : this.tree.FLAG_NEG_Z );

        }

        objectData.indexOctant = -indexOctant - this.tree.INDEX_OUTSIDE_OFFSET;

        return objectData.indexOctant;

      }

      // return octant index from delta xyz

      if (deltaX - radiusObj > -overlap) {

        // x right

        indexOctant = indexOctant | 1;

      } else if (!( deltaX + radiusObj < overlap )) {

        // x left

        objectData.indexOctant = this.tree.INDEX_INSIDE_CROSS;
        return objectData.indexOctant;

      }

      if (deltaY - radiusObj > -overlap) {

        // y right

        indexOctant = indexOctant | 2;

      } else if (!( deltaY + radiusObj < overlap )) {

        // y left

        objectData.indexOctant = this.tree.INDEX_INSIDE_CROSS;
        return objectData.indexOctant;

      }


      if (deltaZ - radiusObj > -overlap) {

        // z right

        indexOctant = indexOctant | 4;

      } else if (!( deltaZ + radiusObj < overlap )) {

        // z left

        objectData.indexOctant = this.tree.INDEX_INSIDE_CROSS;
        return objectData.indexOctant;
      }
      objectData.indexOctant = indexOctant;
      return objectData.indexOctant;
    }

    getOctantIndexFromPosition(x, y, z) {
      let indexOctant = 0;
      if (x > 0) {
        indexOctant = indexOctant | 1;
      }
      if (y > 0) {
        indexOctant = indexOctant | 2;
      }
      if (z > 0) {
        indexOctant = indexOctant | 4;
      }
      return indexOctant;
    }

    search(position, radius, objects, direction?, directionPct?) {
      let i, l,
        node,
        intersects;
      // test intersects by parameters
      // 如果是射线
      if (direction) {
        intersects = this.intersectRay(position, direction, radius, directionPct);
      }
      else {
        // 球体
        intersects = this.intersectSphere(position, radius);
      }
      // if intersects
      if (intersects === true) {
        // gather objects
        objects = objects.concat(this.objects);
        // 搜索子树
        // search subtree
        for (i = 0, l = this.nodesIndices.length; i < l; i++) {
          node = this.nodesByIndex[this.nodesIndices[i]];
          objects = node.search(position, radius, objects, direction);
        }
      }

      return objects;

    }

    /**
     * 当前Node与球相交?
     * 球与正方体相交算法
     * @param position
     * @param radius
     * @returns {boolean}
     */
    intersectSphere(position, radius) {
      let distance = radius * radius;
      let px = position.x;
      let py = position.y;
      let pz = position.z;

      if (px < this.left) {
        distance -= Math.pow(px - this.left, 2);
      } else if (px > this.right) {
        distance -= Math.pow(px - this.right, 2);
      }

      if (py < this.bottom) {
        distance -= Math.pow(py - this.bottom, 2);
      } else if (py > this.top) {
        distance -= Math.pow(py - this.top, 2);
      }

      if (pz < this.back) {
        distance -= Math.pow(pz - this.back, 2);
      } else if (pz > this.front) {
        distance -= Math.pow(pz - this.front, 2);
      }

      return distance >= 0;
    }

    /**
     * 当前结点与射线相交？
     * @param origin
     * @param direction
     * @param distance
     * @param directionPct
     * @returns {boolean}
     */
    intersectRay(origin, direction, distance, directionPct?) {
      if (typeof directionPct === 'undefined') {
        directionPct = this.utilVec31Ray.set(1, 1, 1).divide(direction);
      }
      let t1 = ( this.left - origin.x ) * directionPct.x,
        t2 = ( this.right - origin.x ) * directionPct.x,
        t3 = ( this.bottom - origin.y ) * directionPct.y,
        t4 = ( this.top - origin.y ) * directionPct.y,
        t5 = ( this.back - origin.z ) * directionPct.z,
        t6 = ( this.front - origin.z ) * directionPct.z,
        tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6)),
        tmin;
      // ray would intersect in reverse direction, i.e. this is behind ray
      if (tmax < 0) {
        return false;
      }
      tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
      // if tmin > tmax or tmin > ray distance, ray doesn't intersect AABB
      if (tmin > tmax || tmin > distance) {
        return false;
      }
      return true;
    }

    getDepthEnd(depth) {
      let i, l, node;
      if (this.nodesIndices.length > 0) {
        for (i = 0, l = this.nodesIndices.length; i < l; i++) {
          node = this.nodesByIndex[this.nodesIndices[i]];
          depth = node.getDepthEnd(depth);
        }
      } else {
        depth = !depth || this.depth > depth ? this.depth : depth;
      }
      return depth;
    }

    getNodeCountEnd() {
      return this.tree.root.getNodeCountRecursive() + 1;
    }

    getNodeCountRecursive() {
      let i, l, count = this.nodesIndices.length;
      for (i = 0, l = this.nodesIndices.length; i < l; i++) {
        count += this.nodesByIndex[this.nodesIndices[i]].getNodeCountRecursive();
      }
      return count;
    }

    getObjectsEnd(objects) {
      let i, l, node;
      objects = ( objects || [] ).concat(this.objects);
      for (i = 0, l = this.nodesIndices.length; i < l; i++) {
        node = this.nodesByIndex[this.nodesIndices[i]];
        objects = node.getObjectsEnd(objects);
      }
      return objects;
    }

    getObjectCountEnd() {
      let i, l, count = this.objects.length;
      for (i = 0, l = this.nodesIndices.length; i < l; i++) {
        count += this.nodesByIndex[this.nodesIndices[i]].getObjectCountEnd();
      }
      return count;
    }

    getObjectCountStart() {
      let count = this.objects.length;
      let parent = this.parent;
      while (parent instanceof OctreeNode) {
        count += parent.objects.length;
        parent = parent.parent;
      }
      return count;
    }


  }

  export class OctreeObjectData {
    vertices: THREE.Vector3;
    radius: any;
    position: any;
    positionLast: any;
    object: any;
    node: any;

    constructor(object, part) {
      // properties
      this.object = object;
      // Remove Face3 & Face4
      if (part instanceof THREE.Vector3) {
        this.vertices = part;
      }
      this.radius = 0;
      this.position = new THREE.Vector3();
      // initial update
      if (this.object instanceof THREE.Object3D) {
        this.update();
      }
      else {
        // Generic object
        this.position.set(object.x, object.y, object.z);
        this.radius = object.radius;
      }
      this.positionLast = this.position.clone();
    }

    update() {
      if (this.vertices) {
        if (this.object.geometry.boundingSphere === null) {
          this.object.geometry.computeBoundingSphere();
        }
        this.radius = this.object.geometry.boundingSphere.radius;
        this.position.copy(this.vertices).applyMatrix4(this.object.matrixWorld);
      } else {
        if (this.object.geometry) {
          if (this.object.geometry.boundingSphere === null) {
            this.object.geometry.computeBoundingSphere();
          }
          this.radius = this.object.geometry.boundingSphere.radius;
          this.position.copy(this.object.geometry.boundingSphere.center).applyMatrix4(this.object.matrixWorld);
        } else {
          this.radius = this.object.boundRadius;
          this.position.getPositionFromMatrix(this.object.matrixWorld);
        }
      }
      this.radius = this.radius * Math.max(this.object.scale.x, this.object.scale.y, this.object.scale.z);
    }
  }

  export class Util {
    static isNumber(n) {
      // 函数可用于判断其参数是否是 NaN,该值表示一个非法的数字(比如被 0 除后得到的结果)
      // isFinite 判断数组的元素是否是有界的
      return !isNaN(n) && isFinite(n);
    }

    static isArray(target) {
      return Object.prototype.toString.call(target) === '[object Array]';
    }

    static toArray(target) {
      return target ? ( this.isArray(target) !== true ? [target] : target ) : [];
    }

    static indexOfValue(array, value) {
      // 返回当前数值在数组中的引用
      let il = array.length;
      for (let i = 0; i < il; i++) {
        if (array[i] === value) {
          return i;
        }
      }
      return -1;
    }

    static indexOfPropertyWithValue(array, property, value) {
      // 返回当前数值在数组中带属性的引用
      for (let i = 0, il = array.length; i < il; i++) {
        if (array[i][property] === value) {
          return i;
        }
      }
      return -1;
    }
  }

  export class ESRaycaster extends THREE.Raycaster {
    intersectOctreeObject(object, recursive) {
      let intersects,
        octreeObject,
        facesAll,
        facesSearch;
      if (object.object instanceof THREE.Object3D) {
        octreeObject = object;
        object = octreeObject.object;
        // temporarily replace object geometry's faces with octree object faces
        facesSearch = octreeObject.faces;
        facesAll = object.geometry.faces;
        if (facesSearch.length > 0) {
          object.geometry.faces = facesSearch;
        }
        // intersect
        intersects = this.intersectObject(object, recursive);
        // revert object geometry's faces
        if (facesSearch.length > 0) {
          object.geometry.faces = facesAll;
        }
      } else {
        intersects = this.intersectObject(object, recursive);
      }
      return intersects;
    };

    intersectOctreeObjects(objects, recursive?) {
      let i, il,
        intersects = [];

      for (i = 0, il = objects.length; i < il; i++) {
        intersects = intersects.concat(this.intersectOctreeObject(objects[i], recursive));
      }

      intersects.sort(function (a, b) {
        return a.distance - b.distance;
      });

      return intersects;

    };
  }
}









