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
    let mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 20, 20), new THREE.MeshPhongMaterial({color: color}));
    let shape = new Ammo.btSphereShape(radius);
    shape.setMargin(this.margin);
    this.createRigidBody(mesh, shape, mass, pos, quat, friction, (threeObject, body) => {
      if (callback) {
        return callback(threeObject, body, mass);
      }
    });
  }

  buildRigidBodyBox(pos, quat, sx, sy, sz, mass, color, friction?, callback?: Function) {
    let mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(sx, sy, sz, 1, 1, 1), new THREE.MeshPhongMaterial({color: color}));
    let shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
    shape.setMargin(this.margin);
    this.createRigidBody(mesh, shape, mass, pos, quat, friction, (threeObject, body) => {
      if (callback) {
        return callback(threeObject, body, mass);
      }
    });
  }

  buildRigidBodyCylinder(pos, quat, radius, height, mass, color, friction?, callback?: Function) {
    let mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 20, 1), new THREE.MeshPhongMaterial({color: color}));
    let shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * 0.5, radius));
    shape.setMargin(this.margin);
    this.createRigidBody(mesh, shape, mass, pos, quat, friction, (threeObject, body) => {
      if (callback) {
        return callback(threeObject, body, mass);
      }
    });
  }

  buildRigidBodyCone(pos, quat, radius, height, mass, color, friction?, callback?: Function) {
    let mesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(0, radius, height, 20, 2), new THREE.MeshPhongMaterial({color: color}));
    let shape = new Ammo.btConeShape(radius, height);
    shape.setMargin(this.margin);
    this.createRigidBody(mesh, shape, mass, pos, quat, friction, (threeObject, body) => {
      if (callback) {
        return callback(threeObject, body, mass);
      }
    });
  }

  buildRigidBodyPlane__Point_3(array: Array<number>, mass: number, color, isTrans: boolean, friction?: number, callback?: Function) {
    let pos = new THREE.Vector3();
    let quat = new THREE.Quaternion();
    pos.set(0, 0, 0);
    quat.set(0, 0, 0, 1);
    for (let i = 0; i < array.length; i += 9) {
      let meshArray: Array<number> = new Array<number>();
      for (let num = 0; num < 9; num++) {
        meshArray.push(array[i + num]);
      }
      let geometry = new THREE.BufferGeometry();
      let vertices = new Float32Array(meshArray);
      geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
      let material = new THREE.MeshBasicMaterial({color});
      material.alphaTest = isTrans ? 1 : 0;
      let mesh = new THREE.Mesh(geometry, material);
      let btConvexHullShape = new Ammo.btConvexHullShape();
      for (let j = 0; j < meshArray.length; j += 3) {
        btConvexHullShape.addPoint(new Ammo.btVector3(meshArray[j], meshArray[j + 1], meshArray[j + 2]), true);
      }
      let shape = btConvexHullShape;
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
    threeObject.quaternion.copy(quat);
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);
    let localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);
    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);
    body.setFriction(friction);
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
