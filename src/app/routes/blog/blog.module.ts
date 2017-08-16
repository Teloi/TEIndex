import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {RouterModule} from '@angular/router';
import {routes} from './blog.routes';

// Components
import {BlogComponent} from './blog.component';
import {BindexComponent} from './bindex/bindex.component';
import {BaboutComponent} from './babout/babout.component';
import {BmessageComponent} from './bmessage/bmessage.component';
import {BarticleComponent} from './barticle/barticle.component';
import {BclassifyComponent} from './bclassify/bclassify.component';
import {BphotoComponent} from './bphoto/bphoto.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    BlogComponent,
    BindexComponent,
    BaboutComponent,
    BmessageComponent,
    BarticleComponent,
    BclassifyComponent,
    BphotoComponent
  ],
  exports: [
    RouterModule
  ]
})
export class BlogModule {
}
