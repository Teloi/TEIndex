import {Component, OnDestroy, OnInit} from '@angular/core';
import {AMMOViewer} from '../../../shared/viewer/ammoviewer';
import {MeshbuilderService} from '../../../shared/services/mesh-builder.service';

@Component({
  selector: 'app-viewer-ammo',
  templateUrl: './viewer-ammo.component.html',
  styleUrls: ['./viewer-ammo.component.scss']
})
export class ViewerAmmoComponent implements OnInit, OnDestroy {

  viewer: AMMOViewer;
  isControls: boolean;
  isPhysics: boolean;

  constructor(private meshbuilder: MeshbuilderService) {
    this.isControls = true;
    this.isPhysics = true;
  }

  ngOnInit() {
    this.viewer = new AMMOViewer('viewer-ammo');
    this.viewer.InitScene(this.isControls, this.isPhysics,
      () => {
        this.viewer.addStats();
        this.viewer.addAxisHelper(100);
        // 方块2
        this.viewer.buildRigidBodyBoxbyo(new THREE.Vector3(0, -47.5, 0), new THREE.Quaternion(0, 0, 0, 1),
          100, 5, 100, 0, 0x345678, 2);
        // 球
        this.meshbuilder.buildRigidBodySphere(new THREE.Vector3(0, 0, 0), new THREE.Quaternion(0, 0, 0, 1),
          5, 100, 0xabcdef, 4, (threeObject, body, mass) => {
            this.viewer.addRigidBodyObjects(threeObject, body, mass);
          });
        // 方块 带重力
        this.meshbuilder.buildRigidBodyBox(new THREE.Vector3(0, 50, 3), new THREE.Quaternion(0, 0, 0, 1),
          10, 10, 10, 100, 0xabcdef, 4, (threeObject, body, mass) => {
            this.viewer.addRigidBodyObjects(threeObject, body, mass);
          });
        // 车
        this.viewer.buildVehicle(new THREE.Vector3(10, -40, 0), new THREE.Quaternion(0, 0, 0, 1));
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
