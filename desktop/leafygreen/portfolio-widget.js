import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  portfolioWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/portfolio-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const portfolioWidgetStyles = (context, definition) => css`
    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: portfolioWidgetTemplate,
    styles: portfolioWidgetStyles,
    shadowOptions: null
  });
}
