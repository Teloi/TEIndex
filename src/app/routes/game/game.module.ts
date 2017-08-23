import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {RouterModule} from '@angular/router';
import {routes} from './game.routes';


import {GameComponent} from './game.component';
import {GcarComponent} from './gcar/gcar.component';
import {GammoComponent} from './gammo/gammo.component';
import {GindexComponent} from './gindex/gindex.component';
import {GammocarComponent} from './gammocar/gammocar.component';
import {GdemoComponent} from './gdemo/gdemo.component';
import {GviewerComponent} from './gviewer/gviewer.component';
import {GcaviewerComponent} from './gcaviewer/gcaviewer.component';
import {GcsgComponent} from './gcsg/gcsg.component';
import {GoctreeComponent} from './goctree/goctree.component';
import { GoctreegitComponent } from './goctreegit/goctreegit.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    GameComponent,
    GindexComponent,
    GcarComponent,
    GammoComponent,
    GammocarComponent,
    GdemoComponent,
    GviewerComponent,
    GcaviewerComponent,
    GcsgComponent,
    GoctreeComponent,
    GoctreegitComponent
  ],
  exports: [
    RouterModule
  ]
})
export class GameModule {
}
