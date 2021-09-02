/** @decorator */

import { attr } from '../element/components/attributes.js';
import { observable } from '../element/observation/observable.js';
import { ARIAGlobalStatesAndProperties } from '../patterns/aria-global.js';
import { StartEnd } from '../patterns/start-end.js';
import { applyMixins } from '../utilities/apply-mixins.js';
import { FormAssociatedButton } from './button.form-associated.js';

/**
 * A Button Custom HTML Element.
 * Based largely on the {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button | <button> element }.
 *
 * @public
 */
export class Button extends FormAssociatedButton {
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
   * The id of a form to associate the element to.
   *
   * @public
   * @remarks
   * HTML Attribute: form
   */
  @attr({ attribute: 'form' })
  formId;

  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button | <button> element} for more details.
   *
   * @public
   * @remarks
   * HTML Attribute: formaction
   */
  @attr
  formaction;

  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button | <button> element} for more details.
   *
   * @public
   * @remarks
   * HTML Attribute: formenctype
   */
  @attr
  formenctype;

  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button | <button> element} for more details.
   *
   * @public
   * @remarks
   * HTML Attribute: formmethod
   */
  @attr
  formmethod;

  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button | <button> element} for more details.
   *
   * @public
   * @remarks
   * HTML Attribute: formnovalidate
   */
  @attr({ mode: 'boolean' })
  formnovalidate;

  /**
   * See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button | <button> element} for more details.
   *
   * @public
   * @remarks
   * HTML Attribute: formtarget
   */
  @attr
  formtarget;

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

  constructor() {
    super(...arguments);
    /**
     * Submits the parent form
     */
    this.handleSubmission = () => {
      if (!this.form) {
        return;
      }

      const attached = this.proxy.isConnected;

      if (!attached) {
        this.attachProxy();
      }

      // Browser support for requestSubmit is not comprehensive
      // so click the proxy if it isn't supported
      typeof this.form.requestSubmit === 'function'
        ? this.form.requestSubmit(this.proxy)
        : this.proxy.click();

      if (!attached) {
        this.detachProxy();
      }
    };
    /**
     * Resets the parent form
     */
    this.handleFormReset = () => {
      var _a;

      (_a = this.form) === null || _a === void 0 ? void 0 : _a.reset();
    };
  }

  formactionChanged() {
    if (this.proxy instanceof HTMLInputElement) {
      this.proxy.formAction = this.formaction;
    }
  }

  formenctypeChanged() {
    if (this.proxy instanceof HTMLInputElement) {
      this.proxy.formEnctype = this.formenctype;
    }
  }

  formmethodChanged() {
    if (this.proxy instanceof HTMLInputElement) {
      this.proxy.formMethod = this.formmethod;
    }
  }

  formnovalidateChanged() {
    if (this.proxy instanceof HTMLInputElement) {
      this.proxy.formNoValidate = this.formnovalidate;
    }
  }

  formtargetChanged() {
    if (this.proxy instanceof HTMLInputElement) {
      this.proxy.formTarget = this.formtarget;
    }
  }

  typeChanged(previous, next) {
    if (this.proxy instanceof HTMLInputElement) {
      this.proxy.type = this.type;
    }

    next === 'submit' && this.addEventListener('click', this.handleSubmission);
    previous === 'submit' &&
      this.removeEventListener('click', this.handleSubmission);
    next === 'reset' && this.addEventListener('click', this.handleFormReset);
    previous === 'reset' &&
      this.removeEventListener('click', this.handleFormReset);
  }

  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();
    this.proxy.setAttribute('type', this.type);
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
