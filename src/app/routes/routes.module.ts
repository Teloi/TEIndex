import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Routing} from './routes';

import {IndexComponent} from './index/index.component';

// Ngx-transloate
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {Http} from '@angular/http';

// https://github.com/ocombe/ng2-translate/issues/218
export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, '.././assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    Routing,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    })
  ],
  declarations: [IndexComponent],
  exports: [
    RouterModule
  ]
})
export class RoutesModule {
}
