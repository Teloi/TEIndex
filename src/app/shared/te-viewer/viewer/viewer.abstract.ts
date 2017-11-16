/// <reference types="three" />
declare const $;

/**
 * 声明抽象类 Viewer
 * */
export abstract class Viewer {
  protected _width: number;
  protected _height: number;

  private _container: HTMLElement;
  private _clock: THREE.Clock;
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _camera: THREE.Camera;
  private _control: THREE.OrbitControls;

  constructor(containerId: string) {
    this._container = document.getElementById(containerId);
    this._width = $(this.container).width();
    this._height = $(this.container).height();
    this._clock = new THREE.Clock();
    this.checkWebGL();
  }

  abstract InitScene(callback: Function): void;

  private checkWebGL(): void {
    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
    }
  }


  get container(): HTMLElement {
    return this._container;
  }

  get clock(): THREE.Clock {
    return this._clock;
  }

  get renderer(): THREE.WebGLRenderer {
    return this._renderer;
  }

  get scene(): THREE.Scene {
    return this._scene;
  }

  get camera(): THREE.Camera {
    return this._camera;
  }

  get control(): THREE.OrbitControls {
    return this._control;
  }

  set renderer(renderer: THREE.WebGLRenderer) {
    try {
      this._renderer = renderer;
    } catch (error) {
      console.error('Failed to set renderer: ', error, error.stack, this, arguments);
    }
  }

  set scene(scene: THREE.Scene) {
    try {
      this._scene = scene;
    } catch (error) {
      console.error('Failed to set scene: ', error, error.stack, this, arguments);
    }
  }

  set camera(camera: THREE.Camera) {
    try {
      this._camera = camera;
    } catch (error) {
      console.error('Failed to set camera: ', error, error.stack, this, arguments);
    }
  }

  set control(control: THREE.OrbitControls) {
    try {
      this._control = control;
    } catch (error) {
      console.error('Failed to set control: ', error, error.stack, this, arguments);
    }
  }

}
