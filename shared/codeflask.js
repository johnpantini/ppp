/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { attr } from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';
import { when } from './element/templating/when.js';
import { html } from './template.js';
import { ref } from './element/templating/ref.js';

import Prism from '../vendor/prism.min.js';

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

export function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=/]/g, function (s) {
    return entityMap[s];
  });
}

export const codeflaskTemplate = (context, definition) => html`
  <template class="${(x) => (x.readOnly ? 'readonly' : '')}">
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <div class="root-container">
        <textarea
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          part="control"
          class="control"
          id="control"
          @input="${(x, c) => x.onInput(c)}"
          @scroll="${(x, c) => x.onScroll(c)}"
          ${ref('control')}
        ></textarea>
        <pre ${ref('pre')} class="pre language-js"><code ${ref(
          'codeHolder'
        )} class="code language-js"></code></pre>
      </div>
    </div>
    ${when(
      (x) => x.state === 'error' && !!x.errorMessage,
      html` <div class="helper error">
        <label>${(x) => x.errorMessage}</label>
      </div>`
    )}
  </template>
`;

export class Codeflask extends FoundationElement {
  @attr({ attribute: 'readonly', mode: 'boolean' })
  readOnly;

  @observable
  code;

  get value() {
    return this.code;
  }

  @attr
  state;

  @observable
  errorMessage;

  onInput(c) {
    this.code = c.event.target.value;
    this.codeHolder.innerHTML = escapeHtml(c.event.target.value);
    this.highlight();

    if (this.code)
      this.state = 'default';
  }

  onScroll(c) {
    const e = c.event;

    this.pre.style.transform = `translate3d(-${e.target.scrollLeft}px, -${e.target.scrollTop}px, 0)`;
  }

  stateChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this.classList.add(newValue);
      this.classList.remove(oldValue);
    }
  }

  updateCode(code = '') {
    this.code = code;
    this.control.value = code;
    this.codeHolder.innerHTML = escapeHtml(code);
    this.highlight();
  }

  highlight() {
    Prism.highlightElement(this.codeHolder, false);
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.state) {
      this.state = 'default';
    }

    this.updateCode(this.code);
  }

  codeChanged(oldValue, newValue = '') {
    if (this.$pppController.isConnected) {
      this.updateCode(newValue);
    }
  }
}
