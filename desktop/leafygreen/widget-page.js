import { WidgetPage } from '../../shared/widget-page.js';
import { html, requireComponent } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { repeat } from '../../shared/element/templating/repeat.js';
import { pageStyles } from './page.js';
import { css } from '../../shared/element/styles/css.js';
import { bodyFont } from './design-tokens.js';
import { when } from '../../shared/element/templating/when.js';
import ppp from '../../ppp.js';

await Promise.all([
  await requireComponent('ppp-collection-select'),
  await requireComponent('ppp-text-field')
]);
await requireComponent('ppp-widget-type-radio-group');

export const widgetPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-top-loader'} ${ref('topLoader')}></ppp-top-loader>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) => (x.document.name ? `Виджет - ${x.document.name}` : 'Виджет')}
        </span>
        <${'ppp-button'}
          appearance="primary"
          slot="header-controls"
          @click="${() =>
            ppp.app.navigate({
              page: 'widgets'
            })}"
        >
          К списку виджетов
        </ppp-button>
        <div class="content">
          <nav>
            <div class="nav-inner">
              <div class="spacer"></div>
              <div class="widget-settings">
                <form novalidate>
                  <div>
                    <div class="drawer">
                      <div class="drawer-header">
                        <div class="drawer-header-inner">
                          <h3>Тип виджета</h3>
                        </div>
                        <div class="drawer-arrow">
                          <div class="drawer-arrow-bg"></div>
                        </div>
                      </div>
                      <div class="drawer-body">
                        <div class="drawer-body-inner">
                          <ppp-widget-type-radio-group
                            value="${(x) => x.document.type}"
                            @change="${(x, { event }) =>
                              x.handleWidgetTypeChange(event)}"
                          >
                            <ppp-widget-type-radio
                              ?disabled="${(x) =>
                                x.document._id && x.document.type !== 'order'}"
                              value="order"
                            >
                              <span slot="text">Заявка</span>
                              <img draggable="false" alt="Заявка"
                                   slot="icon"
                                   src="static/widgets/order.svg"/>
                            </ppp-widget-type-radio>
                            <ppp-widget-type-radio
                              ?disabled="${(x) =>
                                x.document._id &&
                                x.document.type !== 'scalping-buttons'}"
                              value="scalping-buttons"
                            >
                              <span slot="text">Скальперские кнопки</span>
                              <img draggable="false" alt="Скальперские кнопки"
                                   slot="icon"
                                   src="static/widgets/scalping-buttons.svg"/>
                            </ppp-widget-type-radio>
                            <ppp-widget-type-radio
                              ?disabled="${(x) =>
                                x.document._id &&
                                x.document.type !== 'active-orders'}"
                              value="active-orders"
                            >
                              <span slot="text">Активные заявки</span>
                              <img draggable="false" alt="Активные заявки"
                                   slot="icon"
                                   src="static/widgets/active-orders.svg"/>
                            </ppp-widget-type-radio>
                            <ppp-widget-type-radio
                              ?disabled="${(x) =>
                                x.document._id &&
                                x.document.type !== 'light-chart'}"
                              value="light-chart"
                            >
                              <span slot="text">Лёгкий график</span>
                              <img draggable="false" alt="Лёгкий график"
                                   slot="icon"
                                   src="static/widgets/light-chart.svg"/>
                            </ppp-widget-type-radio>
                            <ppp-widget-type-radio
                              ?disabled="${(x) =>
                                x.document._id &&
                                x.document.type !== 'orderbook'}"
                              value="orderbook"
                            >
                              <div slot="text">
                                Книга заявок
                                <div class="widget-type-tags">
                                  <${'ppp-badge'} appearance="blue">Биржевой
                                    стакан
                                  </ppp-badge>
                                </div>
                              </div>
                              <img draggable="false" alt="Книга заявок"
                                   slot="icon"
                                   src="static/widgets/orderbook.svg"/>
                            </ppp-widget-type-radio>
                            <ppp-widget-type-radio
                              ?disabled="${(x) =>
                                x.document._id &&
                                x.document.type !== 'time-and-sales'}"
                              value="time-and-sales"
                            >
                              <div slot="text">
                                Лента всех сделок
                                <div class="widget-type-tags">
                                  <${'ppp-badge'} appearance="blue">Лента
                                    обезличенных сделок
                                  </ppp-badge>
                                </div>
                              </div>
                              <img draggable="false" alt="Лента всех сделок"
                                   slot="icon"
                                   src="static/widgets/time-and-sales.svg"/>
                            </ppp-widget-type-radio>
                            <ppp-widget-type-radio
                              ?disabled="${(x) =>
                                x.document._id &&
                                x.document.type !== 'portfolio'}"
                              value="portfolio"
                            >
                              <span slot="text">Портфель</span>
                              <img draggable="false" alt="Портфель"
                                   slot="icon"
                                   src="static/widgets/portfolio.svg"/>
                            </ppp-widget-type-radio>
                            <ppp-widget-type-radio
                              ?disabled="${(x) =>
                                x.document._id &&
                                x.document.type !== 'instruments'}"
                              value="instruments"
                            >
                              <span slot="text">Инструменты</span>
                              <img draggable="false" alt="Инструменты"
                                   slot="icon"
                                   src="static/widgets/instruments.svg"/>
                            </ppp-widget-type-radio>
                            <ppp-widget-type-radio
                              ?disabled="${(x) =>
                                x.document._id &&
                                x.document.type !== 'timeline'}"
                              value="timeline"
                            >
                              <span slot="text">Лента операций</span>
                              <img draggable="false" alt="История операций"
                                   slot="icon"
                                   src="static/widgets/timeline.svg"/>
                            </ppp-widget-type-radio>
                            <ppp-widget-type-radio
                              ?disabled="${(x) =>
                                x.document._id && x.document.type !== 'custom'}"
                              value="custom"
                            >
                              <div slot="text">
                                По ссылке
                                <div class="widget-type-tags">
                                  <${'ppp-badge'} appearance="blue">Загружаемый
                                    виджет
                                  </ppp-badge>
                                </div>
                              </div>
                              <img draggable="false" alt="Произвольный"
                                   slot="icon"
                                   src="static/widgets/custom.svg"/>
                            </ppp-widget-type-radio>
                          </ppp-widget-type-radio-group>
                        </div>
                      </div>
                    </div>
                    <div class="drawer">
                      <div class="drawer-header">
                        <div class="drawer-header-inner">
                          <h3>Основные настройки</h3>
                        </div>
                        <div class="drawer-arrow">
                          <div class="drawer-arrow-bg"></div>
                        </div>
                      </div>
                      <div class="drawer-body">
                        <div class="drawer-body-inner">
                          <div class="widget-settings-section">
                            <div class="widget-settings-label-group">
                              <h5>Название</h5>
                              <p>Будет отображаться в списке виджетов.</p>
                            </div>
                            <div class="widget-settings-input-group">
                              <ppp-text-field
                                placeholder="Название виджета"
                                value="${(x) => x.document.name}"
                                ${ref('name')}
                              ></ppp-text-field>
                            </div>
                          </div>
                          ${when(
                            (x) => x.document.type === 'custom',
                            html`
                              <div class="widget-settings-section">
                                <div class="widget-settings-label-group">
                                  <h5>URL</h5>
                                  <p>Ссылка на реализацию виджета. Нельзя
                                    изменить после создания</p>
                                </div>
                                <div class="widget-settings-input-group">
                                  <${'ppp-text-field'}
                                    type="url"
                                    placeholder="https://example.com/widget.js"
                                    value="${(x) => x.document.url}"
                                    ?disabled="${(x) => x.document._id}"
                                    ${ref('url')}
                                  ></ppp-text-field>
                                </div>
                              </div>
                            `
                          )}
                        </div>
                      </div>
                    </div>
                    <div class="drawer">
                      <div class="drawer-header">
                        <div class="drawer-header-inner">
                          <h3>Дополнительные настройки</h3>
                        </div>
                        <div class="drawer-arrow">
                          <div class="drawer-arrow-bg"></div>
                        </div>
                      </div>
                      <div class="drawer-body">
                        <div class="drawer-body-inner">
                          ${when(
                            (x) => !x.widgetDefinition.settings,
                            html`
                              <${'ppp-banner'}
                                appearance="warning">
                                Этот виджет не содержит дополнительных настроек.
                              </ppp-banner>
                            `
                          )}
                          ${when(
                            (x) => x.widgetDefinition.settings,
                            (x) => x.widgetDefinition.settings
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <${'ppp-checkbox'}
                ${ref('autoApplyModifications')}
                @change="${(x) =>
                  ppp.app.setSetting(
                    'autoApplyModifications',
                    x.autoApplyModifications.checked
                  )}"
                ?checked="${() =>
                  ppp.app.settings.autoApplyModifications ?? true}"
              >
                Применять изменения автоматически
              </ppp-checkbox>
              <button
                class="apply-modifications"
                @click="${(x) => x.applyModifications()}"
              >
                <div class="text">Применить изменения</div>
              </button>
              <button
                class="save-widget"
                type="submit"
                @click="${(x) => x.saveDocument()}"
              >
                <div class="text">Сохранить виджет</div>
              </button>
              <footer>
                После сохранения виджет станет доступен для использования в
                рабочей
                области торгового терминала.
              </footer>
            </div>
          </nav>
          <div class="right-pane">
            <div class="right-pane-inner">
              <div class="widget-holder">
                <h4>Предварительный просмотр</h4>
                <h2 class="widget-name">
                  ${when(
                    (x) => x.widgetDefinition.title,
                    html`
                      <span class="positive">
                        ${(x) => x.widgetDefinition.title}
                      </span>
                    `
                  )}
                  ${when(
                    (x) => !x.widgetDefinition.title,
                    html`
                      <span class="positive">
                        Идёт загрузка, подождите...
                      </span>
                    `
                  )}
                </h2>
                ${when(
                  (x) => x.widgetDefinition.tags,
                  html` <div class="widget-tags">
                    ${repeat(
                      (x) => x.widgetDefinition.tags,
                      html`
                          <${'ppp-badge'} class="widget-tags" appearance="blue">
                            ${(x) => x}
                          </ppp-badge>
                        `
                    )}
                  </div>`
                )}
                <div class="widget-info">
                  ${(x) => x.widgetDefinition.description}
                </div>
                ${when(
                  (x) => x.page.loading || x.loading,
                  html`
                    <hr class="divider" />
                    <div class="widget-area">
                      Виджет загружается, подождите...
                    </div>
                  `
                )}
                ${when(
                  (x) => !x.page.loading && !x.loading && x.getWidgetTagName(),
                  html`
                    <hr class="divider" />
                    <div class="widget-area" ${ref('widgetArea')}>
                      ${(x) => html`
                        <ppp-${x.getWidgetTagName()}
                          preview
                          :widgetDefinition="${(x) => x.widgetDefinition ?? {}}"
                          :container="${(x) => x}"
                          ${ref('widgetElement')}
                        ></ppp-${x.getWidgetTagName()}>`}
                    </div>
                  `
                )}
                ${when(
                  (x) => x.widgetDefinition.collection,
                  html`
                    <hr class="divider" />
                    <div class="summary">
                      <div class="summary-left">Коллекция</div>
                      <div class="summary-right">
                        <span class="positive"
                          >${(x) => x.widgetDefinition.collection}</span
                        >
                      </div>
                    </div>
                  `
                )}
              </div>
            </div>
          </div>
        </div>
        <span slot="actions"></span>
      </ppp-page>
    </form>
  </template>
`;

export const widgetPageStyles = (context, definition) => css`
  ${pageStyles}
  * {
    box-sizing: border-box;
  }

  h2,
  h4 {
    margin-top: 0;
    line-height: 1.4;
    color: #001e2b;
  }

  span.positive {
    color: rgb(0, 163, 92);
  }

  span.negative {
    color: rgb(219, 48, 48);
  }

  h2 {
    font-size: 30px;
  }

  h3 {
    font-size: 24px;
    line-height: 1.4;
    margin-bottom: 10px;
  }

  h4 {
    font-size: 18px;
  }

  .content {
    display: flex;
    min-height: calc(100vh - 85px);
    font-family: ${bodyFont};
  }

  nav {
    padding: 0 10px;
    position: relative;
    width: 50%;
    border-left: 1px solid transparent;
    background-color: rgb(249, 251, 250);
  }

  .nav-inner {
    max-width: 470px;
    margin: 32px auto 0;
  }

  .nav-inner .spacer {
    font-size: 18px;
    margin: 32px 0;
    max-width: 80%;
  }

  .right-pane {
    position: relative;
    width: 50%;
    border-left: 1px solid rgb(232, 237, 235);
    background-color: rgb(255, 255, 255);
  }

  .right-pane-inner {
    position: sticky;
    top: 15px;
    padding-bottom: 150px;
  }

  .widget-holder {
    padding: 15px 30px 60px;
  }

  .widget-holder h4 {
    margin-bottom: 20px;
    font-weight: bold;
  }

  .widget-info {
    font-size: 14px;
    margin-top: 20px;
  }

  h2.widget-name {
    margin-top: -5px;
    font-weight: bold;
    line-height: 1em;
  }

  .widget-tags {
    margin-top: 5px;
  }

  .widget-settings {
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(232, 237, 235);
    border-radius: 7px;
    box-shadow: rgba(0, 0, 0, 0.3) 0 4px 10px -4px;
    margin-bottom: 30px;
    padding: 24px;
    transition: height 200ms ease-in-out 0s;
  }

  nav footer {
    font-size: 12px;
    padding-bottom: 60px;
    color: rgb(92, 108, 117);
  }

  .save-widget,
  .apply-modifications {
    font-size: 17px;
    height: auto;
    margin: 24px 0 8px;
    padding: 10px;
    width: 100%;
    appearance: none;
    border: 1px solid rgb(0, 104, 74);
    display: inline-flex;
    align-items: stretch;
    transition: all 150ms ease-in-out 0s;
    position: relative;
    text-decoration: none;
    cursor: pointer;
    z-index: 0;
    font-family: ${bodyFont};
    border-radius: 6px;
    background-color: rgb(0, 104, 74);
    color: rgb(255, 255, 255);
    line-height: 20px;
    font-weight: 500;
  }

  .save-widget {
    margin-top: 0;
  }

  .apply-modifications {
    background-color: #ffc439;
    color: rgb(17, 17, 17);
    border: 1px solid transparent;
  }

  .save-widget:hover {
    color: rgb(255, 255, 255);
    background-color: rgb(0, 89, 63);
    border-color: rgb(0, 89, 63);
    box-shadow: rgb(192, 250, 230) 0 0 0 3px;
  }

  .apply-modifications:hover {
    box-shadow: inset 0 0 100px 100px rgb(0 0 0 / 5%);
  }

  .save-widget .text,
  .apply-modifications .text {
    display: grid;
    grid-auto-flow: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    pointer-events: none;
    position: relative;
    z-index: 0;
    padding: 0 11px;
    gap: 6px;
  }

  .drawer {
    position: relative;
    border-radius: 6px;
  }

  .drawer-header {
    position: relative;
    border-bottom: 2px solid rgb(232, 237, 235);
  }

  .drawer-header-inner {
    padding-right: 40px;
    transition: opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  }

  .drawer-header-inner h3 {
    font-weight: bold;
    margin-top: 0;
  }

  .drawer-arrow {
    position: absolute;
    padding: 10px;
    top: 0;
    right: 0;
    width: 30px;
    height: 100%;
    cursor: pointer;
    transform: rotate(180deg);
    transform-origin: center center;
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  }

  .drawer-arrow::before,
  .drawer-arrow::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 14px;
    height: 3px;
    background-color: rgb(61, 79, 88);
    transform: translateY(-50%);
    z-index: 1;
  }

  .drawer-arrow::before {
    left: 4px;
    transform: rotate(45deg);
  }

  .drawer-arrow::after {
    right: 4px;
    transform: rotate(-45deg);
  }

  .drawer-arrow-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 35px;
    height: 35px;
    border-radius: 100%;
    background-position: center center;
    background-color: rgb(225, 247, 255);
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  }

  .drawer-arrow:hover .drawer-arrow-bg {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1);
    transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) 0.1s;
  }

  .drawer-body {
    position: relative;
    overflow-y: hidden;
    transition: height 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  }

  .drawer-body-inner {
    padding: 25px 4px;
    opacity: 1;
    transition: opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) 0.1s;
  }

  .drawer-title {
    font-family: ${bodyFont};
    font-weight: bold;
    color: rgb(0, 30, 43);
    font-size: 15px;
    line-height: 20px;
  }

  .widget-settings-section {
    font-family: ${bodyFont};
    display: flex;
    flex-direction: column;
    font-size: 13px;
    line-height: 20px;
    margin-bottom: 20px;
  }

  .widget-settings-label-group h5 {
    display: flex;
    line-height: 26px;
    font-size: 14px;
    max-width: 100%;
    margin: 0;
    padding: 0;
    font-weight: bold;
    color: rgb(0, 30, 43);
  }

  .widget-settings-label-group p {
    font-family: ${bodyFont};
    font-weight: normal;
    margin-top: 0;
    margin-bottom: 0;
    color: rgb(92, 108, 117);
    font-size: 14px;
    line-height: 20px;
  }

  .divider {
    border: none;
    margin: 20px 0;
    padding: 0;
    width: 100%;
    height: 2px;
    background-color: rgb(193, 199, 198);
  }

  .summary {
    display: flex;
    width: 100%;
    font-size: 17px;
    font-weight: bold;
  }

  .summary-left {
    display: flex;
    width: 50%;
  }

  .summary-right {
    display: flex;
    width: 50%;
    justify-content: flex-end;
  }

  .widget-type-tags {
    margin-top: 5px;
  }

  ppp-codeflask {
    width: 100%;
    height: 180px;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default WidgetPage.compose({
  template: widgetPageTemplate,
  styles: widgetPageStyles
});
