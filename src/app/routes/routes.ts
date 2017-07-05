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
  {path: '**', redirectTo: ''}
];

export const Routing = RouterModule.forRoot(routes);
