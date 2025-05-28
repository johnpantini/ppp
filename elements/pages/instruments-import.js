/** @decorator */

import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import {
  BROKERS,
  EXCHANGE,
  INSTRUMENT_DICTIONARY,
  getInstrumentDictionaryMeta
} from '../../lib/const.js';
import { invalidate, maybeFetchError, validate } from '../../lib/ppp-errors.js';
import { toNumber } from '../../lib/traders/tinkoff-grpc-web.js';
import { dictionarySelectorTemplate } from './instruments-manage.js';
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
          ${dictionarySelectorTemplate()}
          <div class="spacing2"></div>
          <ppp-checkbox
            @change="${(x) => {
              ppp.settings.set(
                'clearInstrumentsBeforeImport',
                x.clearBeforeImport.checked
              );
            }}"
            ${ref('clearBeforeImport')}
            ?checked="${() =>
              ppp.settings.get('clearInstrumentsBeforeImport') ?? true}"
          >
            Удалить инструменты словаря перед импортом (ускоряет импорт)
          </ppp-checkbox>
        </div>
      </section>
      <section
        ?hidden="${(x) =>
          !(
            x.dictionary.value === INSTRUMENT_DICTIONARY.PSINA_US_STOCKS ||
              x.dictionary.value === INSTRUMENT_DICTIONARY.ALPACA ||
              x.dictionary.value === INSTRUMENT_DICTIONARY.IB
          )}"
      >
        <div class="label-group">
          <h5>Ссылка на словарь</h5>
          <p class="description">
            Этот словарь загружается из внешнего источника по ссылке. Значение
            запоминается при редактировании.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="url"
            placeholder="https://example.com"
            @input="${(x) => {
              ppp.settings.set(
                'psinaStocksDictionaryUrl',
                x.dictionaryUrl.value ?? ''
              );
            }}"
            value="${(x) => ppp.settings.get('psinaStocksDictionaryUrl') ?? ''}"
            ${ref('dictionaryUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <section hidden>
        <div class="label-group">
          <h5>Параметры импорта</h5>
        </div>
        <div class="input-group">
          <ppp-checkbox checked ${ref('psinaSkipOTC')}>
            Не импортировать инструменты OTC
          </ppp-checkbox>
        </div>
      </section>
      <section
        ?hidden="${(x) => x.dictionary.value !== INSTRUMENT_DICTIONARY.TINKOFF}"
      >
        <div class="label-group">
          <h5>Брокерский профиль T-Bank</h5>
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
            Добавить профиль T-Bank
          </ppp-button>
        </div>
      </section>
      <section
        ?hidden="${(x) => x.dictionary.value !== INSTRUMENT_DICTIONARY.FINAM}"
      >
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
      <section
        ?hidden="${(x) =>
          x.dictionary.value !== INSTRUMENT_DICTIONARY.CAPITALCOM}"
      >
        <div class="label-group">
          <h5>Брокерский профиль Capital.com</h5>
          <p class="description">Необходим для формирования словаря.</p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('capitalcomBrokerId')}
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
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.CAPITALCOM%]`
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
              ppp.app.mountPage('broker-capitalcom', {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить профиль Capital.com
          </ppp-button>
        </div>
      </section>
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
        const fullName = s.tagetCurrencyInfo.description;

        return {
          symbol: s.tagetCurrencyInfo.code.split('M_')[1].replace('/', ' '),
          exchange: EXCHANGE.UTEX_MARGIN_STOCKS,
          broker: BROKERS.UTEX,
          fullName,
          minPriceIncrement: s.priceStep / 1e8,
          type:
            /ETF|ETN/.test(fullName) ||
            /Invesco|ProShares|iShares|Direxion|SPDR/i.test(fullName)
              ? 'etf'
              : 'stock',
          currency: s.baseCurrencyInfo.code.split('M_')[1],
          forQualInvestorFlag: false,
          utexSymbolID: s.id,
          lot: s.qtyStep
        };
      });
  }

  async psinaStocks(broker) {
    await validate(this.dictionaryUrl);

    const rStocks = await ppp.fetch(this.dictionaryUrl.value);

    await maybeFetchError(rStocks, 'Не удалось загрузить список инструментов.');

    const stocks = await rStocks.json();
    // const psinaSkipOTC = this.psinaSkipOTC.checked;
    const psinaSkipOTC = true;

    return stocks
      .filter((s) => {
        if (psinaSkipOTC) {
          return (
            !s.realExchange?.startsWith('OTC') && s.realExchange !== 'EXMKT'
          );
        } else {
          return true;
        }
      })
      .map((s) => {
        if (s.type === 'preipo' || s.type === 'ipo') {
          s.type = 'stock';
        }

        return {
          symbol: s.symbol,
          exchange: EXCHANGE.US,
          broker,
          fullName: s.fullName,
          minPriceIncrement: 0,
          type: s.type ?? 'stock',
          currency: 'USD',
          forQualInvestorFlag: false,
          lot: 1
        };
      });
  }

  async [INSTRUMENT_DICTIONARY.IB]() {
    return this.psinaStocks(BROKERS.IB);
  }

  async [INSTRUMENT_DICTIONARY.ALPACA]() {
    return this.psinaStocks(BROKERS.ALPACA);
  }

  async [INSTRUMENT_DICTIONARY.PSINA_US_STOCKS]() {
    return this.psinaStocks(BROKERS.PSINA);
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

  async [INSTRUMENT_DICTIONARY.ALOR_MOEX_FX_METALS]() {
    const rInstruments = await fetch(
      'https://api.alor.ru/md/v2/Securities?exchange=MOEX&sector=CURR&limit=5000&offset=0',
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(
      rInstruments,
      'Не удалось загрузить список инструментов.'
    );

    const securities = await rInstruments.json();

    return securities.map((s) => {
      return {
        symbol: s.symbol,
        exchange: EXCHANGE.MOEX,
        broker: BROKERS.ALOR,
        fullName: s.description,
        minPriceIncrement: s.minstep,
        type: 'currency',
        currency: s.currency,
        forQualInvestorFlag: false,
        classCode: s.board,
        lot: s.lotsize
      };
    });
  }

  async #tBankSecurities(security = 'Shares', token) {
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
      (await this.#tBankSecurities(
        'Shares',
        this.tinkoffBrokerId.datum().apiToken
      )) ?? [];
    const bonds =
      (await this.#tBankSecurities(
        'Bonds',
        this.tinkoffBrokerId.datum().apiToken
      )) ?? [];
    const etfs =
      (await this.#tBankSecurities(
        'Etfs',
        this.tinkoffBrokerId.datum().apiToken
      )) ?? [];
    const futures =
      (await this.#tBankSecurities(
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
    const alorMoexSecurities =
      await this[INSTRUMENT_DICTIONARY.ALOR_MOEX_SECURITIES]();

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

  async [INSTRUMENT_DICTIONARY.CAPITALCOM]() {
    await validate(this.capitalcomBrokerId);

    const { identifier, key, password } = this.capitalcomBrokerId.datum();
    const sessionResponse = await fetch(
      'https://api-capital.backend-capital.com/api/v1/session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CAP-API-KEY': key
        },
        body: JSON.stringify({
          identifier,
          password,
          encryptedPassword: false
        })
      }
    );

    const rSecurities = await ppp.fetch(
      'https://api-capital.backend-capital.com/api/v1/markets',
      {
        method: 'GET',
        headers: {
          'X-SECURITY-TOKEN': sessionResponse.headers.get('X-SECURITY-TOKEN'),
          CST: sessionResponse.headers.get('CST')
        }
      }
    );

    const { markets } = await rSecurities.json();
    const iterable = markets.filter((i) =>
      ['COMMODITIES', 'CURRENCIES', 'INDICES'].includes(i?.instrumentType)
    );

    const result = [];

    for (const s of iterable) {
      const type = {
        COMMODITIES: 'commodity',
        CURRENCIES: 'currency',
        INDICES: 'index'
      }[s.instrumentType];

      let currency = 'N/A';

      if (['OIL_CRUDE', 'OIL_BRENT'].includes(s.epic)) {
        currency = 'USD';
      }

      result.push({
        symbol: s.epic,
        exchange: EXCHANGE.CAPITALCOM,
        broker: BROKERS.CAPITALCOM,
        fullName: s.instrumentName,
        minPriceIncrement: 0,
        type,
        currency,
        forQualInvestorFlag: false,
        lot: s.lotSize
      });
    }

    return result;
  }

  async [INSTRUMENT_DICTIONARY.BINANCE]() {
    const rExchangeInfo = await fetch(
      'https://api.binance.com/api/v3/exchangeInfo',
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

  async #bybitInstruments(category = 'spot') {
    const rInstrumentsInfo = await fetch(
      `https://api.bybit.com//v5/market/instruments-info?category=${category}&limit=1000`,
      {
        cache: 'reload'
      }
    );

    await maybeFetchError(
      rInstrumentsInfo,
      'Не удалось загрузить список инструментов.'
    );

    const json = await rInstrumentsInfo.json();
    const result = [];

    for (const s of json.result.list ?? []) {
      result.push({
        symbol: s.symbol,
        exchange:
          category === 'spot' ? EXCHANGE.BYBIT_SPOT : EXCHANGE.BYBIT_LINEAR,
        broker: BROKERS.BYBIT,
        fullName: `${s.baseCoin}/${s.quoteCoin}`,
        minPriceIncrement: parseFloat(s.priceFilter.tickSize),
        minQuantityIncrement: parseFloat(
          category === 'linear'
            ? s.lotSizeFilter.qtyStep
            : s.lotSizeFilter.basePrecision
        ),
        type: 'cryptocurrency',
        baseCryptoAsset: s.baseCoin,
        quoteCryptoAsset: s.quoteCoin,
        minNotional: 0,
        forQualInvestorFlag: false
      });
    }

    return result;
  }

  async [INSTRUMENT_DICTIONARY.BYBIT_SPOT]() {
    return this.#bybitInstruments('spot');
  }

  async [INSTRUMENT_DICTIONARY.BYBIT_LINEAR]() {
    return this.#bybitInstruments('linear');
  }

  async connectedCallback() {
    await super.connectedCallback();

    let { dictionary = INSTRUMENT_DICTIONARY.ALOR_MOEX_SECURITIES } =
      ppp.app.params() ?? {};

    if (Object.values(INSTRUMENT_DICTIONARY).indexOf(dictionary) === -1) {
      dictionary = INSTRUMENT_DICTIONARY.ALOR_MOEX_SECURITIES;
    }

    this.dictionary.value = dictionary;
  }

  async submitDocument() {
    this.beginOperation();

    try {
      const instruments = await this[this.dictionary.value].call(this);

      if (!instruments.length) {
        invalidate(ppp.app.toast, {
          errorMessage: 'Список инструментов для импорта пуст.',
          raiseException: true
        });
      }

      const { exchange, broker } = getInstrumentDictionaryMeta(
        this.dictionary.value
      );

      let existingInstruments;

      if (exchange && broker) {
        // Use this to preserve user field values.
        existingInstruments = await ppp.user.functions.find(
          {
            collection: 'instruments'
          },
          {
            broker,
            dictionary: this.dictionary.value
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
            broker,
            dictionary: this.dictionary.value
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

            i.dictionary = this.dictionary.value;

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
