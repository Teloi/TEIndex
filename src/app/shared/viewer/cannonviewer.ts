/// <reference types="three" />
import {Viewer} from './viewer';

declare let CANNON;

export class CAViewer extends Viewer {

  private world;
  private mesh;
  private body;

  public initSceneOther() {
    this.initCannon();
  }

  public initAnimateOther() {
    this.initAnimate();
  }

  private initCannon() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, 0); // 重力
    this.world.broadphase = new CANNON.NaiveBroadphase(); // 粗测阶段
    this.world.solver.iterations = 10; // 迭代次数
  }

  private initAnimate() {
    let deltaTime = this.clock.getDelta();
    this.world.step(deltaTime);
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }

  addObject() {
    let geometry = new THREE.BoxGeometry(2, 2, 2);
    let material = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: false});
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  addCaObject() {
    let shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    // let mass = 1;
    this.body = new CANNON.Body({
      mass: 1
    });
    this.body.addShape(shape);
    this.body.angularVelocity.set(0, 10, 0); // 角度转速
    this.body.angularDamping = 0.5; // 阻尼
    this.world.addBody(this.body);
  }

}
