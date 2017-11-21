/// <reference types="three" />

declare namespace THREE {
  export class MMDLoader {
    load(modelUrl, vmdUrls, callback?, onProgress?, onError?): MMDLoader;

    loadVmds(cameraFiles: string[], callback?: Function): any;

    loadAudio(audioFile: string, callback?: Function);

    pourVmdIntoCamera(camera: THREE.Camera, vmd);
  }

  export class MMDHelper {
    add(mesh);

    setAnimation(mesh);

    setPhysics(mesh);

    unifyAnimationDuration(params?: any);

    animate(time: number);

    setCamera(camera: THREE.Camera);

    setCameraAnimation(camera: THREE.Camera);

    setAudio(audio, listener, audioParams);
  }

  export class CCDIKHelper {
    public visible: boolean;

    constructor(mesh);

    update();
  }

  export class MMDPhysicsHelper {
    public visible: boolean;

    constructor(mesh);

    update();
  }
}
