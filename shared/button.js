/** @decorator */

import { attr } from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';
import { ARIAGlobalStatesAndProperties } from './patterns/aria-global.js';
import { StartEnd } from './patterns/start-end.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { html } from './element/templating/template.js';
import { ref } from './element/templating/ref.js';
import { slotted } from './element/templating/slotted.js';
import { endSlotTemplate, startSlotTemplate } from './patterns/start-end.js';
import { FoundationElement } from './foundation-element.js';

/**
 * The template for the Button component.
 * @public
 */
export const buttonTemplate = (context, definition) => html`
  <button
    class="control"
    part="control"
    ?autofocus="${(x) => x.autofocus}"
    ?disabled="${(x) => x.disabled}"
    form="${(x) => x.formId}"
    formaction="${(x) => x.formaction}"
    formenctype="${(x) => x.formenctype}"
    formmethod="${(x) => x.formmethod}"
    formnovalidate="${(x) => x.formnovalidate}"
    formtarget="${(x) => x.formtarget}"
    name="${(x) => x.name}"
    type="${(x) => x.type}"
    value="${(x) => x.value}"
    aria-atomic="${(x) => x.ariaAtomic}"
    aria-busy="${(x) => x.ariaBusy}"
    aria-controls="${(x) => x.ariaControls}"
    aria-current="${(x) => x.ariaCurrent}"
    aria-describedBy="${(x) => x.ariaDescribedby}"
    aria-details="${(x) => x.ariaDetails}"
    aria-disabled="${(x) => x.ariaDisabled}"
    aria-errormessage="${(x) => x.ariaErrormessage}"
    aria-expanded="${(x) => x.ariaExpanded}"
    aria-flowto="${(x) => x.ariaFlowto}"
    aria-haspopup="${(x) => x.ariaHaspopup}"
    aria-hidden="${(x) => x.ariaHidden}"
    aria-invalid="${(x) => x.ariaInvalid}"
    aria-keyshortcuts="${(x) => x.ariaKeyshortcuts}"
    aria-label="${(x) => x.ariaLabel}"
    aria-labelledby="${(x) => x.ariaLabelledby}"
    aria-live="${(x) => x.ariaLive}"
    aria-owns="${(x) => x.ariaOwns}"
    aria-pressed="${(x) => x.ariaPressed}"
    aria-relevant="${(x) => x.ariaRelevant}"
    aria-roledescription="${(x) => x.ariaRoledescription}"
    ${ref('control')}
  >
    ${startSlotTemplate(context, definition)}
    <span class="content" part="content">
      <slot ${slotted('defaultSlottedContent')}></slot>
    </span>
    ${endSlotTemplate(context, definition)}
  </button>
`;

/**
 * A Button Custom HTML Element.
 * Based largely on the {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button | <button> element }.
 *
 * @public
 */
export class Button extends FoundationElement {
  /**
   * Determines if the element should receive document focus on page load.
   *
   * @public
   * @remarks
   * HTML Attribute: autofocus
   */
  @attr({ mode: 'boolean' })
  autofocus;

  /**
   * The button type.
   *
   * @public
   * @remarks
   * HTML Attribute: type
   */
  @attr
  type;

  /**
   *
   * Default slotted content
   *
   * @public
   * @remarks
   */
  @observable
  defaultSlottedContent;

  @attr({ mode: 'boolean' })
  disabled;

  constructor() {
    super(...arguments);
    /**
     * Submits the parent form
     */
    this.handleSubmission = () => {
      this.form?.requestSubmit();
    };

    /**
     * Resets the parent form
     */
    this.handleFormReset = () => {
      this.form?.reset();
    };
  }

  typeChanged(previous, next) {
    next === 'submit' && this.addEventListener('click', this.handleSubmission);
    previous === 'submit' &&
      this.removeEventListener('click', this.handleSubmission);
    next === 'reset' && this.addEventListener('click', this.handleFormReset);
    previous === 'reset' &&
      this.removeEventListener('click', this.handleFormReset);
  }
}

/**
 * Includes ARIA states and properties relating to the ARIA button role
 *
 * @public
 */
export class DelegatesARIAButton {
  /**
   * See {@link https://www.w3.org/WAI/PF/aria/roles#button} for more information
   * @public
   * @remarks
   * HTML Attribute: aria-expanded
   */
  @attr({ attribute: 'aria-expanded', mode: 'fromView' })
  ariaExpanded;

  /**
   * See {@link https://www.w3.org/WAI/PF/aria/roles#button} for more information
   * @public
   * @remarks
   * HTML Attribute: aria-pressed
   */
  @attr({ attribute: 'aria-pressed', mode: 'fromView' })
  ariaPressed;
}

applyMixins(DelegatesARIAButton, ARIAGlobalStatesAndProperties);
applyMixins(Button, StartEnd, DelegatesARIAButton);
