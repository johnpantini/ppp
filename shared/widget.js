/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { attr } from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';

export class Widget extends FoundationElement {
  @attr
  symbol;

  @attr
  x;

  @attr
  y;

  @attr({ mode: 'boolean' })
  dragging;

  @observable
  document;

  constructor() {
    super();

    this.document = {};
  }

  close() {
    if (!this.container) {

    }
  }

  handlePointerMove(c) {
    if (this.dragging) {
      const { clientX, clientY } = c.event;

      this.style.transform = `translate(${clientX - this.x}px, ${
        clientY - this.y
      }px)`;
    }
  }

  handlePointerDown(c) {
    this.x = c.event.clientX;
    this.y = c.event.clientY;

    this.dragging = true;
  }

  handlePointerUp() {
    this.dragging = false;
  }

  connectedCallback() {
    super.connectedCallback();
  }
}
