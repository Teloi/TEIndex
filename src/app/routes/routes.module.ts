import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {IndexModule} from './index/index.module';
import {GameModule} from './game/game.module';
import {BlogModule} from './blog/blog.module';
import {Routing} from './routes';

@NgModule({
  imports: [
    CommonModule,
    IndexModule,
    GameModule,
    BlogModule,
    Routing
  ],
  declarations: [],
  exports: [
    RouterModule
  ]
})
export class RoutesModule {

}
