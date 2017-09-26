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

// https://ng.ant.design/#/docs/angular/getting-started
import { NgZorroAntdModule } from 'ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    NgZorroAntdModule
  ],
  declarations: [
    SampleComponent,
    IndexComponent,
    ViewerComponent,
    ViewerAmmoComponent,
    ViewerCannonComponent,
    ViewerCsgComponent,
    ViewerOctreeComponent
  ],
  exports: [RouterModule]
})
export class SampleModule {
}
