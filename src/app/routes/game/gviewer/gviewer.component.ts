import {Component, OnInit} from '@angular/core';
import {TEViewer} from '../../../shared/viewer/viewer';
import {MeshbuilderService} from '../../../shared/services/mesh-builder.service';

@Component({
  selector: 'app-gviewer',
  templateUrl: './gviewer.component.html',
  styleUrls: ['./gviewer.component.scss']
})
export class GviewerComponent implements OnInit {

  viewer: TEViewer;
  pointArray: Array<number>;

  isControls: boolean;
  isPhysics: boolean;

  constructor(private meshbuilder: MeshbuilderService) {
    this.pointArray = new Array<number>();
    this.pointArray = [
      -50.0, -50.0, 50.0,
      50.0, -50.0, 50.0,
      50.0, 50.0, 50.0,

      50.0, 50.0, 50.0,
      -50.0, 50.0, 50.0,
      -50.0, -50.0, 50.0,

      50.0, 50.0, 50.0,
      50.0, -50.0, 50.0,
      -50.0, -50.0, 50.0,


      -50.0, -50.0, 50.0,
      -50.0, 50.0, 50.0,
      50.0, 50.0, 50.0];
    this.isControls = true;
    this.isPhysics = true;
  }

  ngOnInit() {
    this.viewer = new TEViewer('teviewer');
    this.viewer.InitScene(this.isControls, this.isPhysics,
      () => {
        this.viewer.addStats();
        this.viewer.addAxisHelper(100);
        this.viewer.buildPlane();
        // // 方块2
        // this.viewer.buildRigidBodyBoxbyo(new THREE.Vector3(0, -47.5, 0), new THREE.Quaternion(0, 0, 0, 1), 100, 5, 100, 0, 0x345678, 2);
        // // 平面
        // this.meshbuilder.buildRigidBodyPlane__Point_3(this.pointArray, 0, 0xffffff, false, 4, (threeObject, body, mass) => {
        //     this.viewer.addRigidBodyObjects(threeObject, body, mass);
        //   });
        // // build 球
        this.meshbuilder.buildRigidBodySphere(new THREE.Vector3(0, 0, 0), new THREE.Quaternion(0, 0, 0, 1),
          5, 100, 0xabcdef, 4, (threeObject, body, mass) => {
            this.viewer.addRigidBodyObjects(threeObject, body, mass);
          });
        // // 方块
        // this.meshbuilder.buildRigidBodyBox(new THREE.Vector3(0, 50, 3), new THREE.Quaternion(0, 0, 0, 1),
        //   10, 10, 10, 100, 0xabcdef, 4, (threeObject, body, mass) => {
        //     this.viewer.addRigidBodyObjects(threeObject, body, mass);
        //   });

        // 小车
        // this.viewer.buildVehicle(new THREE.Vector3(10, -40, 0), new THREE.Quaternion(0, 0, 0, 1));
        this.viewer.animate();
      }
    );
  }

}
