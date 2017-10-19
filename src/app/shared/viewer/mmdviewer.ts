/// <reference types="three" />
import {Viewer} from './viewer';

export class MMDViewer extends Viewer {
  private helper;
  private ikHelper;
  private physicsHelper;

  public loadMMD(modelFile, vmdFiles, x, y, z) {
    let loader = new THREE.MMDLoader();
    this.helper = new THREE.MMDHelper();
    loader.load(modelFile, vmdFiles, function (object) {
      let mesh = object;
      mesh.position.set(x, y, z);
      let array = [];
      for (let i = 0, il = mesh.material.materials.length; i < il; i++) {
        let m = new THREE.MeshPhongMaterial();
        m.copy(mesh.material.materials[i]);
        // m.color = 0xffffff;
        m.envMap = this.skyBoxtexture;
        m.refractionRatio = 0.98;
        m.needsUpdate = true;
        array.push(m);
      }
      mesh.material.materials = array;

      this.scene.add(mesh);

      this.helper.add(mesh);
      this.helper.setAnimation(mesh);

      this.ikHelper = new THREE.CCDIKHelper(mesh);
      this.ikHelper.visible = false;
      this.scene.add(this.ikHelper);

      this.helper.setPhysics(mesh);
      this.physicsHelper = new THREE.MMDPhysicsHelper(mesh);
      this.physicsHelper.visible = false;
      this.scene.add(this.physicsHelper);

      this.helper.unifyAnimationDuration({afterglow: 2.0});
    }.bind(this));
  }

  public addAnimate(time) {
    this.helper.animate(time);
    if (this.physicsHelper !== undefined && this.physicsHelper.visible) {
      this.physicsHelper.update();
    }
    if (this.ikHelper !== undefined && this.ikHelper.visible) {
      this.ikHelper.update();
    }
  }
}

