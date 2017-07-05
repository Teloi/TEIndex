import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Routing} from './routes';

import {IndexComponent} from './index/index.component';

@NgModule({
  imports: [
    CommonModule,
    Routing
  ],
  declarations: [IndexComponent],
  exports: [
    RouterModule
  ]
})
export class RoutesModule {

}
