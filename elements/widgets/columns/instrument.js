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
            style="${(x) =>
              `background-image:url(${
                'static/currency/' + x.payload?.symbol + '.svg'
              })`}"
          ></div>
          <div class="name">${(x) => currencyName(x.payload?.symbol)}</div>
        </div>
      `,
      html`
        <div class="logo-with-name capitalize" title="${(x) => x.value}">
          <div
            class="logo"
            style="${(x) =>
              `background-image:url(${x.getInstrumentIconUrl(
                x.payload?.instrument
              )})`}"
          ></div>
          <div class="name">${(x) => x.value}</div>
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
    gap: 0 8px;
    width: 100%;
    letter-spacing: 0;
  }

  .logo {
    min-width: 14px;
    min-height: 14px;
    height: 14px;
    width: 14px;
    padding: 2px;
    border-radius: 50%;
    background-size: 100%;
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
export default (class extends Column {
  get value() {
    return this.payload?.instrument?.fullName ?? this.payload?.symbol;
  }

  getInstrumentIconUrl(instrument) {
    let url = '';

    if (this.defaultTrader) {
      url = this.defaultTrader.getInstrumentIconUrl?.(instrument);
    } else if (this.widget) {
      url = this.widget.instrumentTrader?.getInstrumentIconUrl?.(instrument);
    }

    return url || 'static/instruments/unknown.svg';
  }
}
  .compose({
    name: `ppp-${uuidv4()}`,
    template: columnTemplate,
    styles: columnStyles
  })
  .define());
