import { FoundationElement } from './foundation-element.js';

const ELEMENTS = [];

export class OffClickElement extends FoundationElement {
  documentOffClickHandler() {}

  documentKeydownHandler() {}

  connectedCallback() {
    super.connectedCallback();

    ELEMENTS.push(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    ELEMENTS.splice(ELEMENTS.indexOf(this), 1);
  }
}

document.addEventListener('pointerdown', (event) => {
  ELEMENTS.forEach((e) => {
    if (!event.composedPath().find((n) => n === e)) {
      e?.documentOffClickHandler.call(e, event);
    }
  });
});

document.addEventListener('keydown', (event) => {
  ELEMENTS.forEach((e) => {
    e?.documentKeydownHandler.call(e, event);
  });
});
