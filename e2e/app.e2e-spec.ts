import { Jacob.JsPage } from './app.po';

describe('jacob.js App', () => {
  let page: Jacob.JsPage;

  beforeEach(() => {
    page = new Jacob.JsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
