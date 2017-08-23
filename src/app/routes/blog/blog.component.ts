declare let $;
import {Component, OnInit} from '@angular/core';
import {TranslatorService} from '../../shared/services/translator.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

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
