/** @decorator */

import {
  widget,
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
import { TRADER_CAPS, TRADER_DATUM, WIDGET_TYPES } from '../../lib/const.js';
import {
  formatPercentage,
  formatPriceWithoutCurrency,
  priceCurrencySymbol
} from '../../lib/intl.js';
import { normalize } from '../../design/styles.js';

export const portfolioWidgetTemplate = html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <ppp-widget-group-control
            selection="${(x) => x.document?.group}"
          ></ppp-widget-group-control>
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
    </div>
    <ppp-widget-resize-controls></ppp-widget-resize-controls>
  </template>
`;

export const portfolioWidgetStyles = css`
  ${normalize()}
  ${widget()}
`;

export class PortfolioWidget extends WidgetWithInstrument {
  @observable
  portfolioTrader;

  @observable
  position;

  @observable
  balances;

  @observable
  stocks;

  @observable
  bonds;

  @observable
  futures;

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
    this.bonds = new Map();
    this.futures = new Map();
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

  async handlePortfolioTableClick({ event }) {
    if (this.groupControl.selection && !this.preview && this.portfolioTrader) {
      const cp = event.composedPath();
      const symbol = cp
        .find((n) => n?.tagName?.toLowerCase?.() === 'tr')
        ?.getAttribute('symbol');
      const type = cp
        .find((n) => n?.tagName?.toLowerCase?.() === 'tr')
        ?.getAttribute('type');

      if (symbol && type) {
        this.topLoader.start();

        try {
          const instrument = await this.findAndSelectSymbol({
            type,
            symbol,
            exchange: {
              $in: this.portfolioTrader.getExchange()
            }
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
          case 'bond':
            if (newValue.size !== 0) this.bonds.set(newValue.symbol, newValue);
            else this.bonds.delete(newValue.symbol);

            Observable.notify(this, 'bonds');

            break;
          case 'future':
            if (newValue.size !== 0)
              this.futures.set(newValue.symbol, newValue);
            else this.futures.delete(newValue.symbol);

            Observable.notify(this, 'futures');

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

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.PORTFOLIO,
    collection: 'PPP',
    title: html`Портфель`,
    description: html`Виджет <span class="positive">Порфтель</span> отображает
      список открытых позиций.`,
    customElement: PortfolioWidget.compose({
      template: portfolioWidgetTemplate,
      styles: portfolioWidgetStyles
    }).define(),
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
