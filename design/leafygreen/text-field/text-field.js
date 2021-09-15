import { TextField as FoundationTextField } from '../../../lib/text-field/text-field.js';
import { html } from '../../../lib/element/templating/template.js';
import { ref } from '../../../lib/element/templating/ref.js';
import {
  endSlotTemplate,
  startSlotTemplate
} from '../../../lib/patterns/start-end.js';
import { css } from '../../../lib/element/styles/css.js';
import { display } from '../../../lib/utilities/style/display.js';

import { bodyFont } from '../design-tokens.js';

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
        ${endSlotTemplate(context, definition)}
      </div>
    </div>
  </template>
`;

// TODO - design tokens
export const textFieldStyles = (context, definition) => css`
  ${display('flex')}

  :host {
    flex-direction: column;
  }

  :host(:focus-visible) {
    outline: none;
  }

  .label {
    font-size: 14px;
    font-weight: bold;
    line-height: 16px;
    padding-bottom: 4px;
    color: rgb(61, 79, 88);
  }

  .description {
    font-size: 14px;
    line-height: 16px;
    font-weight: normal;
    padding-bottom: 4px;
    margin-top: 0;
    margin-bottom: 0;
    color: rgb(93, 108, 116);
  }

  .root {
    position: relative;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    z-index: 0;
  }

  .root-container {
    display: inline-flex;
    -webkit-box-align: stretch;
    align-items: stretch;
    position: relative;
    z-index: 0;
    width: 100%;
  }

  input {
    width: 100%;
    height: 36px;
    border-radius: 4px;
    padding-left: 12px;
    font-size: 14px;
    font-weight: normal;
    border: 1px solid rgb(137, 151, 155);
    transition: border-color 150ms ease-in-out 0s;
    z-index: 1;
    outline: none;
    color: rgb(33, 49, 60);
    background-color: rgb(255, 255, 255);
    padding-right: 12px;
    font-family: ${bodyFont};
  }
`;

export class TextField extends FoundationTextField {}

/**
 *
 * @public
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus | delegatesFocus}
 */
export const textField = TextField.compose({
  baseName: 'text-field',
  template: textFieldTemplate,
  styles: textFieldStyles,
  shadowOptions: {
    delegatesFocus: true
  }
});
