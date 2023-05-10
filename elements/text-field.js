/** @decorator */

import ppp from '../ppp.js';
import { PPPAppearanceElement } from '../lib/ppp-element.js';
import {
  css,
  ref,
  html,
  attr,
  when,
  Updates,
  nullableNumberConverter,
  observable
} from '../vendor/fast-element.min.js';
import { normalize, typography } from '../design/styles.js';
import {
  bodyFont,
  darken,
  fontSizeBody1,
  fontWeightBody1,
  lineHeightBody1,
  paletteBlack,
  paletteBlueLight1,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark3,
  paletteGrayLight1,
  paletteGrayLight3,
  paletteGreenBase,
  paletteGreenDark1,
  paletteRedBase,
  paletteRedLight1,
  paletteWhite,
  spacing1,
  themeConditional
} from '../design/design-tokens.js';
import {
  warning,
  checkmark,
  checkmarkWithCircle,
  visibility,
  visibilityOff
} from '../static/svg/sprite.js';
import {
  startSlotTemplate,
  endSlotTemplate,
  ARIAGlobalStatesAndProperties
} from '../vendor/fast-patterns.js';
import { applyMixins, display } from '../vendor/fast-utilities.js';

export const textFieldTemplate = html`
  <template>
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <div class="root-container">
        ${startSlotTemplate()}
        <input
          class="control"
          part="control"
          id="control"
          @input="${(x) => x.handleTextInput()}"
          @change="${(x) => x.handleChange()}"
          ?autofocus="${(x) => x.autofocus}"
          autocomplete="${(x) => x.autocomplete}"
          ?disabled="${(x) => x.disabled}"
          list="${(x) => x.list}"
          min="${(x) => x.min}"
          max="${(x) => x.max}"
          precision="${(x) => x.precision}"
          step="${(x) => x.step}"
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
          aria-errormessage="${(x) => x.ariaErrormessage ?? x.errorMessage}"
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
      </div>
      ${when((x) => x.appearance === 'default', html`${endSlotTemplate()}`)}
      ${when(
        (x) => x.optional,
        html`
          <div class="end">
            <div class="optional-text">
              <p>Опционально</p>
            </div>
          </div>
        `
      )}
      ${when(
        (x) => x.appearance === 'default' && x.type === 'password',
        html`
          <div class="end">
            <div
              class="show-password"
              @click="${(x) => x.togglePasswordVisibility()}"
            >
              <span ?hidden="${(x) => x.passwordVisible}">
                ${html.partial(visibility)}
              </span>
              <span ?hidden="${(x) => !x.passwordVisible}">
                ${html.partial(visibilityOff)}
              </span>
            </div>
          </div>
        `
      )}
      ${when(
        (x) => x.appearance === 'error' && x.errorMessage,
        html` <div class="end">${html.partial(warning)}</div> `
      )}
      ${when(
        (x) => x.appearance === 'valid',
        html` <div class="end">
          ${html.partial(ppp.darkMode ? checkmarkWithCircle : checkmark)}
        </div>`
      )}
    </div>
    ${when(
      (x) => x.appearance === 'error' && x.errorMessage,
      html` <div class="helper body1 error">${(x) => x.errorMessage}</div> `
    )}
  </template>
`;

export const textFieldStyles = css`
  ${display('flex')}
  ${normalize()}
  ${typography()}
  input::-ms-reveal,
  input::-ms-clear {
    display: none;
  }

  input[type='search'] {
    padding-right: 30px;
  }

  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  :host {
    flex-direction: column;
  }

  :host(:focus-visible) {
    outline: none;
  }

  .label,
  .description {
    padding-bottom: ${spacing1};
  }

  .root {
    position: relative;
    display: flex;
    align-items: center;
    z-index: 0;
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    font-weight: ${fontWeightBody1};
    line-height: ${lineHeightBody1};
  }

  .root-container {
    display: inline-flex;
    align-items: stretch;
    position: relative;
    z-index: 0;
    width: 100%;
  }

  :host([type='password']) input,
  :host([slotted]) input {
    padding-right: 40px;
  }

  :host([optional]) input {
    padding-right: 95px;
  }

  :host([optional][type='password']) input {
    padding-right: 130px;
  }

  .optional-text {
    display: flex;
    position: relative;
    align-self: center;
    font-size: 12px;
    font-style: italic;
    font-weight: normal;
    color: ${themeConditional(paletteGrayDark1, paletteGrayBase)};
  }

  :host([optional][type='password']) .optional-text {
    margin-right: 30px;
  }

  :host([disabled]) {
    cursor: not-allowed;
  }

  .end,
  ::slotted(span[slot='end']) {
    position: absolute;
    display: flex;
    right: 12px;
    z-index: 1;
    color: ${themeConditional(paletteBlack, paletteGrayLight3)};
  }

  .end svg {
    width: 16px;
    height: 16px;
  }

  input {
    border-radius: 4px;
    width: 100%;
    height: 36px;
    padding: 0 12px;
    z-index: 1;
    outline: none;
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
    border: 1px solid ${themeConditional(paletteGrayBase)};
    color: ${themeConditional(paletteBlack, paletteGrayLight3)};
    text-transform: inherit;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
  }

  input::placeholder {
    color: ${themeConditional(
      paletteGrayLight1,
      darken(paletteGrayLight1, 60)
    )};
  }

  :host(.error:not([disabled])) input {
    border-color: ${themeConditional(paletteRedBase, paletteRedLight1)};
    padding-right: 30px;
  }

  :host(.error) .end,
  :host(.error) ::slotted(span[slot='end']) {
    color: ${themeConditional(paletteRedBase, paletteRedLight1)};
  }

  :host(.valid:not([disabled])) input {
    border-color: ${themeConditional(paletteGreenDark1)};
    padding-right: 30px;
  }

  :host(.valid) .end,
  :host(.valid) ::slotted(span[slot='end']) {
    color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  input:hover {
    border-color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  input.control:focus,
  input.control:focus-visible {
    border-color: ${themeConditional(paletteBlueLight1)};
  }

  :host([disabled]) input {
    color: ${themeConditional(paletteGrayBase, paletteGrayDark1)};
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark3)};
    border-color: ${themeConditional(paletteGrayLight1, paletteGrayDark1)};
    cursor: not-allowed;
  }

  :host([disabled]) input::placeholder {
    color: ${themeConditional(paletteGrayLight1, paletteGrayBase)};
  }

  .helper {
    font-family: ${bodyFont};
    text-transform: none;
    min-height: 20px;
    padding-top: ${spacing1};
  }

  :host(.error) .helper {
    color: ${themeConditional(paletteRedBase, paletteRedLight1)};
  }

  .show-password {
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight1)};
    cursor: pointer;
  }

  .show-password > span {
    display: flex;
    align-items: center;
  }
`;

export class TextField extends PPPAppearanceElement {
  @attr
  value;

  @attr({ mode: 'boolean' })
  disabled;

  @attr
  name;

  @attr({ attribute: 'readonly', mode: 'boolean' })
  readOnly;

  @attr({ mode: 'boolean' })
  autofocus;

  @attr
  placeholder;

  @attr
  type;

  @attr
  list;

  @attr({ converter: nullableNumberConverter })
  maxlength;

  @attr({ converter: nullableNumberConverter })
  minlength;

  @attr
  pattern;

  @attr({ converter: nullableNumberConverter })
  size;

  @attr({ mode: 'boolean' })
  spellcheck;

  @attr({ mode: 'boolean' })
  optional;

  @attr
  autocomplete;

  @attr({ converter: nullableNumberConverter })
  min;

  @attr({ converter: nullableNumberConverter })
  max;

  @attr({ converter: nullableNumberConverter })
  precision;

  @attr({ converter: nullableNumberConverter })
  step;

  @observable
  passwordVisible;

  @observable
  defaultSlottedNodes;

  constructor() {
    super();

    this.passwordVisible = false;
    this.value = '';
    this.type = 'text';
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.autofocus) {
      Updates.queueUpdate(() => {
        this.focus();
      });
    }
  }

  togglePasswordVisibility() {
    if (this.control.type === 'password') {
      this.control.type = 'text';
      this.passwordVisible = true;
    } else {
      this.control.type = 'password';
      this.passwordVisible = false;
    }
  }

  handleTextInput() {
    this.value = this.control.value ?? '';

    if (this.value && this.appearance === 'error') {
      this.appearance = 'default';
    }
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
   */
  handleChange() {
    this.$emit('change');
  }
}

applyMixins(TextField, ARIAGlobalStatesAndProperties);

export default TextField.compose({
  template: textFieldTemplate,
  styles: textFieldStyles,
  shadowOptions: {
    delegatesFocus: true
  }
}).define();
