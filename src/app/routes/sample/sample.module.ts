import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {RouterModule} from '@angular/router';
import {routes} from './sample.route';

// Local Components
import {SampleComponent} from './sample.component';
import {IndexComponent} from './index/index.component';
import {ViewerComponent} from './viewer/viewer.component';
import {ViewerAmmoComponent} from './viewer-ammo/viewer-ammo.component';
import {ViewerCannonComponent} from './viewer-cannon/viewer-cannon.component';
import {ViewerCsgComponent} from './viewer-csg/viewer-csg.component';
import {ViewerOctreeComponent} from './viewer-octree/viewer-octree.component';
import {ViewerMmdComponent} from './viewer-mmd/viewer-mmd.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    SampleComponent,
    IndexComponent,
    ViewerComponent,
    ViewerAmmoComponent,
    ViewerCannonComponent,
    ViewerCsgComponent,
    ViewerOctreeComponent,
    ViewerMmdComponent
  ],
  exports: [RouterModule]
})
export class SampleModule {
}
