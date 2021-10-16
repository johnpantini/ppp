import { App as BaseApp } from '../lib/app.js';
import { requireComponent } from '../lib/template.js';

export class App extends BaseApp {
  _toast;

  constructor() {
    super(...arguments);

    requireComponent('ppp-toast');
  }

  pageChanged(oldValue, newValue) {
    super.pageChanged(oldValue, newValue);

    this._toast && (this._toast.visible = false);
  }

  get toast() {
    if (!this._toast) {
      this._toast = document.body.querySelector('.toast').firstElementChild;
    }

    return this._toast;
  }
}

export const app = (styles, template) =>
  App.compose({
    baseName: 'app',
    template,
    styles
  });
