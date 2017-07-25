import {BlogComponent} from './blog.component';
import {BindexComponent} from './bindex/bindex.component';
import {BaboutComponent} from './babout/babout.component';
import {BmessageComponent} from './bmessage/bmessage.component';
import {BarticleComponent} from './barticle/barticle.component';
import {BclassifyComponent} from './bclassify/bclassify.component';
import {BphotoComponent} from './bphoto/bphoto.component';

export const routes = [
  {
    path: '',
    component: BlogComponent,
    children: [
      {
        path: '',
        component: BindexComponent
      },
      {
        path: 'babout',
        component: BaboutComponent
      },
      {
        path: 'bmessage',
        component: BmessageComponent
      },
      {
        path: 'barticle',
        component: BarticleComponent
      },
      {
        path: 'bclassify',
        component: BclassifyComponent
      },
      {
        path: 'bphoto',
        component: BphotoComponent
      },
      {path: '**', redirectTo: ''}
    ]
  }
];
