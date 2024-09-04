/** @decorator */

import ppp from '../../../ppp.js';
import {
  html,
  Observable,
  observable,
  ref
} from '../../../vendor/fast-element.min.js';
import {
  BROKERS,
  COLUMN_SOURCE,
  OPERATION_TYPE,
  TRADER_DATUM,
  TRADERS
} from '../../../lib/const.js';
import { $throttle } from '../../../lib/ppp-decorators.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import '../../widget-column-list.js';
import {
  currencyName,
  formatAbsoluteChange,
  formatAmount,
  formatNumber
} from '../../../lib/intl.js';
import { getTraderSelectOptionColor } from '../../../design/styles.js';
import { invalidate } from '../../../lib/ppp-errors.js';
import { Tmpl } from '../../../lib/tmpl.js';
import { ValidationError } from '../../../lib/ppp-exceptions.js';
import '../../snippet.js';

export const exampleVirtualCommFunctionCode = `/**
* Функция, возвращающая абсолютное значение комиссии за балансирующую сделку.
*
* @param price - Цена исполнения.
* @param quantity - Количество лотов инструмента.
* @param instrument - Торговый инструмент.
* @param {boolean} isBuySide - Направление сделки.
*/

return 0;
`;

export const DEFAULT_COLUMNS = [
  {
    source: COLUMN_SOURCE.INSTRUMENT
  },
  {
    source: COLUMN_SOURCE.SYMBOL
  },
  {
    source: COLUMN_SOURCE.LAST_PRICE,
    highlightChanges: true
  },
  {
    source: COLUMN_SOURCE.LAST_PRICE_ABSOLUTE_CHANGE
  },
  {
    source: COLUMN_SOURCE.LAST_PRICE_RELATIVE_CHANGE
  },
  {
    source: COLUMN_SOURCE.FORMATTED_VALUE,
    name: 'Покупки',
    valueKey: 'buys'
  },
  {
    source: COLUMN_SOURCE.FORMATTED_VALUE,
    name: 'Продажи',
    valueKey: 'sells'
  },
  {
    source: COLUMN_SOURCE.FORMATTED_VALUE,
    name: 'PnL, gross',
    valueKey: 'gross'
  },
  {
    source: COLUMN_SOURCE.FORMATTED_VALUE,
    name: 'Комиссия',
    valueKey: 'commission'
  },
  {
    source: COLUMN_SOURCE.FORMATTED_VALUE,
    name: 'PnL, net',
    valueKey: 'net'
  }
].map((column) => {
  if (typeof column.name === 'undefined') {
    column.name = ppp.t(`$const.columnSource.${column.source}`);
  }

  return column;
});

export class IntradayStatsIndividualSymbolSource {
  /**
   * @type {IntradayStats}
   */
  parent;

  sourceID = uuidv4();

  currency;

  symbol;

  instrument;

  constructor(parent, currency, symbol, instrument) {
    this.parent = parent;
    this.instrument = instrument;
    this.currency = currency;
    this.symbol = symbol;
  }

  @observable
  lastPrice;

  lastPriceChanged(oldValue, newValue) {
    this.parent.referencePrices.get(this.currency).get(this.symbol).price =
      newValue;

    return this.parent.rebuildStats();
  }

  @observable
  extendedLastPrice;

  extendedLastPriceChanged(oldValue, newValue) {
    this.parent.referencePrices.get(this.currency).get(this.symbol).price =
      newValue;

    return this.parent.rebuildStats();
  }
}

function pushSorted(array, item, comparator) {
  const index = (function (arr) {
    let m = 0;
    let n = arr.length - 1;

    while (m <= n) {
      const k = (n + m) >> 1;
      const cmp = comparator(item, arr[k]);

      if (cmp > 0) m = k + 1;
      else if (cmp < 0) n = k - 1;
      else {
        return k;
      }
    }

    return -m - 1;
  })(array);

  if (index >= 0) array.splice(index, 0, item);
  else if (index < 0) array.splice(index * -1 - 1, 0, item);

  return array.length;
}

export class IntradayStats {
  widget;

  sourceID = uuidv4();

  @observable
  trader;

  @observable
  level1Trader;

  @observable
  extraLevel1Trader;

  @observable
  extraLevel1Trader2;

  @observable
  position;

  #duplicates = new Set();

  positions = new Map();

  timeline = new Map();

  stats = new Map();

  referencePrices = new Map();

  rowsCache = new Map();

  totalsCache = new Map();

  positionChanged(oldValue, newValue) {
    if (newValue?.operationId === '@CLEAR') {
      this.positions.clear();

      return this.rebuildStats();
    }

    if (!newValue.isBalance) {
      const currency = newValue.instrument?.currency;

      if (!currency) {
        return;
      }

      if (!this.positions.has(currency)) {
        this.positions.set(currency, new Map());
      }

      const innerMap = this.positions.get(currency);

      if (newValue.size === 0) {
        innerMap.delete(newValue.symbol);
      } else {
        innerMap.set(newValue.symbol, newValue.size);
      }

      return this.rebuildStats();
    }
  }

  @observable
  timelineItem;

  isTradeEligibleForStats(trade = {}) {
    if (!trade?.instrument) {
      return false;
    }

    if (
      trade?.instrument.broker === BROKERS.ALOR &&
      trade?.instrument.type === 'currency'
    ) {
      return;
    }

    if (typeof trade.operationId === 'undefined') {
      return;
    }

    if (this.#duplicates.has(trade.operationId)) {
      return;
    } else {
      this.#duplicates.add(trade.operationId);
    }

    if (this.trader.document.type === TRADERS.UTEX_MARGIN_STOCKS) {
      let commissionRate = +this.trader.document.commissionRate;

      if (typeof commissionRate !== 'number') {
        commissionRate = 0;
      }

      if (!trade.commission) {
        trade.commission =
          (commissionRate *
            trade.quantity *
            trade.price *
            trade.instrument.lot) /
          100;

        if (trade.price < 8) {
          trade.commission += 0.003 * trade.quantity;
        }
      }

      const date = new Date(trade.createdAt);
      const nowUtc = new Date();
      const startOfDayUtc = new Date(
        Date.UTC(
          nowUtc.getUTCFullYear(),
          nowUtc.getUTCMonth(),
          nowUtc.getUTCDate(),
          8,
          0,
          0
        )
      );
      const startOfPreviousDayUtc = new Date(
        startOfDayUtc.getTime() - 24 * 60 * 60 * 1000
      );

      if (nowUtc.getUTCHours() >= 8) {
        return date >= startOfDayUtc && date <= nowUtc;
      } else {
        return date >= startOfPreviousDayUtc && date <= nowUtc;
      }
    }

    return true;
  }

  timelineItemChanged(oldValue, newValue) {
    if (newValue?.operationId === '@CLEAR') {
      for (const [, innerMap] of this.timeline) {
        innerMap.clear();
      }

      this.timeline.clear();
      this.#duplicates.clear();

      for (const [, innerMap] of this.stats) {
        innerMap.clear();
      }

      this.stats.clear();

      for (const [, totalRowData] of this.totalsCache) {
        totalRowData.tr.remove();
      }

      for (const [, row] of this.rowsCache) {
        row.remove();
      }

      this.rowsCache.clear();
      this.totalsCache.clear();

      this.widget.document.listSource = null;

      Observable.notify(this.widget, 'document');

      return this.rebuildStats();
    }

    if (!this.isTradeEligibleForStats(newValue)) {
      return;
    }

    if (newValue.type === OPERATION_TYPE.OPERATION_TYPE_LOCATE_FEE) {
      newValue.price = 0;
      newValue.quantity = 0;
    }

    const currency = newValue.instrument.currency;

    if (!this.timeline.has(currency)) {
      this.timeline.set(currency, new Map());
    }

    const innerMap = this.timeline.get(currency);

    if (!innerMap.has(newValue.symbol)) {
      innerMap.set(newValue.symbol, []);
    }

    const array = innerMap.get(newValue.symbol);

    // From newest to oldest.
    pushSorted(
      array,
      {
        instrument: newValue.instrument,
        price: newValue.price,
        quantity: newValue.quantity,
        commission: newValue.commission,
        createdAt: new Date(newValue.createdAt),
        side:
          newValue.type === OPERATION_TYPE.OPERATION_TYPE_BUY ||
          newValue.type === OPERATION_TYPE.OPERATION_TYPE_BUY_CARD
            ? 'buy'
            : 'sell'
      },
      (a, b) => b.createdAt - a.createdAt
    );

    return this.rebuildStats();
  }

  async #referencePriceNeeded(currency, symbol, instrument) {
    if (typeof this.referencePrices.get(currency) === 'undefined') {
      this.referencePrices.set(currency, new Map());
    }

    const innerMap = this.referencePrices.get(currency);

    if (typeof innerMap.get(symbol) === 'undefined') {
      const individualSource = new IntradayStatsIndividualSymbolSource(
        this,
        currency,
        symbol,
        instrument
      );

      innerMap.set(symbol, {
        price: 0,
        source: individualSource
      });

      if (this.level1Trader) {
        await this.level1Trader.subscribeFields({
          source: individualSource,
          fieldDatumPairs: {
            lastPrice: TRADER_DATUM.LAST_PRICE,
            extendedLastPrice: TRADER_DATUM.EXTENDED_LAST_PRICE
          }
        });
      }

      if (this.extraLevel1Trader) {
        await this.extraLevel1Trader.subscribeFields({
          source: individualSource,
          fieldDatumPairs: {
            lastPrice: TRADER_DATUM.LAST_PRICE,
            extendedLastPrice: TRADER_DATUM.EXTENDED_LAST_PRICE
          }
        });
      }

      if (this.extraLevel1Trader2) {
        await this.extraLevel1Trader2.subscribeFields({
          source: individualSource,
          fieldDatumPairs: {
            lastPrice: TRADER_DATUM.LAST_PRICE,
            extendedLastPrice: TRADER_DATUM.EXTENDED_LAST_PRICE
          }
        });
      }
    }
  }

  rebuildStatsInternal() {
    for (const [currency, timeline] of this.timeline) {
      this.stats.set(currency, new Map());

      for (const [symbol, trades] of timeline) {
        const referencePrice = this.referencePrices
          .get(currency)
          ?.get(symbol)?.price;

        if (!referencePrice) {
          // Do it the async way.
          void this.#referencePriceNeeded(
            currency,
            symbol,
            trades[0].instrument
          );

          continue;
        }

        const instrument = trades[0].instrument;
        const stats = {
          instrument,
          referencePrice,
          buys: 0,
          virtualBuys: 0,
          buyQuantity: 0,
          sells: 0,
          virtualSells: 0,
          sellQuantity: 0,
          // The difference between buyQuantity, sellQuantity and portfolio.
          // If the portfolio was empty on the beginning of the day, the imbalance is 0.
          // If there were overnight long positions, the imbalance would be negative.
          // Otherwise it would be positive.
          imbalance: 0,
          gross: 0,
          commission: 0,
          // Without commission.
          net: 0
        };

        this.stats.get(currency).set(symbol, stats);

        const position = this.positions.get(currency)?.get(symbol) ?? 0;

        for (const trade of trades) {
          if (trade.side === 'buy') {
            stats.buys += trade.price * trade.quantity * instrument.lot;
            stats.buyQuantity += trade.quantity;
          } else {
            stats.sells += trade.price * trade.quantity * instrument.lot;
            stats.sellQuantity += trade.quantity;
          }

          stats.commission += trade.commission;
        }

        stats.imbalance = stats.buyQuantity - stats.sellQuantity - position;

        // Empty portfolio on the beginning of the day.
        if (stats.imbalance === 0) {
          if (stats.buyQuantity === stats.sellQuantity) {
            stats.gross = stats.sells - stats.buys;
          } else if (stats.buyQuantity > stats.sellQuantity) {
            // Long position.
            stats.virtualSells =
              (stats.buyQuantity - stats.sellQuantity) *
              referencePrice *
              instrument.lot;
            stats.commission += this.commFunc(
              referencePrice,
              stats.buyQuantity - stats.sellQuantity,
              instrument
            );
            stats.gross = stats.sells - stats.buys + stats.virtualSells;
          } else {
            // Short position.
            stats.virtualBuys =
              (stats.sellQuantity - stats.buyQuantity) *
              referencePrice *
              instrument.lot;
            stats.commission += this.commFunc(
              referencePrice,
              stats.sellQuantity - stats.buyQuantity,
              instrument,
              true
            );
            stats.gross = stats.sells - stats.buys - stats.virtualBuys;
          }
        } else {
          // Portfolio is not empty on the beginning of the day.
          if (stats.buyQuantity === stats.sellQuantity) {
            stats.gross = stats.sells - stats.buys;
          } else {
            const absImbalance = Math.abs(stats.imbalance);

            // Previous day short position.
            if (stats.imbalance > 0) {
              if (stats.sellQuantity > stats.buyQuantity) {
                // Added new shorts today.
                stats.virtualBuys =
                  (stats.sellQuantity - stats.buyQuantity) *
                  referencePrice *
                  instrument.lot;
                stats.commission += this.commFunc(
                  referencePrice,
                  stats.sellQuantity - stats.buyQuantity,
                  instrument,
                  true
                );
                stats.gross = stats.sells - stats.buys - stats.virtualBuys;
              } else {
                // Covered existing shorts today.
                // stats.sellQuantity < stats.buyQuantity
                const diff = stats.buyQuantity - stats.sellQuantity;
                const rollbackCount = diff > absImbalance ? absImbalance : diff;

                // Rollback.
                let rolled = 0;

                for (let t = trades.length - 1; t >= 0; t--) {
                  const trade = trades[t];

                  if (trade.side === 'buy') {
                    const unitCommission = trade.commission / trade.quantity;

                    for (let i = 0; i < trade.quantity; i++) {
                      rolled++;
                      stats.commission -= unitCommission;
                      stats.buys -= trade.price * instrument.lot;

                      if (rolled >= rollbackCount) {
                        break;
                      }
                    }

                    // Outer iteration.
                    if (rolled >= rollbackCount) {
                      break;
                    }
                  }
                }

                // Close virtual positions if needed (if short turned into long).
                if (diff > absImbalance) {
                  stats.virtualSells =
                    (diff - absImbalance) * referencePrice * instrument.lot;
                  stats.commission += this.commFunc(
                    referencePrice,
                    diff - absImbalance,
                    instrument
                  );
                }

                stats.gross = stats.sells - stats.buys + stats.virtualSells;
              }
            } else {
              // Previous day long position.
              if (stats.buyQuantity > stats.sellQuantity) {
                // Added new longs today.
                stats.virtualSells =
                  (stats.buyQuantity - stats.sellQuantity) *
                  referencePrice *
                  instrument.lot;
                stats.commission += this.commFunc(
                  referencePrice,
                  stats.buyQuantity - stats.sellQuantity,
                  instrument
                );
                stats.gross = stats.sells - stats.buys + stats.virtualSells;
              } else {
                // Liquidated existing longs today.
                // stats.buyQuantity < stats.sellQuantity.
                const diff = stats.sellQuantity - stats.buyQuantity;
                const rollbackCount = diff > absImbalance ? absImbalance : diff;

                // Rollback.
                let rolled = 0;

                for (let t = trades.length - 1; t >= 0; t--) {
                  const trade = trades[t];

                  if (trade.side === 'sell') {
                    const unitCommission = trade.commission / trade.quantity;

                    for (let i = 0; i < trade.quantity; i++) {
                      rolled++;
                      stats.commission -= unitCommission;
                      stats.sells -= trade.price * instrument.lot;

                      if (rolled >= rollbackCount) {
                        break;
                      }
                    }

                    // Outer iteration.
                    if (rolled >= rollbackCount) {
                      break;
                    }
                  }
                }

                // Close virtual positions if needed (if long turned into short).
                if (diff > absImbalance) {
                  stats.virtualBuys =
                    (diff - absImbalance) * referencePrice * instrument.lot;
                  stats.commission += this.commFunc(
                    referencePrice,
                    diff - absImbalance,
                    instrument,
                    true
                  );
                }

                stats.gross = stats.sells - stats.buys - stats.virtualBuys;
              }
            }
          }
        }

        stats.net = stats.gross - stats.commission;
      }
    }

    return this.displayStats();
  }

  displayStats() {
    if (this.stats.size) {
      const totals = new Map();

      // A fake one.
      this.widget.document.listSource ??= [{}];

      for (const [currency, innerMap] of this.stats) {
        totals.set(currency, {
          buys: 0,
          virtualBuys: 0,
          buyQuantity: 0,
          sells: 0,
          virtualSells: 0,
          sellQuantity: 0,
          gross: 0,
          commission: 0,
          net: 0
        });

        for (const [symbol, stats] of innerMap) {
          const t = totals.get(currency);

          t.buys += stats.buys;
          t.virtualBuys += stats.virtualBuys;
          t.buyQuantity += stats.buyQuantity;
          t.sells += stats.sells;
          t.virtualSells += stats.virtualSells;
          t.sellQuantity += stats.sellQuantity;
          t.gross += stats.gross;
          t.commission += stats.commission;
          t.net += stats.net;

          let row = this.rowsCache.get(`${symbol}:${currency}`);

          if (typeof row === 'undefined') {
            row = this.widget.tableBody.querySelector(
              `.row[symbol="${symbol}"][currency="${currency}"]`
            );

            if (row) this.rowsCache.set(`${symbol}:${currency}`, row);
          }

          // const precision = getInstrumentPrecision(
          //   stats.instrument,
          //   stats.referencePrice
          // );
          const precision = 2;
          const pnlFormatter = (value) =>
            html`
              <span
                class="${value > 0 ? 'positive' : value < 0 ? 'negative' : ''}"
              >
                ${formatAbsoluteChange(value, stats.instrument, {
                  maximumFractionDigits: precision
                })}
              </span>
            `;
          const v = {
            buys: {
              value: stats.buys,
              formatter: 'amount'
            },
            virtualBuys: {
              value: stats.virtualBuys,
              formatter: 'amount'
            },
            buyQuantity: {
              value: stats.buyQuantity,
              formatter: 'quantity'
            },
            sells: {
              value: stats.sells,
              formatter: 'amount'
            },
            virtualSells: {
              value: stats.virtualSells,
              formatter: 'amount'
            },
            sellQuantity: {
              value: stats.sellQuantity,
              formatter: 'quantity'
            },
            gross: {
              value: +stats.gross.toFixed(precision) || 0,
              formatter: pnlFormatter
            },
            commission: {
              value: Math.abs(stats.commission),
              formatter: 'amount'
            },
            net: {
              value: +stats.net.toFixed(precision) || 0,
              formatter: pnlFormatter
            }
          };

          if (!row) {
            const tr = this.widget.appendRow({
              symbol,
              traderId: this.widget.document.traderId,
              values: v
            });

            tr.setAttribute('currency', currency);
          } else {
            const columns = this.widget.columnsArray ?? [];

            for (let i = 0; i < columns.length; i++) {
              const col = columns[i];

              if (col.source === COLUMN_SOURCE.FORMATTED_VALUE) {
                const cell = row.children[i]?.firstElementChild;

                if (cell?.payload) {
                  cell.payload.values = v;

                  cell.rebuild();
                }
              }
            }
          }
        }

        // Update totals.
        let totalRowData = this.totalsCache.get(currency);

        if (typeof totalRowData === 'undefined') {
          totalRowData = {};

          this.totalsCache.set(currency, totalRowData);

          const tr = document.createElement('div');

          tr.setAttribute('currency', currency);
          tr.setAttribute('class', 'tr total');

          totalRowData.tr = tr;

          for (const col of this.widget.columnsArray) {
            const th = document.createElement('div');

            th.setAttribute('class', 'th cell');

            if (col.source === 'instrument') {
              th.style.textTransform = 'capitalize';

              totalRowData.instrument = th;
            } else if (col.source === 'symbol') {
              totalRowData.symbol = th;
            } else if (col.source === 'formatted-value') {
              if (
                [
                  'buys',
                  'virtualBuys',
                  'buyQuantity',
                  'sells',
                  'virtualSells',
                  'sellQuantity',
                  'gross',
                  'commission',
                  'net'
                ].includes(col.valueKey)
              ) {
                totalRowData[col.valueKey] = th;
              }
            }

            tr.appendChild(th);
          }

          const emptyTh = document.createElement('div');

          emptyTh.setAttribute('class', 'th cell');

          // Empty last cell.
          tr.appendChild(emptyTh);
          this.widget.tableFoot.appendChild(tr);
        }

        if (totalRowData.instrument) {
          totalRowData.instrument.textContent = currencyName(currency);
        }

        if (totalRowData.symbol) {
          totalRowData.symbol.textContent = currency;
        }

        if (totalRowData.buys) {
          totalRowData.buys.textContent = formatAmount(
            totals.get(currency).buys,
            { currency }
          );
        }

        if (totalRowData.virtualBuys) {
          totalRowData.virtualBuys.textContent = formatAmount(
            totals.get(currency).virtualBuys,
            { currency }
          );
        }

        if (totalRowData.buyQuantity) {
          totalRowData.buyQuantity.textContent = formatNumber(
            totals.get(currency).buyQuantity
          );
        }

        if (totalRowData.sells) {
          totalRowData.sells.textContent = formatAmount(
            totals.get(currency).sells,
            { currency }
          );
        }

        if (totalRowData.virtualSells) {
          totalRowData.virtualSells.textContent = formatAmount(
            totals.get(currency).virtualSells,
            { currency }
          );
        }

        if (totalRowData.sellQuantity) {
          totalRowData.sellQuantity.textContent = formatNumber(
            totals.get(currency).sellQuantity
          );
        }

        if (totalRowData.commission) {
          totalRowData.commission.textContent = formatAmount(
            totals.get(currency).commission,
            { currency }
          );
        }

        if (totalRowData.gross) {
          const gross = totals.get(currency).gross;

          totalRowData.gross.setAttribute(
            'class',
            `th cell${gross > 0 ? ' positive' : gross < 0 ? ' negative' : ''}`
          );

          totalRowData.gross.textContent = formatAbsoluteChange(
            gross,
            {
              currency
            },
            {
              maximumFractionDigits: 2
            }
          );
        }

        if (totalRowData.net) {
          const net = totals.get(currency).net;

          totalRowData.net.setAttribute(
            'class',
            `th cell${net > 0 ? ' positive' : net < 0 ? ' negative' : ''}`
          );

          totalRowData.net.textContent = formatAbsoluteChange(
            net,
            {
              currency
            },
            {
              maximumFractionDigits: 2
            }
          );
        }
      }

      Observable.notify(this.widget, 'document');
    }
  }

  async connectedCallback(widget) {
    this.widget = widget;
    this.rebuildStats = $throttle(this.rebuildStatsInternal.bind(this), 1000);
    this.commFunc = new Function(
      'price',
      'quantity',
      'instrument',
      'isBuySide',
      await new Tmpl().render(
        this.widget,
        this.widget.document.virtualTradesCommFunctionCode ??
          exampleVirtualCommFunctionCode,
        {}
      )
    );

    if (!this.widget.document.trader) {
      return this.widget.notificationsArea.error({
        text: 'Отсутствует трейдер портфеля и позиций.',
        keep: true
      });
    }

    if (this.widget.document.level1Trader) {
      this.level1Trader = await ppp.getOrCreateTrader(
        this.widget.document.level1Trader
      );
    }

    if (this.widget.document.extraLevel1Trader) {
      this.extraLevel1Trader = await ppp.getOrCreateTrader(
        this.widget.document.extraLevel1Trader
      );
    }

    if (this.widget.document.extraLevel1Trader2) {
      this.extraLevel1Trader2 = await ppp.getOrCreateTrader(
        this.widget.document.extraLevel1Trader2
      );
    }

    this.trader = await ppp.getOrCreateTrader(this.widget.document.trader);

    await this.trader.subscribeFields({
      source: this,
      fieldDatumPairs: {
        position: TRADER_DATUM.POSITION,
        timelineItem: TRADER_DATUM.TIMELINE_ITEM
      }
    });
  }

  async disconnectedCallback() {
    for (const [, innerMap] of this.referencePrices) {
      for (const [, refData] of innerMap) {
        if (this.level1Trader) {
          await this.level1Trader.unsubscribeFields({
            source: refData.source,
            fieldDatumPairs: {
              lastPrice: TRADER_DATUM.LAST_PRICE,
              extendedLastPrice: TRADER_DATUM.EXTENDED_LAST_PRICE
            }
          });
        }

        if (this.extraLevel1Trader) {
          await this.extraLevel1Trader.unsubscribeFields({
            source: refData.source,
            fieldDatumPairs: {
              lastPrice: TRADER_DATUM.LAST_PRICE,
              extendedLastPrice: TRADER_DATUM.EXTENDED_LAST_PRICE
            }
          });
        }

        if (this.extraLevel1Trader2) {
          await this.extraLevel1Trader2.unsubscribeFields({
            source: refData.source,
            fieldDatumPairs: {
              lastPrice: TRADER_DATUM.LAST_PRICE,
              extendedLastPrice: TRADER_DATUM.EXTENDED_LAST_PRICE
            }
          });
        }
      }
    }

    await this.trader?.unsubscribeFields?.({
      source: this,
      fieldDatumPairs: {
        position: TRADER_DATUM.POSITION,
        timelineItem: TRADER_DATUM.TIMELINE_ITEM
      }
    });
  }
}

export async function listDefinition() {
  return {
    extraControls: null,
    pagination: false,
    defaultColumns: DEFAULT_COLUMNS,
    control: class {
      async connectedCallback(widget) {
        widget.stats = new IntradayStats(widget);

        return widget.stats?.connectedCallback(widget);
      }

      async disconnectedCallback(widget) {
        return widget.stats?.disconnectedCallback();
      }
    },
    validate: async (widget) => {
      try {
        const commission = new Function(
          'price',
          'quantity',
          'instrument',
          'isBuySide',
          await new Tmpl().render(
            widget,
            widget.container.virtualTradesCommFunctionCode.value,
            {}
          )
        )(1, 567.35, {
          symbol: 'ROSN',
          exchange: 'MOEX',
          broker: 'alor',
          fullName: 'ПАО НК Роснефть',
          minPriceIncrement: 0.05,
          type: 'stock',
          currency: 'RUB',
          forQualInvestorFlag: false,
          classCode: 'TQBR',
          lot: 1,
          isin: 'RU000A0J2Q06'
        });

        if (isNaN(commission) || typeof commission !== 'number') {
          throw new ValidationError();
        }
      } catch (e) {
        console.dir(e);

        invalidate(widget.container.virtualTradesCommFunctionCode, {
          errorMessage: 'Исходный код не может быть использован.',
          raiseException: true
        });
      }
    },
    submit: async (widget) => {
      return {
        traderId: widget.container.traderId.value,
        level1TraderId: widget.container.level1TraderId.value,
        extraLevel1TraderId: widget.container.extraLevel1TraderId.value,
        extraLevel1Trader2Id: widget.container.extraLevel1Trader2Id.value,
        virtualTradesCommFunctionCode:
          widget.container.virtualTradesCommFunctionCode.value
      };
    },
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер для формирования статистики</h5>
          <p class="description">
            Трейдер должен поддерживать выгрузку истории операций и портфеля.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <div class="control-line flex-start">
            <ppp-query-select
              ${ref('traderId')}
              deselectable
              standalone
              placeholder="Основной трейдер"
              variant="compact"
              value="${(x) => x.document.traderId}"
              :context="${(x) => x}"
              :preloaded="${(x) => x.document.trader ?? ''}"
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
                    .find({
                      $or: [
                        {
                          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.ALOR_OPENAPI_V2%]`
                        },
                        {
                          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.PAPER_TRADE%]`
                        },
                        {
                          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.IB%]`
                        },
                        {
                          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.UTEX_MARGIN_STOCKS%]`
                        },
                        {
                          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.CUSTOM%]`
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
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Трейдер L1</h5>
          <p class="description">Источник L1-данных.</p>
        </div>
        <div class="control-line flex-start">
          <ppp-query-select
            ${ref('level1TraderId')}
            standalone
            deselectable
            placeholder="Опционально, нажмите для выбора"
            value="${(x) => x.document.level1TraderId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.level1Trader ?? ''}"
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
                  .find({
                    $and: [
                      {
                        caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_LEVEL1%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          { _id: `[%#this.document.level1TraderId ?? ''%]` }
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
          <h5>Дополнительный трейдер L1 #1</h5>
        </div>
        <div class="spacing2"></div>
        <div class="control-line flex-start">
          <ppp-query-select
            ${ref('extraLevel1TraderId')}
            standalone
            deselectable
            placeholder="Опционально, нажмите для выбора"
            value="${(x) => x.document.extraLevel1TraderId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.extraLevel1Trader ?? ''}"
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
                  .find({
                    $and: [
                      {
                        caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_LEVEL1%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.extraLevel1TraderId ?? ''%]`
                          }
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
          <h5>Дополнительный трейдер L1 #2</h5>
        </div>
        <div class="spacing2"></div>
        <div class="control-line flex-start">
          <ppp-query-select
            ${ref('extraLevel1Trader2Id')}
            standalone
            deselectable
            placeholder="Опционально, нажмите для выбора"
            value="${(x) => x.document.extraLevel1Trader2Id}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.extraLevel1Trader2 ?? ''}"
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
                  .find({
                    $and: [
                      {
                        caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_LEVEL1%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.extraLevel1Trader2Id ?? ''%]`
                          }
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
          <h5>Расчёт комиссии виртуальных сделок</h5>
        </div>
        <div class="spacing2"></div>
        <ppp-snippet
          standalone
          style="height: 200px;"
          revertable
          @revert="${(x) => {
            x.virtualTradesCommFunctionCode.updateCode(
              exampleVirtualCommFunctionCode
            );
          }}"
          :code="${(x) =>
            x.document.virtualTradesCommFunctionCode ??
            exampleVirtualCommFunctionCode}"
          ${ref('virtualTradesCommFunctionCode')}
        ></ppp-snippet>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Столбцы таблицы со статистикой</h5>
        </div>
        <div class="spacing2"></div>
        <ppp-widget-column-list
          ${ref('columnList')}
          :stencil="${() => {
            return {
              source: COLUMN_SOURCE.SYMBOL,
              name: ppp.t(`$const.columnSource.${COLUMN_SOURCE.SYMBOL}`)
            };
          }}"
          :mainTraderColumns="${() => [
            COLUMN_SOURCE.INSTRUMENT,
            COLUMN_SOURCE.SYMBOL
          ]}"
          :list="${(x) => x.document.columns ?? DEFAULT_COLUMNS}"
          :traders="${(x) => x.document.traders}"
        ></ppp-widget-column-list>
      </div>
    `
  };
}
