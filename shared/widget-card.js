/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { observable } from './element/observation/observable.js';

export class WidgetCard extends FoundationElement {
  @observable
  slottedActions;

  constructor() {
    super();

    this.slottedActions = [];
  }

  connectedCallback() {
    super.connectedCallback();

    if (
      this.classList.contains('new') &&
      document.visibilityState === 'visible'
    ) {
      setTimeout(() => {
        this.classList.remove('new');
      }, 3000);
    }
  }
}
