import {RouterModule} from '@angular/router';
import {IndexComponent} from './index/index.component';
import {GameComponent} from './game/game.component';
import {GindexComponent} from './game/gindex/gindex.component';
import {BlogComponent} from './blog/blog.component';
import {BindexComponent} from './blog/bindex/bindex.component';
import {GcarComponent} from './game/gcar/gcar.component';
import {GammoComponent} from './game/gammo/gammo.component';
import {GammocarComponent} from './game/gammocar/gammocar.component';

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
      },
      {
        path: 'gcar',
        component: GcarComponent
      },
      {
        path: 'gammo',
        component: GammoComponent
      },
      {
        path: 'gammocar',
        component: GammocarComponent
      },
      {path: '**', redirectTo: 'gindex'}]
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
