import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  instrumentsWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/instruments-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const instrumentsWidgetStyles = (context, definition) => css`
    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: instrumentsWidgetTemplate,
    styles: instrumentsWidgetStyles,
    shadowOptions: null
  });
}
