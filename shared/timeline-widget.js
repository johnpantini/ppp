/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html } from './template.js';
import {
  TIMELINE_OPERATION_TYPE,
  TRADER_DATUM,
  WIDGET_TYPES
} from './const.js';
import { validate } from './validate.js';
import { when } from './element/templating/when.js';
import { repeat } from './element/templating/repeat.js';
import { Observable, observable } from './element/observation/observable.js';
import { formatAmount, formatPrice, formatDateWithOptions } from './intl.js';
import { DOM } from './element/dom.js';
import ppp from '../ppp.js';

await ppp.i18n(import.meta.url);

export const timelineWidgetTemplate = (context, definition) => html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-instrument-area">
          <${'ppp-widget-group-control'}
            :widget="${(x) => x}"
            selection="${(x) => x.document?.group}"
            ${ref('groupControl')}
          ></ppp-widget-group-control>
          <div class="instrument-search-holder">
            <${'ppp-widget-search-control'}
              :widget="${(x) => x}"
              ${ref('searchControl')}
            ></ppp-widget-search-control>
          </div>
          <div class="widget-header-name"
               title="${(x) => x.document?.name ?? ''}">
            <span>${(x) => x.document?.name ?? ''}</span>
          </div>
          <div class="widget-header-controls">
            <img
              draggable="false"
              alt="Закрыть"
              class="widget-close-button"
              src="static/widgets/close.svg"
              @click="${(x) => x.close()}"
            />
          </div>
        </div>
      </div>
      <div class="widget-body">
        <div class="timeline-widget-item-list">
          ${when(
            (x) => x.isEmpty(),
            html`
              <div class="widget-empty-state-holder">
                <img draggable="false" src="static/empty-widget-state.svg" />
                <span>Нет операций.</span>
              </div>
            `
          )}
          <div class="timeline-widget-item-list-inner">
            ${repeat(
              (x) =>
                x.needsRefresh
                  ? []
                  : Array.from(x.timeline.keys()).sort(
                      (a, b) => new Date(b) - new Date(a)
                    ),
              html`
                ${when(
                  (x, c) => !c.parent.isEmpty() && !c.parent.isEmpty(x),
                  html` <div class="timeline-item-headline">
                    ${(i) =>
                      formatDateWithOptions(new Date(i), {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                  </div>`
                )}
                ${repeat(
                  (x, c) => c.parent.getCards(x),
                  html`
                    <div class="timeline-item-holder">
                      <div class="timeline-item-holder-inner">
                        <div
                          class="timeline-item-card ${(x, c) =>
                            c.parentContext.parent.getExtraCardClasses(x)}"
                        >
                          <div class="timeline-item-card-side-indicator"></div>
                          <div class="timeline-item-card-payload">
                            <div class="timeline-item-card-logo">
                              <div
                                style="${(x, c) =>
                                  c.parentContext.parent.getLogo(x)}"
                              ></div>
                              ${(x, c) =>
                                c.parentContext.parent.getLogoFallback(x)}
                            </div>
                            <div class="timeline-item-card-text">
                              <div class="timeline-item-card-text-name-price">
                                <div class="timeline-item-card-text-name">
                                  <span>
                                    <div>
                                      ${(x, c) =>
                                        c.parentContext.parent.formatCardTitle(
                                          x
                                        )}
                                    </div>
                                  </span>
                                </div>
                                <span
                                  class="${(x, c) =>
                                    c.parentContext.parent.getCardAmountExtraClasses(
                                      x
                                    )}"
                                >
                                  ${(x, c) =>
                                    c.parentContext.parent.formatCardAmount(x)}
                                </span>
                              </div>
                              <div class="timeline-item-card-text-side-rest">
                                <div>
                                  ${(x, c) =>
                                    c.parentContext.parent.formatCardDescription(
                                      x
                                    )}
                                </div>
                                <span>
                                  <div>
                                    ${(x) =>
                                      formatDateWithOptions(x[0].createdAt, {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                  </div>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `
                )}
              `
            )}
          </div>
        </div>
      </div>
    </div>
  </template>
`;

export class PppTimelineWidget extends WidgetWithInstrument {
  @observable
  timelineTrader;

  @observable
  timelineItem;

  @observable
  timeline;

  @observable
  emptyIndicator;

  @observable
  needsRefresh;

  constructor() {
    super();

    this.timeline = new Map();
    this.emptyIndicator = new Map();
  }

  async connectedCallback() {
    super.connectedCallback();

    this.timelineTrader = await ppp.getOrCreateTrader(
      this.document.timelineTrader
    );
    this.searchControl.trader = this.timelineTrader;

    if (this.timelineTrader) {
      await this.timelineTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          timelineItem: TRADER_DATUM.TIMELINE_ITEM
        }
      });
    }
  }

  async disconnectedCallback() {
    if (this.timelineTrader) {
      await this.timelineTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          print: TRADER_DATUM.TIMELINE_ITEM
        }
      });
    }

    super.disconnectedCallback();
  }

  instrumentChanged() {
    super.instrumentChanged();

    this.needsRefresh = true;

    DOM.queueUpdate(() => {
      this.needsRefresh = false;

      Observable.notify(this, 'timeline');
    });
  }

  getLogo(operations) {
    const [firstOperation] = operations;

    switch (firstOperation.type) {
      case TIMELINE_OPERATION_TYPE.BUY:
      case TIMELINE_OPERATION_TYPE.SELL:
        return firstOperation.instrument.isin
          ? `background-image:url(${
              'static/instruments/' + firstOperation.instrument.isin + '.svg'
            })`
          : '';

      default:
        return '';
    }
  }

  getLogoFallback(operations) {
    const [firstOperation] = operations;

    switch (firstOperation.type) {
      case TIMELINE_OPERATION_TYPE.BUY:
      case TIMELINE_OPERATION_TYPE.SELL:
        return (
          firstOperation.instrument.symbol?.[0] ?? firstOperation.symbol[0]
        );

      default:
        return '';
    }
  }

  formatCardAmount(operations) {
    const [firstOperation] = operations;

    let totalAmount = 0;
    let negative = false;

    for (const item of operations) {
      if (
        item.type === TIMELINE_OPERATION_TYPE.SELL ||
        item.type === TIMELINE_OPERATION_TYPE.BUY
      ) {
        if (item.type === TIMELINE_OPERATION_TYPE.BUY) negative = true;

        totalAmount += item.price * item.quantity;
      }
    }

    totalAmount *= firstOperation.instrument?.lot ?? 1;

    if (negative) totalAmount *= -1;

    return formatAmount(totalAmount, firstOperation.instrument?.currency);
  }

  getCardAmountExtraClasses(operations) {
    const [firstOperation] = operations;

    return firstOperation.type === TIMELINE_OPERATION_TYPE.SELL
      ? 'positive'
      : '';
  }

  formatCardTitle(operations) {
    const [firstOperation] = operations;

    let totalQuantity = 0;

    for (const item of operations) {
      if (
        item.type === TIMELINE_OPERATION_TYPE.SELL ||
        item.type === TIMELINE_OPERATION_TYPE.BUY
      ) {
        totalQuantity += item.quantity;
      }
    }

    totalQuantity *= firstOperation.instrument?.lot ?? 1;

    switch (firstOperation.type) {
      case TIMELINE_OPERATION_TYPE.SELL:
        return ppp.dict.t('$timeLineWidget.sellOperation', {
          tradedCount: ppp.dict.t(
            `$timeLineWidget.${firstOperation.instrument.type ?? 'other'}Count`,
            {
              smart_count: totalQuantity
            }
          ),
          instrumentFullName:
            firstOperation.instrument?.fullName ??
            firstOperation.instrument.symbol
        });

      case TIMELINE_OPERATION_TYPE.BUY:
        return ppp.dict.t('$timeLineWidget.buyOperation', {
          tradedCount: ppp.dict.t(
            `$timeLineWidget.${firstOperation.instrument.type ?? 'other'}Count`,
            {
              smart_count: totalQuantity
            }
          ),
          instrumentFullName:
            firstOperation.instrument?.fullName ??
            firstOperation.instrument.symbol
        });
    }

    return '';
  }

  formatCardDescription(operations) {
    const [firstOperation] = operations;

    let totalAmount = 0;
    let totalQuantity = 0;

    for (const item of operations) {
      if (
        item.type === TIMELINE_OPERATION_TYPE.SELL ||
        item.type === TIMELINE_OPERATION_TYPE.BUY
      ) {
        totalQuantity += item.quantity;
        totalAmount += item.price * item.quantity;
      }
    }

    switch (firstOperation.type) {
      case TIMELINE_OPERATION_TYPE.SELL:
      case TIMELINE_OPERATION_TYPE.BUY:
        return ppp.dict.t('$timeLineWidget.lotAtPrice', {
          lotCount: ppp.dict.t('$timeLineWidget.lotCount', {
            smart_count: totalQuantity
          }),
          price: formatPrice(
            totalAmount / totalQuantity,
            firstOperation.instrument
          )
        });
    }
  }

  getCards(dateKey) {
    return Array.from(this.timeline.get(dateKey).values())
      .filter(([i]) => {
        if (this.instrument) {
          return i.instrument.symbol === this.instrument.symbol;
        } else return true;
      })
      .sort((a, b) => {
        return new Date(b[0].createdAt) - new Date(a[0].createdAt);
      });
  }

  getExtraCardClasses(item) {
    const [firstOperation] = item;
    const classList = [];

    switch (firstOperation.type) {
      case TIMELINE_OPERATION_TYPE.BUY:
        classList.push('expandable');

        if (this.document.highlightTrades) classList.push('positive');

        break;

      case TIMELINE_OPERATION_TYPE.SELL:
        classList.push('expandable');

        if (this.document.highlightTrades) classList.push('negative');

        break;
    }

    return classList.join(' ');
  }

  #padTo2Digits(number) {
    return number.toString().padStart(2, '0');
  }

  timelineItemChanged(oldValue, newValue) {
    this.needsRefresh = true;

    const date = new Date(newValue.createdAt);
    const topLevelKey = `${date.getFullYear()}-${this.#padTo2Digits(
      date.getMonth() + 1
    )}-${this.#padTo2Digits(date.getDate())}`;

    if (!this.timeline.has(topLevelKey)) {
      this.timeline.set(
        topLevelKey,
        new Map().set(newValue.parentId, [newValue])
      );
    } else {
      const topLevelMap = this.timeline.get(topLevelKey);

      if (topLevelMap.has(newValue.parentId)) {
        const parent = topLevelMap.get(newValue.parentId);

        if (
          !parent.find(
            (operation) => operation.operationId === newValue.operationId
          )
        )
          parent.push(newValue);
      } else {
        topLevelMap.set(newValue.parentId, [newValue]);
      }
    }

    const symbol = newValue.instrument?.symbol ?? newValue.symbol;

    if (this.emptyIndicator.has(symbol)) {
      this.emptyIndicator.get(symbol).push(topLevelKey);
    } else {
      this.emptyIndicator.set(symbol, [topLevelKey]);
    }

    DOM.queueUpdate(() => {
      this.needsRefresh = false;

      Observable.notify(this, 'timeline');
      Observable.notify(this, 'emptyIndicator');
    });
  }

  isEmpty(dateKey) {
    if (!dateKey) {
      if (!this.instrument) return !this.timeline.size;
      else {
        return !this.emptyIndicator.has(this.instrument.symbol);
      }
    } else {
      if (!this.instrument) return !this.timeline.get(dateKey).size;
      else
        return !this.emptyIndicator
          .get(this.instrument.symbol)
          .find((key) => key === dateKey);
    }
  }

  async validate() {
    await validate(this.container.timelineTraderId);
  }

  async update() {
    return {
      $set: {
        timelineTraderId: this.container.timelineTraderId.value,
        highlightTrades: this.container.highlightTrades.checked
      }
    };
  }
}

export async function widgetDefinition(definition = {}) {
  return {
    type: WIDGET_TYPES.TIMELINE,
    collection: 'PPP',
    title: html`Лента операций`,
    description: html`Виджет
      <span class="positive">Лента операций</span> отображает историю сделок и
      других биржевых событий одного или нескольких торговых инструментов.`,
    customElement: PppTimelineWidget.compose(definition),
    maxHeight: 1200,
    maxWidth: 512,
    defaultHeight: 365,
    minHeight: 120,
    minWidth: 250,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер ленты операций</h5>
          <p>Трейдер, который будет источником ленты операций.</p>
        </div>
        <ppp-collection-select
          ${ref('timelineTraderId')}
          value="${(x) => x.document.timelineTraderId}"
          :context="${(x) => x}"
          :preloaded="${(x) => x.document.timelineTrader ?? ''}"
          :query="${() => {
            return (context) => {
              return context.services
                .get('mongodb-atlas')
                .db('ppp')
                .collection('traders')
                .find({
                  $and: [
                    {
                      caps: `[%#(await import('./const.js')).TRADER_CAPS.CAPS_TIMELINE%]`
                    },
                    {
                      $or: [
                        { removed: { $ne: true } },
                        { _id: `[%#this.document.timelineTraderId ?? ''%]` }
                      ]
                    }
                  ]
                })
                .sort({ updatedAt: -1 });
            };
          }}"
          :transform="${() => ppp.decryptDocumentsTransformation()}"
        ></ppp-collection-select>
        <${'ppp-button'}
          class="margin-top"
          @click="${() => window.open('?page=trader', '_blank').focus()}"
          appearance="primary"
        >
          Создать нового трейдера
        </ppp-button>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Параметры отображения</h5>
        </div>
        <${'ppp-checkbox'}
          ?checked="${(x) => x.document.highlightTrades}"
          ${ref('highlightTrades')}
        >
          Выделять покупки и продажи фоновым цветом
        </${'ppp-checkbox'}>
      </div>
    `
  };
}
