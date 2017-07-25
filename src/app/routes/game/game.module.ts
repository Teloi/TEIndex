import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GameComponent} from './game.component';
import {RouterModule} from '@angular/router';
import {GcarComponent} from './gcar/gcar.component';
import {GammoComponent} from './gammo/gammo.component';
import {routes} from './game.routes';
import {GindexComponent} from './gindex/gindex.component';
import {GammocarComponent} from './gammocar/gammocar.component';
import {GdemoComponent} from './gdemo/gdemo.component';
import { GviewerComponent } from './gviewer/gviewer.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [GameComponent, GindexComponent, GcarComponent, GammoComponent, GammocarComponent, GdemoComponent, GviewerComponent],
  exports: [
    RouterModule
  ]
})
export class GameModule {
}
