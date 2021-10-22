/** @decorator */

import {
  attr,
  nullableNumberConverter
} from '../element/components/attributes.js';
import { observable } from '../element/observation/observable.js';
import { DelegatesARIATextbox } from '../text-field/text-field.js';
import { applyMixins } from '../utilities/apply-mixins.js';
import { FormAssociatedTextArea } from './text-area.form-associated.js';
import { TextAreaResize } from './text-area.options.js';

export { TextAreaResize };

/**
 * A Text Area Custom HTML Element.
 * Based largely on the {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea | <textarea> element }.
 *
 * @public
 */
export class TextArea extends FormAssociatedTextArea {
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
   * The {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id | id} of the {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form | form} the element is associated to
   * @public
   */
  @attr({ attribute: 'form' })
  formId;

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
    };
  }

  readOnlyChanged() {
    if (this.proxy instanceof HTMLTextAreaElement) {
      this.proxy.readOnly = this.readOnly;
    }
  }

  autofocusChanged() {
    if (this.proxy instanceof HTMLTextAreaElement) {
      this.proxy.autofocus = this.autofocus;
    }
  }

  listChanged() {
    if (this.proxy instanceof HTMLTextAreaElement) {
      this.proxy.setAttribute('list', this.list);
    }
  }

  maxlengthChanged() {
    if (this.proxy instanceof HTMLTextAreaElement) {
      this.proxy.maxLength = this.maxlength;
    }
  }

  minlengthChanged() {
    if (this.proxy instanceof HTMLTextAreaElement) {
      this.proxy.minLength = this.minlength;
    }
  }

  spellcheckChanged() {
    if (this.proxy instanceof HTMLTextAreaElement) {
      this.proxy.spellcheck = this.spellcheck;
    }
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
