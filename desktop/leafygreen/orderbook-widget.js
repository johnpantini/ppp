import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import { orderbookWidgetTemplate, widgetData } from '../../shared/orderbook-widget.js';

export async function widget({ ppp, baseWidgetUrl }) {
  const orderbookWidgetStyles = (context, definition) => css`
    ${widgetStyles}
  `;

  return widgetData({
    template: orderbookWidgetTemplate,
    styles: orderbookWidgetStyles
  });
}
