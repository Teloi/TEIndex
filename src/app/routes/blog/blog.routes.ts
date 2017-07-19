import {BlogComponent} from './blog.component';
import {BindexComponent} from './bindex/bindex.component';
import {BaboutComponent} from './babout/babout.component';
import {BmessageComponent} from './bmessage/bmessage.component';

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
      {path: '**', redirectTo: ''}
    ]
  }
];
