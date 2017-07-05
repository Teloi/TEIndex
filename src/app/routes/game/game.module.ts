import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GameComponent} from './game.component';
import {RouterModule} from '@angular/router';
import {GcarComponent} from './gcar/gcar.component';
import {GammoComponent} from './gammo/gammo.component';
import {GammocarComponent} from './gammocar/gammocar.component';
import {routes} from './game.routes';
import {GindexComponent} from './gindex/gindex.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [GameComponent, GindexComponent, GcarComponent, GammoComponent, GammocarComponent],
  exports: [
    RouterModule
  ]
})
export class GameModule {
}
