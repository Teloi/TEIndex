import {GindexComponent} from './gindex/gindex.component';
import {GcarComponent} from './gcar/gcar.component';
import {GammoComponent} from './gammo/gammo.component';
import {GameComponent} from './game.component';
import {GammocarComponent} from './gammocar/gammocar.component';
import {GdemoComponent} from './gdemo/gdemo.component';
import {GviewerComponent} from './gviewer/gviewer.component';
import {GcaviewerComponent} from './gcaviewer/gcaviewer.component';
import {GcsgComponent} from './gcsg/gcsg.component';
import {GoctreeComponent} from './goctree/goctree.component';
import {GoctreegitComponent} from './goctreegit/goctreegit.component';

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
    {
      path: 'gdemo',
      component: GdemoComponent
    },
    {
      path: 'gviewer',
      component: GviewerComponent
    },
    {
      path: 'gcaviewer',
      component: GcaviewerComponent
    },
    {
      path: 'gcsg',
      component: GcsgComponent
    },
    {
      path: 'goctree',
      component: GoctreeComponent
    },
    {
      path: 'goctreegit',
      component: GoctreegitComponent
    },
    {path: '**', redirectTo: ''}
  ]
  }
];
