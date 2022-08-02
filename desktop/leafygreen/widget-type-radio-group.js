import { RadioGroup, radioGroupTemplate } from '../../shared/radio-group.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont } from './design-tokens.js';
import { requireComponent } from '../../shared/template.js';

await requireComponent(
  'ppp-widget-type-radio'
);

export const widgetTypeRadioGroupStyles = (context, definition) => css`
  ${display('flex')} :host {
    font-family: ${bodyFont};
    margin: 0 auto;
    flex-direction: column;
  }

  .positioning-region {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 20px;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default RadioGroup.compose({
  baseName: 'widget-type-radio-group',
  template: radioGroupTemplate,
  styles: widgetTypeRadioGroupStyles
});
