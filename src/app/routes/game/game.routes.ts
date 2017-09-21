import {GameComponent} from './game.component';
import {GindexComponent} from './gindex/gindex.component';


export const routes = [
  {
    path: '', component: GameComponent, children: [
    {
      path: '',
      component: GindexComponent
    },
    {path: '**', redirectTo: ''}
  ]
  }
];
