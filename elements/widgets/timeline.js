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
  observable,
  Observable,
  Updates
} from '../../vendor/fast-element.min.js';
import { TRADER_CAPS, TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import {
  formatPercentage,
  formatPriceWithoutCurrency,
  priceCurrencySymbol
} from '../../lib/intl.js';
import { normalize } from '../../design/styles.js';

await ppp.i18n(import.meta.url);

export const timelineWidgetTemplate = html`
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
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const timelineWidgetStyles = css`
  ${normalize()}
  ${widget()}
`;

export class TimelineWidget extends WidgetWithInstrument {
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

    Updates.enqueue(() => {
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

    Updates.enqueue(() => {
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

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.TIMELINE,
    collection: 'PPP',
    title: html`Лента операций`,
    description: html`Виджет
      <span class="positive">Лента операций</span> отображает историю сделок и
      других биржевых событий одного или нескольких торговых инструментов.`,
    customElement: TimelineWidget.compose({
      template: timelineWidgetTemplate,
      styles: timelineWidgetStyles
    }).define(),
    maxHeight: 2560,
    maxWidth: 2560,
    defaultHeight: 375,
    defaultWidth: 280,
    minHeight: 120,
    minWidth: 140,
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
        <ppp-button
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
        <ppp-checkbox
          ?checked="${(x) => x.document.highlightTrades}"
          ${ref('highlightTrades')}
        >
          Выделять покупки и продажи фоновым цветом
        </ppp-checkbox>
      </div>
    `
  };
}
