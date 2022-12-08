/** @decorator */

import { attr } from '../../shared/element/components/attributes.js';
import { Button } from '../../shared/button.js';
import { css } from '../../shared/element/styles/css.js';
import {
  buttonTemplate,
  baseButtonStyles,
  disabledButtonStyles
} from './button.js';
import { appearanceBehavior } from '../../shared/utilities/behaviors.js';

export const successWidgetButtonStyles = (context, definition) => css`
  :host([appearance='success']) .control {
    background-color: #0bb06d;
  }

  :host([appearance='success']) .control:hover,
  :host([appearance='success']) .control:active {
    background-color: #13c17b;
  }
`;

export const dangerWidgetButtonStyles = (context, definition) => css`
  :host([appearance='danger']) .control {
    background-color: #d53645;
  }

  :host([appearance='danger']) .control:hover,
  :host([appearance='danger']) .control:active {
    background-color: #ec4756;
  }
`;

export const widgetButtonStyles = (context, definition) =>
  css`
    ${baseButtonStyles(context, definition)}
    ${disabledButtonStyles(context, definition)}
    .control {
      width: 100%;
      height: 32px;
      font-size: 12px;
      line-height: 32px;
      border-radius: 4px;
      color: #ffffff;
    }

    .content-container {
      padding: 0 4px;
    }
  `.withBehaviors(
    appearanceBehavior(
      'success',
      successWidgetButtonStyles(context, definition)
    ),
    appearanceBehavior('danger', dangerWidgetButtonStyles(context, definition))
  );

export class WidgetButton extends Button {
  @attr
  appearance;

  appearanceChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this.classList.add(newValue);
      this.classList.remove(oldValue);
    }
  }

  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();

    if (!this.appearance) {
      this.appearance = 'success';
    }
  }
}

export default WidgetButton.compose({
  template: buttonTemplate,
  styles: widgetButtonStyles,
  shadowOptions: {
    delegatesFocus: true
  }
});
