import {Component, OnDestroy, OnInit} from '@angular/core';
import {Viewer} from '../../../shared/viewer/viewer';
import {CSG} from '../../../shared/utils/csg/escsg';

@Component({
  selector: 'app-gcsg',
  templateUrl: './gcsg.component.html',
  styleUrls: ['./gcsg.component.scss']
})
export class GcsgComponent implements OnInit, OnDestroy {

  viewer: Viewer;
  mesh: THREE.Mesh;
  geometrycube;
  geometrysphere;

  constructor() {

  }

  Reload() {

  }

  loadData() {


  }

  ngOnInit() {

    this.geometrycube = new THREE.BoxBufferGeometry(8, 8, 8);
    // this.geometrysphere = new THREE.BoxBufferGeometry(4, 4, 4);
    this.geometrysphere = new THREE.SphereBufferGeometry(5, 32, 32);
    let csgcube = CSG.fromGeometry(this.geometrycube);
    let csgsphere = CSG.fromGeometry(this.geometrysphere);
    let geometrynew = csgcube.subtract(csgsphere).toGeometry();
    let materialnew = new THREE.MeshBasicMaterial({color: 0xfefefe, wireframe: true, opacity: 0.5});
    this.mesh = new THREE.Mesh(geometrynew, materialnew);

    this.viewer = new Viewer('teviewer');
    this.viewer.InitScene(true, () => {
      this.viewer.addStats();
      this.viewer.addMesh(this.mesh);
      this.viewer.animate();
    });
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.disposeControls();
    }
  }

}
