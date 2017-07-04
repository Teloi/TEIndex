import {NgModule} from '@angular/core';
import {ServicesModule} from './services/services.module';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
// Route Module
import {RoutesModule} from './routes/routes.module';

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
    RoutesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
