import {Component, OnInit} from '@angular/core';

declare let OSG;

@Component({
  selector: 'app-osg-viewer',
  templateUrl: './osg-viewer.component.html',
  styleUrls: ['./osg-viewer.component.scss']
})
export class OsgViewerComponent implements OnInit {

  private _OSG = OSG;
  private osg = this._OSG.osg;
  private osgDB = this._OSG.osgDB;
  private osgViewer = this._OSG.osgViewer;

  constructor() {
  }

  ngOnInit() {
    this.loadView();
  }

  loadView() {
    // The 3D canvas.
    const canvas = document.getElementById('View');
    let viewer;

    // The viewer
    viewer = new this.osgViewer.Viewer(canvas);
    viewer.init();
    const rootNode = new this.osg.Node();
    viewer.setSceneData(rootNode);
    viewer.setupManipulator();
    viewer.run();

    const modelURL = 'http://osgjs.org/examples/media/models/material-test/file.osgjs';
    const request = this.osgDB.readNodeURL(modelURL);

    request.then(function (model) {
      const mt = new this.osg.MatrixTransform();
      this.osg.mat4.rotateZ(mt.getMatrix(), mt.getMatrix(), -Math.PI);
      mt.addChild(model);
      rootNode.addChild(mt);
      viewer.getManipulator().computeHomePosition();
      const loading = document.getElementById('loading');
      document.body.removeChild(loading);
    }).catch(function () {
      this.osg.warn('cant load ' + modelURL);
    }).finally(function () {
      this.osg.warn('cant load ' + modelURL);
    });
  }

}
