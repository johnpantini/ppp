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

const OFF_CLICK_ELEMENTS = [];

export class PPPOffClickElement extends PPPElement {
  documentOffClickHandler() {}

  documentKeydownHandler() {}

  connectedCallback() {
    super.connectedCallback();

    OFF_CLICK_ELEMENTS.push(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    OFF_CLICK_ELEMENTS.splice(OFF_CLICK_ELEMENTS.indexOf(this), 1);
  }
}

document.addEventListener('pointerdown', (event) => {
  OFF_CLICK_ELEMENTS.forEach((e) => {
    if (!event.composedPath().find((n) => n === e)) {
      e?.documentOffClickHandler.call(e, event);
    }
  });
});

document.addEventListener('keydown', (event) => {
  OFF_CLICK_ELEMENTS.forEach((e) => {
    e?.documentKeydownHandler.call(e, event);
  });
});
