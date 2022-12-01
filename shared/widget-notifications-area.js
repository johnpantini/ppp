/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { observable } from './element/observation/observable.js';

export class WidgetNotificationsArea extends FoundationElement {
  @observable
  visible;

  @observable
  title;

  @observable
  text;

  @observable
  status;

  #timeout;

  success({ title, text }) {
    this.status = 'success';
    this.title = title;
    this.text = text;
    this.visible = true;

    clearTimeout(this.#timeout);

    this.#timeout = setTimeout(() => {
      this.visible = false;
    }, 3000);
  }

  error({ title, text }) {
    this.status = 'error';
    this.title = title;
    this.text = text;
    this.visible = true;

    clearTimeout(this.#timeout);

    this.#timeout = setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
}
