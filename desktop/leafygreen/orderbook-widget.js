import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  orderbookWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/orderbook-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const orderbookWidgetStyles = (context, definition) => css`
    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: orderbookWidgetTemplate,
    styles: orderbookWidgetStyles,
    shadowOptions: null
  });
}
