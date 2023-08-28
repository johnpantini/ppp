/** @decorator */

import {
  widgetStyles,
  widgetEmptyStateTemplate,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate,
  widgetWithInstrumentBodyTemplate
} from '../widget.js';
import {
  html,
  css,
  when,
  ref,
  repeat,
  observable,
  Observable
} from '../../vendor/fast-element.min.js';
import { WIDGET_TYPES, TRADER_DATUM, TRADER_CAPS } from '../../lib/const.js';
import {
  priceCurrencySymbol,
  formatQuantity,
  formatDate,
  formatPriceWithoutCurrency
} from '../../lib/intl.js';
import { ellipsis, normalize } from '../../design/styles.js';
import {
  buy,
  fontSizeWidget,
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark4,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteWhite,
  sell,
  themeConditional,
  toColorComponents,
  lighten,
  lineHeightWidget
} from '../../design/design-tokens.js';
import { Tmpl } from '../../lib/tmpl.js';
import { AsyncFunction } from '../../vendor/fast-utilities.js';
import { invalidate, validate, ValidationError } from '../../lib/ppp-errors.js';
import '../button.js';
import '../query-select.js';
import '../snippet.js';
import '../text-field.js';
import '../widget-controls.js';

export const listWidgetTemplate = html`
  <template>
    <div class="widget-root">
      ${widgetDefaultHeaderTemplate()}
      <div class="widget-body">
        ${widgetWithInstrumentBodyTemplate(html` <div></div> `)}
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const listWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
`;

export class ListWidget extends WidgetWithInstrument {
  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
  }

  async validate() {}

  async submit() {
    return {
      $set: {}
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.LIST,
    collection: 'PPP',
    title: html`Список`,
    description: html`<span class="positive">Список</span> позволяет создавать
      листинги инструментов и любых других данных, которые можно оформить в
      таблицу.`,
    customElement: ListWidget.compose({
      template: listWidgetTemplate,
      styles: listWidgetStyles
    }).define(),
    minWidth: 275,
    minHeight: 120,
    defaultWidth: 620
  };
}
