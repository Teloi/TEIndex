/// <reference types="three" />
import {Viewer} from './viewer';

export class MMDModel {

  public name: string;
  public mesh: any;
  public ikHelper: any;
  public physicsHelper: any;

  constructor(name, mesh) {
    this.name = name;
    this.mesh = mesh;
  }
}

export class ViewerMMD extends Viewer {
  private mmdModels: MMDModel[] = [];
  private helper: THREE.MMDHelper;
  public finishLoaded: boolean;

  public loadMMD(modelFile: string, vmdFiles: string[], name: string, callback: Function, onProgress?: Function, onError?: Function) {
    const loader = new THREE.MMDLoader();
    loader.load(modelFile, vmdFiles,
      function (object) {
        const item = new MMDModel(name, object);
        this.mmdModels.push(item);
        callback(item);
      }.bind(this),
      function (percent) {
        if (percent.lengthComputable) {
          const percentComplete = percent.loaded / percent.total * 100;
          if (onProgress) {
            onProgress(percentComplete);
          }
        }
      }.bind(this),
      function (error) {
        if (onError) {
          onError(error);
        }
      }.bind(this));
  }

  public modelPosition(model: MMDModel, position: THREE.Vector3) {
    model.mesh.position.set(position.x, position.y, position.z);
  }

  public modelAction(model: MMDModel) {
    const array = [];
    for (let i = 0, il = model.mesh.material.materials.length; i < il; i++) {
      const m = new THREE.MeshPhongMaterial();
      m.copy(model.mesh.material.materials[i]);
      m.envMap = this.skyBoxtexture;
      m.refractionRatio = 0.98;
      m.needsUpdate = true;
      array.push(m);
    }
    model.mesh.material.materials = array;
    this.scene.add(model.mesh);
    this.helper.add(model.mesh);
    this.helper.setAnimation(model.mesh);
    this.helper.setPhysics(model.mesh);
  }

  public modelIk(model: MMDModel, visible?: boolean) {
    model.ikHelper = new THREE.CCDIKHelper(model.mesh);
    model.ikHelper.visible = visible ? visible : false;
    this.scene.add(model.ikHelper);
  }

  public modelPhysics(model: MMDModel, visible?: boolean) {
    model.physicsHelper = new THREE.MMDPhysicsHelper(model.mesh);
    model.physicsHelper.visible = visible ? visible : false;
    this.scene.add(model.physicsHelper);
  }

  public addInitScene() {
    this.helper = new THREE.MMDHelper();
    this.helper.unifyAnimationDuration({afterglow: 2.0});
  }

  public addAnimate(time) {
    if (this.finishLoaded !== undefined && this.finishLoaded) {
      this.helper.animate(time);
      for (const model of this.mmdModels) {
        if (model.physicsHelper !== undefined && model.physicsHelper.visible) {
          model.physicsHelper.update();
        }
        if (model.ikHelper !== undefined && model.ikHelper.visible) {
          model.ikHelper.update();
        }
      }
    }
  }

}
