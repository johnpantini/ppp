import { html, when, css } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { Column, columnStyles as baseColumnStyles } from './column.js';
import {
  fontSizeWidget,
  fontWeightWidget,
  lineHeightWidget,
  paletteBlack,
  paletteGrayBase,
  paletteGrayLight1,
  paletteGrayLight2,
  themeConditional
} from '../../../design/design-tokens.js';
import { ellipsis } from '../../../design/styles.js';
import { currencyName } from '../../../lib/intl.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`
        <div class="logo-with-name capitalize">
          <div
            class="logo"
            style="${(cell) =>
              `background-image:url(${
                'static/currency/' + cell.datum?.symbol + '.svg'
              })`}"
          ></div>
          <div class="name">${(cell) => currencyName(cell.datum?.symbol)}</div>
        </div>
      `
    )}
    ${when(
      (x) => !x.isBalance,
      html`
        <div class="logo-with-name capitalize">
          <div
            class="logo"
            style="${(cell) =>
              `background-image:url(${cell.widget?.searchControl?.getInstrumentIconUrl(
                cell.datum?.instrument
              )})`}"
          ></div>
          <div class="name">
            ${(cell) =>
              cell.datum?.instrument?.fullName ??
              cell.datum?.instrument?.symbol}
          </div>
        </div>
      `
    )}
  </template>
`;

export const columnStyles = css`
  ${baseColumnStyles}
  .logo-with-name {
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    font-weight: ${fontWeightWidget};
    display: flex;
    align-items: center;
    width: 100%;
    letter-spacing: 0;
  }

  .logo {
    min-width: 20px;
    min-height: 20px;
    height: 20px;
    width: 20px;
    padding: 2px;
    border-radius: 50%;
    background-size: 100%;
    margin-right: 10px;
    color: ${themeConditional(paletteGrayLight1, paletteBlack)};
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayBase)};
  }

  .name {
    opacity: 1;
    width: 100%;
    text-align: left;
    ${ellipsis()};
  }
`;

// noinspection JSVoidFunctionReturnValueUsed
export default (class extends Column {}
  .compose({
    name: `ppp-${uuidv4()}`,
    template: columnTemplate,
    styles: columnStyles
  })
  .define());
