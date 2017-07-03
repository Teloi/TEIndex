import {RouterModule} from '@angular/router';
import {IndexComponent} from './index/index.component';
import {GameComponent} from './game/game.component';
import {GindexComponent} from './game/gindex/gindex.component';
import {BlogComponent} from './blog/blog.component';
import {BindexComponent} from './blog/bindex/bindex.component';

export const routes = [
  {
    path: '',
    redirectTo: 'index',
    pathMatch: 'full'
  },
  {
    path: 'index',
    component: IndexComponent
  },
  {
    path: 'game',
    component: GameComponent,
    children: [
      {
        path: '',
        redirectTo: 'gindex',
        pathMatch: 'full'
      },
      {
        path: 'gindex',
        component: GindexComponent
      }]
  },
  {
    path: 'blog',
    component: BlogComponent,
    children: [
      {
        path: '',
        redirectTo: 'bindex',
        pathMatch: 'full'
      },
      {
        path: 'bindex',
        component: BindexComponent
      }]
  },
  {path: '**', redirectTo: 'index'}
];

export const Routing = RouterModule.forRoot(routes);
