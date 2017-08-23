import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BindexService} from './blog/bindex.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    BindexService
  ],
  declarations: []
})
export class ServicesModule {
}
