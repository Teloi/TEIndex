import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BlogComponent} from './blog.component';
import {BindexComponent} from './bindex/bindex.component';
import {RouterModule} from '@angular/router';
import {routes} from './blog.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [BlogComponent, BindexComponent],
  exports: [
    RouterModule
  ]
})
export class BlogModule {
}
