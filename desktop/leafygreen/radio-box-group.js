import { RadioGroup, radioGroupTemplate } from '../../shared/radio-group.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont } from './design-tokens.js';
import { requireComponent } from '../../shared/template.js';

await requireComponent(
  'ppp-box-radio'
);

export const radioBoxGroupStyles = (context, definition) => css`
  ${display('flex')} :host {
    font-family: ${bodyFont};
    margin: 0 auto;
    flex-direction: column;
  }

  .positioning-region {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default RadioGroup.compose({
  baseName: 'radio-box-group',
  template: radioGroupTemplate,
  styles: radioBoxGroupStyles
});
