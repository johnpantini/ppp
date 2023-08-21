/** @decorator */

import ppp from '../../ppp.js';
import {
  html,
  css,
  ref,
  when,
  observable,
  Updates,
  Observable,
  repeat,
  attr
} from '../../vendor/fast-element.min.js';
import { documentPageHeaderPartial, Page, pageStyles } from '../page.js';
import { Denormalization } from '../../lib/ppp-denormalize.js';
import { debounce, later } from '../../lib/ppp-decorators.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  bodyFont,
  fontSizeBody1,
  fontSizeHeading5,
  fontWeightBody1,
  lineHeightBody1,
  negative,
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark2,
  paletteGrayLight2,
  paletteGreenBase,
  paletteGreenDark1,
  paletteGreenDark3,
  paletteGreenLight3,
  paletteWhite,
  positive,
  spacing1,
  spacing2, spacing3,
  spacing5,
  themeConditional
} from '../../design/design-tokens.js'
import { display } from '../../vendor/fast-utilities.js';
import { RadioGroup, radioGroupTemplate } from '../radio-group.js';
import { Radio } from '../radio.js';
import {
  activeOrdersWidget,
  customWidget,
  instrumentsWidget,
  lightChartWidget,
  orderbookWidget,
  orderWidget,
  portfolioWidget,
  scalpingButtonsWidget,
  timeAndSalesWidget,
  timelineWidget
} from '../../static/svg/sprite.js';
import { normalize } from '../../design/styles.js';
import { PAGE_STATUS, WIDGET_TYPES } from '../../lib/const.js';
import { PPPElement } from '../../lib/ppp-element.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../draggable-stack.js';
import '../select.js';
import '../text-field.js';
import '../top-loader.js';
import '../widget.js';
import '../pages/template-library-modal.js';

export const widgetTypeRadioGroupStyles = css`
  ${normalize()}
  ${display('flex')}
  :host {
    font-family: ${bodyFont};
    margin: 0 auto;
    flex-direction: column;
  }

  .positioning-region {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 20px;
  }
`;

export class WidgetTypeRadioGroup extends RadioGroup {}

export const widgetTypeRadioTemplate = html`
  <template
    role="radio"
    class="${(x) => (x.checked ? 'checked' : '')}"
    aria-checked="${(x) => x.checked}"
    aria-required="${(x) => x.required}"
    aria-disabled="${(x) => x.disabled}"
    aria-readonly="${(x) => x.readOnly}"
    @keypress="${(x, c) => x.keypressHandler(c.event)}"
    @click="${(x, c) => x.clickHandler(c.event)}"
  >
    <div class="control">
      <div class="content">
        <slot name="text"></slot>
        <slot name="icon"></slot>
      </div>
    </div>
  </template>
`;

export const widgetTypeRadioStyles = css`
  ${normalize()}
  :host(:focus-visible) {
    outline: none;
  }

  .control {
    width: 100%;
    padding: 10px 15px;
    cursor: pointer;
    border-width: 1px;
    border-style: solid;
    border-color: ${paletteGrayBase};
    border-image: initial;
    border-radius: 4px;
  }

  :host(:not([checked]):not([disabled])) .control:hover {
    border-color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  :host([checked]) .control {
    border-color: ${paletteGreenDark1};
    background-color: ${themeConditional(
      paletteGreenLight3,
      paletteGreenDark3
    )};
  }

  .content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    color: ${themeConditional(paletteGrayBase, paletteWhite)};
    font-size: ${fontSizeHeading5};
  }

  [name='text']::slotted(*) {
    font-family: ${bodyFont};
    display: flex;
    flex-direction: column;
    font-weight: bold;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
  }

  [name='icon']::slotted(*) {
    height: 20px;
    width: 20px;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
  }

  :host([disabled]) {
    display: none;
  }
`;

export class WidgetTypeRadio extends Radio {}

export const widgetPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-top-loader ${ref('topLoader')}></ppp-top-loader>
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <ppp-modal
        ${ref('templateLibraryModal')}
        class="large"
        hidden
        dismissible
      >
        <span slot="title">Библиотека шаблонов</span>
        <ppp-template-library-modal-page
          ${ref('templateLibraryModalPage')}
          slot="body"
        ></ppp-template-library-modal-page>
      </ppp-modal>
      <div class="content">
        <nav>
          <div class="nav-inner">
            <div class="widget-settings">
              <form novalidate>
                <div>
                  <div class="drawer" ?hidden="${(x) => x.document._id}">
                    <div class="drawer-header">
                      <div class="drawer-header-inner">
                        <h3>Тип виджета</h3>
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
                            <span slot="icon">
                              ${html.partial(orderWidget)}
                            </span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'scalping-buttons'}"
                            value="scalping-buttons"
                          >
                            <span slot="text">Скальперские кнопки</span>
                            <span slot="icon">
                              ${html.partial(scalpingButtonsWidget)}
                            </span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'active-orders'}"
                            value="active-orders"
                          >
                            <span slot="text">Активные заявки</span>
                            <span slot="icon">
                              ${html.partial(activeOrdersWidget)}
                            </span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'light-chart'}"
                            value="light-chart"
                          >
                            <span slot="text">Лёгкий график</span>
                            <span slot="icon">
                              ${html.partial(lightChartWidget)}
                            </span>
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
                                <ppp-badge appearance="lightgray">
                                  Биржевой стакан
                                </ppp-badge>
                              </div>
                            </div>
                            <span slot="icon">
                              ${html.partial(orderbookWidget)}
                            </span>
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
                                <ppp-badge appearance="lightgray">
                                  Лента обезличенных сделок
                                </ppp-badge>
                              </div>
                            </div>
                            <span slot="icon">
                              ${html.partial(timeAndSalesWidget)}
                            </span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'portfolio'}"
                            value="portfolio"
                          >
                            <span slot="text">Портфель</span>
                            <span slot="icon">
                              ${html.partial(portfolioWidget)}
                            </span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'instruments'}"
                            value="instruments"
                          >
                            <span slot="text">Список инструментов</span>
                            <span slot="icon">
                              ${html.partial(instrumentsWidget)}
                            </span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id && x.document.type !== 'timeline'}"
                            value="timeline"
                          >
                            <span slot="text">Лента операций</span>
                            <span slot="icon">
                              ${html.partial(timelineWidget)}
                            </span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id && x.document.type !== 'custom'}"
                            value="custom"
                          >
                            <div slot="text">
                              По ссылке
                              <div class="widget-type-tags">
                                <ppp-badge appearance="lightgray"
                                  >Загружаемый виджет
                                </ppp-badge>
                              </div>
                            </div>
                            <span slot="icon">
                              ${html.partial(customWidget)}
                            </span>
                          </ppp-widget-type-radio>
                        </ppp-widget-type-radio-group>
                      </div>
                    </div>
                  </div>
                  <div class="drawer">
                    <div class="drawer-header">
                      <div class="drawer-header-inner">
                        <div
                          class="control-line"
                          style="justify-content: space-between;"
                        >
                          <h3>Настройки</h3>
                          <ppp-button
                            style="margin-bottom: 6px;"
                            ?hidden="${(x) => !x.mounted}"
                            appearance="primary"
                            class="xsmall"
                            @click="${(x) => x.loadTemplateSettings()}"
                          >
                            Подставить настройки из шаблона
                          </ppp-button>
                        </div>
                      </div>
                    </div>
                    <div class="drawer-body">
                      <div class="drawer-body-inner" style="padding-bottom: 0">
                        <div class="widget-settings-section">
                          <div class="widget-settings-label-group">
                            <h5>Название</h5>
                            <p class="description">
                              Будет отображаться в списке виджетов.
                            </p>
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
                                <p class="description">
                                  Ссылка на реализацию виджета. Нельзя изменить
                                  после создания. Можно воспользоваться
                                  выпадающим списком, чтобы использовать готовую
                                  ссылку (только при создании виджета).
                                </p>
                              </div>
                              <div class="widget-settings-input-group">
                                <ppp-text-field
                                  ?disabled="${(x) =>
                                    !(
                                      x.document.type === 'custom' &&
                                      typeof x.widgetDefinition
                                        ?.customElement === 'undefined'
                                    )}"
                                  type="url"
                                  placeholder="https://example.com/widget.js"
                                  value="${(x) => x.document.url}"
                                  ?disabled="${(x) => x.document._id}"
                                  ${ref('url')}
                                ></ppp-text-field>
                              </div>
                              ${when(
                                (x) => !x.document._id,
                                html`
                                  <div class="control-stack">
                                    <ppp-select
                                      ${ref('predefinedWidgetUrl')}
                                      deselectable
                                      ?disabled="${(x) =>
                                        !(
                                          x.document.type === 'custom' &&
                                          typeof x.widgetDefinition
                                            ?.customElement === 'undefined'
                                        )}"
                                      placeholder="Выберите готовую ссылку"
                                      @change="${(x) => {
                                        switch (x.predefinedWidgetUrl.value) {
                                          case 'simple-frame-widget':
                                            x.url.value =
                                              'https://psina.pages.dev/widgets/simple-frame-widget.js';
                                            x.name.value = 'Фрейм';

                                            break;
                                          case 'pusher-subscription-widget':
                                            x.url.value =
                                              'https://psina.pages.dev/widgets/pusher-subscription-widget.js';
                                            x.name.value = 'Сообщения Pusher';

                                            break;
                                          case 'psina':
                                            x.url.value =
                                              'https://psina.pages.dev/widgets/psina.js';
                                            x.name.value = 'Psina';

                                            break;
                                        }
                                      }}"
                                    >
                                      <ppp-option value="psina">
                                        Psina
                                      </ppp-option>
                                      <ppp-option value="simple-frame-widget">
                                        Фрейм
                                      </ppp-option>
                                      <ppp-option
                                        value="pusher-subscription-widget"
                                      >
                                        Сообщения Pusher
                                      </ppp-option>
                                    </ppp-select>
                                  </div>
                                `
                              )}
                            </div>
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
            <div class="cta-holder">
              ${when(
                (x) => x.document.removed,
                html`
                  <ppp-badge
                    style="margin-right: auto"
                    slot="controls"
                    appearance="red"
                  >
                    Виджет удалён
                  </ppp-badge>
                `
              )}
              <div class="control-line">
                <ppp-button
                  appearance="primary"
                  class="save-widget"
                  @click="${(x) => x.submitDocument()}"
                >
                  ${(x) =>
                    x.document.type === 'custom' &&
                    typeof x.widgetDefinition?.customElement === 'undefined'
                      ? 'Продолжить'
                      : 'Сохранить виджет'}
                </ppp-button>
                <ppp-button
                  ?hidden="${(x) => !x.document._id || x.mounted}"
                  ?disabled="${(x) => !x.isSteady() || x.document.removed}"
                  appearance="danger"
                  @click="${(x) => x.cleanupAndRemoveDocument()}"
                >
                  Удалить
                </ppp-button>
              </div>
            </div>
          </div>
        </nav>
        <div class="right-pane">
          <div class="right-pane-inner">
            <div class="widget-holder">
              <div class="drawer">
                <div class="control-stack">
                  <div class="drawer-header">
                    <div class="drawer-header-inner">
                      <h3>Предварительный просмотр</h3>
                    </div>
                  </div>
                  <ppp-checkbox
                    ${ref('autoApplyWidgetModifications')}
                    @change="${(x) =>
                      ppp.settings.set(
                        'autoApplyWidgetModifications',
                        x.autoApplyWidgetModifications.checked
                      )}"
                    ?checked="${() =>
                      ppp.settings.get('autoApplyWidgetModifications') ??
                      true}"
                  >
                    Применять настройки по мере редактирования
                  </ppp-checkbox>
                  <ppp-button
                    appearance="primary"
                    class="xsmall"
                    @click="${(x) => x.applyModifications()}"
                  >
                    Применить текущие настройки
                  </ppp-button>
                </div>
              </div>
              <div class="spacing3"></div>
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
                    <span class="positive">Идёт загрузка, подождите...</span>
                  `
                )}
              </h2>
              ${when(
                (x) => x.widgetDefinition.tags,
                html` <div class="widget-tags">
                  ${repeat(
                    (x) => x.widgetDefinition.tags,
                    html`
                      <ppp-badge class="widget-tags" appearance="lightgray">
                        ${(x) => x}
                      </ppp-badge>
                    `
                  )}
                </div>`
              )}
              <div class="widget-info">
                <p class="description">
                  ${(x) => x.widgetDefinition.description}
                </p>
              </div>
              ${when(
                (x) => !x.isSteady(),
                html`
                  <hr class="divider" />
                  <div class="widget-area">
                    <h5>Виджет загружается, подождите...</h5>
                  </div>
                `
              )}
              ${when(
                (x) => x.isSteady() && x.getWidgetTagName(),
                html`
                  <hr class="divider" />
                  <div class="widget-area" ${ref('widgetArea')}>
                    <ppp-widget-preview
                      ${ref('widgetPreview')}
                      wtag="${(x) => x.getWidgetTagName()}"
                      :widgetDefinition="${(x) => x.widgetDefinition ?? {}}"
                      :container="${(x) => x}"
                    ></ppp-widget-preview>
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
    </form>
  </template>
`;

export const widgetPageStyles = css`
  ${pageStyles}
  .positive {
    color: ${positive};
  }

  .negative {
    color: ${negative};
  }

  h3 {
    margin-bottom: ${spacing2};
  }

  .preview-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing5};
  }

  .content {
    display: flex;
    min-height: calc(100vh - 85px);
    font-family: ${bodyFont};
  }

  :host([mounted]) .content {
    min-height: 100%;
    justify-content: space-around;
  }

  nav {
    padding: 0 10px;
    position: relative;
    width: 50%;
    border-left: 1px solid transparent;
  }

  .nav-inner {
    max-width: 600px;
    margin: 32px auto 0;
  }

  :host([mounted]) .nav-inner {
    margin: 0 13px;
    max-width: unset;
  }

  .right-pane {
    position: relative;
    width: 50%;
    border-left: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }

  .right-pane-inner {
    position: sticky;
    top: 15px;
  }

  :host([mounted]) .right-pane-inner {
    padding-bottom: 10px;
  }

  .widget-holder {
    padding: 15px 0 60px 20px;
  }

  :host([mounted]) .widget-holder {
    padding: 15px 24px 60px 20px;
  }

  .widget-info {
    margin-top: 8px;
  }

  .widget-tags {
    margin-top: 5px;
  }

  .widget-settings {
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
    border-radius: 4px;
    padding: 24px;
  }

  .cta-holder {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: right;
    padding: 24px 0;
  }

  .drawer {
    position: relative;
    border-radius: 6px;
  }

  .drawer-header {
    position: relative;
    width: 100%;
    border-bottom: 2px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }

  .drawer-header-inner h3 {
    margin-top: 0;
  }

  .drawer-body {
    position: relative;
  }

  .drawer-body-inner {
    padding: 25px 4px;
  }

  .drawer-body ppp-tab-panel {
    display: flex;
    flex-direction: column;
    margin-top: ${spacing2};
    margin-bottom: ${spacing3};
  }

  .drawer-body ppp-tabs {
    margin-top: 20px;
  }

  .widget-settings-section {
    font-family: ${bodyFont};
    display: flex;
    flex-direction: column;
    font-size: ${fontSizeBody1};
    font-weight: ${fontWeightBody1};
    line-height: ${lineHeightBody1};
    margin-bottom: 20px;
  }

  .widget-settings-section:last-of-type {
    margin-bottom: 0;
  }

  .widget-settings-label-group h5 {
    display: flex;
    line-height: 26px;
    font-size: 14px;
    max-width: 100%;
    margin: 0;
    padding: 0;
  }

  .widget-settings-label-group .description {
    margin-top: ${spacing1};
    padding-right: 20px;
  }

  .widget-settings-section .control-line ppp-query-select:first-child {
    width: 100%;
  }

  .widget-settings-section .control-line ppp-button:last-child {
    margin-top: 8px;
  }

  /* prettier-ignore */

  .widget-settings-section .control-line ppp-query-select[appearance="error"] + ppp-button {
    margin-top: -16px;
  }

  .divider {
    border: none;
    margin: 20px 0;
    padding: 0;
    width: 100%;
    height: 2px;
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }

  .summary {
    display: flex;
    width: 100%;
    font-size: 17px;
    font-weight: bold;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
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

  ppp-snippet {
    width: 100%;
    height: 180px;
  }
`;

export class WidgetPage extends Page {
  collection = 'widgets';

  denormalization = new Denormalization();

  savedInstrument;

  savedWidth;

  savedHeight;

  @attr({ mode: 'boolean' })
  resizing;

  @attr({ mode: 'boolean' })
  mounted;

  @observable
  widgetDefinition;

  constructor() {
    super();

    this.onChange = this.onChange.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.widgetDefinition = {};
  }

  async connectedCallback() {
    await super.connectedCallback();

    document.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointercancel', this.onPointerUp);
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onChange);
    this.removeEventListener('input', this.onChange);
    this.removeEventListener('columnadd', this.onChange);
    this.removeEventListener('columnremove', this.onChange);
    this.removeEventListener('pppdragend', this.onChange);
    document.removeEventListener('pointerdown', this.onPointerDown);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointercancel', this.onPointerUp);

    super.disconnectedCallback();
  }

  onPointerDown(event) {
    let resizeControls;

    const cp = event.composedPath();

    if (
      (resizeControls = cp.find(
        (n) => n?.tagName?.toLowerCase?.() === 'ppp-widget-resize-controls'
      ))
    ) {
      this.resizeControls = resizeControls;
      this.resizing = true;
    }

    if (this.resizing) {
      // Initial coordinates for deltas
      this.clientX = event.clientX;
      this.clientY = event.clientY;
      this.x = 0;

      const widget = this.resizeControls.getRootNode().host;

      if (widget) {
        widget.resizing = this.resizing;

        if (this.resizing) {
          this.resizeControls.onPointerDown({ event, node: cp[0] });
        }
      }
    }
  }

  onPointerMove(event) {
    if (this.resizing) {
      this.resizeControls.onPointerMove({ event });
    }
  }

  onPointerUp(event) {
    if (this.resizing) {
      this.resizeControls.onPointerUp({ event });

      this.resizing = false;

      const widget = this.resizeControls.getRootNode().host;

      if (widget) {
        widget.resizing = false;
      }
    }
  }

  async validate() {
    if (this.widgetDefinition.type !== WIDGET_TYPES.MIGRATION) {
      await validate(this.name);
    }

    if (this.document.type === 'custom' && !this.widgetDefinition.loaded) {
      await this.loadWidget();

      return;
    }

    if (typeof this.widgetDefinition?.customElement !== 'object') {
      invalidate(this.url, {
        errorMessage: 'Этот виджет не может быть загружен.',
        raiseException: true
      });
    }

    if (this.document.type === 'custom' && this.url?.isConnected) {
      await validate(this.url);

      try {
        new URL(this.url.value);
        await fetch(this.url.value, {
          cache: 'reload'
        });
      } catch (e) {
        this.widgetDefinition = {};

        invalidate(this.url, {
          errorMessage: 'Неверный или неполный URL',
          raiseException: true
        });
      }
    }

    if (typeof this.widgetElement?.validate === 'function') {
      return this.widgetElement.validate();
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]')
            }
          },
          {
            $lookup: {
              from: 'apis',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0
                  }
                }
              ],
              as: 'apis'
            }
          },
          {
            $lookup: {
              from: 'traders',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0
                  }
                }
              ],
              as: 'traders'
            }
          },
          {
            $lookup: {
              from: 'brokers',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0
                  }
                }
              ],
              as: 'brokers'
            }
          },
          {
            $lookup: {
              from: 'bots',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0,
                    webhook: 0,
                    type: 0
                  }
                }
              ],
              as: 'bots'
            }
          },
          {
            $lookup: {
              from: 'services',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0,
                    constsCode: 0,
                    formatterCode: 0,
                    instrumentsCode: 0,
                    symbolsCode: 0,
                    environmentCode: 0,
                    environmentCodeSecret: 0,
                    sourceCode: 0,
                    parsingCode: 0,
                    versioningUrl: 0,
                    useVersioning: 0,
                    tableSchema: 0,
                    insertTriggerCode: 0,
                    deleteTriggerCode: 0,
                    proxyHeaders: 0
                  }
                }
              ],
              as: 'services'
            }
          }
        ]);
    };
  }

  async transform() {
    this.denormalization.fillRefs(this.document);
    this.templateDocument = await this.denormalization.denormalize(
      this.document
    );

    if (this.mounted && this.parentNode.widget) {
      return Object.assign(
        {},
        this.templateDocument,
        await this.denormalization.denormalize(this.parentNode.widget.document)
      );
    } else {
      return this.templateDocument;
    }
  }

  async find() {
    return {
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  canSubmit(event) {
    // Disable submission from widget
    return !this.shadowRoot.activeElement?.closest?.('.widget-area');
  }

  async submitDocument(options = {}) {
    try {
      await this.validate();
      await this.applyModifications();
    } catch (e) {
      this.failOperation(e);

      // Skip second validation.
      return;
    } finally {
      this.endOperation();
    }

    await later(100);
    await super.submitDocument(options);
  }

  async submit() {
    let widgetUpdateResult = {};

    // Needed to prevent widget preview null document
    this.widgetPreview?.shadowRoot.firstChild &&
      this.widgetPreview.shadowRoot.removeChild(
        this.widgetPreview.shadowRoot.firstChild
      );

    const $set = {
      name: this.name.value.trim(),
      reportedType: this.widgetDefinition.type,
      updatedAt: new Date()
    };

    const $setOnInsert = {
      type: this.document.type,
      collection: this.widgetDefinition.collection,
      createdAt: new Date()
    };

    if (this.document.type === 'custom') {
      $setOnInsert.url = this.url.value.trim();
    }

    const result = {
      $set,
      $setOnInsert
    };

    if (typeof this.widgetElement?.submit === 'function') {
      widgetUpdateResult = await this.widgetElement.submit();

      if (typeof widgetUpdateResult === 'object') {
        for (const key in widgetUpdateResult) {
          result[key] = Object.assign(
            {},
            result[key] ?? {},
            widgetUpdateResult[key]
          );
        }
      } else if (widgetUpdateResult === false) {
        return false;
      }
    }

    return result;
  }

  getWidgetTagName() {
    if (this.document.type === 'custom' && !this.document.url) return null;

    if (typeof this.widgetDefinition?.customElement === 'object') {
      return this.widgetDefinition.customElement.name;
    }
  }

  getWidgetUrl() {
    const type = this.document.type;

    if (!type) {
      console.error('No widget type.');

      return;
    }

    if (type === 'custom') {
      if (this.document.url) return this.document.url;

      return this.url?.value ? new URL(this.url?.value).toString() : '';
    } else {
      return `${ppp.rootUrl}/elements/widgets/${type}.js`;
    }
  }

  async loadWidget(url = this.getWidgetUrl()) {
    this.beginOperation();

    if (!url && this.document.type === 'custom') {
      this.widgetDefinition.settings = null;
      this.widgetDefinition.title = 'По ссылке';
      this.widgetDefinition.tags = ['Загружаемый виджет'];
      this.widgetDefinition.collection = null;
      this.widgetDefinition.loaded = false;
      this.widgetDefinition.description =
        'Введите имя виджета и URL, чтобы продолжить.';

      this.endOperation();

      Observable.notify(this, 'widgetDefinition');
    }

    if (url) {
      this.beginOperation();

      try {
        const module = await import(url);
        const wUrl = new URL(url);
        const baseWidgetUrl = wUrl.href.slice(0, wUrl.href.lastIndexOf('/'));

        this.widgetDefinition = await module.widgetDefinition?.({
          ppp,
          baseWidgetUrl
        });

        if (typeof this.widgetDefinition?.customElement !== 'object') {
          invalidate(this.url, {
            errorMessage: 'Этот виджет не может быть загружен.',
            raiseException: true
          });
        }

        this.widgetDefinition.loaded = true;

        Observable.notify(this, 'widgetDefinition');
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    }
  }

  onChange(event) {
    const cp = event.composedPath();
    const isTextFiled = cp.find((n) =>
      /ppp-text|ppp-snippet/i.test(n.tagName?.toLowerCase())
    );

    if (!event.detail && !isTextFiled) {
      return;
    }

    if (!this.autoApplyWidgetModifications.checked) return true;

    // Discard input onChange
    if (event.type === 'change' && isTextFiled) return true;

    if (cp.find((n) => n.classList?.contains('widget-area'))) return true;

    this.onChangeDelayed(event);

    return true;
  }

  async applyModifications() {
    this.beginOperation();
    await this.onChangeDelayedAsync();
  }

  async onChangeDelayedAsync() {
    try {
      let documentAfterChanges;

      this.savedInstrument = this.widgetElement?.instrument;

      if (this.widgetElement?.isConnected) {
        this.savedWidth = parseInt(this.widgetElement?.style?.width);
        this.savedHeight = parseInt(this.widgetElement?.style?.height);
      }

      const urlObject = {};

      if (this.document.type === 'custom' && this.url?.isConnected) {
        urlObject.url = this.url.value ?? '';
      }

      if (typeof this.widgetElement?.submit === 'function') {
        const { $set } = await this.widgetElement?.submit({ preview: true });

        documentAfterChanges = await this.denormalization.denormalize(
          Object.assign(
            {},
            this.document,
            $set ?? {},
            {
              name: this.name.value
            },
            urlObject
          )
        );
      } else {
        documentAfterChanges = await this.denormalization.denormalize(
          Object.assign(
            {},
            this.document,
            {
              name: this.name.value
            },
            urlObject
          )
        );
      }

      this.document = Object.assign({}, documentAfterChanges ?? {});

      if (!this.document._id) {
        this.document = await this.#denormalizePartialDocument();
      }

      if (this.url?.isConnected && this.document.type === 'custom') {
        await validate(this.url);

        try {
          new URL(this.url.value);
          await fetch(this.url.value, {
            cache: 'no-cache'
          });
        } catch (e) {
          this.widgetDefinition = {};

          invalidate(this.url, {
            errorMessage: 'Неверный или неполный URL',
            raiseException: true
          });
        }
      }

      if (this.document.type === 'custom' && !this.widgetDefinition.loaded) {
        await this.loadWidget();
      }
    } finally {
      this.widgetPreview?.shadowRoot.firstChild &&
        this.widgetPreview.shadowRoot.removeChild(
          this.widgetPreview.shadowRoot.firstChild
        );

      // Force widget connectedCallback
      Updates.enqueue(() => this.endOperation());
    }
  }

  @debounce(100)
  onChangeDelayed(event) {
    this.beginOperation();

    return this.onChangeDelayedAsync(event);
  }

  async #denormalizePartialDocument() {
    const lines = ((context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('app')
        .aggregate([
          {
            $match: {
              _id: '@settings'
            }
          },
          {
            $lookup: {
              from: 'apis',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0
                  }
                }
              ],
              as: 'apis'
            }
          },
          {
            $lookup: {
              from: 'traders',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0
                  }
                }
              ],
              as: 'traders'
            }
          },
          {
            $lookup: {
              from: 'brokers',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0
                  }
                }
              ],
              as: 'brokers'
            }
          },
          {
            $lookup: {
              from: 'bots',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0,
                    webhook: 0,
                    type: 0
                  }
                }
              ],
              as: 'bots'
            }
          },
          {
            $lookup: {
              from: 'services',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0,
                    constsCode: 0,
                    formatterCode: 0,
                    instrumentsCode: 0,
                    symbolsCode: 0,
                    environmentCode: 0,
                    environmentCodeSecret: 0,
                    sourceCode: 0,
                    parsingCode: 0,
                    versioningUrl: 0,
                    useVersioning: 0,
                    tableSchema: 0,
                    insertTriggerCode: 0,
                    deleteTriggerCode: 0,
                    proxyHeaders: 0
                  }
                }
              ],
              as: 'services'
            }
          }
        ]);
    })
      .toString()
      .split(/\r?\n/);

    lines.pop();
    lines.shift();

    const [evalRequest] = await ppp.user.functions.eval(lines.join('\n'));

    this.denormalization.fillRefs(evalRequest);

    return this.denormalization.denormalize(this.document);
  }

  statusChanged(oldValue, newValue) {
    if (newValue === PAGE_STATUS.READY) {
      if (!this.lastError) {
        if (!this.document.type) {
          this.document.type = ppp.app.params().type ?? 'order';
        }

        Observable.notify(this, 'document');
        this.addEventListener('change', this.onChange);
        this.addEventListener('input', this.onChange);
        this.addEventListener('columnadd', this.onChange);
        this.addEventListener('columnremove', this.onChange);
        this.addEventListener('pppdragend', this.onChange);
      }
    }
  }

  async handleWidgetTypeChange(event) {
    if (!this.document._id) {
      this.widgetDefinition = {};
      this.savedInstrument = void 0;
      this.savedWidth = void 0;
      this.savedHeight = void 0;

      const name = this.name.value.trim();

      this.document.type = event.target.value;

      await later(100);

      ppp.app.setURLSearchParams({
        type: this.document.type
      });

      Observable.notify(this, 'document');
      Updates.enqueue(() => (this.name.value = name));
    }

    await this.loadWidget();
  }
}

class WidgetPreview extends PPPElement {
  @attr
  wtag;

  connectedCallback() {
    super.connectedCallback();

    this.wtagChanged(void 0, this.wtag);
  }

  wtagChanged(oldValue, newValue) {
    if (this.$fastController.isConnected) {
      if (newValue) {
        this.shadowRoot.firstChild &&
          this.shadowRoot.removeChild(this.shadowRoot.firstChild);

        const element = document.createElement(newValue);

        element.setAttribute('preview', '');

        element.container = this.container;
        element.widgetDefinition = this.widgetDefinition;
        this.container.widgetElement = element;

        this.shadowRoot.appendChild(element);
        this.$emit('widgetpreviewchange', {
          element
        });
      }
    }
  }
}

export default {
  WidgetPageComposition: WidgetPage.compose({
    template: widgetPageTemplate,
    styles: widgetPageStyles
  }).define(),
  WidgetTypeRadioGroupComposition: WidgetTypeRadioGroup.compose({
    template: radioGroupTemplate,
    styles: widgetTypeRadioGroupStyles
  }).define(),
  WidgetTypeRadioComposition: WidgetTypeRadio.compose({
    template: widgetTypeRadioTemplate,
    styles: widgetTypeRadioStyles
  }).define(),
  WidgetPreviewComposition: WidgetPreview.compose({
    template: html` <template></template> `,
    styles: css`
      ${display('flex')}
      :host {
        position: relative;
        width: 100%;
        height: 100%;
      }
    `
  }).define()
};
