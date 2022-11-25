/** @decorator */

import {
  attr,
  nullableNumberConverter
} from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';
import { DelegatesARIATextbox } from './text-field.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { html } from './element/templating/template.js';
import { ref } from './element/templating/ref.js';
import { FoundationElement } from './foundation-element.js';
import { when } from './element/templating/when.js';

/**
 * Resize mode for a TextArea
 * @public
 */
export let TextAreaResize;
(function (TextAreaResize) {
  /**
   * No resize.
   */
  TextAreaResize['none'] = 'none';
  /**
   * Resize vertically and horizontally.
   */
  TextAreaResize['both'] = 'both';
  /**
   * Resize horizontally.
   */
  TextAreaResize['horizontal'] = 'horizontal';
  /**
   * Resize vertically.
   */
  TextAreaResize['vertical'] = 'vertical';
})(TextAreaResize || (TextAreaResize = {}));

/**
 * The template for the TextArea component.
 * @public
 */
export const textAreaTemplate = (context, definition) => html`
  <template
    class="
            ${(x) => (x.readOnly ? 'readonly' : '')}
            ${(x) =>
      x.resize !== TextAreaResize.none ? `resize-${x.resize}` : ''}"
  >
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <div class="root-container">
        <textarea
          part="control"
          class="control"
          id="control"
          ?autofocus="${(x) => x.autofocus}"
          cols="${(x) => x.cols}"
          ?disabled="${(x) => x.disabled}"
          list="${(x) => x.list}"
          maxlength="${(x) => x.maxlength}"
          minlength="${(x) => x.minlength}"
          name="${(x) => x.name}"
          placeholder="${(x) => x.placeholder}"
          ?readonly="${(x) => x.readOnly}"
          ?required="${(x) => x.required}"
          rows="${(x) => x.rows}"
          ?spellcheck="${(x) => x.spellcheck}"
          :value="${(x) => x.value}"
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
          @input="${(x, c) => x.handleTextInput()}"
          @change="${(x) => x.handleChange()}"
          ${ref('control')}
        ></textarea>
        <div class="interaction-ring"></div>
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

/**
 * A Text Area Custom HTML Element.
 * Based largely on the {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea | <textarea> element }.
 *
 * @public
 */
export class TextArea extends FoundationElement {
  /**
   * @public
   * @remarks
   * HTML Attribute: value
   */
  @attr
  value;

  /**
   * When true, the control will be immutable by user interaction. See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly | readonly HTML attribute} for more information.
   * @public
   * @remarks
   * HTML Attribute: readonly
   */
  @attr({ mode: 'boolean' })
  readOnly;

  /**
   * The resize mode of the element.
   * @public
   * @remarks
   * HTML Attribute: resize
   */
  @attr
  resize;

  /**
   * A reference to the internal textarea element
   * @internal
   */
  control;

  /**
   * Indicates that this element should get focus after the page finishes loading.
   * @public
   * @remarks
   * HTML Attribute: autofocus
   */
  @attr({ mode: 'boolean' })
  autofocus;

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
   * The name of the element.
   * @public
   * @remarks
   * HTML Attribute: name
   */
  @attr
  name;

  @attr({ mode: 'boolean' })
  disabled;

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
   * Sizes the element horizontally by a number of character columns.
   *
   * @public
   * @remarks
   * HTML Attribute: cols
   */
  @attr({ converter: nullableNumberConverter, mode: 'fromView' })
  cols;

  /**
   * Sizes the element vertically by a number of character rows.
   *
   * @public
   * @remarks
   * HTML Attribute: rows
   */
  @attr({ converter: nullableNumberConverter, mode: 'fromView' })
  rows;

  /**
   * Sets if the element is eligible for spell checking
   * but the UA.
   * @public
   * @remarks
   * HTML Attribute: spellcheck
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

    this.value = '';
    /**
     * The resize mode of the element.
     * @public
     * @remarks
     * HTML Attribute: resize
     */
    this.resize = TextAreaResize.none;
    /**
     * Sizes the element horizontally by a number of character columns.
     *
     * @public
     * @remarks
     * HTML Attribute: cols
     */
    this.cols = 20;
    /**
     * @internal
     */
    this.handleTextInput = () => {
      this.value = this.control.value;

      if (this.value) this.state = 'default';
    };
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

applyMixins(TextArea, DelegatesARIATextbox);
