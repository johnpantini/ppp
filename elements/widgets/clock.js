/** @decorator */

import ppp from '../../ppp.js';
import { widgetStyles, Widget } from '../widget.js';
import { html, css, ref, observable } from '../../vendor/fast-element.min.js';
import { WIDGET_TYPES } from '../../lib/const.js';
import { formatDateWithOptions } from '../../lib/intl.js';
import { normalize } from '../../design/styles.js';
import '../button.js';
import '../checkbox.js';
import '../radio-group.js';
import '../text-field.js';
import '../widget-controls.js';

await ppp.i18n(import.meta.url);

export const clockWidgetTemplate = html`
  <template ensemble="disabled">
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <span class="widget-title">
            <span class="title">
              ${(x) =>
                x.document?.displayTimeInHeader ?? true
                  ? x.time
                  : x.document?.name}
            </span>
          </span>
          <ppp-widget-header-buttons
            ensemble="disabled"
          ></ppp-widget-header-buttons>
        </div>
      </div>
      <div class="widget-body"></div>
      <ppp-widget-resize-controls
        :ignoredHandles="${(x) => ['top', 'bottom', 'ne', 'se', 'nw', 'sw']}"
      ></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const clockWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
  .widget-header::after {
    border-bottom: none;
  }
`;

export class ClockWidget extends Widget {
  @observable
  time;

  options;

  constructor() {
    super();

    this.rafLoop = this.rafLoop.bind(this);
  }

  rafLoop() {
    if (this.$fastController.isConnected) {
      this.time = formatDateWithOptions(new Date(), this.options);
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this.options = {
      default: {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      },
      'day-1': {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      },
      compact: {
        hour: 'numeric',
        minute: 'numeric'
      },
      'day-2': {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    }[this.document.headerTimeFormat ?? 'default'];

    ppp.app.rafEnqueue(this.rafLoop);
  }

  disconnectedCallback() {
    ppp.app.rafDequeue(this.rafLoop);
    super.disconnectedCallback();
  }

  async validate() {}

  async submit() {
    return {
      $set: {
        displayTimeInHeader: this.container.displayTimeInHeader.checked,
        headerTimeFormat: this.container.headerTimeFormat.value
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.CLOCK,
    collection: 'PPP',
    title: html`${() => ppp.t(`$const.widget.${WIDGET_TYPES.CLOCK}`)}`,
    description: html`${() => ppp.t('$clockWidget.descriptionBeforeName')}
      <span class="positive">
        ${() => ppp.t(`$const.widget.${WIDGET_TYPES.CLOCK}`)}
      </span>
      ${() => ppp.t('$clockWidget.descriptionAfterName')}`,
    customElement: ClockWidget.compose({
      template: clockWidgetTemplate,
      styles: clockWidgetStyles
    }).define(),
    minWidth: 115,
    minHeight: 32,
    defaultWidth: 150,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>${() => ppp.t('$clockWidget.interface')}</h5>
        </div>
        <div class="spacing2"></div>
        <ppp-checkbox
          ?checked="${(x) => x.document.displayTimeInHeader ?? true}"
          ${ref('displayTimeInHeader')}
        >
          ${() => ppp.t('$clockWidget.displayTimeInHeader')}
        </ppp-checkbox>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>${() => ppp.t('$clockWidget.headerTimeFormat')}</h5>
        </div>
        <div class="spacing2"></div>
        <div class="widget-settings-input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.headerTimeFormat ?? 'default'}"
            ${ref('headerTimeFormat')}
          >
            <ppp-radio value="default">
              ${() => ppp.t('$clockWidget.formats.default')}
            </ppp-radio>
            <ppp-radio value="day-1">
              ${() => ppp.t('$clockWidget.formats.day1')}
            </ppp-radio>
            <ppp-radio value="compact">
              ${() => ppp.t('$clockWidget.formats.compact')}
            </ppp-radio>
            <ppp-radio value="day-2">
              ${() => ppp.t('$clockWidget.formats.day2')}
            </ppp-radio>
          </ppp-radio-group>
        </div>
      </div>
    `
  };
}
