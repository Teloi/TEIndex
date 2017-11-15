/// <reference types="three" />
import {Viewer} from './viewer';
import {element} from 'protractor';

export class MMDModel {

  public name: string;
  public mesh: any;
  public ikHelper: any;
  public physicsHelper: any;

  constructor(name, mesh) {
    mesh.castShadow = true;
    this.name = name;
    this.mesh = mesh;
  }
}

export class ViewerMMD extends Viewer {
  private mmdModels: MMDModel[] = [];
  private helper: THREE.MMDHelper;
  public finishLoaded: boolean;

  public loadMMD(modelFile: string,
                 vmdFiles: string[],
                 cameraFiles: string[],
                 audioFile: string,
                 name: string,
                 callback: Function,
                 onProgress?: Function,
                 onError?: Function) {
    const loader = new THREE.MMDLoader();
    loader.load(modelFile, vmdFiles, (object) => {
        const model = new MMDModel(name, object);
        this.mmdModels.push(model);
        if (cameraFiles != null) {
          // camera
          loader.loadVmds(cameraFiles, (vmd) => {
            this.helper.setCamera(this.camera);
            loader.pourVmdIntoCamera(this.camera, vmd);
            this.helper.setCameraAnimation(this.camera);
            // audio
            if (audioFile != null) {
              loader.loadAudio(audioFile, (audio, listener) => {
                listener.position.z = 1;
                this.helper.setAudio(audio, listener, {delayTime: 0.12});
                this.helper.unifyAnimationDuration();
                this.scene.add(audio);
                this.scene.add(listener);
                this.scene.add(object);
                callback(model);
              });
            } else {
              callback(model);
            }
          });
        } else {
          callback(model);
        }
      },
      (percent) => {
        if (percent.lengthComputable) {
          const percentComplete = percent.loaded / percent.total * 100;
          if (onProgress) {
            onProgress(percentComplete);
          }
        }
      },
      (error) => {
        if (onError) {
          onError(error);
        }
      });
  }

  public modelPosition(model: MMDModel, position: THREE.Vector3) {
    model.mesh.position.set(position.x, position.y, position.z);
  }

  public modelAction(model: MMDModel, isClearGlass: boolean) {
    const array = [];
    for (let i = 0, il = model.mesh.material.materials.length; i < il; i++) {
      const m = new THREE.MeshPhongMaterial();
      m.copy(model.mesh.material.materials[i]);
      if (isClearGlass) {
        m.envMap = this.skyBoxtexture;
        m.refractionRatio = 0.98;
        m.needsUpdate = true;
      }
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
