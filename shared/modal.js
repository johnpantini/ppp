/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { attr } from './element/components/attributes.js';
import { html } from './element/templating/template.js';
import { when } from './element/templating/when.js';

export const modalTemplate = (context, definition) =>
  html`
    <template>
      <div class="holder">
        <div aria-modal="true" role="dialog" tabindex="-1" class="content">
          <h3 class="title">
            <slot name="title"></slot>
          </h3>
          <div class="body">
            <slot name="body"></slot>
          </div>
          ${when(
            (x) => x.dismissible,
            html` <button
              @click="${(x) => (x.visible = false)}"
              aria-label="Close Modal"
              aria-disabled="false"
              class="close"
              tabindex="0"
            >
              <div class="close-icon">${definition.closeIcon || ''}</div>
            </button>`
          )}
        </div>
      </div>
    </template>
  `;

export class Modal extends FoundationElement {
  @attr({ mode: 'boolean' })
  dismissible;

  @attr({ mode: 'boolean' })
  visible;

  visibleChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this.classList.add(newValue);
      this.classList.remove(oldValue);
    }
  }
}
