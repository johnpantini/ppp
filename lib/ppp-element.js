/** @decorator */

import { attr, FASTElement, Updates } from '../vendor/fast-element.min.js';

export class PPPElement extends FASTElement {
  static compose(type, nameOrDef) {
    if (typeof type.name === 'undefined') {
      type.name = `ppp-${this.name
        .replace(/([A-Z]($|[a-z]))/g, '-$1')
        .replace(/(^-|-Element$)/g, '')
        .toLowerCase()}`;
    }

    return super.compose(type, nameOrDef);
  }
}

export class PPPAppearanceElement extends PPPElement {
  @attr
  appearance;

  appearanceChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      Updates.enqueue(() => {
        this.classList.add(newValue);
        oldValue && this.classList.remove(oldValue);
      });
    }
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.appearance) {
      this.appearance = 'default';
    }
  }
}
