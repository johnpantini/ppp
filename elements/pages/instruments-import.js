/** @decorator */

import ppp from '../../ppp.js';
import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { BROKERS, EXCHANGE, INSTRUMENT_DICTIONARY } from '../../lib/const.js';
import { invalidate, maybeFetchError, validate } from '../../lib/ppp-errors.js';
import { toNumber } from '../../traders/tinkoff-grpc-web.js';
import '../button.js';
import '../checkbox.js';
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
              UTEX Margin (акции и ETF, US)
            </ppp-option>
            <ppp-option value="${() => INSTRUMENT_DICTIONARY.PSINA_US_STOCKS}">
              Psina (акции и ETF, US)
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
            <ppp-option value="${() => INSTRUMENT_DICTIONARY.FINAM}">
              Finam
            </ppp-option>
            <ppp-option value="${() => INSTRUMENT_DICTIONARY.IB}">
              Interactive Brokers (акции и ETF, US)
            </ppp-option>
          </ppp-select>
          <div class="spacing2"></div>
          <ppp-checkbox ${ref('clearBeforeImport')}>
            Удалить инструменты словаря перед импортом (ускоряет импорт)
          </ppp-checkbox>
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
      ${when(
        (x) => x.dictionary.value === INSTRUMENT_DICTIONARY.FINAM,
        html`
          <section>
            <div class="label-group">
              <h5>Брокерский профиль Finam</h5>
              <p class="description">Необходим для формирования словаря.</p>
            </div>
            <div class="input-group">
              <ppp-query-select
                ${ref('finamBrokerId')}
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
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.FINAM%]`
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
                  ppp.app.mountPage('broker-finam', {
                    size: 'xlarge',
                    adoptHeader: true
                  })}"
                appearance="primary"
              >
                Добавить профиль Finam
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
    const rStocks = await ppp.fetch(
      'https://ususdt-api-margin.utex.io/rest/grpc/com.unitedtraders.luna.utex.protocol.mobile.MobileMetaService.getSymbolsIncludingMargin',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }
    );

    await maybeFetchError(rStocks, 'Не удалось загрузить список инструментов.');

    const stocks = await rStocks.json();
    const { symbolsInfo } = stocks;

    return symbolsInfo
      .filter((s) => {
        return (
          s.tagetCurrencyInfo?.description &&
          s.baseCurrencyInfo?.code === 'M_USDT' &&
          !/\:/.test(s.tagetCurrencyInfo.code)
        );
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

  async [INSTRUMENT_DICTIONARY.IB]() {
    const rUtexStocks = await ppp.fetch(
      'https://ususdt-api-margin.utex.io/rest/grpc/com.unitedtraders.luna.utex.protocol.mobile.MobileMetaService.getSymbolsIncludingMargin',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }
    );

    await maybeFetchError(
      rUtexStocks,
      'Не удалось загрузить список инструментов.'
    );

    const stocks = await rUtexStocks.json();
    const { symbolsInfo } = stocks;

    return symbolsInfo
      .filter((s) => {
        return (
          s.tagetCurrencyInfo?.description &&
          s.baseCurrencyInfo?.code === 'M_USDT' &&
          !/\:/.test(s.tagetCurrencyInfo.code)
        );
      })
      .map((s) => {
        return {
          symbol: s.tagetCurrencyInfo.code.split('M_')[1].replace('/', ' '),
          exchange: EXCHANGE.US,
          broker: BROKERS.IB,
          fullName: s.tagetCurrencyInfo.description,
          minPriceIncrement: 0,
          type: 'stock',
          currency: 'USD',
          forQualInvestorFlag: false,
          lot: 1
        };
      });
  }

  async [INSTRUMENT_DICTIONARY.PSINA_US_STOCKS]() {
    await validate(this.dictionaryUrl);

    const rStocks = await ppp.fetch(this.dictionaryUrl.value);

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
    const rSecurities = await fetch(
      'https://api.alor.ru/md/v2/Securities?exchange=SPBX&limit=5000&offset=0',
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(
      rSecurities,
      'Не удалось загрузить список инструментов.'
    );

    const securities = await rSecurities.json();

    return securities
      .filter((s) => {
        if (s.symbol?.endsWith('@GS')) {
          return false;
        }

        if (s.symbol?.endsWith('@GR')) {
          return false;
        }

        return ![
          'SPB',
          'SBER',
          'SBERP',
          'DSKY',
          'GAZP',
          'GMKN',
          'RSTI',
          'RTKM',
          'RUAL',
          'SIBN',
          'GZPFY',
          'SNGS',
          'SNGSP'
        ].includes(s.symbol);
      })
      .map((s) => {
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
    const rSecurities = await fetch(
      'https://api.alor.ru/md/v2/Securities?exchange=MOEX&sector=FOND&limit=5000&offset=0',
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(
      rSecurities,
      'Не удалось загрузить список инструментов.'
    );

    const securities = await rSecurities.json();

    return securities
      .filter((s) => {
        return s.board !== 'FQBR';
      })
      .map((s) => {
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
      if (
        typeof f.orderInfo?.minPriceIncrementAmount?.currency === 'undefined'
      ) {
        continue;
      }

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
      const realExchange = s.realExchange?.toUpperCase();

      if (s.ticker === 'ASTR' && s.classCode === 'TQBR') {
        s.ticker = 'ASTR~MOEX';
      }

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

      if (e.ticker === 'GOLD' && e.classCode === 'TQTF') {
        e.ticker = 'GOLD~MOEX';
      }

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

  async [INSTRUMENT_DICTIONARY.FINAM]() {
    await validate(this.finamBrokerId);

    const rFinamSecurities = await ppp.fetch(
      'https://trade-api.finam.ru/public/api/v1/securities',
      {
        headers: {
          'X-Api-Key': this.finamBrokerId.datum().token
        }
      }
    );

    await maybeFetchError(
      rFinamSecurities,
      'Не удалось авторизоваться в Finam.'
    );

    const instruments = (await rFinamSecurities.json()).data.securities ?? [];
    // USD securities only.
    const mmaStocks = instruments.filter((i) => {
      return (
        !/\s/.test(i.code) &&
        i.board === 'MCT' &&
        i.currency === 'USD' &&
        i.market?.toUpperCase?.() === 'MMA' &&
        (+i.decimals === 2 || +i.decimals === 4) &&
        +i.lotSize === 1 &&
        (+i.minStep === 1 || +i.minStep === 100)
      );
    });

    const result = [];
    const alorSpbexSecurities = await this[INSTRUMENT_DICTIONARY.ALOR_SPBX]();
    const alorMoexSecurities = await this[
      INSTRUMENT_DICTIONARY.ALOR_MOEX_SECURITIES
    ]();

    for (const s of alorSpbexSecurities) {
      if (/@/.test(s.symbol) && s.symbol !== 'SPB@US') {
        continue;
      }

      s.broker = BROKERS.FINAM;
      s.classCode = 'SPFEQ';

      result.push(s);
    }

    for (const s of alorMoexSecurities) {
      if (/@/.test(s.symbol)) {
        continue;
      }

      if (s.type === 'stock') {
        s.broker = BROKERS.FINAM;

        // Collision with "Five Below Inc".
        if (s.symbol === 'FIVE') {
          s.symbol = 'FIVE~MOEX';
        } else if (s.symbol === 'ASTR') {
          // ASTR
          s.symbol = 'ASTR~MOEX';
        }

        result.push(s);
      } else if (s.type === 'etf') {
        s.broker = BROKERS.FINAM;

        if (s.symbol === 'GOLD') {
          // GOLD
          s.symbol = 'GOLD~MOEX';
        }

        result.push(s);
      }
    }

    for (const s of mmaStocks) {
      if (s.symbol === 'SPB') {
        s.shortName = 'Spectrum Brands Holdings, Inc.';
      }

      result.push({
        symbol: s.code.replace('.', ' ') + '~US',
        exchange: EXCHANGE.US,
        broker: BROKERS.FINAM,
        fullName: s.shortName,
        minPriceIncrement: s.decimals === 2 ? 0.01 : 0.0001,
        type:
          s.shortName.toUpperCase().endsWith(' ETF') ||
          /Invesco|ProShares|iShares/i.test(s.fullName)
            ? 'etf'
            : 'stock',
        currency: 'USD',
        forQualInvestorFlag: true,
        lot: s.lotSize,
        classCode: s.board
      });
    }

    return result;
  }

  async submitDocument() {
    this.beginOperation();

    try {
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
        case INSTRUMENT_DICTIONARY.IB:
          exchange = EXCHANGE.CUSTOM;
          exchangeForDBRequest = EXCHANGE.US;
          broker = BROKERS.IB;

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
        case INSTRUMENT_DICTIONARY.FINAM:
          exchange = EXCHANGE.CUSTOM;
          exchangeForDBRequest = {
            $in: [EXCHANGE.SPBX, EXCHANGE.MOEX, EXCHANGE.US]
          };
          broker = BROKERS.FINAM;

          break;
      }

      let existingInstruments;

      if (exchange && broker && exchangeForDBRequest) {
        // Use this to preserve user field values
        existingInstruments = await ppp.user.functions.find(
          {
            collection: 'instruments'
          },
          {
            exchange: exchangeForDBRequest,
            broker
          },
          {
            symbol: 1,
            removed: 1
          }
        );
      }

      if (this.clearBeforeImport.checked) {
        await ppp.user.functions.deleteMany(
          {
            collection: 'instruments'
          },
          {
            exchange: exchangeForDBRequest,
            broker
          }
        );

        const cache = await ppp.openInstrumentCache({
          exchange,
          broker
        });

        try {
          const storeName = `${exchange}:${broker}`;
          const tx = cache.transaction(storeName, 'readwrite');
          const instrumentsStore = tx.objectStore(storeName);

          await new Promise((resolve, reject) => {
            instrumentsStore.clear();

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

      const instruments = await this[this.dictionary.value].call(this);

      if (!instruments.length) {
        invalidate(ppp.app.toast, {
          errorMessage: 'Список инструментов для импорта пуст.',
          raiseException: true
        });
      }

      // Fix execution timeout errors
      const chunks = [];

      for (let i = 0; i < instruments.length; i += 2000) {
        chunks.push(instruments.slice(i, i + 2000));
      }

      const operation = this.clearBeforeImport.checked
        ? 'insertOne'
        : 'updateOne';

      for (const chunk of chunks) {
        await ppp.user.functions.bulkWrite(
          {
            collection: 'instruments'
          },
          chunk.map((i) => {
            if (typeof i.symbol === 'string') {
              i.symbol = i.symbol.toUpperCase();
            }

            if (existingInstruments) {
              const existingInstrument = existingInstruments.find(
                (ei) => ei.symbol === i.symbol
              );

              if (existingInstrument?.removed) {
                // User flags
                i.removed = true;
              }
            }

            if (operation === 'updateOne') {
              return {
                updateOne: {
                  filter: {
                    symbol: i.symbol,
                    exchange: i.exchange,
                    broker: i.broker
                  },
                  update: {
                    $set: i
                  },
                  upsert: true
                }
              };
            } else {
              return {
                insertOne: {
                  document: i
                }
              };
            }
          }),
          {
            ordered: false
          }
        );
      }

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
            if (existingInstruments) {
              const existingInstrument = existingInstruments.find(
                (ei) => ei.symbol === i.symbol
              );

              if (existingInstrument?.removed) {
                // User flags
                i.removed = true;
              }
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
