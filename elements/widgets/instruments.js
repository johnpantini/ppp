/** @decorator */

import {
  widget,
  widgetEmptyStateTemplate,
  WidgetWithInstrument
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
import { TRADER_CAPS, TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import { normalize, spacing } from '../../design/styles.js';
import { validate } from '../../lib/ppp-errors.js';

export const instrumentsWidgetTemplate = html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <ppp-widget-group-control></ppp-widget-group-control>
          <ppp-widget-search-control></ppp-widget-search-control>
          <span class="widget-title">
            <span class="title">${(x) => x.document?.name ?? ''}</span>
          </span>
          <ppp-widget-header-buttons></ppp-widget-header-buttons>
        </div>
      </div>
      <div class="widget-body">
        ${when(
          (x) => !x.instrument,
          html`${html.partial(
            widgetEmptyStateTemplate('Выберите инструмент.')
          )}`
        )}
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const instrumentsWidgetStyles = css`
  ${normalize()}
  ${widget()}
  ${spacing()}
`;

export class InstrumentsWidget extends WidgetWithInstrument {}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.INSTRUMENTS,
    collection: 'PPP',
    title: html`Список инструментов`,
    description: html`Виджет
      <span class="positive">Список инструментов</span> позволяет настраивать
      списки торговых инструментов с различными данными.`,
    customElement: InstrumentsWidget.compose({
      template: instrumentsWidgetTemplate,
      styles: instrumentsWidgetStyles
    }).define(),
    defaultWidth: 600,
    minHeight: 120,
    minWidth: 140
  };
}
