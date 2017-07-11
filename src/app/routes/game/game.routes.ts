import {GindexComponent} from './gindex/gindex.component';
import {GcarComponent} from './gcar/gcar.component';
import {GammoComponent} from './gammo/gammo.component';
import {GameComponent} from './game.component';
import {GtestComponent} from './gtest/gtest.component';

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
      path: 'gtest',
      component: GtestComponent
    },
    {path: '**', redirectTo: ''}
  ]
  }
];
