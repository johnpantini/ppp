import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  scalpingButtonsWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/scalping-buttons-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const scalpingButtonsWidgetStyles = (context, definition) => css`
    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: scalpingButtonsWidgetTemplate,
    styles: scalpingButtonsWidgetStyles,
    shadowOptions: null
  });
}
