import { html } from '../element/templating/template.js';
import { slotted } from '../element/templating/slotted.js';
import { endSlotTemplate, startSlotTemplate } from '../patterns/start-end.js';

/**
 * The template for the Tabs component.
 * @public
 */
export const tabsTemplate = (context, definition) => html`
  <template class="${(x) => x.orientation}">
    ${startSlotTemplate(context, definition)}
    <div class="tablist" part="tablist" role="tablist">
      <slot class="tab" name="tab" part="tab" ${slotted('tabs')}></slot>
    </div>
    ${endSlotTemplate(context, definition)}
    <div class="tabpanel">
      <slot name="tabpanel" part="tabpanel" ${slotted('tabpanels')}></slot>
    </div>
  </template>
`;

/**
 * The template for the TabPanel component.
 * @public
 */
export const tabPanelTemplate = (context, definition) => html`
  <template slot="tabpanel" role="tabpanel">
    <slot></slot>
  </template>
`;

/**
 * The template for the Tab component.
 * @public
 */
export const tabTemplate = (context, definition) => html`
  <template slot="tab" role="tab" aria-disabled="${(x) => x.disabled}">
    <slot></slot>
  </template>
`;
