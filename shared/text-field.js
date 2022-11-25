/** @decorator */

import { DOM } from './element/dom.js';
import {
  attr,
  nullableNumberConverter
} from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';
import { ARIAGlobalStatesAndProperties } from './patterns/aria-global.js';
import { StartEnd } from './patterns/start-end.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { html } from './element/templating/template.js';
import { ref } from './element/templating/ref.js';
import { endSlotTemplate, startSlotTemplate } from './patterns/start-end.js';
import { FoundationElement } from './foundation-element.js';
import { when } from './element/templating/when.js';

/**
 * Text field subtype
 * @public
 */
export let TextFieldType;

(function (TextFieldType) {
  /**
   * An email TextField
   */
  TextFieldType['email'] = 'email';
  /**
   * A password TextField
   */
  TextFieldType['password'] = 'password';
  /**
   * A telephone TextField
   */
  TextFieldType['tel'] = 'tel';
  /**
   * A text TextField
   */
  TextFieldType['text'] = 'text';
  /**
   * A URL TextField
   */
  TextFieldType['url'] = 'url';
})(TextFieldType || (TextFieldType = {}));

/**
 * The template for the TextField component.
 * @public
 */
export const textFieldTemplate = (context, definition) => html`
  <template class="${(x) => (x.readOnly ? 'readonly' : '')}">
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <div class="root-container">
        ${startSlotTemplate(context, definition)}
        <input
          class="control"
          part="control"
          id="control"
          @input="${(x) => x.handleTextInput()}"
          @change="${(x) => x.handleChange()}"
          ?autofocus="${(x) => x.autofocus}"
          ?disabled="${(x) => x.disabled}"
          list="${(x) => x.list}"
          maxlength="${(x) => x.maxlength}"
          minlength="${(x) => x.minlength}"
          pattern="${(x) => x.pattern}"
          placeholder="${(x) => x.placeholder}"
          ?readonly="${(x) => x.readOnly}"
          ?required="${(x) => x.required}"
          size="${(x) => x.size}"
          ?spellcheck="${(x) => x.spellcheck}"
          :value="${(x) => x.value}"
          type="${(x) => x.type}"
          aria-atomic="${(x) => x.ariaAtomic}"
          aria-busy="${(x) => x.ariaBusy}"
          aria-controls="${(x) => x.ariaControls}"
          aria-current="${(x) => x.ariaCurrent}"
          aria-describedBy="${(x) => x.ariaDescribedby}"
          aria-details="${(x) => x.ariaDetails}"
          aria-disabled="${(x) => x.ariaDisabled}"
          aria-errormessage="${(x) => x.ariaErrormessage}"
          aria-flowto="${(x) => x.ariaFlowto}"
          aria-haspopup="${(x) => x.ariaHaspopup}"
          aria-hidden="${(x) => x.ariaHidden}"
          aria-invalid="${(x) => x.ariaInvalid}"
          aria-keyshortcuts="${(x) => x.ariaKeyshortcuts}"
          aria-label="${(x) => x.ariaLabel}"
          aria-labelledby="${(x) => x.ariaLabelledby}"
          aria-live="${(x) => x.ariaLive}"
          aria-owns="${(x) => x.ariaOwns}"
          aria-relevant="${(x) => x.ariaRelevant}"
          aria-roledescription="${(x) => x.ariaRoledescription}"
          ${ref('control')}
        />
        <div class="interaction-ring"></div>
      </div>
      ${when(
        (x) => x.state === 'default',
        endSlotTemplate(context, definition)
      )}
      ${when(
        (x) => x.state === 'error' && x.errorMessage,
        html` <div class="end">${definition.errorIcon ?? ''}</div> `
      )}
      ${when(
        (x) => x.optional,
        html`
          <div class="end">
            <div class="optional-text">
              <p>${definition.optionalText ?? 'Опционально'}</p>
            </div>
          </div>
        `
      )}
      ${when(
        (x) => x.state === 'valid',
        html` <div class="end">${definition.checkMarkIcon ?? ''}</div>`
      )}
    </div>
    ${when(
      (x) => x.state === 'error' && x.errorMessage,
      html`
        <div class="helper error">
          <label>${(x) => x.errorMessage}</label>
        </div>
      `
    )}
  </template>
`;

/**
 * A Text Field Custom HTML Element.
 * Based largely on the {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text | <input type="text" /> element }.
 *
 * @public
 */
export class TextField extends FoundationElement {
  /**
   * @public
   * @remarks
   * HTML Attribute: value
   */
  @attr
  value;

  @attr({ mode: 'boolean' })
  disabled;

  /**
   * The name of the input.
   */
  @attr
  name;

  /**
   * When true, the control will be immutable by user interaction. See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly | readonly HTML attribute} for more information.
   * @public
   * @remarks
   * HTML Attribute: readonly
   */
  @attr({ attribute: 'readonly', mode: 'boolean' })
  readOnly;

  /**
   * Indicates that this element should get focus after the page finishes loading. See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautofocus | autofocus HTML attribute} for more information.
   * @public
   * @remarks
   * HTML Attribute: autofocus
   */
  @attr({ mode: 'boolean' })
  autofocus;

  /**
   * Sets the placeholder value of the element, generally used to provide a hint to the user.
   * @public
   * @remarks
   * HTML Attribute: placeholder
   * Using this attribute does is not a valid substitute for a labeling element.
   */
  @attr
  placeholder;

  /**
   * Allows setting a type or mode of text.
   * @public
   * @remarks
   * HTML Attribute: type
   */
  @attr
  type;

  /**
   * Allows associating a {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist | datalist} to the element by {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/id}.
   * @public
   * @remarks
   * HTML Attribute: list
   */
  @attr
  list;

  /**
   * The maximum number of characters a user can enter.
   * @public
   * @remarks
   * HTMLAttribute: maxlength
   */
  @attr({ converter: nullableNumberConverter })
  maxlength;

  /**
   * The minimum number of characters a user can enter.
   * @public
   * @remarks
   * HTMLAttribute: minlength
   */
  @attr({ converter: nullableNumberConverter })
  minlength;

  /**
   * A regular expression that the value must match to pass validation.
   * @public
   * @remarks
   * HTMLAttribute: pattern
   */
  @attr
  pattern;

  /**
   * Sets the width of the element to a specified number of characters.
   * @public
   * @remarks
   * HTMLAttribute: size
   */
  @attr({ converter: nullableNumberConverter })
  size;

  /**
   * Controls whether to enable spell checking for the input field, or if the default spell checking configuration should be used.
   * @public
   * @remarks
   * HTMLAttribute: size
   */
  @attr({ mode: 'boolean' })
  spellcheck;

  /**
   * @internal
   */
  @observable
  defaultSlottedNodes;

  constructor() {
    super(...arguments);
    /**
     * Allows setting a type or mode of text.
     * @public
     * @remarks
     * HTML Attribute: type
     */
    this.value = '';
    this.type = TextFieldType.text;
  }

  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();

    if (this.autofocus) {
      DOM.queueUpdate(() => {
        this.focus();
      });
    }
  }

  /**
   * Handles the internal control's `input` event
   * @internal
   */
  handleTextInput() {
    this.value = this.control.value ?? '';

    if (this.value) this.state = 'default';
  }

  valueChanged(prev, next) {
    if (next === null || next === undefined) this.value = '';
  }

  /**
   * Change event handler for inner control.
   * @remarks
   * "Change" events are not `composable` so they will not
   * permeate the shadow DOM boundary. This fn effectively proxies
   * the change event, emitting a `change` event whenever the internal
   * control emits a `change` event
   * @internal
   */
  handleChange() {
    this.$emit('change');
  }
}

/**
 * Includes ARIA states and properties relating to the ARIA textbox role
 *
 * @public
 */
export class DelegatesARIATextbox {}

applyMixins(DelegatesARIATextbox, ARIAGlobalStatesAndProperties);
applyMixins(TextField, StartEnd, DelegatesARIATextbox);
