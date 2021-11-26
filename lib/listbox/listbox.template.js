import { html } from '../element/templating/template.js';
import { slotted } from '../element/templating/slotted.js';
import { Listbox } from './listbox.js';
import { endSlotTemplate, startSlotTemplate } from '../patterns/start-end.js';

/**
 * The template for the Listbox component.
 * @public
 */
export const listboxTemplate = (context, definition) => html`
  <template
    aria-activedescendant="${(x) => x.ariaActiveDescendant}"
    class="listbox"
    role="${(x) => x.role}"
    tabindex="${(x) => (!x.disabled ? '0' : null)}"
    @click="${(x, c) => x.clickHandler(c.event)}"
    @focusin="${(x, c) => x.focusinHandler(c.event)}"
    @keydown="${(x, c) => x.keydownHandler(c.event)}"
    @mousedown="${(x, c) => x.mousedownHandler(c.event)}"
  >
    <slot
      ${slotted({
        filter: Listbox.slottedOptionFilter,
        flatten: true,
        property: 'slottedOptions'
      })}
    ></slot>
  </template>
`;

/**
 * The template for the ListboxOption component.
 * @public
 */
export const listboxOptionTemplate = (context, definition) => html`
  <template
    aria-selected="${(x) => x.selected}"
    class="${(x) => (x.selected ? 'selected' : '')} ${(x) =>
      x.disabled ? 'disabled' : ''}"
    role="option"
  >
    ${startSlotTemplate(context, definition)}
    <span class="content" part="content">
      <slot></slot>
    </span>
    ${endSlotTemplate(context, definition)}
  </template>
`;
