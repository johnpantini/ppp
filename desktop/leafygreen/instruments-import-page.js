import { InstrumentsImportPage } from '../../shared/instruments-import-page.js';
import { html, requireComponent } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { when } from '../../shared/element/templating/when.js';
import { css } from '../../shared/element/styles/css.js';
import { bodyFont } from './design-tokens.js';
import { pageStyles } from './page.js';

await requireComponent('ppp-select');
await requireComponent('ppp-codeflask');
await requireComponent('ppp-radio-box-group');

const exampleImportCode = `/**
 * Возвращает список инструментов с подробными данными.
 *
 * @returns {Object[]} instruments - Инструменты.
 * @returns {string} instruments[].symbol - Тикер инструмента.
 * @returns {array.<string>} instruments[].exchange - Торговые площадки.
 * @returns {string} instruments[].fullName - Полное наименование.
 * @returns {string} instruments[].isin - ISIN инструмента.
 * @returns {string} instruments[].minPriceIncrement - Шаг цены.
 * @returns {string} instruments[].type - Тип инструмента.
 * @returns {string} instruments[].currency - Валюта инструмента.
 * @returns {string} instruments[].lot - Минимальный объем для покупки.
 * @returns {array.<string>} instruments[].broker - брокеры, где инструмент торгуется.
 * @returns {string} instruments[].tinkoffFigi - идентификатор FIGI для брокера Тинькофф Инвестиции.
 * @returns {string} instruments[].spbexSymbol - тикер для СПБ Биржи.
 */
return [
  {
    symbol: 'AAPL',
    exchange: [
      'nyse-nsdq',
      'spbex'
    ],
    fullName: 'Apple',
    isin: 'US0378331005',
    minPriceIncrement: 0.01,
    type: 'stock',
    currency: 'USD',
    lot: 1,
    broker: [
      'alor-openapi-v2',
      'tinkoff-invest-api'
    ],
    tinkoffFigi: 'BBG000B9XRY4'
  }
];`;

export const instrumentsImportPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} headless centered-controls>
        <div class="content">
          <img class="logo" alt="Импорт" src="static/filter.svg"
               draggable="false">
          <h3 class="title">Импорт торговых инструментов</h3>
          <h3 class="description">Выберите, из какого источника следует
            импортировать торговые инструменты</h3>
          <div class="controls">
            <ppp-radio-box-group
              class="option-selector"
              value="dictionary"
              ${ref('optionSelector')}
            >
              <ppp-box-radio
                value="dictionary"
              >
                <div class="text-group">
                  Словари
                  <p>Используйте подготовленные словари инструментов по
                    различным
                    торговым площадкам</p>
                </div>
              </ppp-box-radio>
              <ppp-box-radio
                value="code"
              >
                <div class="text-group">
                  Функция JavaScript
                  <p>Предоставьте собственную реализацию источника для импорта
                    торговых инструментов</p>
                </div>
              </ppp-box-radio>
            </ppp-radio-box-group>
            ${when(
              (x) => x.optionSelector.value === 'dictionary',
              html`
                <div class="control-label">
                  <p>Выберите словарь из списка</p>
                </div>
                <ppp-select value="spbex-stocks" ${ref('dictionary')}>
                  <ppp-option value="spbex-stocks">Акции СПБ Биржи</ppp-option>
                  <ppp-option value="moex-stocks"
                    >Акции Московской биржи
                  </ppp-option>
                </ppp-select>
              `
            )}
            ${when(
              (x) => x.optionSelector.value === 'code',
              html`
                <div class="control-label">
                  <p>Предоставьте реализацию импорта</p>
                </div>
                <ppp-codeflask
                  :code="${() => exampleImportCode}"
                  ${ref('code')}
                ></ppp-codeflask>
              `
            )}
            <small>
              В процессе операции уже существующие в базе данных инструменты
              будут перезаписаны, если имеют соответствие по тикеру в источнике
              для импорта.
            </small>
          </div>
        </div>
        <span slot="submit-control-text">Импортировать инструменты</span>
      </ppp-page>
    </form>
  </template>
`;

export const instrumentsImportPageStyles = (context, definition) => css`
  ${pageStyles}
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 50px calc(50% - 400px) 15px;
  }

  .logo {
    vertical-align: middle;
    height: 100px;
    margin-bottom: 50px;
    user-select: none;
  }

  .title {
    margin: unset;
    font-family: ${bodyFont};
    font-size: 24px;
    line-height: 32px;
    font-weight: bold;
    margin-bottom: 20px;
    color: rgb(0, 30, 43);
  }

  .description {
    margin: unset;
    font-family: ${bodyFont};
    font-size: 15px;
    width: 400px;
    margin-bottom: 42px;
    line-height: 20px;
    color: rgb(0, 30, 43);
    font-weight: 400;
  }

  .controls {
    text-align: left;
    width: 580px;
  }

  .option-selector {
    margin-bottom: 20px;
  }

  .text-group {
    display: flex;
    flex-direction: column;
  }

  .text-group p {
    margin: unset;
    font-family: ${bodyFont};
    font-size: 13px;
    line-height: 20px;
    color: rgb(0, 30, 43);
    font-weight: 400;
  }

  .control-label {
    margin-bottom: 8px;
    display: flex;
  }

  .control-label p {
    margin: unset;
    font-family: ${bodyFont};
    font-size: 13px;
    line-height: 20px;
    color: rgb(0, 30, 43);
    font-weight: 500;
  }

  small {
    margin: unset;
    font-family: ${bodyFont};
    display: block;
    font-size: 12px;
    color: rgb(137, 151, 155);
    line-height: 15px;
    margin-top: 12px;
    letter-spacing: 0.2px;
  }

  ppp-codeflask {
    width: 100%;
    height: 256px;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default InstrumentsImportPage.compose({
  template: instrumentsImportPageTemplate,
  styles: instrumentsImportPageStyles
});
