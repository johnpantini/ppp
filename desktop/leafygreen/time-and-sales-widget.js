import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  timeAndSalesWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/time-and-sales-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const timeAndSalesWidgetStyles = (context, definition) => css`
    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: timeAndSalesWidgetTemplate,
    styles: timeAndSalesWidgetStyles,
    shadowOptions: null
  });
}
