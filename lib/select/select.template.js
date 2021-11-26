import { html } from '../element/templating/template.js';
import { ref } from '../element/templating/ref.js';
import { slotted } from '../element/templating/slotted.js';
import { Listbox } from '../listbox/listbox.js';
import { endSlotTemplate, startSlotTemplate } from '../patterns/start-end.js';

/**
 * The template for the Select component.
 * @public
 */
export const selectTemplate = (context, definition) => html`
  <template
    class="${(x) => (x.open ? 'open' : '')} ${(x) =>
      x.disabled ? 'disabled' : ''} ${(x) => x.position}"
    role="${(x) => x.role}"
    tabindex="${(x) => (!x.disabled ? '0' : null)}"
    aria-disabled="${(x) => x.ariaDisabled}"
    aria-expanded="${(x) => x.ariaExpanded}"
    @click="${(x, c) => x.clickHandler(c.event)}"
    @focusout="${(x, c) => x.focusoutHandler(c.event)}"
    @keydown="${(x, c) => x.keydownHandler(c.event)}"
  >
    <div
      aria-activedescendant="${(x) => (x.open ? x.ariaActiveDescendant : null)}"
      aria-controls="listbox"
      aria-expanded="${(x) => x.ariaExpanded}"
      aria-haspopup="listbox"
      class="control"
      part="control"
      role="button"
      ?disabled="${(x) => x.disabled}"
    >
      ${startSlotTemplate(context, definition)}
      <slot name="button-container">
        <div class="selected-value" part="selected-value">
          <slot name="selected-value">${(x) => x.displayValue}</slot>
        </div>
        <div class="indicator" part="indicator">
          <slot name="indicator"> ${definition.indicator || ''}</slot>
        </div>
      </slot>
      ${endSlotTemplate(context, definition)}
    </div>
    <div
      aria-disabled="${(x) => x.disabled}"
      class="listbox"
      id="listbox"
      part="listbox"
      role="listbox"
      ?disabled="${(x) => x.disabled}"
      ?hidden="${(x) => !x.open}"
      ${ref('listbox')}
    >
      <slot
        ${slotted({
          filter: Listbox.slottedOptionFilter,
          flatten: true,
          property: 'slottedOptions'
        })}
      ></slot>
    </div>
  </template>
`;
