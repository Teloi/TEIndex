/// <reference types="three" />
import {Viewer} from './viewer';
import * as CANNON from 'cannon';

export class CAViewer extends Viewer {

  private world;
  private mesh;
  private body;

  // 继承自Viewer
  public addInitScene() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, 0); // 重力
    this.world.broadphase = new CANNON.NaiveBroadphase(); // 粗测阶段
    this.world.solver.iterations = 10; // 迭代次数
  }

  // 继承自Viewer
  public addAnimate(time) {
    this.world.step(time);
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }

  // private function
  public addObject() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: false});
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  public addCaObject() {
    const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    this.body = new CANNON.Body({
      mass: 1
    });
    this.body.addShape(shape);
    this.body.angularVelocity.set(0, 10, 0); // 角度转速
    this.body.angularDamping = 0.5; // 阻尼
    this.world.addBody(this.body);
  }

}
