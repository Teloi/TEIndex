/// <reference types="three" />
// import 'imports?THREE=three!loaders/MMDLoader';

import {Viewer} from './viewer';

export class MMDViewer extends Viewer {
  public loadMMD(modelFile, vmdFiles) {
    let loader = null;
    loader.load(modelFile, vmdFiles, function (object) {
      let mesh = object;
      this.scene.add(mesh);
    }.bind(this));
  }
}

