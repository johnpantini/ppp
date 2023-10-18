/** @decorator */

import {
  widgetStyles,
  widgetEmptyStateTemplate,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import {
  html,
  css,
  when,
  ref,
  observable,
  attr,
  repeat,
  Updates
} from '../../vendor/fast-element.min.js';
import { BROKERS, TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import {
  formatAmount,
  formatDateWithOptions,
  formatPrice
} from '../../lib/intl.js';
import { normalize, scrollbars } from '../../design/styles.js';
import { validate } from '../../lib/ppp-errors.js';
import {
  fontSizeWidget,
  lineHeightWidget,
  paletteGrayBase,
  paletteGrayLight1,
  themeConditional
} from '../../design/design-tokens.js';
import { OperationType } from '../../vendor/tinkoff/definitions/operations.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../text-field.js';
import '../widget-controls.js';

await ppp.i18n(import.meta.url);

export const timelineWidgetTemplate = html`
  <template>
    <div class="widget-root">
      ${widgetDefaultHeaderTemplate()}
      <div class="widget-body">
        ${widgetStackSelectorTemplate()}
        <div class="widget-card-list">
          ${when(
            (x) => x.empty,
            html`${html.partial(
              widgetEmptyStateTemplate('Нет операций для отображения.')
            )}`
          )}
          <div class="widget-card-list-inner">
            ${repeat(
              (x) => x.timeline,
              html`
                ${when(
                  (x) => typeof x === 'string',
                  html`
                    <div class="timeline-item-headline">
                      ${(i) =>
                        formatDateWithOptions(new Date(i), {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                    </div>
                  `
                )}
                ${when(
                  (x) => typeof x === 'object',
                  html`
                    <div class="widget-card-holder">
                      <div class="widget-card-holder-inner">
                        <ppp-widget-card
                          class="${(x, c) => c.parent.getExtraCardClasses(x)}"
                        >
                          <div
                            slot="icon"
                            style="${(x, c) => `${c.parent.getLogo(x)}`}"
                          ></div>
                          <span slot="icon-fallback">
                            ${(x, c) => c.parent.getLogoFallback(x)}
                          </span>
                          <span slot="title-left">
                            ${(x, c) => c.parent.formatCardTitle(x)}
                          </span>
                          <span slot="title-right">
                            <span
                              class="${(x, c) =>
                                c.parent.getCardAmountExtraClasses(x)}"
                            >
                              ${(x, c) => c.parent.formatCardAmount(x)}
                            </span>
                          </span>
                          <span slot="subtitle-left" class="x-scroll">
                            ${(x, c) => c.parent.formatCardDescription(x)}
                          </span>
                          <div slot="subtitle-right">
                            ${(x) =>
                              formatDateWithOptions(
                                x[0].parentCreatedAt ??
                                  x[x.length - 1].createdAt,
                                {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }
                              )}
                          </div>
                        </ppp-widget-card>
                      </div>
                    </div>
                  `
                )}
              `
            )}
          </div>
        </div>
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const timelineWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
  .timeline-item-headline {
    width: 100%;
    margin: 0 8px;
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    font-weight: 500;
    letter-spacing: 0;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    padding-top: 8px;
  }

  .timeline-item-headline:has(+ .timeline-item-headline) {
    display: none;
  }

  .x-scroll {
    overflow-y: hidden;
    overflow-x: auto;
  }

  ${scrollbars('.x-scroll')}
`;

export class TimelineWidget extends WidgetWithInstrument {
  @observable
  timelineTrader;

  @observable
  timelineItem;

  @observable
  timeline;

  @attr({ mode: 'boolean' })
  empty;

  constructor() {
    super();

    this.empty = true;
    this.timeline = [];
    this.timelineMap = new Map();
    this.emptyIndicatorMap = new Map();
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!this.document.timelineTrader) {
      return this.notificationsArea.error({
        text: 'Отсутствует трейдер ленты операций.',
        keep: true
      });
    }

    if (!this.document.depth) {
      this.document.depth = 100;
    }

    try {
      this.timelineTrader = await ppp.getOrCreateTrader(
        this.document.timelineTrader
      );
      this.instrumentTrader = this.timelineTrader;

      this.selectInstrument(this.document.symbol, { isolate: true });

      await this.timelineTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          timelineItem: TRADER_DATUM.TIMELINE_ITEM
        }
      });
    } catch (e) {
      return this.catchException(e);
    }
  }

  async disconnectedCallback() {
    if (this.timelineTrader) {
      await this.timelineTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          timelineItem: TRADER_DATUM.TIMELINE_ITEM
        }
      });
    }

    super.disconnectedCallback();
  }

  getLogo(operations) {
    const [firstOperation] = operations;

    switch (firstOperation.type) {
      case OperationType.OPERATION_TYPE_BUY:
      case OperationType.OPERATION_TYPE_SELL:
        return `background-image:url(${this.searchControl.getInstrumentIconUrl(
          firstOperation.instrument
        )}`;

      default:
        return '';
    }
  }

  getLogoFallback(operations) {
    const [firstOperation] = operations;

    switch (firstOperation.type) {
      case OperationType.OPERATION_TYPE_BUY:
      case OperationType.OPERATION_TYPE_SELL:
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
        item.type === OperationType.OPERATION_TYPE_SELL ||
        item.type === OperationType.OPERATION_TYPE_BUY
      ) {
        if (item.type === OperationType.OPERATION_TYPE_BUY) negative = true;

        totalAmount += item.price * item.quantity;
      }
    }

    if (negative) totalAmount *= -1;

    totalAmount *= firstOperation.instrument.lot;

    return formatAmount(
      totalAmount,
      firstOperation.instrument?.currency,
      firstOperation.instrument
    );
  }

  getCardAmountExtraClasses(operations) {
    const [firstOperation] = operations;

    return firstOperation.type === OperationType.OPERATION_TYPE_SELL
      ? 'positive'
      : '';
  }

  formatCardTitle(operations) {
    const [firstOperation] = operations;

    let totalQuantity = 0;

    for (const item of operations) {
      if (
        item.type === OperationType.OPERATION_TYPE_SELL ||
        item.type === OperationType.OPERATION_TYPE_BUY
      ) {
        totalQuantity += item.quantity;
      }
    }

    totalQuantity *= firstOperation.instrument?.lot ?? 1;

    switch (firstOperation.type) {
      case OperationType.OPERATION_TYPE_SELL:
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

      case OperationType.OPERATION_TYPE_BUY:
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
        item.type === OperationType.OPERATION_TYPE_SELL ||
        item.type === OperationType.OPERATION_TYPE_BUY
      ) {
        totalQuantity += item.quantity;
        totalAmount += item.price * item.quantity;
      }
    }

    switch (firstOperation.type) {
      case OperationType.OPERATION_TYPE_SELL:
      case OperationType.OPERATION_TYPE_BUY:
        return ppp.dict.t('$timeLineWidget.lotAtPrice', {
          lotCount: ppp.dict.t('$timeLineWidget.lotCount', {
            smart_count: totalQuantity
          }),
          price: formatPrice(
            totalAmount / totalQuantity,
            firstOperation.instrument,
            {
              minimumFractionDigits: 0,
              maximumFractionDigits:
                firstOperation.instrument?.broker === BROKERS.IB ? 3 : void 0
            }
          )
        });
    }
  }

  getCards(dateKey) {
    return Array.from(this.timelineMap.get(dateKey).values())
      .filter(([i]) => {
        if (this.instrument) {
          return this.instrumentTrader.instrumentsAreEqual(
            i.instrument,
            this.instrument
          );
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
      case OperationType.OPERATION_TYPE_BUY:
        if (this.document.highlightTrades) classList.push('positive');

        break;

      case OperationType.OPERATION_TYPE_SELL:
        if (this.document.highlightTrades) classList.push('negative');

        break;
    }

    return classList.join(' ');
  }

  #padTo2Digits(number) {
    return number.toString().padStart(2, '0');
  }

  timelineItemChanged(oldValue, newValue) {
    if (typeof newValue.operationId === 'undefined') {
      return;
    }

    const date = new Date(newValue.createdAt);
    // Timeline item date (bucket)
    const topLevelKey = `${date.getFullYear()}-${this.#padTo2Digits(
      date.getMonth() + 1
    )}-${this.#padTo2Digits(date.getDate())}`;

    if (!this.timelineMap.has(topLevelKey)) {
      this.timelineMap.set(
        topLevelKey,
        new Map().set(newValue.parentId, [newValue])
      );
    } else {
      const topLevelMap = this.timelineMap.get(topLevelKey);

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

    if (this.emptyIndicatorMap.has(symbol)) {
      const array = this.emptyIndicatorMap.get(symbol);

      if (array.indexOf(topLevelKey) === -1) {
        array.push(topLevelKey);
      }
    } else {
      this.emptyIndicatorMap.set(symbol, [topLevelKey]);
    }

    this.timeline = [];

    Updates.enqueue(() => (this.timeline = this.getTimelineArray()));
  }

  instrumentChanged() {
    super.instrumentChanged();

    this.timeline = [];

    Updates.enqueue(() => (this.timeline = this.getTimelineArray()));
  }

  getTimelineArray() {
    this.empty = this.isEmpty();

    let cardCount = 0;
    const timeline = [];
    const topLevelKeys = Array.from(this.timelineMap.keys()).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    for (const tk of topLevelKeys) {
      timeline.push(tk);

      const cards = this.getCards(tk);

      if (!cards.length) {
        timeline.pop();
      }

      for (const card of cards) {
        if (cardCount >= this.document.depth) {
          continue;
        }

        timeline.push(card);
        cardCount++;
      }
    }

    return timeline;
  }

  isEmpty(dateKey) {
    if (!dateKey) {
      if (!this.instrument) return !this.timelineMap.size;
      else {
        return !this.emptyIndicatorMap.has(this.instrument.symbol);
      }
    } else {
      if (!this.instrument) return !this.timelineMap.get(dateKey).size;
      else
        return !this.emptyIndicatorMap
          .get(this.instrument.symbol)
          .find((key) => key === dateKey);
    }
  }

  async validate() {
    await validate(this.container.depth);
    await validate(this.container.depth, {
      hook: async (value) => +value > 0 && +value <= 100,
      errorMessage: 'Введите значение в диапазоне от 1 до 100'
    });
  }

  async submit() {
    return {
      $set: {
        timelineTraderId: this.container.timelineTraderId.value,
        depth: Math.abs(this.container.depth.value),
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
      других биржевых событий по одному или нескольким торговым инструментам.`,
    customElement: TimelineWidget.compose({
      template: timelineWidgetTemplate,
      styles: timelineWidgetStyles
    }).define(),
    minWidth: 140,
    minHeight: 120,
    defaultWidth: 280,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер ленты операций</h5>
          <p class="description">
            Трейдер, который будет источником ленты операций.
          </p>
        </div>
        <div class="control-line flex-start">
          <ppp-query-select
            ${ref('timelineTraderId')}
            deselectable
            standalone
            placeholder="Опционально, нажмите для выбора"
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
                        caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_TIMELINE%]`
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
          ></ppp-query-select>
          <ppp-button
            appearance="default"
            @click="${() => window.open('?page=trader', '_blank').focus()}"
          >
            +
          </ppp-button>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Количество операций для отображения</h5>
          <p class="description">
            Максимальное количество операций, отображаемое в ленте.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-text-field
            type="number"
            placeholder="100"
            value="${(x) => x.document.depth ?? 100}"
            ${ref('depth')}
          ></ppp-text-field>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Интерфейс</h5>
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
