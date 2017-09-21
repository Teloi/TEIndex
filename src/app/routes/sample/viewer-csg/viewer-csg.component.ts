import {Component, OnDestroy, OnInit} from '@angular/core';
import {Viewer} from '../../../shared/viewer/viewer';
import {CSG} from '../../../shared/utils/csg/csg';

@Component({
  selector: 'app-viewer-csg',
  templateUrl: './viewer-csg.component.html',
  styleUrls: ['./viewer-csg.component.scss']
})
export class ViewerCsgComponent implements OnInit, OnDestroy {

  private viewer: Viewer;
  private isControls: boolean;

  constructor() {
    this.isControls = true;
  }

  ngOnInit() {


    let geometrycube = new THREE.BoxBufferGeometry(8, 8, 8);
    let geometrysphere = new THREE.SphereBufferGeometry(5, 32, 32);
    let csgcube = CSG.fromGeometry(geometrycube);
    let csgsphere = CSG.fromGeometry(geometrysphere);
    let geometrynew = csgcube.subtract(csgsphere).toGeometry();
    let materialnew = new THREE.MeshBasicMaterial({color: 0xfefefe, wireframe: true, opacity: 0.5});
    let mesh = new THREE.Mesh(geometrynew, materialnew);


    this.viewer = new Viewer('viewer-csg');
    this.viewer.InitScene(this.isControls,
      () => {
        this.viewer.addStats();
        this.viewer.addSkyBox();
        this.viewer.addMesh(mesh);
        this.viewer.animate();
      }
    );
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.disposeControls();
    }
  }

}
