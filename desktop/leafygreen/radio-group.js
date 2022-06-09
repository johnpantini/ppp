import { RadioGroup, radioGroupTemplate } from '../../shared/radio-group.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { designUnit } from './design-tokens.js';

export const radioGroupStyles = (context, definition) => css`
  ${display('flex')} :host {
    align-items: flex-start;
    margin: calc(${designUnit} * 1px) 0;
    flex-direction: column;
  }

  .positioning-region {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  :host([orientation='vertical']) .positioning-region {
    flex-direction: column;
  }

  :host([orientation='horizontal']) .positioning-region {
    flex-direction: row;
  }
`;

// noinspection JSUnusedGlobalSymbols
export const radioGroup = RadioGroup.compose({
  baseName: 'radio-group',
  template: radioGroupTemplate,
  styles: radioGroupStyles
});
