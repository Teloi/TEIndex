import { browser, element, by } from 'protractor';

export class TEIndexPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root header ')).getText();
  }
}
