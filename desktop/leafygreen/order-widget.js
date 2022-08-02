import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import { orderWidgetTemplate, widgetData } from '../../shared/order-widget.js';

export async function widget({ ppp, baseWidgetUrl }) {
  const orderWidgetStyles = (context, definition) => css`
    ${widgetStyles}
  `;

  return widgetData({
    template: orderWidgetTemplate,
    styles: orderWidgetStyles
  });
}
