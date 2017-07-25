import {NgModule} from '@angular/core';
import {ServicesModule} from './services/services.module';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
// Route Module
import {RoutesModule} from './routes/routes.module';
// Share Module
import {SharedModule} from './shared/shared.module';


// Ngx-transloate
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {Http} from '@angular/http';
import {TranslatorService} from './shared/services/translator.service';

// https://github.com/ocombe/ng2-translate/issues/218
export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServicesModule,
    FormsModule,
    HttpModule,
    RoutesModule,
    SharedModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public translator: TranslatorService) {
    this.translator.useLanguage(this.translator.getCurrentLanguage());
  }
}
