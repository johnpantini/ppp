/** @decorator */

import { attr, FASTElement, Updates } from '../vendor/fast-element.min.js';

/** Base FAST element with the application's naming convention and partial-class constructor hook. */
export class PPPElement extends FASTElement {
  /** Runs the optional ctor hook supplied by a partial implementation. */
  constructor() {
    super();

    // For partial classes.
    if (typeof this.ctor === 'function') this.ctor.call(this);
  }

  /**
   * Supplies a ppp-prefixed custom-element name when the definition omits it.
   * @param {object | Function} type FAST definition or element constructor.
   * @param {string | object} [nameOrDef] Optional FAST name/definition override.
   * @returns {object} FAST definition supporting define().
   */
  static compose(type, nameOrDef) {
    if (typeof type.name === 'undefined') {
      // biome-ignore lint/complexity/noThisInStatic:
      type.name = `ppp-${this.name
        .replace(/([A-Z]($|[a-z]))/g, '-$1')
        .replace(/(^-|-Element$)/g, '')
        .toLowerCase()}`;
    }

    // biome-ignore lint/complexity/noThisInStatic:
    return super.compose(type, nameOrDef);
  }
}

/** Mirrors the appearance attribute to a CSS class after the FAST update queue runs. */
export class PPPAppearanceElement extends PPPElement {
  /** @type {string} Visual state such as default, error, primary or warning. */
  @attr
  appearance;

  /**
   * @param {string} oldValue Previous appearance.
   * @param {string} newValue Replacement appearance.
   * @returns {void}
   */
  appearanceChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      Updates.enqueue(() => {
        this.classList.add(newValue);
        oldValue && this.classList.remove(oldValue);
      });
    }
  }

  /** Initializes the default appearance when connected without an explicit value. */
  connectedCallback() {
    super.connectedCallback();

    if (!this.appearance) {
      this.appearance = 'default';
    }
  }
}

const OFF_CLICK_ELEMENTS = [];

/** Receives document key presses and pointer presses outside its composed DOM path. */
export class PPPOffClickElement extends PPPElement {
  /**
   * Override to handle outside pointer presses.
   * @returns {void}
   */
  documentOffClickHandler() {}

  /**
   * Override to handle document keyboard events.
   * @returns {void}
   */
  documentKeydownHandler() {}

  /** Registers the connected element with the shared document listeners. */
  connectedCallback() {
    super.connectedCallback();

    OFF_CLICK_ELEMENTS.push(this);
  }

  /** Releases the disconnected element from the shared listener registry. */
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
