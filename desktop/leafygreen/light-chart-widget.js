import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  lightweightChartWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/light-chart-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const lightweightChartWidgetStyles = (context, definition) => css`
    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: lightweightChartWidgetTemplate,
    styles: lightweightChartWidgetStyles,
    shadowOptions: null
  });
}
