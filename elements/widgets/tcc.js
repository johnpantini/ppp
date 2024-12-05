/** @decorator */

import ppp from '../../ppp.js';
import {
  widgetStyles,
  Widget,
  widgetDefaultHeaderTemplate,
  widgetStackSelectorTemplate,
  widgetCommonContentStyles
} from '../widget.js';
import {
  html,
  css,
  ref,
  when,
  observable,
  repeat,
  Observable,
  attr
} from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import { TRADER_CAPS, TRADERS, WIDGET_TYPES } from '../../lib/const.js';
import {
  ClonableList,
  clonableListStyles,
  defaultDragEndHandler,
  dragControlsTemplate
} from '../clonable-list.js';
import { normalize, getTraderSelectOptionColor } from '../../design/styles.js';
import { PPPElement } from '../../lib/ppp-element.js';
import { formatDate } from '../../lib/intl.js';
import { fontWeightWidget } from '../../design/design-tokens.js';
import { disconnect, trash } from '../../static/svg/sprite.js';
import '../button.js';
import '../checkbox.js';
import '../radio-group.js';
import '../text-field.js';
import '../widget-controls.js';

await ppp.i18n(import.meta.url);

export const tccWidgetTraderListTemplate = html`
  <template>
    <ppp-draggable-stack
      style="flex-flow: row wrap; gap: 24px 16px;"
      @pppdragend="${(x) => defaultDragEndHandler(x)}"
      ${ref('dragList')}
    >
      ${repeat(
        (x) => x.list,
        html`
          <div
            class="control-line draggable draggable-line"
            style="align-items: center"
          >
            ${dragControlsTemplate({})}
            <ppp-query-select
              trader-id
              deselectable
              standalone
              ?disabled="${(x) => x.hidden}"
              value="${(x) => x.traderId}"
              :preloaded="${(x, c) => {
                return c.parent?.traders?.find((t) => t._id === x.traderId);
              }}"
              placeholder="Трейдер"
              variant="compact"
              :context="${(x) => x}"
              :displayValueFormatter="${() => (item) =>
                html`
                  <span style="color:${getTraderSelectOptionColor(item)}">
                    ${item?.name}
                  </span>
                `}"
              :query="${() => {
                return (context) => {
                  return context.services
                    .get('mongodb-atlas')
                    .db('ppp')
                    .collection('traders')
                    .find({ removed: { $ne: true } })
                    .sort({ updatedAt: -1 });
                };
              }}"
              :transform="${() => ppp.decryptDocumentsTransformation()}"
            ></ppp-query-select>
          </div>
        `
      )}
    </ppp-draggable-stack>
  </template>
`;

export class TccWidgetTraderList extends ClonableList {
  async validate() {
    for (const field of Array.from(
      this.dragList.querySelectorAll('[trader-id]')
    )) {
      await validate(field);
    }
  }

  get value() {
    const result = [];

    for (const line of Array.from(
      this.dragList.querySelectorAll('.draggable-line')
    )) {
      result.push({
        traderId: line.querySelector('[trader-id]').value,
        hidden: !line.querySelector('[visibility-toggle]').checked
      });
    }

    return result;
  }
}

export const tccWidgetCardTemplate = html`
  <template>
    <ppp-widget-card runtime="${(x) => x.trader.runtime}">
      <div slot="indicator" class="${(x) => x.getIndicatorClass()}"></div>
      <div
        slot="icon"
        style="${(x) => `background-image:url(${x.getIconUrl()})`}"
      ></div>
      <span slot="title-left">${(x) => x.trader.name}</span>
      <span slot="title-right">
        <span status-text class="${(x) => x.getStatusClass()}">
          ${(x) => x.getStatusText()}
        </span>
      </span>
      <span slot="subtitle-left">
        ${(x) => ppp.t(`$const.trader.${x.trader.type}`)}
      </span>
      <div slot="subtitle-right">
        ${(x) =>
          x.serialized?.createdAt
            ? formatDate(new Date(x.serialized.createdAt))
            : 'Идёт запрос...'}
      </div>
      ${when(
        (x) => x.trader.runtime === 'shared-worker',
        html`
          <button
            class="widget-action-button"
            slot="actions"
            @click="${async (x, c) => {
              c.event.preventDefault();
              c.event.stopPropagation();

              x.widget.topLoader.start();

              try {
                await x.traderRuntime?.terminate();

                x.status = 'terminated';
              } finally {
                x.widget.topLoader.stop();
              }
            }}"
          >
            <span>${html.partial(disconnect)}</span>
          </button>
        `
      )}
      ${when(
        (x) => x.trader.caps?.includes?.(TRADER_CAPS.CAPS_PAPER),
        html`
          <button
            title="Выполнить сброс"
            class="widget-action-button"
            slot="actions"
            @click="${async (x, c) => {
              c.event.preventDefault();
              c.event.stopPropagation();

              x.widget.topLoader.start();

              try {
                await x.traderRuntime?.call({
                  method: 'clear'
                });
              } finally {
                x.widget.topLoader.stop();
              }
            }}"
          >
            <span>${html.partial(trash)}</span>
          </button>
        `
      )}
    </ppp-widget-card>
  </template>
`;

export const tccWidgetCardStyles = css`
  ${widgetCommonContentStyles()}
  [status-text] {
    font-weight: ${fontWeightWidget};
  }
`;

export class TccWidgetCard extends PPPElement {
  @attr
  status;

  getStatusText() {
    if (this.status === 'terminated') {
      return 'Остановлен';
    }

    return 'Нет статуса';
  }

  @observable
  trader;

  traderRuntime;

  @observable
  serialized;

  widget;

  async connectedCallback() {
    super.connectedCallback();

    try {
      this.widget = this.getRootNode().host;
      this.traderRuntime = await ppp.getOrCreateTrader(this.trader);
      this.serialized = await this.traderRuntime.serialize();
    } catch (e) {
      return this.widget.catchException(e);
    }
  }

  getIconUrl() {
    switch (this.trader.type) {
      case TRADERS.ALPACA_V2_PLUS:
        return ppp.brandSvg('alpaca-small');

      case TRADERS.TINKOFF_GRPC_WEB:
        return ppp.brandSvg('tinkoff');

      default:
        return 'static/svg/custom-trader.svg';
    }
  }

  getIndicatorClass() {
    if (this.status === 'terminated') {
      return 'negative';
    }

    switch (this.trader.runtime) {
      case 'main-thread':
        return 'ocean';
      case 'shared-worker':
        return 'earth';
      case 'url':
        return 'alien';
    }
  }

  getStatusClass() {
    if (this.status === 'terminated') {
      return 'negative';
    }

    return '';
  }
}

export const tccWidgetTemplate = html`
  <template ensemble="disabled">
    <div class="widget-root">
      ${widgetDefaultHeaderTemplate()}
      <div class="widget-body">
        ${widgetStackSelectorTemplate()}
        <div class="widget-toolbar">
          <div class="tabs">
            <ppp-widget-box-radio-group
              class="trader-type-selector"
              @change="${(x) => x.handleTraderTypeChange()}"
              value="${(x) => x.document.activeTab ?? 'all'}"
              ${ref('traderTypeSelector')}
            >
              <ppp-widget-box-radio value="all">Все</ppp-widget-box-radio>
              <ppp-widget-box-radio value="main-thread">
                <span class="ocean">MainThread</span>
              </ppp-widget-box-radio>
              <ppp-widget-box-radio value="shared-worker">
                <span class="earth">SharedWorker</span>
              </ppp-widget-box-radio>
              <ppp-widget-box-radio value="url">
                <span class="alien">URL</span>
              </ppp-widget-box-radio>
            </ppp-widget-box-radio-group>
          </div>
        </div>
        <div class="widget-card-list">
          <ppp-widget-empty-state-control ?hidden="${(x) => x?.traders.length}">
            ${() => 'Нет трейдеров для отображения.'}
          </ppp-widget-empty-state-control>
          ${when(
            (x) => x?.traders.length,
            html`
              ${repeat(
                (x) => x?.traders ?? [],
                html`
                  <div class="widget-card-holder">
                    <div class="widget-card-holder-inner">
                      <ppp-tcc-widget-card
                        :trader=${(x) => x}
                      ></ppp-tcc-widget-card>
                    </div>
                  </div>
                `
              )}
            `
          )}
        </div>
      </div>
      <ppp-widget-notifications-area></ppp-widget-notifications-area>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const tccWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
  .tabs {
    padding: 0 8px 8px 8px;
  }

  .buttons {
    padding: 0 0 8px 8px;
    display: flex;
    gap: 0 4px;
  }

  .tabs ppp-widget-box-radio-group:not([hidden]) {
    margin-top: 10px;
  }

  .widget-card-list {
    display: flex;
    flex-direction: column;
    top: 0;
    gap: 8px;
  }
`;

export class TccWidget extends Widget {
  @observable
  traders;

  constructor() {
    super();

    this.traders = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    return this.#adjustTraders();
  }

  async #adjustTraders() {
    this.traders = [];

    const activeTab = this.traderTypeSelector.value;

    for (const { traderId, hidden } of this.document?.traderList ?? []) {
      if (hidden || !traderId) {
        continue;
      }

      const trader = await this.container.denormalization.denormalize(
        this.document.traders.find((t) => t._id === traderId)
      );

      if (activeTab !== 'all') {
        if (activeTab !== trader.runtime) {
          continue;
        }
      }

      this.traders.push(trader);
    }

    Observable.notify(this, 'traders');
  }

  async handleTraderTypeChange() {
    this.document.activeTab = this.traderTypeSelector.value;

    await this.#adjustTraders();

    return this.updateDocumentFragment({
      $set: {
        'widgets.$.activeTab': this.document.activeTab
      }
    });
  }

  async validate() {
    await this.container.traderList.validate();
  }

  async submit() {
    return {
      $set: {
        traderList: this.container.traderList.value
      }
    };
  }
}

export default {
  TccWidgetTraderListComposition: TccWidgetTraderList.compose({
    template: tccWidgetTraderListTemplate,
    styles: clonableListStyles
  }).define(),
  TccWidgetCardComposition: TccWidgetCard.compose({
    template: tccWidgetCardTemplate,
    styles: tccWidgetCardStyles
  }).define()
};

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.TCC,
    collection: 'PPP',
    title: html`Управление трейдерами`,
    description: html`Виджет
      <span class="positive">Управление трейдерами</span> служит для просмотра
      информации о трейдерах приложения и взаимодействия с ними.`,
    customElement: TccWidget.compose({
      template: tccWidgetTemplate,
      styles: tccWidgetStyles
    }).define(),
    defaultWidth: 310,
    minHeight: 120,
    minWidth: 140,
    defaultHeight: 350,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Cписок трейдеров</h5>
        </div>
        <div class="spacing2"></div>
        <ppp-tcc-widget-trader-list
          ${ref('traderList')}
          :stencil="${() => {
            return {
              traderId: void 0
            };
          }}"
          :list="${(x) =>
            x.document.traderList ?? [
              {
                traderId: void 0
              }
            ]}"
          :traders="${(x) => x.document.traders}"
        ></ppp-tcc-widget-trader-list>
      </div>
    `
  };
}
