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
  Observable
} from '../../vendor/fast-element.min.js';
import { WIDGET_TYPES, TRADER_DATUM } from '../../lib/const.js';
import { priceCurrencySymbol } from '../../lib/intl.js';
import { normalize } from '../../design/styles.js';

export const timeAndSalesWidgetTemplate = html`
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
    </div>
  </template>
`;

export const timeAndSalesWidgetStyles = css`
  ${normalize()}
  ${widget()}
`;

export class TimeAndSalesWidget extends WidgetWithInstrument {
  @observable
  tradesTrader;

  @observable
  print;

  @observable
  trades;

  constructor() {
    super();

    this.trades = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    this.tradesTrader = await ppp.getOrCreateTrader(this.document.tradesTrader);
    this.searchControl.trader = this.tradesTrader;

    if (this.tradesTrader) {
      if (
        this.instrument &&
        typeof this.tradesTrader.allTrades === 'function'
      ) {
        try {
          this.trades = (
            await this.tradesTrader.allTrades({
              instrument: this.instrument,
              depth: this.document.depth
            })
          )?.filter((t) => {
            if (this.document.threshold) {
              return t.volume >= this.document.threshold;
            } else return true;
          });
        } catch (e) {
          console.error(e);

          return this.notificationsArea.error({
            title: 'Лента всех сделок',
            text: 'Не удалось загрузить историю сделок.'
          });
        }
      }

      try {
        await this.tradesTrader.subscribeFields?.({
          source: this,
          fieldDatumPairs: {
            print: TRADER_DATUM.MARKET_PRINT
          }
        });
      } catch (e) {
        console.error(e);

        return this.notificationsArea.error({
          title: 'Лента всех сделок',
          text: 'Не удалось подключиться к источнику данных.'
        });
      }
    }
  }

  handleTableClick({ event }) {
    const price = parseFloat(
      event
        .composedPath()
        .find((n) => n?.classList?.contains('price-line'))
        ?.getAttribute('price')
    );

    return this.broadcastPrice(price);
  }

  printChanged(oldValue, newValue) {
    if (newValue?.price) {
      if (
        this.document.threshold &&
        newValue?.volume < this.document.threshold
      ) {
        return;
      }

      this.trades.unshift(newValue);

      while (this.trades.length > this.document.depth) {
        this.trades.pop();
      }

      Observable.notify(this, 'trades');
    }
  }

  async disconnectedCallback() {
    if (this.tradesTrader) {
      await this.tradesTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          print: TRADER_DATUM.MARKET_PRINT
        }
      });
    }

    super.disconnectedCallback();
  }

  async instrumentChanged(oldValue, newValue) {
    this.trades = [];

    super.instrumentChanged(oldValue, newValue);

    if (this.tradesTrader) {
      if (
        this.instrument &&
        typeof this.tradesTrader.allTrades === 'function'
      ) {
        this.trades = (
          await this.tradesTrader.allTrades({
            instrument: this.instrument,
            depth: this.document.depth
          })
        )?.filter((t) => {
          if (this.document.threshold) {
            return t.volume >= this.document.threshold;
          } else return true;
        });
      }

      await this.tradesTrader.instrumentChanged?.(this, oldValue, newValue);
    }
  }

  async validate() {
    await validate(this.container.tradesTraderId);
    await validate(this.container.depth);
    await validate(this.container.depth, {
      hook: async (value) => +value > 0 && +value <= 300,
      errorMessage: 'Введите значение в диапазоне от 1 до 300'
    });

    if (this.container.threshold.value) {
      await validate(this.container.threshold, {
        hook: async (value) =>
          +value.replace(',', '.') >= 0 && +value.replace(',', '.') <= 10000000,
        errorMessage: 'Введите значение в диапазоне от 0 до 10000000'
      });
    }
  }

  async update() {
    return {
      $set: {
        depth: Math.abs(this.container.depth.value),
        tradesTraderId: this.container.tradesTraderId.value,
        threshold: +this.container.threshold.value.replace(',', '.') || ''
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.TIME_AND_SALES,
    collection: 'PPP',
    title: html`Лента всех сделок`,
    tags: ['Лента обезличенных сделок'],
    description: html`<span class="positive">Лента всех сделок</span> отображает
      обезличенные сделки с финансовым инструментом по всем доступным рыночным
      центрам.`,
    customElement: TimeAndSalesWidget.compose({
      template: timeAndSalesWidgetTemplate,
      styles: timeAndSalesWidgetStyles
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
          <h5>Трейдер ленты</h5>
          <p>Трейдер, который будет источником ленты сделок.</p>
        </div>
        <ppp-collection-select
          ${ref('tradesTraderId')}
          value="${(x) => x.document.tradesTraderId}"
          :context="${(x) => x}"
          :preloaded="${(x) => x.document.tradesTrader ?? ''}"
          :query="${() => {
            return (context) => {
              return context.services
                .get('mongodb-atlas')
                .db('ppp')
                .collection('traders')
                .find({
                  $and: [
                    {
                      caps: `[%#(await import('./const.js')).TRADER_CAPS.CAPS_TIME_AND_SALES%]`
                    },
                    {
                      $or: [
                        { removed: { $ne: true } },
                        { _id: `[%#this.document.tradesTraderId ?? ''%]` }
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
          <h5>Глубина истории ленты</h5>
          <p>
            Количество записей, запрашиваемое из истории сделок текущего дня при
            смене торгового инструмента в виджете.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-text-field
            type="number"
            placeholder="20"
            value="${(x) => x.document.depth ?? 20}"
            ${ref('depth')}
          ></ppp-text-field>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Фильтр объёма</h5>
          <p>
            Сделки с объёмом меньше указанного не будут отображены в ленте.
            Чтобы всегда отображать все сделки, введите 0 или не заполняйте
            поле.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-text-field
            placeholder="Фильтр объёма"
            value="${(x) => x.document.threshold ?? 0}"
            @beforeinput="${(x, { event }) => {
              return event.data === null || /[0-9.,]/.test(event.data);
            }}"
            ${ref('threshold')}
          ></ppp-text-field>
        </div>
      </div>
    `
  };
}
