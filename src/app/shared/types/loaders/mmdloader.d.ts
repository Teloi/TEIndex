/// <reference types="three" />

declare namespace THREE {
  export class MMDLoader {
    load(modelUrl, vmdUrls, callback?, onProgress?, onError?): MMDLoader;
  }

  export class MMDHelper {
    add(mesh);

    setAnimation(mesh);

    setPhysics(mesh);

    unifyAnimationDuration(object: any);

    animate(time: number);
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
