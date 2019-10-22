import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

// Mesh
import {MeshBuilderService} from './services/mesh-builder.service';
// Translator
import {TranslatorService} from './services/translator.service';
import {TranslateModule} from '@ngx-translate/core';
import {TEHttpService} from './services/http.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    MeshBuilderService,
    TranslatorService,
    TEHttpService
  ],
  exports: [
    TranslateModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule
    };
  }
}
