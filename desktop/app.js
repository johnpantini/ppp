import { App as BaseApp } from '../lib/app.js';
import { requireComponent } from '../lib/template.js';

export class App extends BaseApp {
  #toast;

  constructor() {
    super(...arguments);

    requireComponent('ppp-toast');
  }

  get toast() {
    if (!this.#toast) {
      this.#toast = document.body.querySelector('.toast').firstElementChild;
    }

    return this.#toast;
  }
}

export const app = (styles, template) =>
  App.compose({
    baseName: 'app',
    template,
    styles
  });
