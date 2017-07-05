import {BlogComponent} from './blog.component';
import {BindexComponent} from './bindex/bindex.component';

export const routes = [
  {
    path: '',
    component: BlogComponent,
    children: [
      {
        path: '',
        component: BindexComponent
      },
      {path: '**', redirectTo: ''}
    ]
  }
];
