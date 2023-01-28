import { InstrumentsManagePage } from '../../shared/instruments-manage-page.js';
import { html, requireComponent } from '../../shared/template.js';
import { css } from '../../shared/element/styles/css.js';
import { ref } from '../../shared/element/templating/ref.js';
import { children } from '../../shared/element/templating/children.js';
import { elements } from '../../shared/element/templating/node-observation.js';
import { when } from '../../shared/element/templating/when.js';
import { Observable } from '../../shared/element/observation/observable.js';
import { BROKERS } from '../../shared/const.js';
import { pageStyles } from './page.js';
import { search } from './icons/search.js';
import { decimalSeparator } from '../../shared/intl.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);
await requireComponent('ppp-checkbox');

export const instrumentsManagePageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} headless>
        <${'ppp-banner'} class="inline margin-top" appearance="info">
          Введите краткое наименование (тикер) инструмента, чтобы загрузить для
          редактирования:
        </ppp-banner>
        <${'ppp-text-field'}
          ${ref('symbol')}
          class="search-input"
          type="search"
          placeholder="Поиск инструмента"
          value="${(x) => x.searchText}"
          @input="${(x, c) => {
            x.searchText = c.event.target.value.toUpperCase();
            x.searchEnded = !x.searchText;

            x.search();
          }}"
        >
          ${search({
            slot: 'end'
          })}
        </ppp-text-field>
        <section>
          <div class="label-group">
            <h5>Краткое наименование</h5>
            <p>Краткое наименование (тикер) инструмента.</p>
            ${when(
              (x) => !x.page?.loading && x.notFound && x.searchText,
              html`
                <${'ppp-banner'} class="inline margin-top" appearance="warning">
                  Инструмент отсутствует в базе данных.
                </ppp-banner>
              `
            )}
            ${when(
              (x) => x.document.removed,
              html`
                <${'ppp-banner'} class="inline margin-top" appearance="warning">
                  Инструмент удалён из приложения и не показывается в поиске
                  виджетов.
                </ppp-banner>
              `
            )}
          </div>
          <div class="input-group">
            <ppp-text-field
              disabled
              placeholder="Краткое наименование"
              value="${(x) => x.searchText}"
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Полное наименование</h5>
            <p>Полное наименование инструмента.</p>
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
            <p>Тип торгуемого инструмента.</p>
          </div>
          <div class="input-group">
            <${'ppp-radio-group'}
              orientation="vertical"
              value="${(x) => x.document.type ?? 'stock'}"
              @change="${(x) => {
                x.document.type = x.type.value;

                Observable.notify(x, 'document');
              }}"
              ${ref('type')}
            >
              <${'ppp-radio'} value="stock">Акция</ppp-radio>
              <ppp-radio value="bond">Облигация</ppp-radio>
              <ppp-radio value="future">Фьючерс</ppp-radio>
              <ppp-radio value="cryptocurrency">Криптовалютная пара</ppp-radio>
            </ppp-radio-group>
          </div>
        </section>
        ${when(
          (x) => x.document.type !== 'cryptocurrency',
          html`
            <section>
              <div class="label-group">
                <h5>Валюта</h5>
                <p>Валюта, в которой торгуется инструмент.</p>
              </div>
              <div class="input-group">
                <${'ppp-select'}
                  value="${(x) => x.document.currency ?? 'USD'}"
                  ${ref('currency')}
                >
                  <ppp-option value="USD">USD</ppp-option>
                  <ppp-option value="RUB">RUB</ppp-option>
                  <ppp-option value="HKD">HKD</ppp-option>
                </ppp-select>
              </div>
            </section>
          `
        )}
        <section>
          <div class="label-group">
            <h5>Торговые площадки</h5>
            <p>Список торговых площадок, на которых листингован инструмент.</p>
          </div>
          <div class="input-group">
            <div
              style="display: flex; flex-direction: column;"
              ${children({
                property: 'exchangeCheckboxes',
                filter: elements('ppp-checkbox')
              })}
            >
              ${when(
                (x) => x.document.type !== 'cryptocurrency',
                html`
                  <ppp-checkbox
                    name="nyse-nsdq"
                    ?checked="${(x) =>
                      x.document.exchange?.indexOf('nyse-nsdq') > -1}"
                  >
                    NYSE/NASDAQ
                  </ppp-checkbox>
                  <ppp-checkbox
                    name="spbex"
                    @change="${(x) =>
                      x.scratchSet('spbexChecked', x.spbexCheckbox.checked)}"
                    ?checked="${(x) =>
                      x.document.exchange?.indexOf('spbex') > -1}"
                    ${ref('spbexCheckbox')}
                  >
                    СПБ Биржа
                  </ppp-checkbox>
                  <ppp-checkbox
                    name="moex"
                    ?checked="${(x) =>
                      x.document.exchange?.indexOf('moex') > -1}"
                  >
                    Московская биржа
                  </ppp-checkbox>
                `
              )}
              ${when(
                (x) => x.document.type === 'cryptocurrency',
                html`
                  <ppp-checkbox
                    name="binance"
                    ?checked="${(x) =>
                      x.document.exchange?.indexOf('binance') > -1}"
                  >
                    Binance
                  </ppp-checkbox>
                `
              )}
            </div>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Брокеры</h5>
            <p>Список брокеров, у которых торгуется инструмент.</p>
          </div>
          <div class="input-group">
            <div
              style="display: flex; flex-direction: column;"
              ${children({
                property: 'brokerCheckboxes',
                filter: elements('ppp-checkbox')
              })}
            >
              ${when(
                (x) => x.document.type !== 'cryptocurrency',
                html`
                  <ppp-checkbox
                    name="${() => BROKERS.ALOR_OPENAPI_V2}"
                    ?checked="${(x) =>
                      x.document.broker?.indexOf(BROKERS.ALOR_OPENAPI_V2) > -1}"
                  >
                    ${(x) => x.t(`$const.broker.${BROKERS.ALOR_OPENAPI_V2}`)}
                  </ppp-checkbox>
                  <ppp-checkbox
                    name="${() => BROKERS.TINKOFF_INVEST_API}"
                    ?checked="${(x) =>
                      x.document.broker?.indexOf(BROKERS.TINKOFF_INVEST_API) >
                      -1}"
                    @change="${(x) => {
                      x.scratchSet('tinkoffChecked', x.tinkoffCheckbox.checked);

                      x.tinkoffFigi.state = 'default';
                    }}"
                    ${ref('tinkoffCheckbox')}
                  >
                    ${(x) => x.t(`$const.broker.${BROKERS.TINKOFF_INVEST_API}`)}
                  </ppp-checkbox>
                `
              )}
              ${when(
                (x) => x.document.type === 'stock',
                html`
                  <ppp-checkbox
                    name="${() => BROKERS.UTEX_AURORA}"
                    ?checked="${(x) =>
                      x.document.broker?.indexOf(BROKERS.UTEX_AURORA) > -1}"
                  >
                    ${(x) => x.t(`$const.broker.${BROKERS.UTEX_AURORA}`)}
                  </ppp-checkbox>
                  <ppp-checkbox
                    name="${() => BROKERS.PSINA}"
                    ?checked="${(x) =>
                      x.document.broker?.indexOf(BROKERS.PSINA) > -1}"
                  >
                    ${(x) => x.t(`$const.broker.${BROKERS.PSINA}`)}
                  </ppp-checkbox>
                `
              )}
              ${when(
                (x) => x.document.type === 'cryptocurrency',
                html`
                  <ppp-checkbox
                    name="${() => BROKERS.BINANCE}"
                    ?checked="${(x) =>
                      x.document.broker?.indexOf(BROKERS.BINANCE) > -1}"
                  >
                    ${(x) => x.t(`$const.broker.${BROKERS.BINANCE}`)}
                  </ppp-checkbox>
                `
              )}
            </div>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Флаги</h5>
            <p>Параметры инструмента, принимающие значение Да или Нет.</p>
          </div>
          <div class="input-group">
            <div
              style="display: flex; flex-direction: column;"
            >
              <${'ppp-checkbox'}
                ?checked="${(x) => x.document.removed}"
                ${ref('removed')}
              >
                Инструмент удалён
              </ppp-checkbox>
              <ppp-checkbox
                ?checked="${(x) => x.document.forQualInvestorFlag}"
                ${ref('forQualInvestorFlag')}
              >
                Только для квалифицированных инвесторов
              </ppp-checkbox>
              ${when(
                (x) => x.document.type === 'bond',
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
          (x) => x.document.type !== 'cryptocurrency',
          html`
            <section>
              <div class="label-group">
                <h5>Лотность</h5>
                <p>Минимальное количество, доступное для покупки.</p>
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
          (x) => x.document.type === 'cryptocurrency',
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
                <p>Измеряется в единицах актива котировки.</p>
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
          (x) => x.document.type !== 'cryptocurrency',
          html`
            <section>
              <div class="label-group">
                <h5>ISIN</h5>
                <p>Международный идентификационный код ценной бумаги.</p>
              </div>
              <div class="input-group">
                <ppp-text-field
                  ?disabled="${(x) =>
                    x.document.type !== 'stock' && x.document.type !== 'bond'}"
                  placeholder="ISIN"
                  optional
                  value="${(x) => x.document.isin}"
                  ${ref('isin')}
                ></ppp-text-field>
              </div>
            </section>
            <section>
              <div class="label-group">
                <h5>Идентификатор FIGI</h5>
                <${'ppp-badge'} appearance="green">
                  ${(x) => x.t(`$const.broker.${BROKERS.TINKOFF_INVEST_API}`)}
                </ppp-badge>
              </div>
              <div class="input-group">
                <ppp-text-field
                  ?disabled="${(x) => !x.scratch.tinkoffChecked}"
                  placeholder="FIGI"
                  value="${(x) => x.document.tinkoffFigi}"
                  style="text-transform: uppercase"
                  ${ref('tinkoffFigi')}
                ></ppp-text-field>
              </div>
            </section>
            <section>
              <div class="label-group">
                <h5>Тикер на СПБ Бирже</h5>
                <${'ppp-badge'} appearance="green">
                  СПБ Биржа
                </ppp-badge>
              </div>
              <div class="input-group">
                <ppp-text-field
                  ?disabled="${(x) => !x.scratch.spbexChecked}"
                  optional
                  placeholder="Тикер"
                  value="${(x) => x.document.spbexSymbol}"
                  ${ref('spbexSymbol')}
                ></ppp-text-field>
              </div>
            </section>
          `
        )}
        ${when(
          (x) =>
            !x.document.type ||
            x.document.type === 'stock' ||
            x.document.type === 'bond' ||
            x.document.type === 'future',
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
            <section>
              <div class="label-group">
                <h5>Сектор экономики</h5>
              </div>
              <div class="input-group">
                <ppp-select
                  value="${(x) => x.document.sector ?? ''}"
                  ${ref('sector')}
                >
                  <ppp-option value="">Не указан</ppp-option>
                  <ppp-option value="health_care">Здравоохранение</ppp-option>
                  <ppp-option value="it">
                    Информационные технологии
                  </ppp-option>
                  <ppp-option value="consumer">
                    Потребительские товары и услуги
                  </ppp-option>
                  <ppp-option value="materials">
                    Сырьевая промышленность
                  </ppp-option>
                  <ppp-option value="industrials">
                    Машиностроение и транспорт
                  </ppp-option>
                  <ppp-option value="financial">Финансовый сектор</ppp-option>
                  <ppp-option value="energy">Энергетика</ppp-option>
                  <ppp-option value="real_estate">Недвижимость</ppp-option>
                  <ppp-option value="utilities">Электроэнергетика</ppp-option>
                  <ppp-option value="telecom">Телекоммуникации</ppp-option>
                  <ppp-option value="ecomaterials">
                    Материалы для эко-технологий
                  </ppp-option>
                  <ppp-option value="electrocars">
                    Электротранспорт и комплектующие
                  </ppp-option>
                  <ppp-option value="green_buildings">
                    Энергоэффективные здания
                  </ppp-option>
                  <ppp-option value="other"> Другое</ppp-option>
                  <ppp-option value="green_energy">
                    Зеленая энергетика
                  </ppp-option>
                  <ppp-option value="government"
                    >Государственные облигации
                  </ppp-option>
                  <ppp-option value="municipal"
                    >Муниципальные облигации
                  </ppp-option>
                </ppp-select>
              </div>
            </section>
          `
        )}
        ${when(
          (x) => x.document.type === 'bond',
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
          (x) => x.document.type === 'future',
          html`
            <section>
              <div class="label-group">
                <h5>Основной актив</h5>
              </div>
              <div class="input-group">
                <ppp-text-field
                  placeholder="Основной актив"
                  value="${(x) => x.document.basicAsset}"
                  ${ref('basicAsset')}
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
          (x) => x.document.type === 'cryptocurrency',
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
        <span slot="submit-control-text">Сохранить инструмент</span>
      </ppp-page>
    </form>
  </template>
`;

export const instrumentsManagePageStyles = (context, definition) => css`
  ${pageStyles}
  .search-input {
    display: flex;
    margin: 5px 0 10px 0;
    width: 300px;
    text-transform: uppercase;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default InstrumentsManagePage.compose({
  template: instrumentsManagePageTemplate,
  styles: instrumentsManagePageStyles
});
