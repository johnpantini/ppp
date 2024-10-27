/** @decorator */

import ppp from '../../ppp.js';
import {
  html,
  css,
  ref,
  when,
  attr,
  observable,
  Updates,
  Observable,
  repeat
} from '../../vendor/fast-element.min.js';
import { documentPageHeaderPartial, Page, pageStyles } from '../page.js';
import {
  Denormalization,
  extractEverything
} from '../../lib/ppp-denormalize.js';
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
  spacing2,
  spacing3,
  spacing5,
  themeConditional
} from '../../design/design-tokens.js';
import { display, staticallyCompose } from '../../vendor/fast-utilities.js';
import { RadioGroup, radioGroupTemplate } from '../radio-group.js';
import { Radio } from '../radio.js';
import { customWidget } from '../../static/svg/sprite.js';
import { normalize, scrollbars } from '../../design/styles.js';
import { PAGE_STATUS, WIDGET_TYPES } from '../../lib/const.js';
import { TextField } from '../text-field.js';
import { Select } from '../select.js';
import { Tabs } from '../tabs.js';
import { QuerySelect } from '../query-select.js';
import { Snippet } from '../snippet.js';
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

export const colorSelectorTemplate = ({
  refName,
  value,
  isDark,
  variant
}) => html`
  <ppp-select
    ?disabled="${(x) => !x.isSteady()}"
    variant="${variant ?? 'tiny'}"
    ${ref(refName)}
    value="${() => value ?? 'default'}"
  >
    <span slot="description">${isDark ? 'Тёмная тема' : 'Светлая тема'}</span>
    <ppp-option value="default">По умолчанию</ppp-option>
    <ppp-option value="palette-white">Белый</ppp-option>
    <ppp-option value="palette-black">Чёрный</ppp-option>
    <ppp-option value="palette-gray-dark-4">Серый -4</ppp-option>
    <ppp-option value="palette-gray-dark-3">Серый -3</ppp-option>
    <ppp-option value="palette-gray-dark-2">Серый -2</ppp-option>
    <ppp-option value="palette-gray-dark-1">Серый -1</ppp-option>
    <ppp-option value="palette-gray-base">Серый</ppp-option>
    <ppp-option value="palette-gray-light-1">Серый +1</ppp-option>
    <ppp-option value="palette-gray-light-2">Серый +2</ppp-option>
    <ppp-option value="palette-gray-light-3">Серый +3</ppp-option>
    <ppp-option value="palette-green-dark-3">Зелёный -3</ppp-option>
    <ppp-option value="palette-green-dark-2">Зелёный -2</ppp-option>
    <ppp-option value="palette-green-dark-1">Зелёный -1</ppp-option>
    <ppp-option value="palette-green-base">Зелёный</ppp-option>
    <ppp-option value="palette-green-light-1">Зелёный +1</ppp-option>
    <ppp-option value="palette-green-light-2">Зелёный +2</ppp-option>
    <ppp-option value="palette-green-light-3">Зелёный +3</ppp-option>
    <ppp-option value="palette-purple-dark-3">Фиолетовый -3</ppp-option>
    <ppp-option value="palette-purple-dark-2">Фиолетовый -2</ppp-option>
    <ppp-option value="palette-purple-base">Фиолетовый</ppp-option>
    <ppp-option value="palette-purple-light-2">Фиолетовый +2</ppp-option>
    <ppp-option value="palette-purple-light-3">Фиолетовый +3</ppp-option>
    <ppp-option value="palette-blue-dark-3">Синий -3</ppp-option>
    <ppp-option value="palette-blue-dark-2">Синий -2</ppp-option>
    <ppp-option value="palette-blue-dark-1">Синий -1</ppp-option>
    <ppp-option value="palette-blue-base">Синий</ppp-option>
    <ppp-option value="palette-blue-light-1">Синий +1</ppp-option>
    <ppp-option value="palette-blue-light-2">Синий +2</ppp-option>
    <ppp-option value="palette-blue-light-3">Синий +3</ppp-option>
    <ppp-option value="palette-yellow-dark-3">Жёлтый -3</ppp-option>
    <ppp-option value="palette-yellow-dark-2">Жёлтый -2</ppp-option>
    <ppp-option value="palette-yellow-base">Жёлтый</ppp-option>
    <ppp-option value="palette-yellow-light-2">Жёлтый +2</ppp-option>
    <ppp-option value="palette-yellow-light-3">Жёлтый +3</ppp-option>
    <ppp-option value="palette-red-dark-3">Красный -3</ppp-option>
    <ppp-option value="palette-red-dark-2">Красный -2</ppp-option>
    <ppp-option value="palette-red-dark-1">Красный -1</ppp-option>
    <ppp-option value="palette-red-base">Красный</ppp-option>
    <ppp-option value="palette-red-light-1">Красный +1</ppp-option>
    <ppp-option value="palette-red-light-2">Красный +2</ppp-option>
    <ppp-option value="palette-red-light-3">Красный +3</ppp-option>
  </ppp-select>
`;

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
    flex-wrap: wrap;
    gap: ${spacing2};
  }

  ::slotted(ppp-widget-type-radio) {
    display: flex;
    flex-grow: 1;
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
    padding: 10px;
    cursor: pointer;
    border-width: 1px;
    border-style: solid;
    border-color: ${paletteGrayBase};
    border-image: initial;
    border-radius: 4px;
    user-select: none;
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
    justify-content: center;
    align-items: center;
    width: 100%;
    color: ${themeConditional(paletteGrayBase, paletteWhite)};
    font-size: ${fontSizeHeading5};
  }

  [name='text']::slotted(*) {
    font-family: ${bodyFont};
    display: flex;
    flex-direction: column;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
  }

  [name='icon']::slotted(*) {
    margin-left: ${spacing3};
    height: 20px;
    width: 20px;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: 0.42;
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
            <div class="widget-settings" ${ref('widgetSettingsDomElement')}>
              <form novalidate>
                <div>
                  <div
                    class="drawer"
                    ?hidden="${(x) => {
                      return x.mounted || x.document._id;
                    }}"
                  >
                    <div class="drawer-header">
                      <div class="drawer-header-inner">
                        <h3>Тип виджета</h3>
                      </div>
                    </div>
                    <div class="drawer-body">
                      <div class="drawer-body-inner">
                        <ppp-widget-type-radio-group
                          ${ref('widgetTypeSelector')}
                          ?disabled="${(x) => !x.isSteady()}"
                          @change="${(x, { event }) =>
                            x.handleWidgetTypeChange(event.detail.group.value)}"
                        >
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id && x.document.type !== 'order'}"
                            value="order"
                          >
                            <span slot="text">Заявка</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'scalping-buttons'}"
                            value="scalping-buttons"
                          >
                            <span slot="text">Скальперские кнопки</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'active-orders'}"
                            value="active-orders"
                          >
                            <span slot="text">Активные заявки</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'light-chart'}"
                            value="light-chart"
                          >
                            <span slot="text">Лёгкий график</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'orderbook'}"
                            value="orderbook"
                          >
                            <div slot="text">Книга заявок</div>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'time-and-sales'}"
                            value="time-and-sales"
                          >
                            <div slot="text">Лента всех сделок</div>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id &&
                              x.document.type !== 'portfolio'}"
                            value="portfolio"
                          >
                            <span slot="text">Портфель</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id && x.document.type !== 'balances'}"
                            value="balances"
                          >
                            <span slot="text">Балансы</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id && x.document.type !== 'list'}"
                            value="list"
                          >
                            <span slot="text">Список</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id && x.document.type !== 'timeline'}"
                            value="timeline"
                          >
                            <span slot="text">Лента операций</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id && x.document.type !== 'clock'}"
                            value="clock"
                          >
                            <span slot="text">Часы</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id && x.document.type !== 'marquee'}"
                            value="marquee"
                          >
                            <span slot="text">Строка котировок</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id && x.document.type !== 'tcc'}"
                            value="tcc"
                          >
                            <span slot="text">Управление трейдерами</span>
                          </ppp-widget-type-radio>
                          <ppp-widget-type-radio
                            ?disabled="${(x) =>
                              x.document._id && x.document.type !== 'custom'}"
                            value="custom"
                          >
                            <div slot="text">По ссылке</div>
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
                        <h3>Настройки</h3>
                      </div>
                    </div>
                    <div class="drawer-body">
                      <div class="drawer-body-inner" style="padding-bottom: 0">
                        <ppp-button
                          style="margin-bottom: 6px;"
                          ?hidden="${(x) => !x.mounted}"
                          appearance="primary"
                          class="xsmall"
                          @click="${(x) => x.loadTemplateSettings()}"
                        >
                          Подставить настройки из шаблона
                        </ppp-button>
                        <div class="widget-settings-section">
                          <div class="widget-settings-label-group">
                            <h5>Название</h5>
                            <p class="description">
                              Название (если виджет поддерживает) отображается в
                              заголовке.
                            </p>
                          </div>
                          <div class="widget-settings-input-group">
                            <ppp-text-field
                              standalone
                              placeholder="Название виджета"
                              value="${(x) => x.document.name}"
                              ?disabled="${(x) => !x.isSteady()}"
                              ${ref('name')}
                            ></ppp-text-field>
                          </div>
                        </div>
                        <div class="widget-settings-section">
                          <div class="widget-settings-label-group">
                            <h5>Цвет фона заголовка</h5>
                          </div>
                          <div class="widget-settings-input-group">
                            <div class="control-line colors-line">
                              ${(x) =>
                                colorSelectorTemplate({
                                  refName: 'headerBgDark',
                                  value: x.document.headerBgDark,
                                  isDark: true
                                })}
                              ${(x) =>
                                colorSelectorTemplate({
                                  refName: 'headerBgLight',
                                  value: x.document.headerBgLight
                                })}
                              <ppp-text-field
                                placeholder="20"
                                min="0"
                                step="1"
                                max="100"
                                type="number"
                                value="${(x) => x.document.headerBgOpacity}"
                                ?disabled="${(x) => !x.isSteady()}"
                                ${ref('headerBgOpacity')}
                              >
                                <span slot="description">Прозрачность, %</span>
                              </ppp-text-field>
                            </div>
                          </div>
                        </div>
                        <div class="widget-settings-section">
                          <div class="widget-settings-label-group">
                            <h5>Цвет шрифта заголовка</h5>
                          </div>
                          <div class="widget-settings-input-group">
                            <div class="control-line colors-line">
                              ${(x) =>
                                colorSelectorTemplate({
                                  refName: 'headerColorDark',
                                  value: x.document.headerColorDark,
                                  variant: 'compact',
                                  isDark: true
                                })}
                              ${(x) =>
                                colorSelectorTemplate({
                                  refName: 'headerColorLight',
                                  value: x.document.headerColorLight,
                                  variant: 'compact'
                                })}
                            </div>
                          </div>
                        </div>
                        ${when(
                          (x) => x.document.linkedWidgets?.length,
                          html`
                            <div class="widget-settings-section">
                              <div class="widget-settings-label-group">
                                <h5>Название в ансамбле</h5>
                                <p class="description">
                                  Будет отображаться во вкладках ансамбля.
                                </p>
                              </div>
                              <div class="widget-settings-input-group">
                                <ppp-text-field
                                  standalone
                                  placeholder="Название виджета в ансамбле"
                                  value="${(x) => x.document.nameWhenStacked}"
                                  ${ref('nameWhenStacked')}
                                ></ppp-text-field>
                              </div>
                            </div>
                          `
                        )}
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
                                  standalone
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
                                          case 'noii':
                                            x.url.value =
                                              'https://psina.pages.dev/widgets/noii.js';
                                            x.name.value = 'Индикатор NOII';

                                            break;
                                        }
                                      }}"
                                    >
                                      <ppp-option value="noii">
                                        Индикатор NOII
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
                        ${(x) => x.widgetSettings}
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
                  ${ref('saveWidgetButton')}
                  appearance="primary"
                  class="save-widget"
                  ?disabled="${(x) => !x.isSteady()}"
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
                      ppp.settings.get('autoApplyWidgetModifications') ?? true}"
                    ?disabled="${(x) => !x.isSteady()}"
                  >
                    Применять настройки по мере редактирования
                  </ppp-checkbox>
                  <ppp-button
                    ${ref('autoApplyWidgetModificationsButton')}
                    appearance="primary"
                    class="xsmall"
                    ?disabled="${(x) => !x.isSteady()}"
                    @click="${(x) => x.applyModifications()}"
                  >
                    Применить текущие настройки
                  </ppp-button>
                </div>
              </div>
              <div class="spacing3"></div>
              <h2 class="widget-name">
                ${when(
                  (x) => x.widgetDefinition.title && x.isSteady(),
                  html`
                    <span class="positive">
                      ${(x) => x.widgetDefinition.title}
                    </span>
                  `
                )}
                <span ?hidden="${(x) => x.isSteady()}" class="positive">
                  Идёт загрузка, подождите...
                </span>
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
                    <ppp-banner class="inline" appearance="warning">
                      Виджет появится здесь после загрузки.
                    </ppp-banner>
                  </div>
                `
              )}
              ${when(
                (x) => x.loadedWidgetTag && x.widgetDefinitionLoaded,
                html`
                  <hr class="divider" />
                  <div class="widget-area" ${ref('widgetArea')}>
                    <div class="widget-preview" ${ref('widgetPreview')}>
                      ${(x) =>
                        html`${staticallyCompose(
                          `<${x.loadedWidgetTag} preview></${x.loadedWidgetTag}>`
                        )}`}
                    </div>
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
  ${scrollbars('.widget-area')}
  .positive {
    color: ${positive} !important;
  }

  .negative {
    color: ${negative} !important;
  }

  h3 {
    margin-bottom: ${spacing2};
  }

  .widget-area {
    padding-bottom: ${spacing2};
  }

  .widget-preview {
    position: relative;
    width: 100%;
    height: 100%;
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
    padding: 12px 4px;
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

  .widget-settings-section ppp-text-field {
    max-width: 268px;
  }

  .widget-settings-label-group > .description {
    margin-bottom: ${spacing2};
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
    margin-top: ${spacing2};
    padding-right: 20px;
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

  :host(.page.loader-visible) form {
    opacity: 1;
    pointer-events: all;
    user-select: none;
  }
`;

export class WidgetPage extends Page {
  collection = 'widgets';

  denormalization = new Denormalization();

  savedInstrument;

  // Widget in the preview.
  savedWidth;

  savedHeight;

  @attr({ mode: 'boolean' })
  resizing;

  @attr({ mode: 'boolean' })
  mounted;

  resizeObserver;

  @observable
  loadedWidgetTag;

  @observable
  widgetDefinitionLoaded;

  @observable
  widgetDefinition;

  @observable
  widgetSettings;

  @observable
  extraSettings;

  @observable
  granary;

  constructor() {
    super();

    this.document = {};
    this.granary = {};
    this.onChange = this.onChange.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onResize = this.onResize.bind(this);
    this.widgetDefinition = {};
    this.widgetDefinitionLoaded = false;
    this.loadedWidgetTag = null;
    this.widgetSettings = null;
  }

  async connectedCallback() {
    await super.connectedCallback();

    // Lists require traders.
    if (!this.document._id) {
      const entities = await this.requestManualDenormalization();

      this.document = {
        ...(await this.denormalization.denormalize(this.document)),
        ...entities
      };
    }

    document.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointercancel', this.onPointerUp);

    if (this.hasAttribute('mounted')) {
      this.resizeObserver = new ResizeObserver(this.onResize).observe(this);
    }

    if (!this.document._id) {
      this.widgetTypeSelector.value = this.document.type;
    }
  }

  onResize() {
    if (this.clientHeight) {
      this.parentNode.parentNode.content.style['min-height'] = `${
        this.clientHeight + 90
      }px`;
    }
  }

  disconnectedCallback() {
    if (this.hasAttribute('mounted')) {
      this.resizeObserver?.disconnect();
    }

    this.removeEventListener('change', this.onChange);
    this.removeEventListener('input', this.onChange);
    this.removeEventListener('ppplistitemadd', this.onChange);
    this.removeEventListener('ppplistitemremove', this.onChange);
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

    if (this.document.type === 'custom' && !this.widgetDefinitionLoaded) {
      return await this.loadWidget();
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

        let urlToCheck = this.url.value;

        if (/https:\/\/psina\.pages\.dev/i.test(urlToCheck)) {
          const psinaBaseUrl =
            ppp.settings.get('psinaBaseUrl') ?? 'https://psina.pages.dev';

          urlToCheck = urlToCheck.replace(
            'https://psina.pages.dev',
            new URL(psinaBaseUrl).origin
          );
        }

        await fetch(urlToCheck, {
          cache: 'reload'
        });
      } catch (e) {
        this.widgetDefinition = {};
        this.widgetDefinitionLoaded = false;
        this.loadedWidgetTag = null;
        this.widgetSettings = null;

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
                  $match: {
                    isolated: { $ne: true }
                  }
                },
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
                  $match: {
                    isolated: { $ne: true }
                  }
                },
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
                  $match: {
                    isolated: { $ne: true }
                  }
                },
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
                  $match: {
                    isolated: { $ne: true }
                  }
                },
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
              from: 'orders',
              pipeline: [
                {
                  $match: {
                    isolated: { $ne: true }
                  }
                },
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0
                  }
                }
              ],
              as: 'orders'
            }
          },
          {
            $lookup: {
              from: 'services',
              pipeline: [
                {
                  $match: {
                    isolated: { $ne: true }
                  }
                },
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
                    deleteTriggerCode: 0
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

    if (this.mounted && this.parentNode?.widget) {
      // From workspace, merge with template.
      const mergedDocument = {};
      const liveDocument = await this.denormalization.denormalize(
        this.parentNode.widget.document
      );
      const foreignKeys = new Set();

      for (const key in this.templateDocument) {
        mergedDocument[key] = this.templateDocument[key];

        if (key.endsWith('Id')) {
          foreignKeys.add(key);
        }
      }

      for (const key in liveDocument) {
        mergedDocument[key] = liveDocument[key];
      }

      for (const key of foreignKeys) {
        if (!(key in liveDocument)) {
          mergedDocument[key.split('Id')[0]] = null;
          mergedDocument[key] = null;
        }
      }

      Updates.enqueue(
        () => (this.widgetTypeSelector.value = mergedDocument.type)
      );

      return mergedDocument;
    } else {
      Updates.enqueue(
        () => (this.widgetTypeSelector.value = this.templateDocument.type)
      );

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
    const hasDefinition =
      typeof this.widgetDefinition?.customElement !== 'undefined';

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

    // The user has to proceed first.
    if (
      !this.document._id &&
      this.document.type === 'custom' &&
      !hasDefinition
    ) {
      return;
    }

    await super.submitDocument(options);
  }

  async submit() {
    let widgetUpdateResult = {};

    let headerBgOpacity =
      this.headerBgOpacity.value === ''
        ? ''
        : Math.trunc(Math.abs(this.headerBgOpacity.value));

    if (headerBgOpacity > 100) {
      headerBgOpacity = 100;
    }

    if (isNaN(headerBgOpacity)) {
      headerBgOpacity = '';
    }

    const $set = {
      name: this.name.value.trim(),
      nameWhenStacked: this.nameWhenStacked?.value.trim(),
      headerBgDark: this.headerBgDark.value,
      headerBgLight: this.headerBgLight.value,
      headerBgOpacity,
      headerColorDark: this.headerColorDark.value,
      headerColorLight: this.headerColorLight.value,
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

  #getWidgetTagName() {
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
      this.widgetDefinitionLoaded = false;
      this.widgetDefinition = {
        title: 'По ссылке',
        tags: ['Загружаемый виджет'],
        collection: null,
        description: 'Введите название виджета и его URL, чтобы продолжить.'
      };

      this.endOperation();
    }

    if (url) {
      this.beginOperation();

      if (/https:\/\/psina\.pages\.dev/i.test(url)) {
        const psinaBaseUrl =
          ppp.settings.get('psinaBaseUrl') ?? 'https://psina.pages.dev';

        url = url.replace(
          'https://psina.pages.dev',
          new URL(psinaBaseUrl).origin
        );
      }

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

        // Preserve on modifications.
        if (!this.widgetSettings) {
          this.widgetSettings = this.widgetDefinition.settings;
        }

        this.widgetDefinitionLoaded = true;
        this.loadedWidgetTag = this.#getWidgetTagName();
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    }
  }

  onChange(event) {
    if (!this.autoApplyWidgetModifications.checked || !this.isSteady()) return;

    if (
      ['click', 'pointerdwon', 'pointerup', 'mousedown', 'mouseup'].includes(
        event.type
      )
    )
      return;

    const cp = event.composedPath();

    // Filter out tabs change event.
    if (cp[0] instanceof Tabs) {
      return;
    }

    for (const node of cp) {
      if (node.nodeType === Node.TEXT_NODE) {
        continue;
      }

      if (
        node === this.widgetTypeSelector ||
        node.classList?.contains('widget-area') ||
        node.classList?.contains('widget-ignore-changes')
      ) {
        return;
      }

      const isTextField = node instanceof TextField || node instanceof Snippet;
      const isSelect = node instanceof Select;
      const isQuerySelect = node instanceof QuerySelect;

      if (isSelect && typeof node.wasOpenAtLeastOnce === 'undefined') {
        return;
      }

      if (
        isQuerySelect &&
        typeof node.control.wasOpenAtLeastOnce === 'undefined'
      ) {
        return;
      }

      // Discard input 'change' event.
      if (event.type === 'change' && isTextField) return true;

      // Snippets.
      if (event.detail?.origin === 'updateCode' && isTextField) {
        return;
      }
    }

    return this.onChangeDelayed(event);
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

      const mainFields = {
        name: this.name.value,
        headerBgDark: this.headerBgDark.value,
        headerBgLight: this.headerBgLight.value,
        headerBgOpacity:
          this.headerBgOpacity.value === ''
            ? ''
            : Math.abs(this.headerBgOpacity.value),
        headerColorDark: this.headerColorDark.value,
        headerColorLight: this.headerColorLight.value,
        nameWhenStacked: this.nameWhenStacked?.value
      };

      if (typeof this.widgetElement?.submit === 'function') {
        const { $set } = await this.widgetElement?.submit({ preview: true });

        documentAfterChanges = await this.denormalization.denormalize(
          Object.assign({}, this.document, $set ?? {}, mainFields, urlObject)
        );
      } else {
        documentAfterChanges = await this.denormalization.denormalize(
          Object.assign({}, this.document, mainFields, urlObject)
        );
      }

      this.document = Object.assign({}, documentAfterChanges ?? {});

      if (!this.document._id) {
        this.document = await this.denormalization.denormalize(this.document);
      }

      if (this.url?.isConnected && this.document.type === 'custom') {
        await validate(this.url);

        try {
          new URL(this.url.value);

          let urlToCheck = this.url.value;

          if (/https:\/\/psina\.pages\.dev/i.test(urlToCheck)) {
            const psinaBaseUrl =
              ppp.settings.get('psinaBaseUrl') ?? 'https://psina.pages.dev';

            urlToCheck = urlToCheck.replace(
              'https://psina.pages.dev',
              new URL(psinaBaseUrl).origin
            );
          }

          await fetch(urlToCheck, {
            cache: 'reload'
          });
        } catch (e) {
          this.widgetDefinition = {};
          this.widgetDefinitionLoaded = false;
          this.widgetSettings = null;
          this.loadedWidgetTag = null;

          invalidate(this.url, {
            errorMessage: 'Этот URL не может быть использован',
            raiseException: true
          });
        }
      }

      this.widgetDefinitionLoaded = false;
      await later(100);
      await this.loadWidget();
    } finally {
      this.endOperation();
    }
  }

  @debounce(300)
  onChangeDelayed(event) {
    this.beginOperation();

    return this.onChangeDelayedAsync(event);
  }

  // Needed when there is no document _id. Use  _id: '@settings' to retrieve lookups.
  async requestManualDenormalization() {
    const refs = await extractEverything();

    this.denormalization.fillRefs(refs);

    return {
      apis: refs.apis,
      traders: refs.traders,
      brokers: refs.brokers,
      bots: refs.bots,
      orders: refs.orders,
      services: refs.services
    };
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
        this.addEventListener('ppplistitemadd', this.onChange);
        this.addEventListener('ppplistitemremove', this.onChange);
        this.addEventListener('pppdragend', this.onChange);
      }
    }
  }

  async handleWidgetTypeChange(newType) {
    if (!this.document._id) {
      this.document = {
        name: this.name.value.trim(),
        type: newType,
        apis: this.document.apis,
        traders: this.document.traders,
        brokers: this.document.brokers,
        bots: this.document.bots,
        orders: this.document.orders,
        services: this.document.services
      };

      this.widgetDefinition = {};
      this.widgetDefinitionLoaded = false;
      this.loadedWidgetTag = null;
      this.savedInstrument = void 0;
      this.savedWidth = void 0;
      this.savedHeight = void 0;

      const name = this.name.value.trim();

      ppp.app.setURLSearchParams({
        type: this.document.type
      });

      Observable.notify(this, 'document');
      Updates.enqueue(() => (this.name.value = name));
    }

    this.extraSettings = null;
    this.widgetSettings = null;
    this.granary = {};

    await this.loadWidget();
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
  }).define()
};
