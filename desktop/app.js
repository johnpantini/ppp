import { App as BaseApp } from '../lib/app.js';
import { requireComponent } from '../lib/template.js';
import { keyCodeEscape } from '../lib/web-utilities/key-codes.js';

export class App extends BaseApp {
  _toast;

  constructor() {
    super(...arguments);

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.code === keyCodeEscape) {
          this.toast.visible = false;
        }
      },
      {
        passive: true
      }
    );

    void requireComponent('ppp-toast');
  }

  navigate(url, params = {}) {
    super.navigate(url, params);

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
