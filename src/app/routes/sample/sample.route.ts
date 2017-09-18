import {SampleComponent} from './sample.component';
import {IndexComponent} from './index/index.component';
import {ViewerComponent} from './viewer/viewer.component';
import {ViewerAmmoComponent} from './viewer-ammo/viewer-ammo.component';


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
    {path: '**', redirectTo: ''}
  ]
  }
];
