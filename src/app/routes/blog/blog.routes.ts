import {BlogComponent} from './blog.component';
import {BIndexComponent} from './bindex/bindex.component';

export const routes = [
  {
    path: '',
    component: BlogComponent,
    children: [
      {
        path: '',
        component: BIndexComponent
      },
      {path: '**', redirectTo: ''}
    ]
  }
];
