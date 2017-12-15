import {Component, OnInit} from '@angular/core';
import {TranslatorService} from '../../../shared/services/translator.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})

export class IndexComponent implements OnInit {
  currentLanguage: string;

  constructor(public translator: TranslatorService) {
    this.currentLanguage = this.translator.getCurrentLanguage();
  }

  ngOnInit() {
  }

  setLang(value) {
    this.currentLanguage = this.translator.useLanguage(value);
  }
}
