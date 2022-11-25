import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  timelineWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/timeline-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const timelineWidgetStyles = (context, definition) => css`
    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: timelineWidgetTemplate,
    styles: timelineWidgetStyles,
    shadowOptions: null
  });
}
