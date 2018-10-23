import { RouterModule } from '@angular/router';
import { IndexComponent } from './layouts/index/index.component';
import { ErrorComponent } from './layouts/error/error.component';

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
  {path: '**', component: ErrorComponent}
];

export const Routing = RouterModule.forRoot(routes);
