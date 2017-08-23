import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
// Main Route
import {Routing} from './routes';
import {SharedModule} from '../shared/shared.module';
import {IndexComponent} from './index/index.component';

@NgModule({
  imports: [
    CommonModule,
    Routing,
    SharedModule
  ],
  declarations: [IndexComponent],
  exports: [
    RouterModule
  ]
})
export class RoutesModule {
}
