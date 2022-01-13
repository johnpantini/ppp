/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { attr } from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';

export class Toast extends FoundationElement {
  @observable
  source;

  @attr
  appearance;

  @attr({ mode: 'boolean' })
  dismissible;

  @attr({ mode: 'boolean' })
  visible;

  appearanceChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this.classList.add(newValue);
      this.classList.remove(oldValue);
    }

    if (newValue !== 'progress') {
      this.progress = {
        value: 0
      };
    }
  }

  visibleChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this.classList.add(newValue);
      this.classList.remove(oldValue);
    }
  }

  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();

    if (!this.appearance) {
      this.appearance = 'success';
    }
  }
}
