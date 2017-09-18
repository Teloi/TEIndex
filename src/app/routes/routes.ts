import {RouterModule} from '@angular/router';
import {IndexComponent} from './index/index.component';

export const routes = [
  {
    path: '', component: IndexComponent
  },
  {
    path: 'game',
    loadChildren: './game/game.module#GameModule'
  },
  {
    path: 'blog',
    loadChildren: './blog/blog.module#BlogModule'
  },
  {
    path: 'sample',
    loadChildren: './sample/sample.module#SampleModule'
  },
  {path: '**', redirectTo: ''}
];

export const Routing = RouterModule.forRoot(routes);
