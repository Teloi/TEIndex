import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class TranslatorService {
  private defaultLanguage = 'zh-cn';

  constructor(public translate: TranslateService) {
    if (!translate.getDefaultLang()) {
      translate.setDefaultLang(this.defaultLanguage);
    }
    this.useLanguage();
  }

  useLanguage(lang: string = null) {
    this.translate.use(lang || this.translate.getDefaultLang());
    this.translate.setDefaultLang(lang || this.translate.getDefaultLang());
    return lang || this.translate.getDefaultLang();
  }

  getCurrentLanguage(): string {
    return this.translate.getDefaultLang() || this.defaultLanguage;
  }
}
