import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GameComponent} from './game.component';
import {GindexComponent} from './gindex/gindex.component';
import {RouterModule} from '@angular/router';
import {GcarComponent} from './gcar/gcar.component';
import {GammoComponent} from './gammo/gammo.component';
import { GammocarComponent } from './gammocar/gammocar.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [GameComponent, GindexComponent, GcarComponent, GammoComponent, GammocarComponent],
  exports: []
})
export class GameModule {
}
