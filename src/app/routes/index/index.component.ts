import {Component, OnInit} from '@angular/core';
import {simAnim} from '../../shared/animations/sim-anim';
import {TranslatorService} from '../../shared/services/translator.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  animations: [simAnim]
})

export class IndexComponent implements OnInit {

  staticIn: string;
  currentLanguage: string;

  constructor(public translator: TranslatorService) {
    this.staticIn = 'zoomOut';
    this.currentLanguage = this.translator.getCurrentLanguage();
    this.translator.useLanguage(this.currentLanguage);
  }

  ngOnInit() {
  }

  setLang(value) {
    this.currentLanguage = this.translator.useLanguage(value);
  }
}
