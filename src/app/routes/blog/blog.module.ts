import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {RouterModule} from '@angular/router';
import {routes} from './blog.routes';

// Components
import {BlogComponent} from './blog.component';
import {BIndexComponent} from './bindex/bindex.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    BlogComponent,
    BIndexComponent
  ],
  exports: [
    RouterModule
  ]
})
export class BlogModule {
}
