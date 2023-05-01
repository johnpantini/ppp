/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import {
  attr,
  css,
  html,
  when,
  nullableNumberConverter
} from '../vendor/fast-element.min.js';
import { display } from '../vendor/fast-utilities.js';
import { normalize } from '../design/styles.js';
import {
  paletteBlueDark2,
  paletteBlueLight2,
  themeConditional
} from '../design/design-tokens.js';

export const progressTemplate = html`
  <template
    role="progressbar"
    aria-valuenow="${(x) => x.value}"
    aria-valuemin="${(x) => x.min}"
    aria-valuemax="${(x) => x.max}"
    class="${(x) => (x.paused ? 'paused' : '')}"
  >
    ${when(
      (x) => typeof x.value === 'number',
      html`
        <div class="progress" part="progress" slot="determinate">
          <div
            class="determinate"
            part="determinate"
            style="width: ${(x) => x.value}%"
          ></div>
        </div>
      `
    )}
  </template>
`;

export const progressStyles = css`
  ${normalize()}
  ${display('inline-flex')}
  .determinate {
    overflow: hidden;
    height: 4px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background-color: ${themeConditional(paletteBlueLight2, paletteBlueDark2)};
    background-image: linear-gradient(
      90deg,
      ${themeConditional(paletteBlueLight2, paletteBlueDark2)} 0px,
      ${themeConditional(paletteBlueDark2, paletteBlueLight2)} 200px,
      ${themeConditional(paletteBlueLight2, paletteBlueDark2)} 400px
    );
    background-size: 600px;
    animation: 4s linear 0s infinite normal none running indeterminate;
    transition: width 0.3s ease-in-out 0s;
  }

  @keyframes indeterminate {
    0% {
      background-position: -400px;
    }

    100% {
      background-position: 800px;
    }
  }
`;

export class Progress extends PPPElement {
  @attr({ converter: nullableNumberConverter })
  value;

  @attr({ converter: nullableNumberConverter })
  min;

  @attr({ converter: nullableNumberConverter })
  max;

  @attr({ mode: 'boolean' })
  paused;
}

export default Progress.compose({
  template: progressTemplate,
  styles: progressStyles
}).define();
