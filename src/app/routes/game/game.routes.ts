import {GindexComponent} from './gindex/gindex.component';
import {GcarComponent} from './gcar/gcar.component';
import {GammoComponent} from './gammo/gammo.component';
import {GameComponent} from './game.component';
import {GammocarComponent} from './gammocar/gammocar.component';

export const routes = [
  {
    path: '', component: GameComponent, children: [
    {
      path: '',
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
    {path: '**', redirectTo: ''}
  ]
  }
];
