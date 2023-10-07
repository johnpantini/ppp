/** @decorator */

import {
  html,
  css,
  ref,
  when,
  Observable,
  observable
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { BROKERS, EXCHANGE } from '../../lib/const.js';
import { search } from '../../static/svg/sprite.js';
import { DocumentNotFoundError, validate } from '../../lib/ppp-errors.js';
import { decimalSeparator } from '../../lib/intl.js';
import { debounce } from '../../lib/ppp-decorators.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../radio-group.js';
import '../select.js';
import '../table.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const instrumentsManagePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>Торговая площадка</h5>
          <p class="description">
            Торговая площадка (биржа), на которой торгуется инструмент.
          </p>
        </div>
        <div class="input-group">
          <ppp-select
            value="${() => EXCHANGE.SPBX}"
            @change="${(x) => {
              ppp.app.setURLSearchParams({
                exchange: encodeURIComponent(x.exchange.value)
              });
            }}"
            ${ref('exchange')}
          >
            <ppp-option value="${() => EXCHANGE.MOEX}">
              Московская биржа
            </ppp-option>
            <ppp-option value="${() => EXCHANGE.SPBX}">СПБ Биржа</ppp-option>
            <ppp-option value="${() => EXCHANGE.UTEX_MARGIN_STOCKS}">
              UTEX Margin (акции)
            </ppp-option>
            <ppp-option value="${() => EXCHANGE.US}">Биржи США</ppp-option>
            <ppp-option value="${() => EXCHANGE.BINANCE}">Binance</ppp-option>
          </ppp-select>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Брокер</h5>
          <p class="description">
            Брокер, предоставляющий доступ к торговле инструментом.
          </p>
        </div>
        <div class="input-group">
          <ppp-select
            value="${() => BROKERS.ALOR}"
            @change="${(x) => {
              ppp.app.setURLSearchParams({
                broker: encodeURIComponent(x.broker.value)
              });
            }}"
            ${ref('broker')}
          >
            <ppp-option value="${() => BROKERS.UTEX}">UTEX</ppp-option>
            <ppp-option value="${() => BROKERS.TINKOFF}">Tinkoff</ppp-option>
            <ppp-option value="${() => BROKERS.ALOR}">Alor</ppp-option>
            <ppp-option value="${() => BROKERS.FINAM}">Finam</ppp-option>
            <ppp-option value="${() => BROKERS.BINANCE}">Binance</ppp-option>
            <ppp-option value="${() => BROKERS.PSINA}">Psina</ppp-option>
          </ppp-select>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Тикер</h5>
          <p class="description">Введите тикер, чтобы найти инструмент.</p>
          ${when(
            (x) => x.isSteady() && x.notFound && x.symbol.value,
            html`
              <div class="spacing2"></div>
              <ppp-banner class="inline" appearance="warning">
                Инструмент не найден в базе данных.
              </ppp-banner>
            `
          )}
        </div>
        <div class="input-group">
          <div class="control-stack">
            <ppp-text-field
              ${ref('symbol')}
              class="search-input"
              type="search"
              placeholder="AAPL"
              @input="${(x) => x.search()}"
            >
              <span class="icon" slot="end">${html.partial(search)}</span>
            </ppp-text-field>
          </div>
        </div>
      </section>
      ${when(
        (x) => x.isSteady() && x.symbol.value && x.searchEnded,
        html`
          <section>
            <div class="label-group">
              <h5>Полное наименование</h5>
              <p class="description">Полное наименование инструмента.</p>
            </div>
            <div class="input-group">
              <ppp-text-field
                placeholder="Полное наименование"
                value="${(x) => x.document.fullName}"
                ${ref('fullName')}
              ></ppp-text-field>
            </div>
          </section>
          <section>
            <div class="label-group">
              <h5>Тип</h5>
              <p class="description">Тип торгуемого инструмента.</p>
            </div>
            <div class="input-group">
              <ppp-radio-group
                orientation="vertical"
                value="${(x) => x.document.type ?? 'stock'}"
                ${ref('type')}
              >
                <ppp-radio value="stock">Акция</ppp-radio>
                <ppp-radio value="bond">Облигация</ppp-radio>
                <ppp-radio value="etf">Фонд</ppp-radio>
                <ppp-radio value="future">Фьючерс</ppp-radio>
                <ppp-radio value="cryptocurrency">
                  Криптовалютная пара
                </ppp-radio>
              </ppp-radio-group>
            </div>
          </section>
          ${when(
            (x) => x.type.value !== 'cryptocurrency',
            html`
              <section>
                <div class="label-group">
                  <h5>Валюта</h5>
                  <p class="description">
                    Валюта, в которой торгуется инструмент.
                  </p>
                </div>
                <div class="input-group">
                  <ppp-select
                    value="${(x) => x.document.currency ?? 'USD'}"
                    ${ref('currency')}
                  >
                    <ppp-option value="USD">USD</ppp-option>
                    <ppp-option value="USDT">USDT</ppp-option>
                    <ppp-option value="RUB">RUB</ppp-option>
                    <ppp-option value="HKD">HKD</ppp-option>
                    <ppp-option value="CNY">CNY</ppp-option>
                  </ppp-select>
                </div>
              </section>
            `
          )}
          ${when(
            (x) => x.exchange.value === EXCHANGE.UTEX_MARGIN_STOCKS,
            html`
              <section>
                <div class="label-group">
                  <h5>Идентификатор инструмента UTEX</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    type="number"
                    placeholder="Идентификатор"
                    value="${(x) => x.document.utexSymbolID ?? ''}"
                    ${ref('utexSymbolID')}
                  ></ppp-text-field>
                </div>
              </section>
            `
          )}
          <section>
            <div class="label-group">
              <h5>Флаги</h5>
              <p class="description">
                Параметры инструмента, принимающие значение Да или Нет.
              </p>
            </div>
            <div class="input-group">
              <div class="control-stack">
                <ppp-checkbox
                  ?checked="${(x) => x.document.forQualInvestorFlag}"
                  ${ref('forQualInvestorFlag')}
                >
                  Только для квалифицированных инвесторов
                </ppp-checkbox>
                ${when(
                  (x) => x.type.value === 'bond',
                  html`
                    <ppp-checkbox
                      ?checked="${(x) => x.document.amortizationFlag}"
                      ${ref('amortizationFlag')}
                    >
                      Облигация с амортизацией
                    </ppp-checkbox>
                    <ppp-checkbox
                      ?checked="${(x) => x.document.floatingCouponFlag}"
                      ${ref('floatingCouponFlag')}
                    >
                      Плавающий купон
                    </ppp-checkbox>
                    <ppp-checkbox
                      ?checked="${(x) => x.document.perpetualFlag}"
                      ${ref('perpetualFlag')}
                    >
                      Бессрочная облигация
                    </ppp-checkbox>
                    <ppp-checkbox
                      ?checked="${(x) => x.document.subordinatedFlag}"
                      ${ref('subordinatedFlag')}
                    >
                      Субординированная облигация
                    </ppp-checkbox>
                  `
                )}
              </div>
            </div>
          </section>
          ${when(
            (x) => x.type.value !== 'cryptocurrency',
            html`
              <section>
                <div class="label-group">
                  <h5>Лотность</h5>
                  <p class="description">
                    Минимальное количество, доступное для покупки.
                  </p>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    type="number"
                    placeholder="1"
                    value="${(x) => x.document.lot}"
                    ${ref('lot')}
                  ></ppp-text-field>
                </div>
              </section>
            `
          )}
          <section>
            <div class="label-group">
              <h5>Шаг цены</h5>
              <p class="description">
                Если указать нулевое значение, шаг будет определяться
                автоматически по цене инструмента.
              </p>
            </div>
            <div class="input-group">
              <ppp-text-field
                placeholder="${() => `0${decimalSeparator()}01`}"
                value="${(x) => x.document.minPriceIncrement}"
                @beforeinput="${(x, { event }) => {
                  return event.data === null || /[0-9.,]/.test(event.data);
                }}"
                ${ref('minPriceIncrement')}
              ></ppp-text-field>
            </div>
          </section>
          ${when(
            (x) => x.type.value === 'cryptocurrency',
            html`
              <section>
                <div class="label-group">
                  <h5>Шаг количества</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    placeholder="${() => `0${decimalSeparator()}00001`}"
                    value="${(x) => x.document.minQuantityIncrement}"
                    @beforeinput="${(x, { event }) => {
                      return event.data === null || /[0-9.,]/.test(event.data);
                    }}"
                    ${ref('minQuantityIncrement')}
                  ></ppp-text-field>
                </div>
              </section>
              <section>
                <div class="label-group">
                  <h5>Минимальная сумма заявки</h5>
                  <p class="description">
                    Измеряется в единицах актива котировки.
                  </p>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    placeholder="Минимальная сумма заявки"
                    value="${(x) => x.document.minNotional}"
                    @beforeinput="${(x, { event }) => {
                      return event.data === null || /[0-9.,]/.test(event.data);
                    }}"
                    ${ref('minNotional')}
                  ></ppp-text-field>
                </div>
              </section>
            `
          )}
          ${when(
            (x) => x.type.value !== 'cryptocurrency',
            html`
              <section>
                <div class="label-group">
                  <h5>ISIN</h5>
                  <p class="description">
                    Международный идентификационный код ценной бумаги.
                  </p>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    ?disabled="${(x) =>
                      x.type.value &&
                      x.type.value !== 'stock' &&
                      x.type.value !== 'bond'}"
                    placeholder="ISIN"
                    optional
                    value="${(x) => x.document.isin}"
                    ${ref('isin')}
                  ></ppp-text-field>
                </div>
              </section>
              ${when(
                (x) => x.broker.value === BROKERS.TINKOFF,
                html`
                  <section>
                    <div class="label-group">
                      <h5>Идентификатор FIGI</h5>
                      <ppp-badge appearance="green">
                        ${() => ppp.t(`$const.broker.${BROKERS.TINKOFF}`)}
                      </ppp-badge>
                    </div>
                    <div class="input-group">
                      <ppp-text-field
                        placeholder="FIGI"
                        value="${(x) => x.document.tinkoffFigi}"
                        style="text-transform: uppercase"
                        ${ref('tinkoffFigi')}
                      ></ppp-text-field>
                    </div>
                  </section>
                `
              )}
            `
          )}
          ${when(
            (x) =>
              !x.type.value ||
              x.type.value === 'stock' ||
              x.type.value === 'etf' ||
              x.type.value === 'bond' ||
              x.type.value === 'future',
            html`
              <section>
                <div class="label-group">
                  <h5>Класс-код (секция торгов)</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    optional
                    placeholder="Класс-код"
                    value="${(x) => x.document.classCode ?? ''}"
                    ${ref('classCode')}
                  ></ppp-text-field>
                </div>
              </section>
            `
          )}
          ${when(
            (x) => x.type.value === 'bond',
            html`
              <section>
                <div class="label-group">
                  <h5>Форма выпуска</h5>
                </div>
                <div class="input-group">
                  <ppp-select
                    value="${(x) => x.document.issueKind ?? 'non_documentary'}"
                    ${ref('issueKind')}
                  >
                    <ppp-option value="documentary">Документарная</ppp-option>
                    <ppp-option value="non_documentary">
                      Бездокументарная
                    </ppp-option>
                  </ppp-select>
                </div>
              </section>
              <section>
                <div class="label-group">
                  <h5>Начальный номинал</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    type="number"
                    placeholder="1000"
                    value="${(x) => x.document.initialNominal}"
                    ${ref('initialNominal')}
                  ></ppp-text-field>
                </div>
              </section>
              <section>
                <div class="label-group">
                  <h5>Текущий номинал</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    type="number"
                    placeholder="1000"
                    value="${(x) => x.document.nominal}"
                    ${ref('nominal')}
                  ></ppp-text-field>
                </div>
              </section>
              <section>
                <div class="label-group">
                  <h5>Дата погашения облигации</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    placeholder="Дата погашения"
                    value="${(x) => x.document.maturityDate}"
                    ${ref('maturityDate')}
                  ></ppp-text-field>
                </div>
              </section>
              <section>
                <div class="label-group">
                  <h5>Количество выплат по купонам в год</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    type="number"
                    optional
                    placeholder="Купонов в в год"
                    value="${(x) => x.document.couponQuantityPerYear}"
                    ${ref('couponQuantityPerYear')}
                  ></ppp-text-field>
                </div>
              </section>
            `
          )}
          ${when(
            (x) => x.type.value === 'future',
            html`
              <section>
                <div class="label-group">
                  <h5>Основной актив</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    placeholder="Основной актив"
                    value="${(x) => x.document.baseAsset}"
                    ${ref('baseAsset')}
                  ></ppp-text-field>
                </div>
              </section>
              <section>
                <div class="label-group">
                  <h5>Дата экспирации</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    placeholder="Дата экспирации"
                    value="${(x) => x.document.expirationDate}"
                    ${ref('expirationDate')}
                  ></ppp-text-field>
                </div>
              </section>
            `
          )}
          ${when(
            (x) => x.type.value === 'cryptocurrency',
            html`
              <section>
                <div class="label-group">
                  <h5>Основной актив</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    placeholder="Основной актив"
                    value="${(x) => x.document.baseCryptoAsset}"
                    ${ref('baseCryptoAsset')}
                  ></ppp-text-field>
                </div>
              </section>
              <section>
                <div class="label-group">
                  <h5>Актив котировки</h5>
                </div>
                <div class="input-group">
                  <ppp-text-field
                    placeholder="Актив котировки"
                    value="${(x) => x.document.quoteCryptoAsset}"
                    ${ref('quoteCryptoAsset')}
                  ></ppp-text-field>
                </div>
              </section>
            `
          )}
          <section>
            <div class="label-group">
              <h5>Пользовательские флаги</h5>
              <p class="description">
                Принимают значение Да или Нет, не перезаписываются при импорте
                инструментов.
              </p>
            </div>
            <div class="input-group">
              <div class="control-stack">
                <ppp-checkbox
                  ?checked="${(x) => x.document.removed}"
                  ${ref('removedFlag')}
                >
                  Скрыт из поиска виджетов
                </ppp-checkbox>
              </div>
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
          Сохранить инструмент
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const instrumentsManagePageStyles = css`
  ${pageStyles}
  .search-input {
    display: flex;
    margin: 5px 0 10px 0;
    width: 300px;
    text-transform: uppercase;
  }
`;

export class InstrumentsManagePage extends Page {
  collection = 'instruments';

  /**
   * True if the instrument was not found.
   * @type {boolean}
   */
  @observable
  notFound;

  @observable
  searchEnded;

  changeNotifier = {
    handleChange() {
      this.search(false);
    }
  };

  constructor() {
    super();

    this.changeNotifier.handleChange =
      this.changeNotifier.handleChange.bind(this);
  }

  async connectedCallback() {
    await super.connectedCallback();

    this.notFound = false;
    this.searchEnded = true;

    let {
      exchange = EXCHANGE.SPBX,
      broker = BROKERS.ALOR,
      symbol
    } = ppp.app.params() ?? {};

    if (Object.values(BROKERS).indexOf(broker) === -1) {
      broker = BROKERS.ALOR;
    }

    if (Object.values(EXCHANGE).indexOf(exchange) === -1) {
      exchange = EXCHANGE.SPBX;
    }

    this.exchange.value = exchange;
    this.broker.value = broker;

    if (symbol) {
      this.symbol.value = decodeURIComponent(symbol).toUpperCase();

      try {
        this.searchEnded = false;

        await this.readDocument({ raiseException: true });
      } catch (e) {
        if (e instanceof DocumentNotFoundError) {
          this.notFound = true;
        }
      } finally {
        this.searchEnded = true;
      }
    }

    Observable.getNotifier(this.exchange).subscribe(
      this.changeNotifier,
      'value'
    );

    Observable.getNotifier(this.broker).subscribe(this.changeNotifier, 'value');
  }

  disconnectedCallback() {
    Observable.getNotifier(this.exchange).unsubscribe(
      this.changeNotifier,
      'value'
    );

    Observable.getNotifier(this.broker).unsubscribe(
      this.changeNotifier,
      'value'
    );

    super.disconnectedCallback();
  }

  async #search() {
    return this.readDocument({ raiseException: true })
      .catch((e) => {
        if (e instanceof DocumentNotFoundError) {
          this.notFound = true;
        }
      })
      .finally(() => (this.searchEnded = true));
  }

  @debounce(500)
  delayedSearch() {
    return this.#search();
  }

  search(delay = true) {
    this.notFound = false;
    this.searchEnded = false;

    const symbol = this.symbol.value.trim();

    ppp.app.setURLSearchParams({
      symbol: encodeURIComponent(symbol.toUpperCase())
    });

    if (symbol) {
      delay ? this.delayedSearch() : void this.#search();
    }
  }

  getDocumentId() {
    return {
      exchange: this.exchange.value,
      broker: this.broker.value,
      symbol: this.symbol.value.toUpperCase()
    };
  }

  async validate() {
    await validate(this.symbol);
    await validate(this.fullName);

    if (this.exchange.value === EXCHANGE.UTEX_MARGIN_STOCKS) {
      await validate(this.utexSymbolID);
    }

    if (
      this.type.value === 'stock' ||
      this.type.value === 'bond' ||
      this.type.value === 'future'
    ) {
      await validate(this.lot);
    }

    await validate(this.minPriceIncrement);

    if (this.broker.value === BROKERS.TINKOFF) await validate(this.tinkoffFigi);

    if (this.type.value === 'bond') {
      await validate(this.initialNominal);
      await validate(this.nominal);
      await validate(this.maturityDate);
    }

    if (this.type.value === 'future') {
      await validate(this.baseAsset);
      await validate(this.expirationDate);
    }

    if (this.type.value === 'cryptocurrency') {
      await validate(this.minQuantityIncrement);
      await validate(this.minNotional);
      await validate(this.baseCryptoAsset);
      await validate(this.quoteCryptoAsset);
    }
  }

  async read() {
    if (!this.symbol.value) return {};

    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .findOne(
          {
            exchange: '[%#this.exchange.value%]',
            broker: '[%#this.broker.value%]',
            symbol: '[%#this.symbol.value.toUpperCase()%]'
          },
          {
            _id: 0
          }
        );
    };
  }

  async submit() {
    if (!this.searchEnded) {
      // Do nothing
      return false;
    }

    this.notFound = false;

    const $set = {
      symbol: this.symbol.value.trim(),
      fullName: this.fullName.value.trim(),
      type: this.type.value,
      exchange: this.exchange.value,
      broker: this.broker.value,
      minPriceIncrement: Math.abs(
        this.minPriceIncrement.value?.replace(',', '.')
      ),
      forQualInvestorFlag: !!this.forQualInvestorFlag.checked,
      removed: !!this.removedFlag.checked,
      updatedAt: new Date()
    };

    if (
      this.type.value === 'stock' ||
      this.type.value === 'etf' ||
      this.type.value === 'bond' ||
      this.type.value === 'future'
    ) {
      $set.lot = Math.abs(this.lot.value) || 1;
      $set.currency = this.currency.value;
      $set.isin = this.isin.value.trim();
      $set.classCode = this.classCode.value.trim();
    }

    if (this.exchange.value === EXCHANGE.UTEX_MARGIN_STOCKS) {
      $set.utexSymbolID = this.utexSymbolID.value;
    }

    if (this.broker.value === BROKERS.TINKOFF) {
      $set.tinkoffFigi = this.tinkoffFigi.value.trim();
    }

    if (this.type.value === 'bond') {
      $set.amortizationFlag = !!this.amortizationFlag.checked;
      $set.floatingCouponFlag = !!this.floatingCouponFlag.checked;
      $set.perpetualFlag = !!this.perpetualFlag.checked;
      $set.subordinatedFlag = !!this.subordinatedFlag.checked;
      $set.issueKind = this.issueKind.value;
      $set.initialNominal = this.initialNominal.value;
      $set.nominal = this.nominal.value;
      $set.maturityDate = this.maturityDate.value;
      $set.couponQuantityPerYear = Math.abs(
        this.couponQuantityPerYear.value ?? 0
      );
    }

    if (this.type.value === 'future') {
      $set.isin = '';
      $set.expirationDate = this.expirationDate.value;
      $set.baseAsset = this.baseAsset.value;
    }

    if (this.type.value === 'cryptocurrency') {
      $set.minQuantityIncrement = Math.abs(
        this.minQuantityIncrement.value?.replace(',', '.')
      );
      $set.baseCryptoAsset = this.baseCryptoAsset.value;
      $set.quoteCryptoAsset = this.quoteCryptoAsset.value;
    }

    return {
      $set,
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }

  async updateLocalCache() {
    let exchange = this.exchange.value;

    // Handle special cases
    if (this.broker.value === BROKERS.TINKOFF) {
      exchange = EXCHANGE.RUS;
    }

    const nextCacheVersion = await ppp.nextInstrumentCacheVersion({
      exchange,
      broker: this.broker.value
    });
    const cache = await ppp.openInstrumentCache({
      exchange,
      broker: this.broker.value
    });

    try {
      await new Promise((resolve, reject) => {
        const storeName = `${exchange}:${this.broker.value}`;
        const tx = cache.transaction(storeName, 'readwrite');
        const instrumentsStore = tx.objectStore(storeName);

        instrumentsStore.put(
          Object.fromEntries(
            Object.entries(this.document).filter(([k, v]) => {
              if (typeof v === 'string' && !v) return false;

              return (
                typeof v !== 'undefined' &&
                v !== null &&
                k !== '_id' &&
                v !== ''
              );
            })
          )
        );

        instrumentsStore.put({ symbol: '@version', version: nextCacheVersion });

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

  async submitDocument(options = {}) {
    try {
      await this.validate();
      await super.submitDocument(
        Object.assign(options, { silent: true, raiseException: true })
      );
      await this.updateLocalCache();

      this.showSuccessNotification();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export default InstrumentsManagePage.compose({
  template: instrumentsManagePageTemplate,
  styles: instrumentsManagePageStyles
}).define();
