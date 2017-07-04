import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GameComponent} from './game.component';
import {GindexComponent} from './gindex/gindex.component';
import {RouterModule} from '@angular/router';
import { GcarComponent } from './gcar/gcar.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [GameComponent, GindexComponent, GcarComponent],
  exports: []
})
export class GameModule {
}
