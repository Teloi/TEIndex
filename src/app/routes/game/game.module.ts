import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {RouterModule} from '@angular/router';
import {routes} from './game.routes';

import {GameComponent} from './game.component';
import {GindexComponent} from './gindex/gindex.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    GameComponent,
    GindexComponent
  ],
  exports: [
    RouterModule
  ]
})
export class GameModule {
}
