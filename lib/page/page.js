/** @decorator */

import { FoundationElement } from '../foundation-element/foundation-element.js';
import { Observable, observable } from '../element/observation/observable.js';

export class BasePage extends FoundationElement {
  @observable
  busy;

  @observable
  toastTitle;

  @observable
  toastText;

  toastTitleChanged() {
    Observable.notify(this.app.toast, 'source');
  }

  toastTextChanged() {
    Observable.notify(this.app.toast, 'source');
  }
}
