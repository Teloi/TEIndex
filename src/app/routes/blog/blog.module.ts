import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BlogComponent} from './blog.component';
import {BindexComponent} from './bindex/bindex.component';
import {RouterModule} from '@angular/router';
import {routes} from './blog.routes';
import {BaboutComponent} from './babout/babout.component';
import { BmessageComponent } from './bmessage/bmessage.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [BlogComponent, BindexComponent, BaboutComponent, BmessageComponent],
  exports: [
    RouterModule
  ]
})
export class BlogModule {
}
