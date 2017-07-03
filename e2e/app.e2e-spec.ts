import { TEIndexPage } from './app.po';

describe('teindex App', () => {
  let page: TEIndexPage;

  beforeEach(() => {
    page = new TEIndexPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
