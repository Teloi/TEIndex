import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

// Mesh
import {MeshbuilderService} from './services/mesh-builder.service';
// Translator
import {TranslatorService} from './services/translator.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [MeshbuilderService, TranslatorService]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule
    };
  }
}
