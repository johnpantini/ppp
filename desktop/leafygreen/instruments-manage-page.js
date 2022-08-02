import { InstrumentsManagePage } from '../../shared/instruments-manage-page.js';
import { html } from '../../shared/template.js';
import { css } from '../../shared/element/styles/css.js';
import { ref } from '../../shared/element/templating/ref.js';
import { children } from '../../shared/element/templating/children.js';
import { elements } from '../../shared/element/templating/node-observation.js';
import { when } from '../../shared/element/templating/when.js';
import { pageStyles } from './page.js';
import { search } from './icons/search.js';

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
            x.searchText = c.event.target.value;
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
              ${ref('type')}
            >
              <${'ppp-radio'} value="stock">Акция</ppp-radio>
            </ppp-radio-group>
          </div>
        </section>
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
              <${'ppp-checkbox'}
                name="nyse-nsdq"
                ?checked="${(x) =>
                  x.document.exchange?.indexOf('nyse-nsdq') > -1}"
              >
                NYSE/NASDAQ
              </ppp-checkbox>
              <ppp-checkbox
                name="spbex"
                ?checked="${(x) => x.document.exchange?.indexOf('spbex') > -1}"
              >
                СПБ Биржа
              </ppp-checkbox>
              <ppp-checkbox
                name="moex"
                ?checked="${(x) => x.document.exchange?.indexOf('moex') > -1}"
              >
                Московская биржа
              </ppp-checkbox>
            </div>
          </div>
        </section>
        <div class="folding">
          <div class="folding-header" @click="${(x, c) =>
            c.event.target.parentNode.classList.toggle('folding-open')}"
          >
            <div class="folding-header-toggle">
              <img slot="logo" draggable="false" alt="Toggle"
                   src="static/fa/angle-down.svg"/>
            </div>
            <div class="folding-header-text">Биржевые параметры</div>
          </div>
          <div class="folding-content">
            <section>
              <div class="label-group">
                <h5>ISIN</h5>
                <p>Международный идентификационный код ценной бумаги.</p>
              </div>
              <div class="input-group">
                <ppp-text-field
                  placeholder="ISIN"
                  value="${(x) => x.document.isin}"
                  ${ref('isin')}
                ></ppp-text-field>
              </div>
            </section>
            <section>
              <div class="label-group">
                <h5>Лотность</h5>
              </div>
              <div class="input-group">
                <ppp-text-field
                  type="number"
                  placeholder="1"
                  value="${(x) => x.document.lotSize}"
                  ${ref('lotSize')}
                ></ppp-text-field>
              </div>
            </section>
            <section>
              <div class="label-group">
                <h5>Шаг цены</h5>
              </div>
              <div class="input-group">
                <ppp-text-field
                  type="number"
                  placeholder="${() =>
                    new Intl.NumberFormat().format(0.01).toString()}"
                  value="${(x) => x.document.minPriceIncrement}"
                  ${ref('minPriceIncrement')}
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
                  placeholder="Тикер"
                  value="${(x) => x.document.spbexSymbol}"
                  ${ref('spbexSymbol')}
                ></ppp-text-field>
              </div>
            </section>
          </div>
        </div>
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
