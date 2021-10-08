/** @decorator */

import { FoundationElement } from '../foundation-element/foundation-element.js';
import { attr } from '../element/components/attributes.js';

export class Badge extends FoundationElement {
  @attr
  appearance;

  appearanceChanged(oldValue, newValue) {
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
      this.appearance = 'green';
    }
  }
}
