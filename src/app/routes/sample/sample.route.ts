import {SampleComponent} from './sample.component';
import {IndexComponent} from './index/index.component';
import {ViewerComponent} from './viewer/viewer.component';
import {ViewerAmmoComponent} from './viewer-ammo/viewer-ammo.component';
import {ViewerCannonComponent} from './viewer-cannon/viewer-cannon.component';
import {ViewerCsgComponent} from './viewer-csg/viewer-csg.component';
import {ViewerOctreeComponent} from './viewer-octree/viewer-octree.component';
import {ViewerMmdComponent} from './viewer-mmd/viewer-mmd.component';

export const routes = [
  {
    path: '', component: SampleComponent, children: [
      {
        path: '',
        component: IndexComponent
      },
      {
        path: 'viewer',
        component: ViewerComponent
      },
      {
        path: 'viewer-ammo',
        component: ViewerAmmoComponent
      },
      {
        path: 'viewer-cannon',
        component: ViewerCannonComponent
      },
      {
        path: 'viewer-csg',
        component: ViewerCsgComponent
      },
      {
        path: 'viewer-octree',
        component: ViewerOctreeComponent
      },
      {
        path: 'viewer-mmd',
        component: ViewerMmdComponent
      },
      {path: '**', redirectTo: ''}
    ]
  }
];
