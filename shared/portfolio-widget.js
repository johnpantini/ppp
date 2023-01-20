/** @decorator */

import { WidgetWithInstrument } from './widget-with-instrument.js';
import { ref } from './element/templating/ref.js';
import { html } from './template.js';
import { TRADER_DATUM, WIDGET_TYPES } from './const.js';
import { validate } from './validate.js';
import { Observable, observable } from './element/observation/observable.js';
import { when } from './element/templating/when.js';
import { repeat } from './element/templating/repeat.js';
import {
  currencyName,
  formatAmount,
  formatPrice,
  formatQuantity,
  formatRelativeChange
} from './intl.js';
import ppp from '../ppp.js';

export const portfolioWidgetTemplate = (context, definition) => html`
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
            <div
              style="background-image:url('static/widgets/settings.svg')"
              class="widget-close-button"
              @click="${(x) => x.goToSettings()}">
            </div>
            <div
              style="background-image:url('static/widgets/close.svg')"
              class="widget-close-button"
              @click="${(x) => x.close()}">
            </div>
          </div>
        </div>
      </div>
      <div class="widget-body">
        <div class="portfolio-header">
          <div class="portfolio-name-section">
            <div style="display: flex">
              <div class="portfolio-name-section-header">
                ${(x) => x.getPortfolioName()}
              </div>
            </div>
          </div>
        </div>
        <table class="portfolio-table">
          <thead>
          <tr>
            <th>Инструмент</th>
            <th>Всего, шт.</th>
            <th>Средняя</th>
            <th>Доход</th>
            <th>Доход, %</th>
            <th>За день</th>
            <th>За день, %</th>
          </tr>
          </thead>
          <tbody @click="${(x, c) => x.handleBalancesTableClick(c)}">
          ${repeat(
            (widget, c) => [widget],
            html`
              ${when(
                (x, c) => c.parent.balances?.size,
                html`
                  <tr class="table-group">
                    <td colspan="1">Валютные балансы</td>
                  </tr>
                  ${repeat(
                    (__, r) =>
                      Array.from(r.parent.balances?.values()).sort((a, b) =>
                        a.symbol.localeCompare(b.symbol)
                      ),
                    html`
                      <tr class="portfolio-row">
                        <td class="cell capitalize">
                          <div class="portfolio-row-logo-with-name">
                            <div
                              class="portfolio-row-logo"
                              style="${(cell) =>
                                `background-image:url(${
                                  'static/currency/' + cell.symbol + '.svg'
                                })`}"
                            ></div>
                            <div class="portfolio-row-name">
                              ${(cell) => currencyName(cell.symbol)}
                            </div>
                          </div>
                        </td>
                        <td class="cell">
                          ${when(
                            (___, d) => d.parent.document.hideBalances,
                            html`
                              <${'ppp-button'}
                                class="xsmall"
                              >
                                Скрыто
                              </ppp-button>
                            `
                          )}
                          ${(cell) => formatQuantity(cell.size)}
                        </td>
                        <td class="cell"></td>
                        <td class="cell"></td>
                        <td class="cell"></td>
                        <td class="cell"></td>
                        <td class="cell"></td>
                      </tr>
                    `
                  )}
                `
              )}
            `
          )}
          </tbody>
          <tbody @click="${(x, c) => x.handlePortfolioTableClick(c, 'stock')}">
          ${repeat(
            (_, c) => [42],
            html`
              ${when(
                (x, c) => c.parent.stocks?.size,
                html`
                  <tr class="table-group">
                    <td colspan="1">Акции</td>
                  </tr>
                  ${repeat(
                    (__, r) =>
                      Array.from(r.parent.stocks?.values()).sort((a, b) =>
                        a.instrument.symbol.localeCompare(b.instrument.symbol)
                      ),
                    html`
                      <tr
                        class="portfolio-row"
                        symbol="${(cell) => cell.instrument.symbol}"
                      >
                        <td class="cell capitalize">
                          <div class="portfolio-row-logo-with-name">
                            <div
                              class="portfolio-row-logo"
                              style="${(cell) =>
                                cell.instrument.isin
                                  ? `background-image:url(${
                                      'static/instruments/' +
                                      cell.instrument.isin +
                                      '.svg'
                                    })`
                                  : ''}"
                            ></div>
                            <div class="portfolio-row-name">
                              ${(cell) =>
                                cell.instrument.fullName ??
                                cell.instrument.symbol}
                            </div>
                          </div>
                        </td>
                        <td class="cell">
                          ${(cell) => formatQuantity(cell.size * cell.lot)}
                        </td>
                        <td class="cell">
                          ${(cell) =>
                            formatPrice(cell.averagePrice, cell.instrument)}
                        </td>
                        <td
                          class="cell ${(cell) =>
                            cell.unrealizedProfit < 0
                              ? 'negative'
                              : 'positive'}"
                        >
                          ${(cell) =>
                            formatAmount(
                              cell.unrealizedProfit,
                              cell.instrument.currency
                            )}
                        </td>
                        <td
                          class="cell ${(cell) =>
                            cell.unrealizedProfit < 0
                              ? 'negative'
                              : 'positive'}"
                        >
                          ${(cell) =>
                            formatRelativeChange(
                              cell.unrealizedProfit /
                                (cell.averagePrice *
                                  cell.size *
                                  cell.instrument.lot),
                              cell.instrument.currency
                            )}
                        </td>
                        <td
                          class="cell ${(cell) =>
                            cell.dailyUnrealizedProfit < 0
                              ? 'negative'
                              : 'positive'}"
                        >
                          ${(cell) =>
                            formatAmount(
                              cell.dailyUnrealizedProfit,
                              cell.instrument.currency
                            )}
                        </td>
                        <td
                          class="cell ${(cell) =>
                            cell.dailyUnrealizedProfit < 0
                              ? 'negative'
                              : 'positive'}"
                        >
                          ${(cell) =>
                            formatRelativeChange(
                              cell.dailyUnrealizedProfit /
                                (cell.averagePrice *
                                  cell.size *
                                  cell.instrument.lot),
                              cell.instrument.currency
                            )}
                        </td>
                      </tr>
                    `
                  )}
                `
              )}
            `
          )}
          </tbody>
        </table>
        ${when(
          (x) => !x.balances?.size && !x.stocks?.size && !x.zombies?.size,
          html`
            <div class="widget-empty-state-holder">
              <img draggable="false" src="static/empty-widget-state.svg" />
              <span>Нет позиций в портфеле.</span>
            </div>
          `
        )}
        <${'ppp-widget-notifications-area'}
          ${ref('notificationsArea')}
        ></ppp-widget-notifications-area>
      </div>
    </div>
  </template>
`;

export class PppPortfolioWidget extends WidgetWithInstrument {
  @observable
  portfolioTrader;

  @observable
  position;

  @observable
  balances;

  @observable
  stocks;

  @observable
  zombies;

  onTraderError() {
    this.notificationsArea.error({
      title: 'Портфель',
      text: 'Возникла проблема с отображением инструментов. Смотрите консоль браузера.'
    });
  }

  async connectedCallback() {
    super.connectedCallback();

    this.balances = new Map();
    this.stocks = new Map();
    this.zombies = new Map();

    this.portfolioTrader = await ppp.getOrCreateTrader(
      this.document.portfolioTrader
    );
    this.searchControl.trader = this.portfolioTrader;

    if (this.portfolioTrader) {
      this.portfolioTrader.onError = this.onTraderError.bind(this);

      await this.portfolioTrader.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          position: TRADER_DATUM.POSITION
        }
      });
    }
  }

  async disconnectedCallback() {
    if (this.portfolioTrader) {
      await this.portfolioTrader.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          position: TRADER_DATUM.POSITION
        }
      });
    }

    super.disconnectedCallback();
  }

  handleBalancesTableClick({ event }) {
    const button = event
      .composedPath()
      .find((n) => n.tagName?.toLowerCase?.() === 'ppp-button');

    button && (button.style.display = 'none');
  }

  async handlePortfolioTableClick({ event }, instrumentType) {
    if (this.groupControl.selection && !this.preview && this.portfolioTrader) {
      const symbol = event
        .composedPath()
        .find((n) => n?.tagName?.toLowerCase?.() === 'tr')
        ?.getAttribute('symbol');

      if (symbol) {
        this.topLoader.start();

        try {
          const instrument = await this.findAndSelectSymbol({
            type: instrumentType,
            symbol,
            exchange: this.portfolioTrader.getExchange()
          });

          if (!instrument) {
            this.notificationsArea.error({
              title: 'Портфель',
              text: 'Инструмент не найден в базе данных.'
            });
          }
        } catch (e) {
          console.log(e);

          this.notificationsArea.error({
            title: 'Портфель',
            text: 'Ошибка поиска инструмента в базе данных.'
          });
        } finally {
          this.topLoader.stop();
        }
      }
    }
  }

  positionChanged(oldValue, newValue) {
    if (newValue) {
      if (newValue.isBalance) {
        if (newValue.size !== 0) this.balances.set(newValue.symbol, newValue);
        else this.balances.delete(newValue.symbol);

        Observable.notify(this, 'balances');
      } else if (!newValue.instrument?.type) {
        if (newValue.size !== 0) this.zombies.set(newValue.symbol, newValue);
        else this.zombies.delete(newValue.symbol);

        Observable.notify(this, 'zombies');
      } else {
        switch (newValue.instrument.type) {
          case 'stock':
            if (newValue.size !== 0) this.stocks.set(newValue.symbol, newValue);
            else this.stocks.delete(newValue.symbol);

            Observable.notify(this, 'stocks');

            break;
        }
      }
    }
  }

  getPortfolioName() {
    return '';
  }

  async validate() {
    await validate(this.container.portfolioTraderId);
  }

  async update() {
    return {
      $set: {
        portfolioTraderId: this.container.portfolioTraderId.value,
        hideBalances: this.container.hideBalances.checked
      }
    };
  }
}

export async function widgetDefinition(definition = {}) {
  return {
    type: WIDGET_TYPES.PORTFOLIO,
    collection: 'PPP',
    title: html`Портфель`,
    description: html`Виджет <span class="positive">Порфтель</span> отображает
      список открытых позиций.`,
    customElement: PppPortfolioWidget.compose(definition),
    maxHeight: 1200,
    maxWidth: 1920,
    defaultWidth: 620,
    defaultHeight: 375,
    minHeight: 120,
    minWidth: 275,
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер портфеля</h5>
          <p>Трейдер, который будет источником портфельных данных.</p>
        </div>
        <ppp-collection-select
          ${ref('portfolioTraderId')}
          value="${(x) => x.document.portfolioTraderId}"
          :context="${(x) => x}"
          :preloaded="${(x) => x.document.portfolioTrader ?? ''}"
          :query="${() => {
            return (context) => {
              return context.services
                .get('mongodb-atlas')
                .db('ppp')
                .collection('traders')
                .find({
                  $and: [
                    {
                      caps: `[%#(await import('./const.js')).TRADER_CAPS.CAPS_POSITIONS%]`
                    },
                    {
                      $or: [
                        { removed: { $ne: true } },
                        { _id: `[%#this.document.portfolioTraderId ?? ''%]` }
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
          ?checked="${(x) => x.document.hideBalances}"
          ${ref('hideBalances')}
        >
          Скрывать валютные балансы
        </${'ppp-checkbox'}>
      </div>
    `
  };
}
