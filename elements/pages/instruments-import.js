/** @decorator */

import ppp from '../../ppp.js';
import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { BROKERS, EXCHANGE, INSTRUMENT_DICTIONARY } from '../../lib/const.js';
import { maybeFetchError, validate } from '../../lib/ppp-errors.js';
import { toNumber } from '../../traders/tinkoff-grpc-web.js';
import '../button.js';
import '../query-select.js';
import '../select.js';

export const instrumentsImportPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>Словарь</h5>
          <p class="description">
            Выберите словарь-источник для импорта инструментов.
          </p>
        </div>
        <div class="input-group">
          <ppp-select
            value="${() => INSTRUMENT_DICTIONARY.BINANCE}"
            ${ref('dictionary')}
          >
            <ppp-option value="${() => INSTRUMENT_DICTIONARY.BINANCE}">
              Binance
            </ppp-option>
            <ppp-option
              value="${() => INSTRUMENT_DICTIONARY.UTEX_MARGIN_STOCKS}"
            >
              UTEX Margin (акции)
            </ppp-option>
            <ppp-option value="${() => INSTRUMENT_DICTIONARY.PSINA_US_STOCKS}">
              Акции US (Psina)
            </ppp-option>
            <ppp-option value="${() => INSTRUMENT_DICTIONARY.ALOR_SPBX}">
              Alor (СПБ Биржа)
            </ppp-option>
            <ppp-option
              value="${() => INSTRUMENT_DICTIONARY.ALOR_MOEX_SECURITIES}"
            >
              Alor (Московская биржа), фондовый рынок
            </ppp-option>
            <ppp-option value="${() => INSTRUMENT_DICTIONARY.ALOR_FORTS}">
              Alor (Московская биржа), срочный рынок
            </ppp-option>
            <ppp-option value="${() => INSTRUMENT_DICTIONARY.TINKOFF}">
              Tinkoff
            </ppp-option>
          </ppp-select>
        </div>
      </section>
      ${when(
        (x) => x.dictionary.value === INSTRUMENT_DICTIONARY.PSINA_US_STOCKS,
        html`
          <section>
            <div class="label-group">
              <h5>Ссылка на словарь</h5>
            </div>
            <div class="input-group">
              <ppp-text-field
                type="url"
                placeholder="https://example.com"
                ${ref('dictionaryUrl')}
              ></ppp-text-field>
            </div>
          </section>
        `
      )}
      ${when(
        (x) => x.dictionary.value === INSTRUMENT_DICTIONARY.TINKOFF,
        html`
          <section>
            <div class="label-group">
              <h5>Брокерский профиль Tinkoff</h5>
              <p class="description">Необходим для формирования словаря.</p>
            </div>
            <div class="input-group">
              <ppp-query-select
                ${ref('tinkoffBrokerId')}
                :context="${(x) => x}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('brokers')
                      .find({
                        $and: [
                          {
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.TINKOFF%]`
                          },
                          { removed: { $ne: true } }
                        ]
                      })
                      .sort({ updatedAt: -1 });
                  };
                }}"
                :transform="${() => ppp.decryptDocumentsTransformation()}"
              ></ppp-query-select>
              <div class="spacing2"></div>
              <ppp-button
                @click="${() =>
                  ppp.app.mountPage('broker-tinkoff', {
                    size: 'xlarge',
                    adoptHeader: true
                  })}"
                appearance="primary"
              >
                Добавить профиль Tinkoff
              </ppp-button>
            </div>
          </section>
        `
      )}
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
          ${ref('submitControl')}
        >
          Импортировать инструменты
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const instrumentsImportPageStyles = css`
  ${pageStyles}
`;

export class InstrumentsImportPage extends Page {
  collection = 'instruments';

  async [INSTRUMENT_DICTIONARY.UTEX_MARGIN_STOCKS]() {
    const rSymbols = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        cache: 'reload',
        method: 'POST',
        body: JSON.stringify({
          method: 'POST',
          url: 'https://ususdt-api-margin.utex.io/rest/grpc/com.unitedtraders.luna.utex.protocol.mobile.MobileMetaService.getSymbolsIncludingMargin',
          body: JSON.stringify({})
        })
      }
    );

    await maybeFetchError(
      rSymbols,
      'Не удалось загрузить список инструментов.'
    );

    const symbols = await rSymbols.json();
    const { symbolsInfo } = symbols;

    return symbolsInfo
      .filter((s) => {
        return s.tagetCurrencyInfo.description;
      })
      .map((s) => {
        return {
          symbol: s.tagetCurrencyInfo.code.split('M_')[1].replace('/', ' '),
          exchange: EXCHANGE.UTEX_MARGIN_STOCKS,
          broker: BROKERS.UTEX,
          fullName: s.tagetCurrencyInfo.description,
          minPriceIncrement: s.priceStep / 1e8,
          type: 'stock',
          currency: s.baseCurrencyInfo.code.split('M_')[1],
          forQualInvestorFlag: false,
          utexSymbolID: s.id,
          lot: s.qtyStep
        };
      });
  }

  async [INSTRUMENT_DICTIONARY.PSINA_US_STOCKS]() {
    await validate(this.dictionaryUrl);

    const rStocks = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        cache: 'reload',
        method: 'POST',
        body: JSON.stringify({
          method: 'GET',
          url: this.dictionaryUrl.value
        })
      }
    );

    await maybeFetchError(rStocks, 'Не удалось загрузить список инструментов.');

    const stocks = await rStocks.json();

    return stocks.map((s) => {
      return {
        symbol: s.symbol.replace('-', ' '),
        exchange: EXCHANGE.US,
        broker: BROKERS.PSINA,
        fullName: s.fullName,
        minPriceIncrement: 0,
        type:
          s.fullName.toUpperCase().endsWith(' ETF') ||
          /Invesco|ProShares|iShares/i.test(s.fullName)
            ? 'etf'
            : 'stock',
        currency: 'USD',
        forQualInvestorFlag: false,
        lot: 1
      };
    });
  }

  async [INSTRUMENT_DICTIONARY.BINANCE]() {
    const rExchangeInfo = await fetch(
      `https://api.binance.com/api/v3/exchangeInfo`,
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(
      rExchangeInfo,
      'Не удалось загрузить список инструментов.'
    );

    const { symbols } = await rExchangeInfo.json();
    const result = [];

    for (const s of symbols) {
      result.push({
        symbol: s.symbol,
        exchange: EXCHANGE.BINANCE,
        broker: BROKERS.BINANCE,
        fullName: `${s.baseAsset}/${s.quoteAsset}`,
        minPriceIncrement: parseFloat(
          s.filters.find((f) => f.filterType === 'PRICE_FILTER').tickSize
        ),
        minQuantityIncrement: parseFloat(
          s.filters.find((f) => f.filterType === 'LOT_SIZE').stepSize
        ),
        type: 'cryptocurrency',
        baseCryptoAsset: s.baseAsset,
        quoteCryptoAsset: s.quoteAsset,
        minNotional: parseFloat(
          s.filters.find((f) => f.filterType === 'NOTIONAL').minNotional
        ),
        forQualInvestorFlag: false
      });
    }

    return result;
  }

  async [INSTRUMENT_DICTIONARY.ALOR_SPBX]() {
    const rSymbols = await fetch(
      'https://api.alor.ru/md/v2/Securities?exchange=SPBX&limit=5000&offset=0',
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(
      rSymbols,
      'Не удалось загрузить список инструментов.'
    );

    const symbols = await rSymbols.json();

    return symbols.map((s) => {
      let type = 'stock';

      if (s.cfiCode?.startsWith?.('C') && !s.cfiCode?.startsWith?.('CB'))
        type = 'etf';

      return {
        symbol: s.symbol,
        exchange: EXCHANGE.SPBX,
        broker: BROKERS.ALOR,
        fullName: s.description,
        minPriceIncrement: s.minstep,
        type,
        currency: s.currency,
        forQualInvestorFlag: s.currency !== 'RUB',
        lot: s.lotsize,
        isin: s.ISIN
      };
    });
  }

  async [INSTRUMENT_DICTIONARY.ALOR_MOEX_SECURITIES]() {
    const rSymbols = await fetch(
      'https://api.alor.ru/md/v2/Securities?exchange=MOEX&sector=FOND&limit=5000&offset=0',
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(
      rSymbols,
      'Не удалось загрузить список инструментов.'
    );

    const symbols = await rSymbols.json();

    return symbols.map((s) => {
      let type = 'stock';

      if (s.cfiCode?.startsWith?.('DB')) type = 'bond';

      if (s.type === 'ETF' || s.type === 'MF') type = 'etf';

      const payload = {
        symbol: s.symbol,
        exchange: EXCHANGE.MOEX,
        broker: BROKERS.ALOR,
        fullName: s.description,
        minPriceIncrement: s.minstep,
        type,
        currency: s.currency,
        forQualInvestorFlag: false,
        classCode: s.board,
        lot: s.lotsize,
        isin: s.ISIN
      };

      if (type === 'bond') {
        payload.nominal = s.facevalue;
        payload.initialNominal = s.facevalue;

        if (s.cancellation) {
          payload.maturityDate = new Date(s.cancellation).toISOString();
        }
      }

      return payload;
    });
  }

  async [INSTRUMENT_DICTIONARY.ALOR_FORTS]() {
    const { payload } = await (
      await fetch('https://api.tinkoff.ru/trading/futures/list')
    ).json();

    const instruments = [];

    for (const f of payload.values) {
      instruments.push({
        symbol: f.instrumentInfo.ticker.toUpperCase(),
        exchange: EXCHANGE.MOEX,
        broker: BROKERS.ALOR,
        fullName: f.viewInfo.showName,
        minPriceIncrement: f.orderInfo.minPriceIncrement,
        type: 'future',
        currency: f.orderInfo.minPriceIncrementAmount.currency.toUpperCase(),
        forQualInvestorFlag: false,
        lot: f.orderInfo.lotSize,
        classCode: f.instrumentInfo.classCode,
        expirationDate: new Date(f.instrumentInfo.lastTradeDate).toISOString(),
        baseAsset: f.instrumentInfo.basicAsset
      });
    }

    return instruments;
  }

  async #tinkoffSecurities(security = 'Shares', token) {
    try {
      return (
        await (
          await fetch(
            `https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1.InstrumentsService/${security}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'x-app-name': 'johnpantini.ppp'
              },
              body: JSON.stringify({
                instrumentStatus: 'INSTRUMENT_STATUS_UNSPECIFIED'
              })
            }
          )
        ).json()
      ).instruments;
    } catch (e) {
      console.error(e);

      return [];
    }
  }

  async [INSTRUMENT_DICTIONARY.TINKOFF]() {
    await validate(this.tinkoffBrokerId);

    const instruments = [];
    const stocks =
      (await this.#tinkoffSecurities(
        'Shares',
        this.tinkoffBrokerId.datum().apiToken
      )) ?? [];
    const bonds =
      (await this.#tinkoffSecurities(
        'Bonds',
        this.tinkoffBrokerId.datum().apiToken
      )) ?? [];
    const etfs =
      (await this.#tinkoffSecurities(
        'Etfs',
        this.tinkoffBrokerId.datum().apiToken
      )) ?? [];
    const futures =
      (await this.#tinkoffSecurities(
        'Futures',
        this.tinkoffBrokerId.datum().apiToken
      )) ?? [];

    for (const s of stocks) {
      const realExchange = s.realExchange;

      if (
        realExchange === 'REAL_EXCHANGE_MOEX' ||
        realExchange === 'REAL_EXCHANGE_RTS'
      ) {
        instruments.push({
          symbol: s.ticker.replace('.', ' ').toUpperCase(),
          exchange:
            realExchange === 'REAL_EXCHANGE_MOEX'
              ? EXCHANGE.MOEX
              : EXCHANGE.SPBX,
          broker: BROKERS.TINKOFF,
          tinkoffFigi: s.figi,
          fullName: s.name,
          minPriceIncrement: toNumber(s.minPriceIncrement),
          type: 'stock',
          currency: s.currency.toUpperCase(),
          forQualInvestorFlag: s.forQualInvestorFlag,
          lot: s.lot,
          isin: s.isin,
          classCode: s.classCode
        });
      }
    }

    for (const b of bonds) {
      const realExchange = b.realExchange;

      if (
        realExchange === 'REAL_EXCHANGE_MOEX' ||
        realExchange === 'REAL_EXCHANGE_RTS'
      ) {
        instruments.push({
          symbol: b.ticker.replace('.', ' ').toUpperCase(),
          exchange:
            realExchange === 'REAL_EXCHANGE_MOEX'
              ? EXCHANGE.MOEX
              : EXCHANGE.SPBX,
          broker: BROKERS.TINKOFF,
          tinkoffFigi: b.figi,
          fullName: b.name,
          minPriceIncrement: toNumber(b.minPriceIncrement),
          type: 'bond',
          currency: b.currency.toUpperCase(),
          forQualInvestorFlag: b.forQualInvestorFlag,
          amortizationFlag: b.amortizationFlag,
          floatingCouponFlag: b.floatingCouponFlag,
          perpetualFlag: b.perpetualFlag,
          subordinatedFlag: b.subordinatedFlag,
          lot: b.lot,
          isin: b.isin,
          classCode: b.classCode,
          issueKind: b.issueKind,
          initialNominal: toNumber(b.initialNominal),
          nominal: toNumber(b.nominal),
          maturityDate: b.maturityDate,
          couponQuantityPerYear: b.couponQuantityPerYear
        });
      }
    }

    for (const e of etfs) {
      const realExchange = e.realExchange;

      if (
        realExchange === 'REAL_EXCHANGE_MOEX' ||
        realExchange === 'REAL_EXCHANGE_RTS'
      ) {
        instruments.push({
          symbol: e.ticker.replace('.', ' ').toUpperCase(),
          exchange:
            realExchange === 'REAL_EXCHANGE_MOEX'
              ? EXCHANGE.MOEX
              : EXCHANGE.SPBX,
          broker: BROKERS.TINKOFF,
          tinkoffFigi: e.figi,
          fullName: e.name,
          minPriceIncrement: toNumber(e.minPriceIncrement),
          type: 'etf',
          currency: e.currency.toUpperCase(),
          forQualInvestorFlag: e.forQualInvestorFlag,
          lot: e.lot,
          isin: e.isin,
          classCode: e.classCode
        });
      }
    }

    for (const f of futures) {
      const realExchange = f.realExchange;

      if (
        realExchange === 'REAL_EXCHANGE_MOEX' ||
        realExchange === 'REAL_EXCHANGE_RTS'
      ) {
        instruments.push({
          symbol: f.ticker.replace('.', ' ').toUpperCase(),
          exchange:
            realExchange === 'REAL_EXCHANGE_MOEX'
              ? EXCHANGE.MOEX
              : EXCHANGE.SPBX,
          broker: BROKERS.TINKOFF,
          tinkoffFigi: f.figi,
          fullName: f.name,
          minPriceIncrement: toNumber(f.minPriceIncrement),
          type: 'future',
          currency: f.currency.toUpperCase(),
          forQualInvestorFlag: f.forQualInvestorFlag,
          lot: f.lot,
          classCode: f.classCode,
          expirationDate: f.expirationDate,
          baseAsset: f.basicAsset
        });
      }
    }

    return instruments;
  }

  async submitDocument() {
    this.beginOperation();

    try {
      const instruments = await this[this.dictionary.value].call(this);

      await ppp.user.functions.bulkWrite(
        {
          collection: 'instruments'
        },
        instruments.map((i) => {
          const updateClause = {
            $set: i
          };

          return {
            updateOne: {
              filter: {
                symbol: i.symbol.toUpperCase(),
                exchange: i.exchange,
                broker: i.broker
              },
              update: updateClause,
              upsert: true
            }
          };
        }),
        {
          ordered: false
        }
      );

      let exchange;
      let exchangeForDBRequest;
      let broker;

      switch (this.dictionary.value) {
        case INSTRUMENT_DICTIONARY.BINANCE:
          exchange = EXCHANGE.BINANCE;
          exchangeForDBRequest = EXCHANGE.BINANCE;
          broker = BROKERS.BINANCE;

          break;
        case INSTRUMENT_DICTIONARY.UTEX_MARGIN_STOCKS:
          exchange = EXCHANGE.UTEX_MARGIN_STOCKS;
          exchangeForDBRequest = EXCHANGE.UTEX_MARGIN_STOCKS;
          broker = BROKERS.UTEX;

          break;
        case INSTRUMENT_DICTIONARY.PSINA_US_STOCKS:
          exchange = EXCHANGE.US;
          exchangeForDBRequest = EXCHANGE.US;
          broker = BROKERS.PSINA;

          break;

        case INSTRUMENT_DICTIONARY.ALOR_SPBX:
          exchange = EXCHANGE.SPBX;
          exchangeForDBRequest = EXCHANGE.SPBX;
          broker = BROKERS.ALOR;

          break;

        case INSTRUMENT_DICTIONARY.ALOR_MOEX_SECURITIES:
          exchange = EXCHANGE.MOEX_SECURITIES;
          exchangeForDBRequest = EXCHANGE.MOEX;
          broker = BROKERS.ALOR;

          break;

        case INSTRUMENT_DICTIONARY.ALOR_FORTS:
          exchange = EXCHANGE.MOEX_FORTS;
          exchangeForDBRequest = EXCHANGE.MOEX;
          broker = BROKERS.ALOR;

          break;

        case INSTRUMENT_DICTIONARY.TINKOFF:
          exchange = EXCHANGE.RUS;
          exchangeForDBRequest = {
            $in: [EXCHANGE.SPBX, EXCHANGE.MOEX]
          };
          broker = BROKERS.TINKOFF;

          break;
      }

      if (exchange && broker && exchangeForDBRequest) {
        // Use this to preserve user field values
        const existingInstruments = await ppp.user.functions.find(
          {
            collection: 'instruments'
          },
          {
            exchange: exchangeForDBRequest,
            broker
          }
        );

        const nextCacheVersion = await ppp.nextInstrumentCacheVersion({
          exchange,
          broker
        });
        const cache = await ppp.openInstrumentCache({
          exchange,
          broker
        });

        try {
          await new Promise((resolve, reject) => {
            const storeName = `${exchange}:${broker}`;
            const tx = cache.transaction(storeName, 'readwrite');
            const instrumentsStore = tx.objectStore(storeName);

            instrumentsStore.put({
              symbol: '@version',
              version: nextCacheVersion
            });

            instruments.forEach((i) => {
              const existingInstrument = existingInstruments.find(
                (ei) => ei.symbol === i.symbol
              );

              if (existingInstrument?.removed) {
                // User flags
                i.removed = true;
              }

              instrumentsStore.put(i);
            });

            tx.oncomplete = () => {
              resolve();
            };

            tx.onerror = (event) => {
              reject(event.target.error);
            };
          });
        } finally {
          cache.close();
        }
      }

      this.showSuccessNotification(
        `Операция выполнена, импортировано инструментов: ${instruments.length}`
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export default InstrumentsImportPage.compose({
  template: instrumentsImportPageTemplate,
  styles: instrumentsImportPageStyles
}).define();
