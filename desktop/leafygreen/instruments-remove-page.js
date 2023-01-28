import { InstrumentsRemovePage } from '../../shared/instruments-remove-page.js';
import { html } from '../../shared/template.js';
import { css } from '../../shared/element/styles/css.js';
import { ref } from '../../shared/element/templating/ref.js';
import { children } from '../../shared/element/templating/children.js';
import { elements } from '../../shared/element/templating/node-observation.js';
import { BROKERS } from '../../shared/const.js';
import { pageStyles } from './page.js';
import ppp from '../../ppp.js';

await ppp.i18n(import.meta.url);

export const instrumentsRemovePageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} headless>
        <${'ppp-banner'} class="inline margin-top" appearance="info">
          Инструменты, подходящие под выбранные фильтры, будут помечены
          удалёнными и станут недоступными в поиске виджетов.
        </ppp-banner>
        <section>
          <div class="label-group">
            <h5>Тип</h5>
            <p>Типы инструментов для удаления.</p>
          </div>
          <div class="input-group">
            <div
              style="display: flex; flex-direction: column;"
              ${children({
                property: 'typeCheckboxes',
                filter: elements('ppp-checkbox')
              })}
            >
              <${'ppp-checkbox'}
                checked
                name="stock"
              >
                Акция
              </ppp-checkbox>
              <ppp-checkbox
                checked
                name="bond"
              >
                Облигация
              </ppp-checkbox>
              <ppp-checkbox
                checked
                name="future"
              >
                Фьючерс
              </ppp-checkbox>
              <ppp-checkbox
                checked
                name="cryptocurrency"
              >
                Криптовалютная пара
              </ppp-checkbox>
            </div>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Торговые площадки</h5>
          </div>
          <div class="input-group">
            <div
              style="display: flex; flex-direction: column;"
              ${children({
                property: 'exchangeCheckboxes',
                filter: elements('ppp-checkbox')
              })}
            >
              <${'ppp-checkbox'}
                checked
                name="nyse-nsdq"
              >
                NYSE/NASDAQ
              </ppp-checkbox>
              <ppp-checkbox
                checked
                name="spbex"
              >
                СПБ Биржа
              </ppp-checkbox>
              <ppp-checkbox
                checked
                name="moex"
              >
                Московская биржа
              </ppp-checkbox>
              <ppp-checkbox
                checked
                name="binance"
              >
                Binance
              </ppp-checkbox>
            </div>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Брокеры</h5>
          </div>
          <div class="input-group">
            <div
              style="display: flex; flex-direction: column;"
              ${children({
                property: 'brokerCheckboxes',
                filter: elements('ppp-checkbox')
              })}
            >
              <${'ppp-checkbox'}
                checked
                name="${() => BROKERS.ALOR_OPENAPI_V2}"
              >
                ${(x) => x.t(`$const.broker.${BROKERS.ALOR_OPENAPI_V2}`)}
              </ppp-checkbox>
              <ppp-checkbox
                checked
                name="${() => BROKERS.TINKOFF_INVEST_API}"
                ${ref('tinkoffCheckbox')}
              >
                ${(x) => x.t(`$const.broker.${BROKERS.TINKOFF_INVEST_API}`)}
              </ppp-checkbox>
              <ppp-checkbox
                checked
                name="${() => BROKERS.UTEX_AURORA}"
              >
                ${(x) => x.t(`$const.broker.${BROKERS.UTEX_AURORA}`)}
              </ppp-checkbox>
              <ppp-checkbox
                checked
                name="${() => BROKERS.PSINA}"
              >
                ${(x) => x.t(`$const.broker.${BROKERS.PSINA}`)}
              </ppp-checkbox>
              <ppp-checkbox
                checked
                name="${() => BROKERS.BINANCE}"
              >
                ${(x) => x.t(`$const.broker.${BROKERS.BINANCE}`)}
              </ppp-checkbox>
            </div>
          </div>
        </section>
        <span slot="submit-control-text">Удалить инструменты</span>
      </ppp-page>
    </form>
  </template>
`;

export const instrumentsRemovePageStyles = (context, definition) => css`
  ${pageStyles}
`;

// noinspection JSUnusedGlobalSymbols
export default InstrumentsRemovePage.compose({
  template: instrumentsRemovePageTemplate,
  styles: instrumentsRemovePageStyles
});
