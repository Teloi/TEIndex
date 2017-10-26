/// <reference types="three" />
declare let Ammo;

import {Injectable} from '@angular/core';

@Injectable()
export class MeshbuilderService {

  private margin; // 刚体外边缘

  constructor() {
    this.margin = 0.05;
  }

  buildRigidBodySphere(pos, quat, radius, mass, color, friction?, callback?: Function) {
    const mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 20, 20), new THREE.MeshPhongMaterial({color: color}));
    const shape = new Ammo.btSphereShape(radius);
    shape.setMargin(this.margin);
    this.createRigidBody(mesh, shape, mass, pos, quat, friction, (threeObject, body) => {
      if (callback) {
        return callback(threeObject, body, mass);
      }
    });
  }

  buildRigidBodyBox(pos, quat, sx, sy, sz, mass, color, friction?, callback?: Function) {
    const mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(sx, sy, sz, 1, 1, 1), new THREE.MeshPhongMaterial({color: color}));
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
    shape.setMargin(this.margin);
    this.createRigidBody(mesh, shape, mass, pos, quat, friction, (threeObject, body) => {
      if (callback) {
        return callback(threeObject, body, mass);
      }
    });
  }

  buildRigidBodyCylinder(pos, quat, radius, height, mass, color, friction?, callback?: Function) {
    const mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 20, 1),
      new THREE.MeshPhongMaterial({color: color}));
    const shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * 0.5, radius));
    shape.setMargin(this.margin);
    this.createRigidBody(mesh, shape, mass, pos, quat, friction, (threeObject, body) => {
      if (callback) {
        return callback(threeObject, body, mass);
      }
    });
  }

  buildRigidBodyCone(pos, quat, radius, height, mass, color, friction?, callback?: Function) {
    const mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(0, radius, height, 20, 2), new THREE.MeshPhongMaterial({color: color}));
    const shape = new Ammo.btConeShape(radius, height);
    shape.setMargin(this.margin);
    this.createRigidBody(mesh, shape, mass, pos, quat, friction, (threeObject, body) => {
      if (callback) {
        return callback(threeObject, body, mass);
      }
    });
  }

  buildRigidBodyPlane__Point_3(array: Array<number>, mass: number, color, isTrans: boolean, friction?: number, callback?: Function) {
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    pos.set(0, 0, 0);
    quat.set(0, 0, 0, 1);
    for (let i = 0; i < array.length; i += 9) {
      const meshArray: Array<number> = new Array<number>();
      for (let num = 0; num < 9; num++) {
        meshArray.push(array[i + num]);
      }
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(meshArray);
      geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const material = new THREE.MeshBasicMaterial({color});
      material.alphaTest = isTrans ? 1 : 0;
      const mesh = new THREE.Mesh(geometry, material);
      const btConvexHullShape = new Ammo.btConvexHullShape();
      for (let j = 0; j < meshArray.length; j += 3) {
        btConvexHullShape.addPoint(new Ammo.btVector3(meshArray[j], meshArray[j + 1], meshArray[j + 2]), true);
      }
      const shape = btConvexHullShape;
      shape.setMargin(this.margin);
      this.createRigidBody(mesh, shape, mass, pos, quat, friction, (threeObject, body) => {
        if (callback) {
          return callback(threeObject, body, mass);
        }
      });
    }
  }

  private createRigidBody(threeObject, physicsShape, mass, pos, quat, friction?: number, callback?: Function) {
    if (!friction) {
      friction = 1;
    }
    threeObject.position.copy(pos);
    // Quaternion的意思是四元数，一个1x4的向量，只靠四个数，就能很好的描述三维空间中物体绕任意轴旋转
    // 一个1x4向量
    threeObject.quaternion.copy(quat);
    const transform = new Ammo.btTransform(); // 变换
    // bullet中的刚体物理碰撞是六自由度物理碰撞。六自由度的意思是可以同时产生位移(xyz轴各一个)和旋转(xyz轴各一个)。
    // bullet中表示刚体运动的类为btTransform，在updatePhysics函数中
    // 从物体的montionState()中获取变化之后，可以用getOrigin和getRotation两个方法获取位置(btVector3类型)和旋转(btQuaternion类型)。
    // 刚体物体的自由度为6，柔体更多，因为柔体自身可以发生形变，相关柔体的部分日后再说。
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform); // 运动状态
    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia); // 函数可以根据物体的质量和固有惯性计算在力场中的实际惯性。比如在垂直向下的重力场下，物体都有下落的趋势
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    body.setFriction(friction); // 摩擦力
    threeObject.userData.physicsBody = body;
    // this.scene.add(threeObject);
    if (mass > 0) {
      // this.rigidBodies.push(threeObject);
      // Disable deactivation
      // 防止物体弹力过快消失
      // Ammo.DISABLE_DEACTIVATION = 40;
      body.setActivationState(4);
    }
    // this.physicsWorld.addRigidBody(body);
    if (callback) {
      return callback(threeObject, body, mass);
    }
  }
}
