/** @decorator */

import ppp from '../ppp.js';
import { PPPElement, PPPOffClickElement } from '../lib/ppp-element.js';
import {
  attr,
  css,
  html,
  ref,
  observable,
  repeat,
  when,
  slotted,
  Updates,
  Observable,
  nullableNumberConverter
} from '../vendor/fast-element.min.js';
import {
  display,
  keyArrowDown,
  keyArrowUp,
  keyEnter,
  keyEscape
} from '../vendor/fast-utilities.js';
import {
  ellipsis,
  normalize,
  scrollbars,
  typography
} from '../design/styles.js';
import {
  bodyFont,
  buy,
  buyHover,
  fontSizeWidget,
  fontWeightWidget,
  buttonHeightWidget,
  lineHeightWidget,
  negative,
  paletteBlack,
  paletteBlueBase,
  paletteBlueLight1,
  paletteBlueLight2,
  paletteBlueLight3,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayDark3,
  paletteGrayDark4,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteYellowDark2,
  paletteYellowLight2,
  paletteGreenBase,
  paletteGreenLight3,
  paletteRedBase,
  paletteRedDark1,
  paletteRedLight3,
  paletteWhite,
  positive,
  sell,
  sellHover,
  spacing1,
  widgetGroup1,
  widgetGroup2,
  widgetGroup3,
  widgetGroup4,
  widgetGroup5,
  widgetGroup6,
  widgetGroup7,
  widgetGroup8,
  widgetGroup9,
  darken,
  lighten,
  themeConditional,
  toColorComponents,
  paletteBlueDark2,
  palettePurpleDark2,
  palettePurpleLight2
} from '../design/design-tokens.js';
import {
  circleNotch,
  close,
  settings,
  increment,
  decrement,
  search,
  notificationError,
  notificationSuccess,
  notificationNote,
  upDown,
  plus,
  lock,
  unlock,
  emptyWidgetState
} from '../static/svg/sprite.js';
import { uuidv4 } from '../lib/ppp-crypto.js';
import {
  decSeparator,
  distanceToString,
  getInstrumentMinPriceIncrement,
  getInstrumentPrecision,
  priceCurrencySymbol,
  stringToFloat
} from '../lib/intl.js';
import { later } from '../lib/ppp-decorators.js';
import { Tab, Tabs, tabsTemplate, tabTemplate } from './tabs.js';
import { TextField, textFieldStyles, textFieldTemplate } from './text-field.js';
import { Select, selectStyles, selectTemplate } from './select.js';
import { Button, buttonStyles, buttonTemplate } from './button.js';
import { RadioGroup, radioGroupTemplate } from './radio-group.js';
import { BoxRadio, boxRadioStyles, boxRadioTemplate } from './radio.js';
import {
  ListboxOption,
  listboxOptionStyles,
  listboxOptionTemplate
} from './listbox-option.js';
import { widgetCommonColors } from './widget.js';
import { endSlotTemplate, startSlotTemplate } from '../vendor/fast-patterns.js';
import { Checkbox, checkboxStyles, checkboxTemplate } from './checkbox.js';
import './progress.js';

await ppp.i18n(import.meta.url);

export const widgetGroupControlTemplate = html`
  <template @click="${(x, c) => x.handleClick(c)}">
    <div class="toggle">${(x) => x.selection ?? ''}</div>
    ${when(
      (x) => x.open,
      html`
        <div class="popup">
          <div class="toolbar"></div>
          <div class="groups">
            <div class="group-line">
              <div
                class="group-icon-holder"
                ?selected="${(x) => !x.selection}"
                @click="${(x) => x.setGroup()}"
              >
                <div class="group-icon no-group"></div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '1'}"
                @click="${(x) => x.setGroup(1)}"
              >
                <div class="group-icon group-1">1</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '2'}"
                @click="${(x) => x.setGroup(2)}"
              >
                <div class="group-icon group-2">2</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '3'}"
                @click="${(x) => x.setGroup(3)}"
              >
                <div class="group-icon group-3">3</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '4'}"
                @click="${(x) => x.setGroup(4)}"
              >
                <div class="group-icon group-4">4</div>
              </div>
            </div>
            <div class="group-line">
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '5'}"
                @click="${(x) => x.setGroup(5)}"
              >
                <div class="group-icon group-5">5</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '6'}"
                @click="${(x) => x.setGroup(6)}"
              >
                <div class="group-icon group-6">6</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '7'}"
                @click="${(x) => x.setGroup(7)}"
              >
                <div class="group-icon group-7">7</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '8'}"
                @click="${(x) => x.setGroup(8)}"
              >
                <div class="group-icon group-8">8</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '9'}"
                @click="${(x) => x.setGroup(9)}"
              >
                <div class="group-icon group-9">9</div>
              </div>
            </div>
          </div>
        </div>
      `
    )}
  </template>
`;

export const widgetGroupControlStyles = css`
  ${display('inline-flex')}
  :host {
    position: relative;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
  }

  .toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: calc(${fontSizeWidget} - 2px);
    cursor: pointer;
    position: relative;
    background: ${paletteGrayLight1};
    color: ${paletteBlack};
    width: 12px;
    height: 12px;
  }

  :host(:not([selection])) .toggle::before {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 2px;
    content: '';
    transform: translate(-50%, -50%);
    border-radius: 1px;
    background-color: ${themeConditional(paletteGrayDark4, paletteBlack)};
    transform-origin: 50% 50%;
  }

  .popup {
    position: absolute;
    top: 100%;
    left: 50%;
    width: 122px;
    margin: 2px -20px;
    z-index: 1000;
    border-radius: 2px;
    border: 1px solid ${themeConditional(paletteGrayLight3, paletteGrayDark3)};
    transform: translate(12px, 12px);
    background: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
  }

  .popup::after,
  .popup::before {
    position: absolute;
    left: 7px;
    width: 0;
    border: solid transparent;
    bottom: 100%;
    height: 0;
    content: '';
    transform: translate(-50%, 0);
  }

  .popup::before {
    border-width: 6px;
    border-bottom-color: ${themeConditional(
      paletteGrayLight3,
      paletteGrayDark2
    )};
  }

  .popup::after {
    border-width: 5px;
    border-bottom-color: ${themeConditional(
      paletteGrayLight3,
      paletteGrayDark2
    )};
  }

  .groups {
    padding: 10px 8px;
    cursor: default;
  }

  .group-line {
    display: flex;
    justify-content: space-between;
  }

  .group-line + .group-line {
    margin-top: 8px;
  }

  .group-icon-holder {
    display: inline-flex;
    position: relative;
    width: 16px;
    cursor: pointer;
    height: 16px;
    align-items: center;
    justify-content: center;
  }

  .group-icon-holder[selected]::before {
    content: '';
    top: 0;
    left: 0;
    right: 0;
    border: 1px solid ${themeConditional(paletteGrayLight1, paletteGrayLight1)};
    bottom: 0;
    position: absolute;
  }

  .group-icon {
    color: ${paletteBlack};
    width: 12px;
    height: 12px;
    font-size: calc(${fontSizeWidget} - 2px);
    text-align: center;
    line-height: 11px;
    border-radius: 2px;
  }

  .no-group {
    position: relative;
    background: ${themeConditional(paletteGrayLight1)};
  }

  .no-group::before {
    top: 50%;
    left: 50%;
    width: 6px;
    height: 2px;
    content: '';
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 1px;
    background-color: ${themeConditional(paletteGrayDark4, paletteBlack)};
    transform-origin: 50% 50%;
  }

  :host([selection='1']) .toggle,
  .group-1 {
    background-color: ${widgetGroup1};
  }

  :host([selection='2']) .toggle,
  .group-2 {
    background-color: ${widgetGroup2};
  }

  :host([selection='3']) .toggle,
  .group-3 {
    background-color: ${widgetGroup3};
  }

  :host([selection='4']) .toggle,
  .group-4 {
    background-color: ${widgetGroup4};
  }

  :host([selection='5']) .toggle,
  .group-5 {
    background-color: ${widgetGroup5};
  }

  :host([selection='6']) .toggle,
  .group-6 {
    background-color: ${widgetGroup6};
  }

  :host([selection='7']) .toggle,
  .group-7 {
    background-color: ${widgetGroup7};
  }

  :host([selection='8']) .toggle,
  .group-8 {
    background-color: ${widgetGroup8};
  }

  :host([selection='9']) .toggle,
  .group-9 {
    background-color: ${widgetGroup9};
  }
`;

export class WidgetEmptyStateControl extends PPPElement {
  @attr({ mode: 'boolean' })
  loading;

  @attr({ mode: 'boolean' })
  glyphless;

  observer;

  connectedCallback() {
    super.connectedCallback();

    this.observer = new ResizeObserver((entries) => {
      if (this.glyphless) {
        return;
      }

      requestAnimationFrame(() => {
        for (const entry of entries) {
          const height = entry.contentRect.height;

          if (height) {
            if (height <= 100) {
              this.glyph.setAttribute('hidden', '');
            } else {
              this.glyph.removeAttribute('hidden');
            }
          }
        }
      });
    });

    this.observer.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer.disconnect();
  }
}

export const widgetEmptyStateControlTemplate = html`
  <template>
    <svg class="glyph" ${ref('glyph')} ?hidden="${(x) => x.glyphless}">
      ${html.partial(emptyWidgetState)}
    </svg>
    <div class="text">
      <slot></slot>
    </div>
  </template>
`;

export const widgetEmptyStateControlStyles = css`
  ${normalize()}
  :host {
    width: 100%;
    height: 95%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }

  :host > svg {
    color: ${themeConditional(paletteGrayLight2, paletteGrayLight1)};
    width: 60%;
    height: 60%;
    min-width: 32px;
    min-height: 32px;
    max-width: 80px;
    max-height: 80px;
    margin-left: 16px;
  }

  @keyframes widget-empty-state-loading {
    0% {
      transform: scale(1, 1) translateY(0);
    }
    10% {
      transform: scale(1.05, 0.9) translateY(0);
    }
    30% {
      transform: scale(0.9, 1.1) translateY(-8px);
    }
    50% {
      transform: scale(1.05, 0.95) translateY(0);
    }
    100% {
      transform: scale(1, 1) translateY(0);
    }
  }

  :host([loading]) > svg {
    animation-name: widget-empty-state-loading;
    animation-timing-function: ease;
    animation-duration: 2s;
    animation-iteration-count: infinite;
  }

  .text {
    color: ${paletteGrayLight1};
    font-family: ${bodyFont};
    font-size: ${fontSizeWidget};
    font-weight: ${fontWeightWidget};
    line-height: ${lineHeightWidget};
    margin-top: ${spacing1};
    padding: 0 10px;
    text-align: center;
  }

  :host > svg[hidden] + .text {
    margin-top: 0;
  }
`;

export class WidgetGroupControl extends PPPOffClickElement {
  @attr({ mode: 'boolean' })
  open;

  @attr
  selection;

  connectedCallback() {
    super.connectedCallback();

    this.widget = this.getRootNode().host;
    this.widget.groupControl = this;
    this.selection = this.widget.document?.group;
  }

  handleClick({ event }) {
    if (event.composedPath().find((n) => n.classList?.contains('toggle'))) {
      this.open = !this.open;
    }
  }

  documentOffClickHandler() {
    this.open = false;
  }

  documentKeydownHandler(event) {
    if (event.key === 'Escape') {
      this.open = false;
    }
  }

  setGroup(group) {
    this.selection = group?.toString();
    this.open = false;

    if (this.selection && !this.widget.preview) {
      const sourceWidget = Array.from(
        this.widget.container.shadowRoot.querySelectorAll('.widget')
      )
        ?.filter((w) => w !== this.widget)
        ?.find(
          (w) =>
            w?.groupControl &&
            w.groupControl.selection === this.selection &&
            w.instrument
        );

      if (
        sourceWidget?.instrument &&
        !sourceWidget.instrumentTrader.instrumentsAreEqual(
          sourceWidget.instrument,
          this.widget?.instrument
        )
      ) {
        this.widget.isolated = true;

        if (typeof this.widget.instrumentTrader === 'undefined') {
          this.widget.notificationsArea?.error({
            text: 'Не задан трейдер для работы с инструментом.'
          });
        } else {
          this.widget.instrument = this.widget.instrumentTrader.adoptInstrument(
            sourceWidget.instrument
          );
          this.widget.isolated = false;

          if (this.widget.instrument) {
            void this.widget.updateDocumentFragment({
              $set: {
                'widgets.$.symbol': this.widget.instrument.symbol
              }
            });
          }
        }
      }

      void this.widget.updateDocumentFragment({
        $set: {
          'widgets.$.group': group?.toString()
        }
      });
    } else if (!this.selection) {
      void this.widget.updateDocumentFragment({
        $set: {
          'widgets.$.group': null
        }
      });
    }
  }
}

export const widgetSearchControlTemplate = html`
  <template
    size="${(x) => x.widget?.instrument?.symbol?.length ?? '0'}"
    @click="${(x, c) => x.handleClick(c)}"
  >
    <input
      readonly
      class="popup-trigger"
      type="text"
      placeholder="${() => ppp.t('$g.symbol')}"
      maxlength="20"
      autocomplete="off"
      value="${(x) => x.widget?.instrument?.symbol ?? ''}"
      title="${(x) => x.widget?.instrument?.symbol ?? ''}"
    />
    <div class="popup">
      <div class="suggest-area">
        ${when(
          (x) => !x.searching,
          html`<span class="search-icon"> ${html.partial(search)} </span>`
        )}
        ${when(
          (x) => x.searching,
          html`<span class="spinner"> ${html.partial(circleNotch)} </span>`
        )}
        <input
          ${ref('suggestInput')}
          spellcheck="false"
          placeholder="Поиск по тикеру или названию инструмента"
          class="suggest-input"
          @input="${(x, c) => {
            x.search(c.event.target.value);
          }}"
        />
      </div>
      <div class="divider"></div>
      ${when(
        (x) => x.widget?.instrument?.symbol,
        html`
          <div class="menu-item-holder">
            <div
              class="menu-item"
              @click="${(x) => x.chooseInstrument(x.widget?.instrument)}"
            >
              <div class="menu-item-icon-holder">
                <div class="menu-item-icon-fallback">
                  <div
                    class="menu-item-icon-logo"
                    style="${(x) => {
                      if (x.widget?.unsupportedInstrument) {
                        return `background-color:${
                          themeConditional(paletteRedLight3, paletteRedDark1)
                            .$value
                        }`;
                      }

                      return `background-image:url(${x.getInstrumentIconUrl(
                        x.widget?.instrument
                      )})`;
                    }}"
                  ></div>
                  ${(x) => x.widget?.instrument.fullName?.[0]}
                </div>
              </div>
              <div class="menu-item-text">
                ${(x) => {
                  if (x.widget?.unsupportedInstrument) {
                    return ppp.t('$widget.unsupportedInstrumentFullName');
                  }

                  return x.widget?.instrument?.fullName ?? '';
                }}
              </div>
              <div class="menu-item-controls">
                <div class="menu-item-tag">
                  <span>${(x) => x.widget?.instrument.symbol}</span>
                </div>
                <div
                  @click="${(x) => x.chooseInstrument()}"
                  class="menu-item-close"
                >
                  <span>${html.partial(close)}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="divider"></div>
        `
      )}
      <div class="menu-holder" ${ref('menuHolder')}>
        <div class="menu">
          ${when(
            (x) =>
              !x.ticker &&
              !x.stocks.length &&
              !x.bonds.length &&
              !x.etfs.length &&
              !x.futures.length &&
              !x.cryptocurrencies.length &&
              !x.currencies.length &&
              !x.commodities.length &&
              !x.indices.length &&
              !x.special.length,
            html`
              <ppp-widget-empty-state-control>
                ${() => ppp.t('$widget.emptyState.noResultsToDisplay')}
              </ppp-widget-empty-state-control>
            `
          )}
          ${when(
            (x) => x.ticker,
            html`
              <div class="menu-title">Тикер</div>
              <div
                class="menu-item"
                @click="${(x) => x.chooseInstrument(x.ticker)}"
              >
                <div class="menu-item-icon-holder">
                  <div class="menu-item-icon-fallback">
                    <div
                      class="menu-item-icon-logo"
                      style="${(x) =>
                        `background-image:url(${x.getInstrumentIconUrl(
                          x.ticker
                        )})`}"
                    ></div>
                    ${(x) => x.ticker?.fullName[0]}
                  </div>
                </div>
                <div
                  title="${(x) => x.ticker?.fullName}"
                  class="menu-item-text"
                >
                  ${(x) => x.ticker?.fullName}
                </div>
                <div class="menu-item-tag">
                  <span>${(x) => x.ticker?.symbol}</span>
                </div>
              </div>
            `
          )}
          ${when(
            (x) => x.stocks.length,
            html`
              <div class="menu-title">Акции</div>
              ${repeat(
                (x) => x.stocks,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.chooseInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x, c) =>
                            `background-image:url(${c.parent.getInstrumentIconUrl(
                              x
                            )})`}"
                        ></div>
                        ${(x) => x.fullName[0]}
                      </div>
                    </div>
                    <div title="${(x) => x.fullName}" class="menu-item-text">
                      ${(x) => x.fullName}
                    </div>
                    <div class="menu-item-tag">
                      <span>${(x) => x.symbol}</span>
                    </div>
                  </div>
                `
              )}
            `
          )}
          ${when(
            (x) => x.bonds.length,
            html`
              <div class="menu-title">Облигации</div>
              ${repeat(
                (x) => x.bonds,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.chooseInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x, c) =>
                            `background-image:url(${c.parent.getInstrumentIconUrl(
                              x
                            )})`}"
                        ></div>
                        ${(x) => x.fullName[0]}
                      </div>
                    </div>
                    <div title="${(x) => x.fullName}" class="menu-item-text">
                      ${(x) => x.fullName}
                    </div>
                    <div class="menu-item-tag">
                      <span>${(x) => x.symbol}</span>
                    </div>
                  </div>
                `
              )}
            `
          )}
          ${when(
            (x) => x.etfs.length,
            html`
              <div class="menu-title">Фонды</div>
              ${repeat(
                (x) => x.etfs,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.chooseInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x, c) =>
                            `background-image:url(${c.parent.getInstrumentIconUrl(
                              x
                            )})`}"
                        ></div>
                        ${(x) => x.fullName[0]}
                      </div>
                    </div>
                    <div title="${(x) => x.fullName}" class="menu-item-text">
                      ${(x) => x.fullName}
                    </div>
                    <div class="menu-item-tag">
                      <span>${(x) => x.symbol}</span>
                    </div>
                  </div>
                `
              )}
            `
          )}
          ${when(
            (x) => x.futures.length,
            html`
              <div class="menu-title">Фьючерсы</div>
              ${repeat(
                (x) => x.futures,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.chooseInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x, c) =>
                            `background-image:url(${c.parent.getInstrumentIconUrl(
                              x
                            )})`}"
                        ></div>
                        ${(x) => x.fullName[0]}
                      </div>
                    </div>
                    <div title="${(x) => x.fullName}" class="menu-item-text">
                      ${(x) => x.fullName}
                    </div>
                    <div class="menu-item-tag">
                      <span>${(x) => x.symbol}</span>
                    </div>
                  </div>
                `
              )}
            `
          )}
          ${when(
            (x) => x.currencies.length,
            html`
              <div class="menu-title">Валютные пары</div>
              ${repeat(
                (x) => x.currencies,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.chooseInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x, c) =>
                            `background-image:url(${c.parent.getInstrumentIconUrl(
                              x
                            )})`}"
                        ></div>
                        ${(x) => x.fullName[0]}
                      </div>
                    </div>
                    <div class="menu-item-text">${(x) => x.fullName}</div>
                    <div class="menu-item-tag">
                      <span>${(x) => x.symbol}</span>
                    </div>
                  </div>
                `
              )}
            `
          )}
          ${when(
            (x) => x.cryptocurrencies.length,
            html`
              <div class="menu-title">Криптовалютные пары</div>
              ${repeat(
                (x) => x.cryptocurrencies,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.chooseInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x, c) =>
                            `background-image:url(${c.parent.getInstrumentIconUrl(
                              x
                            )})`}"
                        ></div>
                        ${(x) => x.fullName[0]}
                      </div>
                    </div>
                    <div class="menu-item-text">${(x) => x.fullName}</div>
                    <div class="menu-item-tag">
                      <span>${(x) => x.symbol}</span>
                    </div>
                  </div>
                `
              )}
            `
          )}
          ${when(
            (x) => x.indices.length,
            html`
              <div class="menu-title">Индексы</div>
              ${repeat(
                (x) => x.indices,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.chooseInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x, c) =>
                            `background-image:url(${c.parent.getInstrumentIconUrl(
                              x
                            )})`}"
                        ></div>
                        ${(x) => x.fullName[0]}
                      </div>
                    </div>
                    <div class="menu-item-text">${(x) => x.fullName}</div>
                    <div class="menu-item-tag">
                      <span>${(x) => x.symbol}</span>
                    </div>
                  </div>
                `
              )}
            `
          )}
          ${when(
            (x) => x.commodities.length,
            html`
              <div class="menu-title">Товары</div>
              ${repeat(
                (x) => x.commodities,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.chooseInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x, c) =>
                            `background-image:url(${c.parent.getInstrumentIconUrl(
                              x
                            )})`}"
                        ></div>
                        ${(x) => x.fullName[0]}
                      </div>
                    </div>
                    <div class="menu-item-text">${(x) => x.fullName}</div>
                    <div class="menu-item-tag">
                      <span>${(x) => x.symbol}</span>
                    </div>
                  </div>
                `
              )}
            `
          )}
          ${when(
            (x) => x.special.length,
            html`
              <div class="menu-title">Специальные инструменты</div>
              ${repeat(
                (x) => x.special,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.chooseInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        ${(x) => x.fullName[0]}
                      </div>
                    </div>
                    <div class="menu-item-text">${(x) => x.fullName}</div>
                    <div class="menu-item-tag">
                      <span>${(x) => x.symbol}</span>
                    </div>
                  </div>
                `
              )}
            `
          )}
        </div>
      </div>
    </div>
  </template>
`;

export const widgetSearchControlStyles = css`
  ${normalize()}
  ${scrollbars('.menu')}
  :host {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: default;
    max-width: 80px;
    min-width: 45px;
  }

  :host([size='1']),
  :host([size='2']) {
    width: 45px;
  }

  :host([size='3']) {
    width: 55px;
  }

  :host([size='4']) {
    width: 60px;
  }

  :host([size='5']),
  :host([size='6']),
  :host([size='7']),
  :host([size='8']),
  :host([size='9']),
  :host([size='10']),
  :host([size='11']),
  :host([size='12']) {
    width: 80px;
  }

  .popup-trigger {
    cursor: pointer;
    padding: 0 10px;
    font-family: ${bodyFont};
    font-size: ${fontSizeWidget};
    font-weight: ${fontWeightWidget};
    line-height: ${lineHeightWidget};
    text-align: left;
    width: 100%;
    height: 100%;
    border-radius: 2px;
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
    border: 1px solid ${themeConditional(paletteGrayLight1, paletteGrayDark1)};
    color: ${themeConditional(paletteBlack, paletteGrayLight1)};
    ${ellipsis()};
  }

  input.popup-trigger::placeholder {
    color: ${themeConditional(
      paletteGrayLight1,
      darken(paletteGrayLight1, 60)
    )};
  }

  .popup-trigger:focus-visible {
    outline: none;
  }

  .popup-trigger:hover {
    border: 1px solid
      ${themeConditional(darken(paletteGrayLight1, 30), paletteGrayBase)};
  }

  :host([readonly]) .popup-trigger {
    cursor: not-allowed;
  }

  .popup {
    top: 0;
    left: 0;
    width: 330px;
    z-index: 1000;
    position: absolute;
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark3)};
    background: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
    border-radius: 4px;
    transform: translate(0px, -6px);
    display: none;
  }

  :host([open]) .popup {
    display: initial;
  }

  .suggest-area {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 12px 4px;
  }

  .search-icon {
    width: 16px;
    height: 16px;
    color: ${paletteGrayLight1};
  }

  .spinner {
    width: 16px;
    height: 16px;
    animation: spin 2s linear infinite;
    color: ${themeConditional(paletteGreenBase)};
  }

  @keyframes spin {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(359deg);
    }
  }

  .divider {
    display: block;
    border-top: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
    margin: 6px 12px;
  }

  .suggest-input {
    font-family: ${bodyFont};
    font-size: ${fontSizeWidget};
    font-weight: ${fontWeightWidget};
    line-height: ${lineHeightWidget};
    color: ${themeConditional(paletteBlack, paletteGrayLight1)};
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    height: 16px;
    margin-left: 8px;
    appearance: none;
    word-wrap: break-word;
    letter-spacing: 0;
  }

  .suggest-input::placeholder {
    color: ${themeConditional(
      paletteGrayLight1,
      darken(paletteGrayLight1, 60)
    )};
  }

  .menu-holder {
    height: 256px;
    padding: 4px 0;
    min-width: 100%;
    border-radius: 4px;
    position: relative;
  }

  .menu-item-holder {
    padding: 0;
    border-radius: 4px;
    list-style: none;
    margin: 0;
    min-width: 100%;
    height: 100%;
    text-align: left;
  }

  .menu {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .menu-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${themeConditional(
      lighten(paletteGrayDark1, 50),
      paletteGrayLight1
    )};
    padding: 8px 12px;
    cursor: default;
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    line-height: 16px;
    font-weight: 400;
    letter-spacing: 0;
  }

  .menu-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: inherit;
    padding: 7px 12px;
    text-decoration: none;
    user-select: none;
    cursor: pointer;
  }

  .menu-item.active,
  .menu-item:hover {
    background-color: ${themeConditional(
      paletteGrayLight2,
      darken(paletteGrayDark1, 5)
    )};
  }

  .menu-item-icon-holder {
    display: flex;
    align-items: center;
    margin-right: 12px;
  }

  .menu-item-icon-holder > * {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .menu-item-icon-fallback {
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${themeConditional(paletteGrayLight1, paletteGrayLight1)};
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayBase)};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    position: relative;
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    line-height: 16px;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .menu-item-icon-logo {
    width: 20px;
    height: 20px;
    left: 0;
    top: 0;
    position: absolute;
    border-radius: 50%;
    background-size: 100%;
  }

  .menu-item-text {
    color: ${themeConditional(
      paletteGrayDark1,
      lighten(paletteGrayLight1, 15)
    )};
    word-break: break-word;
    flex-grow: 1;
    flex-shrink: 1;
    margin-right: 12px;
    font-size: ${fontSizeWidget};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: normal;
  }

  .menu-item-controls {
    display: flex;
    align-items: center;
  }

  .menu-item-tag {
    color: ${themeConditional(paletteGrayDark1, darken(paletteGrayLight2, 30))};
    background-color: ${themeConditional(
      darken(paletteGrayLight2, 15),
      paletteGrayBase
    )};
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    border: none;
    border-radius: 4px;
    font-size: ${fontSizeWidget};
    line-height: 16px;
    padding: 2px;
    position: relative;
  }

  .menu-item-tag span {
    margin: 0 4px;
    flex-grow: 1;
    flex-shrink: 1;
  }

  .menu-item-close {
    color: ${paletteGrayLight1};
    position: relative;
    margin-left: 8px;
    cursor: pointer;
    width: 16px;
    height: 16px;
  }
`;

export class WidgetSearchControl extends PPPOffClickElement {
  @attr({ mode: 'boolean' })
  open;

  openChanged(oldValue, newValue) {
    if (this.$fastController.isConnected) {
      if (newValue) {
        this.widget.style.overflow = 'visible';
      } else {
        this.widget.style.overflow = 'initial';
      }

      if (this.widget.preview) {
        this.widget.style.position = 'relative';
        this.widget.container.widgetArea.style.height = null;
      }

      if (
        !newValue &&
        this.widget.instrument &&
        this.widget.document?.type === 'order'
      ) {
        Updates.enqueue(() => this.widget.lastFocusedElement?.focus());
      }
    }
  }

  @attr
  size;

  @attr({ mode: 'boolean' })
  readonly;

  @attr({ mode: 'boolean' })
  searching;

  @observable
  widget;

  @observable
  activeItem;

  @observable
  ticker;

  @observable
  stocks;

  @observable
  bonds;

  @observable
  etfs;

  @observable
  futures;

  @observable
  cryptocurrencies;

  @observable
  currencies;

  @observable
  commodities;

  @observable
  indices;

  @observable
  special;

  constructor() {
    super();

    this.open = false;

    this.reset();
  }

  reset() {
    this.stocks = [];
    this.bonds = [];
    this.etfs = [];
    this.futures = [];
    this.cryptocurrencies = [];
    this.currencies = [];
    this.commodities = [];
    this.indices = [];
    this.special = [];
    this.activeItem = null;
    this.ticker = null;
  }

  connectedCallback() {
    super.connectedCallback();

    this.widget = this.getRootNode().host;
    this.widget.searchControl = this;
  }

  documentOffClickHandler() {
    this.open = false;
  }

  documentKeydownHandler(event) {
    if (!event.composedPath().find((n) => n === this)) return;

    if (event.key === keyEscape) {
      this.open = false;
    } else if (event.key === keyEnter) {
      this.activeItem && this.activeItem.click();
    } else if (event.key === keyArrowDown || event.key === keyArrowUp) {
      const items = Array.from(this.menuHolder.querySelectorAll('.menu-item'));

      if (items.length) {
        const activeItemIndex = items.findIndex((i) =>
          i.classList.contains('active')
        );

        if (event.key === keyArrowDown && activeItemIndex < items.length - 1) {
          this.activeItem = items[activeItemIndex + 1];

          this.activeItem?.scrollIntoView?.({
            block: 'nearest'
          });
        } else if (event.key === keyArrowUp && activeItemIndex > 0) {
          this.activeItem = items[activeItemIndex - 1];

          if (activeItemIndex === 1) {
            this.activeItem?.scrollIntoView?.({
              block: 'center'
            });
          } else
            this.activeItem?.scrollIntoView?.({
              block: 'nearest'
            });
        }
      }
    }
  }

  getInstrumentIconUrl(instrument) {
    return (
      this.widget?.instrumentTrader?.getInstrumentIconUrl?.(instrument) ??
      'static/instruments/unknown.svg'
    );
  }

  activeItemChanged(oldValue, newValue) {
    if (oldValue) {
      oldValue.classList.remove('active');
    }

    if (newValue) {
      newValue.classList.add('active');
    }
  }

  chooseInstrument(instrument) {
    if (typeof instrument === 'undefined') {
      this.widget.instrument = void 0;
    } else {
      this.widget.instrument = this.trader.adoptInstrument(instrument, {
        origin: 'search-control'
      });
    }

    this.open = false;
    this.suggestInput.value = '';
    this.$emit('chooseinstrument', this);
  }

  handleClick({ event }) {
    if (this.readonly) {
      return;
    }

    if (
      event.composedPath().find((n) => n.classList?.contains('popup-trigger'))
    ) {
      this.open = !this.open;
    }

    if (this.open) {
      Updates.enqueue(() => this.suggestInput.focus());
    }
  }

  search(text = '') {
    this.searching = true;

    if (typeof this.trader?.search === 'function') {
      try {
        const {
          exactSymbolMatch,
          startsWithSymbolMatches,
          regexSymbolMatches,
          startsWithFullNameMatches,
          regexFullNameMatches
        } = this.trader.search(text) ?? {};

        this.ticker = exactSymbolMatch ?? null;

        const seen = {};

        this.reset();

        [
          startsWithSymbolMatches,
          startsWithFullNameMatches,
          regexSymbolMatches,
          regexFullNameMatches
        ].forEach((instruments) => {
          for (const i of instruments) {
            if (seen[i.symbol]) continue;

            if (i.type === 'stock') this.stocks.push(i);
            else if (i.type === 'bond') this.bonds.push(i);
            else if (i.type === 'etf') this.etfs.push(i);
            else if (i.type === 'future') this.futures.push(i);
            else if (i.type === 'cryptocurrency') this.cryptocurrencies.push(i);
            else if (i.type === 'currency') this.currencies.push(i);
            else if (i.type === 'commodity') this.commodities.push(i);
            else if (i.type === 'index') this.indices.push(i);
            else if (i.type === 'special') this.special.push(i);

            seen[i.symbol] = true;
          }
        });

        Updates.enqueue(() => {
          this.activeItem = this.menuHolder.querySelector('.menu-item');
        });
      } catch (e) {
        console.error(e);
        this.reset();
      } finally {
        this.searching = false;
      }
    } else {
      this.reset();

      this.searching = false;
    }
  }
}

export const widgetResizeControlsTemplate = html`
  <template>
    <div
      class="top"
      ?hidden="${(x) => x.ignoredHandles.includes('top') || x.widget?.locked}"
    ></div>
    <div
      class="right"
      ?hidden="${(x) => x.ignoredHandles.includes('right') || x.widget?.locked}"
    ></div>
    <div
      class="bottom"
      ?hidden="${(x) =>
        x.ignoredHandles.includes('bottom') || x.widget?.locked}"
    ></div>
    <div
      class="left"
      ?hidden="${(x) => x.ignoredHandles.includes('left') || x.widget?.locked}"
    ></div>
    <div
      class="ne"
      ?hidden="${(x) => x.ignoredHandles.includes('ne') || x.widget?.locked}"
    ></div>
    <div
      class="se"
      ?hidden="${(x) => x.ignoredHandles.includes('se') || x.widget?.locked}"
    ></div>
    <div
      class="sw"
      ?hidden="${(x) => x.ignoredHandles.includes('sw') || x.widget?.locked}"
    ></div>
    <div
      class="nw"
      ?hidden="${(x) => x.ignoredHandles.includes('nw') || x.widget?.locked}"
    ></div>
  </template>
`;

export const widgetResizeControlsStyles = css`
  :host > div {
    position: absolute;
    user-select: none;
    z-index: 2;
  }

  .top {
    top: -5px;
    left: 0;
    width: 100%;
    cursor: row-resize;
    height: 10px;
  }

  .right {
    top: 0;
    right: -5px;
    width: 10px;
    cursor: col-resize;
    height: 100%;
  }

  .bottom {
    left: 0;
    width: 100%;
    bottom: -5px;
    cursor: row-resize;
    height: 10px;
  }

  .left {
    top: 0;
    left: -5px;
    width: 10px;
    cursor: col-resize;
    height: 100%;
  }

  .ne {
    top: -10px;
    right: -10px;
    width: 20px;
    cursor: ne-resize;
    height: 20px;
  }

  .se {
    right: -10px;
    width: 20px;
    bottom: -10px;
    cursor: se-resize;
    height: 20px;
  }

  .sw {
    left: -10px;
    width: 20px;
    bottom: -10px;
    cursor: sw-resize;
    height: 20px;
  }

  .nw {
    top: -10px;
    left: -10px;
    width: 20px;
    cursor: nw-resize;
    height: 20px;
  }
`;

export class WidgetResizeControls extends PPPElement {
  @observable
  ignoredHandles;

  @observable
  widget;

  constructor() {
    super();

    this.ignoredHandles = [];
  }

  connectedCallback() {
    super.connectedCallback();

    this.widget = this.getRootNode().host;
    this.snapDistance = this.widget.container.snapDistance ?? 5;
    this.snapMargin = this.widget.container.snapMargin ?? 1;
  }

  onPointerDown({ node }) {
    const bcr = this.widget.getBoundingClientRect();
    const styles = getComputedStyle(this.widget);

    this.x = this.widget.container.x;
    this.widget.x = parseInt(styles.left);
    this.widget.y = parseInt(styles.top);
    this.widget.width = bcr.width;
    this.widget.height = bcr.height;
    this.widget.handle = node.getAttribute('class');

    if (typeof this.widget.beforeResize === 'function') {
      this.widget.beforeResize();
    }
  }

  onPointerMove({ event }) {
    const handle = this.widget.handle;

    if (this.ignoredHandles.includes(handle)) {
      return;
    }

    const clientX = this.widget.container.clientX;
    const clientY = this.widget.container.clientY;
    let deltaX = event.clientX - clientX;
    let deltaY = event.clientY - clientY;
    const { minWidth = 275, minHeight = 395 } = this.widget.widgetDefinition;

    if (this.widget.preview) {
      if (handle !== 'right' && handle !== 'bottom' && handle !== 'se') {
        return;
      }
    }

    if (handle === 'top' || handle === 'bottom') {
      deltaX = 0;
    }

    if (handle === 'right' || handle === 'left') {
      deltaY = 0;
    }

    let newTop = this.widget.y + deltaY;
    let newLeft = this.widget.x + deltaX;
    let newRight = newLeft + this.widget.width;
    let newBottom = newTop + this.widget.height;

    if (handle === 'left' || handle === 'nw' || handle === 'sw') {
      newRight -= deltaX;

      if (newRight - newLeft < minWidth) {
        newLeft = newRight - minWidth;
      }
    }

    if (handle === 'right' || handle === 'se' || handle === 'ne') {
      newLeft -= deltaX;

      if (newRight - newLeft < minWidth) {
        newRight = newLeft + minWidth;
      }
    }

    if (handle === 'top' || handle === 'nw' || handle === 'ne') {
      newBottom -= deltaY;

      if (newBottom - newTop < minHeight) {
        newTop = newBottom - minHeight;
      }
    }

    if (handle === 'bottom' || handle === 'se' || handle === 'sw') {
      newTop -= deltaY;

      if (newBottom - newTop < minHeight) {
        newBottom = newTop + minHeight;
      }
    }

    !this.widget.preview &&
      this.widget.container.rectangles.forEach((rect) => {
        const hasVerticalIntersection =
          (newTop >= rect.top - this.snapDistance &&
            newTop <= rect.bottom + this.snapDistance) ||
          (newBottom >= rect.top - this.snapDistance &&
            newBottom <= rect.bottom + this.snapDistance) ||
          (newTop <= rect.top - this.snapDistance &&
            newBottom >= rect.bottom + this.snapDistance);

        if (hasVerticalIntersection) {
          // 1. Vertical, this.left -> rect.right
          const deltaLeftRight = Math.abs(
            newLeft - (rect.x - this.x + rect.width)
          );

          if (deltaLeftRight <= this.snapDistance) {
            newLeft = rect.x - this.x + rect.width + this.snapMargin;
          }

          // 2. Vertical, this.left -> rect.left
          const deltaLeftLeft = Math.abs(newLeft - (rect.x - this.x));

          if (deltaLeftLeft <= this.snapDistance) {
            newLeft = rect.x - this.x;
          }

          // 3. Vertical, this.right -> rect.right
          const deltaRightRight = Math.abs(
            newRight - (rect.x - this.x + rect.width)
          );

          if (deltaRightRight <= this.snapDistance) {
            newRight = rect.right - this.x;
          }

          // 4. Vertical, this.right -> rect.left
          const deltaRightLeft = Math.abs(newRight - (rect.x - this.x));

          if (deltaRightLeft <= this.snapDistance) {
            newRight = rect.x - this.x - this.snapMargin;
          }
        }

        const hasHorizontalIntersection =
          (newLeft >= rect.left - this.x - this.snapDistance &&
            newLeft <= rect.right - this.x + this.snapDistance) ||
          (newRight >= rect.left - this.x - this.snapDistance &&
            newRight <= rect.right - this.x + this.snapDistance) ||
          (newLeft <= rect.left - this.x - this.snapDistance &&
            newRight >= rect.right - this.x + this.snapDistance);

        if (hasHorizontalIntersection) {
          // 1. Horizontal, this.top -> rect.bottom
          const deltaTopBottom = Math.abs(newTop - rect.bottom);

          if (deltaTopBottom <= this.snapDistance) {
            newTop = rect.bottom + this.snapMargin;
          }

          // 2. Horizontal, this.top -> rect.top
          const deltaTopTop = Math.abs(newTop - rect.y);

          if (deltaTopTop <= this.snapDistance) {
            newTop = rect.y;
          }

          // 3. Horizontal, this.bottom -> rect.bottom
          const deltaBottomBottom = Math.abs(rect.bottom - newBottom);

          if (deltaBottomBottom <= this.snapDistance) {
            newBottom = rect.bottom;
          }

          // 4. Horizontal, this.bottom -> rect.top
          const deltaBottomTop = Math.abs(rect.top - newBottom);

          if (deltaBottomTop <= this.snapDistance) {
            newBottom = rect.top - this.snapMargin;
          }
        }
      });

    if (newLeft < 0) newLeft = 0;

    if (newTop < 0) newTop = 0;

    this.widget.style.left = `${newLeft}px`;
    this.widget.style.top = `${newTop}px`;
    this.widget.style.width = `${newRight - newLeft}px`;
    this.widget.style.height = `${newBottom - newTop}px`;

    if (typeof this.widget.onResize === 'function') {
      this.widget.onResize({
        top: newTop,
        left: newLeft,
        width: newRight - newLeft,
        height: newBottom - newTop
      });
    }
  }

  onPointerUp({ event }) {
    if (!this.widget.preview) {
      this.widget.repositionLinkedWidgets(event.shiftKey);

      if (typeof this.widget.afterResize === 'function') {
        this.widget.afterResize();
      }

      return this.widget.updateDocumentFragment({
        $set: {
          'widgets.$.x': parseInt(this.widget.style.left),
          'widgets.$.y': parseInt(this.widget.style.top),
          'widgets.$.width': parseInt(this.widget.style.width),
          'widgets.$.height': parseInt(this.widget.style.height)
        }
      });
    }
  }
}

export const widgetNotificationsAreaTemplate = html`
  <template>
    <div class="widget-notification-ps">
      <div class="widget-notification-holder">
        ${when(
          (x) => x?.title,
          html`
            <div
              class="widget-notification"
              status="${(x) => x.status ?? 'success'}"
            >
              <div class="widget-notification-icon">
                ${(x) =>
                  html`${html.partial(
                    (x.status ?? 'success') === 'success'
                      ? notificationSuccess
                      : x.status === 'note'
                      ? notificationNote
                      : notificationError
                  )}`}
              </div>
              <div class="widget-notification-text-container">
                <div class="widget-notification-title">
                  ${(x) => x.title ?? ''}
                </div>
                <div class="widget-notification-text">
                  ${(x) => x.text ?? ''}
                </div>
              </div>
              <div
                class="widget-notification-close-icon"
                @click="${(x) => x.setAttribute('hidden', '')}"
              >
                ${html.partial(close)}
              </div>
            </div>
          `
        )}
      </div>
    </div>
  </template>
`;

export const widgetNotificationsAreaStyles = css`
  ${normalize()}
  ${typography()}
  :host {
    position: absolute;
    width: 100%;
    bottom: 20px;
    left: 0;
    z-index: 20;
    will-change: contents;
  }

  .widget-notification-ps {
    position: absolute;
    bottom: 0;
    width: 100%;
    contain: layout;
  }

  .widget-notification-holder {
    padding: 0 12px;
    max-width: 480px;
    margin: auto;
  }

  .widget-notification {
    position: relative;
    display: flex;
    align-items: flex-start;
    width: 100%;
    overflow: hidden;
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
    padding: 12px 16px;
    border-radius: 8px;
  }

  .widget-notification::before {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100%;
    width: 4px;
    content: '';
  }

  .widget-notification[status='error']::before {
    background: ${themeConditional(paletteRedBase, paletteRedLight3)};
  }

  .widget-notification[status='success']::before {
    background: ${themeConditional(paletteGreenBase, paletteGreenLight3)};
  }

  .widget-notification[status='note']::before {
    background: ${themeConditional(paletteBlueBase, paletteBlueLight3)};
  }

  .widget-notification-close-icon {
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    margin-left: ${spacing1};
    width: 16px;
    height: 16px;
  }

  .widget-notification-close-icon svg {
    width: 16px;
    height: 16px;
  }

  .widget-notification-icon {
    margin-right: 8px;
    width: 16px;
    height: 16px;
  }

  .widget-notification-icon svg {
    width: 16px;
    height: 16px;
  }

  .widget-notification[status='error'] .widget-notification-icon {
    color: ${themeConditional(paletteRedBase, paletteRedLight3)};
  }

  .widget-notification[status='success'] .widget-notification-icon {
    color: ${themeConditional(paletteGreenBase, paletteGreenLight3)};
  }

  .widget-notification[status='note'] .widget-notification-icon {
    color: ${themeConditional(paletteBlueBase, paletteBlueLight3)};
  }

  .widget-notification-text-container {
    flex-grow: 1;
    font-size: ${fontSizeWidget};
  }

  .widget-notification-title {
    font-size: ${fontSizeWidget};
    font-weight: 500;
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight2)};
  }

  .widget-notification-text {
    font-size: ${fontSizeWidget};
    margin-top: 4px;
    line-height: 20px;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }

  .widget-notification-close-icon {
    margin-left: 4px;
    cursor: pointer;
  }
`;

export class WidgetNotificationsArea extends PPPElement {
  @observable
  title;

  @observable
  text;

  @observable
  status;

  #timeout;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('hidden', '');

    this.widget = this.getRootNode().host;
    this.widget.notificationsArea = this;
  }

  async openInstrumentsImport(trader) {
    const page = await ppp.app.mountPage('instruments-import', {
      title: 'Импорт инструментов'
    });

    if (typeof trader.getDictionary === 'function')
      page.dictionary.value = trader.getDictionary();
  }

  #appearance({
    status,
    title = this.widget.document.name || 'Виджет',
    text,
    keep,
    timeout
  }) {
    const timeoutFromSettings = ppp.settings.get('widgetNotificationTimeout');

    if (timeoutFromSettings === 0 && !keep) {
      return;
    }

    if (
      typeof text === 'string' &&
      !text.endsWith('.') &&
      !text.endsWith('!') &&
      !text.endsWith('?')
    ) {
      text += '.';
    }

    this.status = status;
    this.title = title;
    this.text = text;

    this.removeAttribute('hidden');
    clearTimeout(this.#timeout);

    if (!keep) {
      this.#timeout = setTimeout(() => {
        this.setAttribute('hidden', '');
      }, timeout ?? timeoutFromSettings ?? 3000);
    }
  }

  success({ title, text, keep, timeout }) {
    return this.#appearance({ status: 'success', title, text, keep, timeout });
  }

  error({ title, text, keep, timeout }) {
    return this.#appearance({ status: 'error', title, text, keep, timeout });
  }

  note({ title, text, keep, timeout }) {
    return this.#appearance({ status: 'note', title, text, keep, timeout });
  }
}

export const widgetHeaderButtonsTemplate = html`
  <template>
    ${startSlotTemplate()}
    <div
      ?hidden="${(x) => x.ensemble === 'disabled'}"
      class="button"
      @click="${(x) => x.stackWidget()}"
    >
      ${html.partial(plus)}
    </div>
    <div
      ?hidden="${(x) => !x.allowLockedState}"
      class="button${(x) => (x.widget?.locked ? '' : ' positive')}"
      @click="${(x) => x.toggleLockedState()}"
    >
      ${(x) => html`${html.partial(x.widget?.locked ? lock : unlock)}`}
    </div>
    <div class="button" @click="${(x) => x.showWidgetSettings()}">
      ${html.partial(settings)}
    </div>
    <div class="button" @click="${(x) => x.closeWidget()}">
      ${html.partial(close)}
    </div>
    ${endSlotTemplate()}
  </template>
`;

export const widgetHeaderButtonsStyles = css`
  ${display('flex')}
  ::slotted(.button),
  .button {
    margin-right: 2px;
    width: 16px;
    height: 16px;
    cursor: pointer;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }

  .button.positive {
    color: ${positive} !important;
  }
`;

export class WidgetHeaderButtons extends PPPElement {
  @attr
  ensemble;

  @observable
  widget;

  @observable
  allowLockedState;

  connectedCallback() {
    super.connectedCallback();

    this.widget = this.getRootNode().host;
    this.allowLockedState =
      !!this.widget.container.document?.allowLockedWidgets;
  }

  async stackWidget() {
    if (!this.widget.preview) {
      if (!this.widget.stackSelector) {
        return this.widget.notificationsArea.error({
          text: 'Этот виджет не поддерживает создание ансамблей.'
        });
      }

      this.widget.topLoader.start();

      try {
        const container = this.widget.container;
        // For copying.
        const { widgets } = await ppp.user.functions.findOne(
          { collection: 'workspaces' },
          {
            _id: container.document._id
          }
        );

        if (Array.isArray(widgets)) {
          const copy =
            ppp.app.widgetClipboard &&
            ppp.app.widgetClipboard.liveDocument?.widgetElement?.getAttribute(
              'ensemble'
            ) !== 'disabled'
              ? ppp.app.widgetClipboard
              : {
                  // A normalized one from MongoDB.
                  savedDocument: widgets?.find(
                    (w) => w.uniqueID === this.widget.document.uniqueID
                  ),
                  // A denormalized one, used for placement.
                  liveDocument: Object.assign({}, this.widget.document)
                };

          if (copy.savedDocument) {
            copy.savedDocument.uniqueID = uuidv4();
            copy.liveDocument.uniqueID = copy.savedDocument.uniqueID;
            copy.liveDocument.x = parseInt(this.widget.style.left);
            copy.liveDocument.y = parseInt(this.widget.style.top);
            copy.liveDocument.width = parseInt(this.widget.style.width);
            copy.liveDocument.height = parseInt(this.widget.style.height);

            container.document.widgets.push(copy.liveDocument);
            container.document.widgets[
              container.document.widgets.length - 1
            ].zIndex = container.zIndex + 1;

            Observable.notify(container, 'document');

            container.locked = true;

            Updates.enqueue(async () => {
              try {
                const bulkWritePayload = [];
                const placedWidget = await container.placeWidget(
                  copy.liveDocument
                );

                this.widget.document.linkedWidgets ??= [];

                // Add parent immediately.
                const linkedWidgets = [this.widget.document.uniqueID];

                for (const uid of this.widget.document.linkedWidgets) {
                  if (!linkedWidgets.includes(uid)) {
                    linkedWidgets.push(uid);
                  }

                  const widget = container.widgets.find(
                    (w) => w.document.uniqueID === uid
                  );

                  if (widget) {
                    widget.document.linkedWidgets ??= [];

                    if (
                      !widget.document.linkedWidgets.includes(
                        copy.liveDocument.uniqueID
                      )
                    ) {
                      widget.document.linkedWidgets.push(
                        copy.liveDocument.uniqueID
                      );

                      widget.document.activeWidgetLink =
                        copy.liveDocument.uniqueID;

                      Observable.notify(widget, 'document');

                      widget.restack();

                      // Save distant links.
                      bulkWritePayload.push({
                        updateOne: {
                          filter: {
                            _id: container.document._id,
                            'widgets.uniqueID': widget.document.uniqueID
                          },
                          update: {
                            $set: {
                              'widgets.$.linkedWidgets':
                                widget.document.linkedWidgets,
                              'widgets.$.activeWidgetLink':
                                widget.document.activeWidgetLink
                            }
                          }
                        }
                      });
                    }
                  }
                }

                this.widget.document.linkedWidgets.push(
                  copy.liveDocument.uniqueID
                );

                this.widget.document.activeWidgetLink =
                  copy.liveDocument.uniqueID;

                this.widget.restack();

                // Save updated parent links.
                bulkWritePayload.push({
                  updateOne: {
                    filter: {
                      _id: container.document._id,
                      'widgets.uniqueID': this.widget.document.uniqueID
                    },
                    update: {
                      $set: {
                        'widgets.$.linkedWidgets':
                          this.widget.document.linkedWidgets,
                        'widgets.$.activeWidgetLink':
                          this.widget.document.activeWidgetLink
                      }
                    }
                  }
                });

                placedWidget.document.linkedWidgets = linkedWidgets;

                // Make new widget active.
                placedWidget.document.activeWidgetLink =
                  copy.liveDocument.uniqueID;

                Observable.notify(this.widget, 'document');
                Observable.notify(placedWidget, 'document');

                // Save new widget with links.
                bulkWritePayload.push({
                  updateOne: {
                    filter: {
                      _id: container.document._id
                    },
                    update: {
                      $push: {
                        widgets: Object.assign(copy.savedDocument, {
                          x: copy.liveDocument.x,
                          y: copy.liveDocument.y,
                          width: copy.liveDocument.width,
                          height: copy.liveDocument.height,
                          zIndex: copy.liveDocument.zIndex,
                          linkedWidgets,
                          activeWidgetLink: copy.liveDocument.uniqueID
                        })
                      }
                    }
                  }
                });

                if (ppp.app.widgetClipboard) {
                  ppp.app.widgetClipboard = null;

                  this.widget.container.showSuccessNotification(
                    'Виджет из буфера обмена был удалён и помещён в ансамбль другого виджета.'
                  );
                }

                await ppp.user.functions.bulkWrite(
                  {
                    collection: 'workspaces'
                  },
                  bulkWritePayload,
                  {
                    ordered: false
                  }
                );

                placedWidget.syncEnsemble();
              } finally {
                container.locked = false;
              }
            });
          }
        }
      } finally {
        this.widget.topLoader.stop();
      }
    }
  }

  async showWidgetSettings() {
    if (!this.widget.preview) {
      ppp.app.mountPoint.widget = this.widget;

      const page = await ppp.app.mountPage('widget', {
        title: `Виджет - ${this.widget.document.name}`,
        size: 'custom-size-for-widget-settings',
        documentId: this.widget.document._id,
        autoRead: true
      });

      page.setAttribute('origin', 'workspace');

      const that = this;

      page.loadTemplateSettings = async () => {
        if (
          await ppp.app.confirm(
            'Подставить настройки из шаблона',
            'Текущие настройки виджета будут заменены на те, которые были указаны в родительском шаблоне. Подтвердите действие.'
          )
        ) {
          page.document = Object.assign(
            {},
            page.document,
            page.templateDocument
          );
        }
      };

      page.submitDocument = async function () {
        page.beginOperation();

        try {
          try {
            await page.validate();
            await later(100);
            await page.applyModifications();
          } catch (e) {
            this.failOperation(e);

            // Skip second validation.
            return;
          } finally {
            this.endOperation();
          }

          const { $set } = await page.submit();
          const newWidgetDocument = Object.assign(
            {},
            that.widget.document,
            page.document,
            $set,
            {
              symbol: that.widget?.instrument?.symbol
            }
          );
          const container = that.widget.container;
          const updateFragment = {};

          for (const key in $set) {
            updateFragment[`widgets.$.${key}`] = $set[key];
          }

          await that.widget.updateDocumentFragment({
            $set: updateFragment
          });

          that.widget.remove();
          container.document.widgets.push(newWidgetDocument);

          that.widget = await container.placeWidget(newWidgetDocument);

          container.lastWidgetSubmissionTime = Date.now();

          page.showSuccessNotification('Виджет сохранён.');
        } catch (e) {
          page.failOperation(e, 'Сохранение виджета');
        } finally {
          page.endOperation();
        }
      };

      return page;
    }
  }

  toggleLockedState() {
    this.widget.locked = !this.widget.locked;
  }

  async closeWidget() {
    if (!this.widget.preview) {
      let shouldCloseNow = true;

      if (ppp.settings.get('confirmWidgetClosing')) {
        shouldCloseNow = await ppp.app.confirm(
          'Закрытие виджета',
          `Закрыть виджет «${this.widget.document.name}» ?`
        );
      }

      if (shouldCloseNow) {
        const bulkWritePayload = [];

        for (const link of this.widget.document.linkedWidgets ?? []) {
          const w = this.widget.container.widgets.find(
            (w) => w.document.uniqueID === link
          );

          if (w && Array.isArray(w.document.linkedWidgets)) {
            w.document.linkedWidgets = w.document.linkedWidgets.filter(
              (l) => l !== this.widget.document.uniqueID
            );
            w.document.activeWidgetLink = this.widget.document.linkedWidgets[0];

            Observable.notify(w, 'document');

            w.restack();

            bulkWritePayload.push({
              updateOne: {
                filter: {
                  _id: w.container.document._id,
                  'widgets.uniqueID': w.document.uniqueID
                },
                update: {
                  $set: {
                    'widgets.$.linkedWidgets': w.document.linkedWidgets,
                    'widgets.$.activeWidgetLink': w.document.activeWidgetLink
                  }
                }
              }
            });
          }
        }

        if (bulkWritePayload.length) {
          await ppp.user.functions.bulkWrite(
            {
              collection: 'workspaces'
            },
            bulkWritePayload,
            {
              ordered: false
            }
          );
        }

        Observable.notify(this.widget, 'document');
        this.widget.close();
      }
    }
  }
}

export const widgetTabsStyles = css`
  ${normalize()}
  ${display('grid')}
  .tablist {
    display: flex;
    position: relative;
    align-items: center;
    border: none;
    margin: 0;
    padding: 0;
  }

  :host([variant='compact']) .tablist {
    width: max-content;
  }

  ::slotted(ppp-widget-tab) {
    border-bottom: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }
`;

export class WidgetTabs extends Tabs {
  @attr
  variant;
}

export const widgetTabStyles = css`
  ${normalize()}
  ${display('inline-flex')}
  :host {
    display: inline-block;
    position: relative;
    font-family: ${bodyFont};
    font-size: ${fontSizeWidget};
    margin-bottom: -1px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: transparent;
    border: none;
    padding: 5px 10px 7px;
    white-space: nowrap;
    width: 100%;
    text-align: center;
    color: ${themeConditional(lighten(paletteGrayBase, 25), paletteGrayLight1)};
  }

  :host:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    border-radius: 4px 4px 0 0;
    background-color: transparent;
  }

  :host(:hover:not([disabled])) {
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight2)};
  }

  :host([aria-selected='true']):after {
    background-color: ${paletteBlueLight2};
  }

  :host([aria-selected='true']) {
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight2)};
    cursor: default;
  }

  :host(:focus-visible) {
    outline: none;
    color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
  }

  :host(:focus-visible):after {
    background-color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
  }

  :host([disabled]) {
    color: ${themeConditional(paletteGrayLight2, paletteGrayBase)};
    cursor: not-allowed;
  }
`;

export class WidgetTab extends Tab {}

export const widgetTextFieldStyles = css`
  ${textFieldStyles}
  :host([lotsize="1"]) input {
    padding-right: 32px;
  }

  :host([lotsize='2']) input {
    padding-right: 39px;
  }

  :host([lotsize='3']) input {
    padding-right: 46px;
  }

  :host([lotsize='4']) input {
    padding-right: 53px;
  }

  :host([lotsize='5']) input {
    padding-right: 60px;
  }

  ::slotted(span[slot='end']) {
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }

  input {
    height: 32px;
    font-size: ${fontSizeWidget};
    line-height: 32px;
    border-radius: 4px 0 0 4px;
    padding: 0 0 0 8px;
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  input:hover {
    border: 1px solid ${themeConditional(paletteGrayLight1, paletteGrayBase)};
  }

  :host([disabled]) input {
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  :host([disabled]) input::placeholder {
    color: ${themeConditional(paletteGrayLight1, paletteGrayBase)};
  }

  .label,
  .description {
    padding: unset;
  }

  .helper {
    font-size: ${fontSizeWidget};
  }
`;

export class WidgetTextField extends TextField {}

export const widgetTrifectaFieldStyles = css`
  ${display('flex')}
  :host {
    width: 100%;
    flex-direction: row;
    align-items: flex-start;
  }

  ppp-widget-text-field {
    width: 100%;
  }

  .step-controls {
    display: inline-flex;
    flex-grow: 0;
    flex-shrink: 0;
    margin-left: 2px;
    border-radius: 0 4px 4px 0;
    align-items: stretch;
    flex-direction: column;
  }

  .step-controls button,
  .unit-selector button {
    outline: none;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;
    font-family: ${bodyFont};
    font-size: ${fontSizeWidget};
    justify-content: center;
    text-align: left;
    vertical-align: middle;
    min-width: 24px;
    position: relative;
    flex: 1 1 15px;
    min-height: 0;
    padding: 0;
    width: 32px;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  .step-controls button[disabled],
  .unit-selector button[disabled] {
    pointer-events: none;
    background-color: ${themeConditional(
      paletteGrayLight2,
      paletteGrayDark3
    )} !important;
    border-color: ${themeConditional(
      paletteGrayLight1,
      paletteGrayDark1
    )} !important;
    color: ${themeConditional(paletteGrayBase, paletteGrayDark1)} !important;
  }

  .step-controls button:hover,
  .unit-selector button:hover {
    border: 1px solid ${themeConditional(paletteGrayLight1, paletteGrayBase)};
  }

  .step-controls button:focus-visible,
  .unit-selector button:focus-visible {
    outline: none;
    color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
  }

  .step-controls button:first-child {
    border-radius: 0 4px 0 0;
    margin-bottom: 2px;
  }

  .step-controls button:last-child {
    border-radius: 0 0 4px;
  }

  .price-placeholder {
    position: absolute;
    z-index: 2;
  }

  .reset-input {
    position: relative;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .reset-input svg {
    width: 16px;
    height: 16px;
  }

  .reset-input:hover svg {
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
  }

  .unit-selector {
    margin-left: 2px;
  }

  .unit-selector button {
    height: 32px;
  }

  .unit-selector svg {
    width: 16px;
    height: 16px;
  }

  :host([disabled]) .unit-selector {
    pointer-events: none;
  }
`;

export const widgetTrifectaFieldTemplate = html`
  <template>
    <ppp-widget-text-field
      type="text"
      autocomplete="off"
      min="0"
      max="1000000000"
      lotsize="1"
      step="${(x) => x.step}"
      precision="${(x) => getInstrumentPrecision(x?.instrument)}"
      ?disabled="${(x) => x.market || x.disabled}"
      maxlength="${(x) => (x.kind === 'quantity' ? 8 : 12)}"
      @input="${(x) => x.handleInput()}"
      @keydown="${(x, c) => x.handleKeydown(c)}"
      @paste="${(x, c) => x.handlePaste(c)}"
      @beforeinput="${(x, c) => x.handleBeforeInput(c)}"
      value="${(x) => x?.value}"
      placeholder="${(x) => x.placeholder}"
      autocomplete="off"
      ${ref('input')}
    >
      <span class="control-line" slot="end">
        <span
          style="pointer-events: none"
          ?hidden=${(x) => x.value || x.disabled}
        >
          ${(x) => x.inputEndSlotContent()}
        </span>
        ${when(
          (x) => x.value,
          html`
            <span
              ?hidden=${(x) => x.disabled}
              class="reset-input"
              @click="${(x) => {
                x.input.value = '';
                x.input.$emit('input');
              }}"
            >
              ${html.partial(close)}
            </span>
          `
        )}
      </span>
    </ppp-widget-text-field>
    ${when(
      (x) => x.kind === 'distance',
      html`
        <div
          class="unit-selector"
          title="${(x) =>
            x.distanceUnit === '%'
              ? 'В процентах'
              : x.distanceUnit === '+'
              ? 'В шагах цены'
              : 'В валюте'}"
          @click="${(x) => x.toggleUnit()}"
        >
          <button ?disabled=${(x) => x.disabled}>
            ${(x) =>
              x.distanceUnit === '%'
                ? '%'
                : x.distanceUnit === '+'
                ? html`${html.partial(upDown)}`
                : priceCurrencySymbol(x.instrument)}
          </button>
        </div>
      `
    )}
    <div class="step-controls">
      <button
        ?disabled=${(x) => x.disabled}
        @pointerdown="${(x) => x.captureStep()}"
      >
        ${html.partial(increment)}
      </button>
      <button
        ?disabled=${(x) => x.disabled}
        @pointerdown="${(x) => x.captureStep(false)}"
      >
        ${html.partial(decrement)}
      </button>
    </div>
    ${when(
      (x) => x.kind === 'price' && x.market,
      html`
        <ppp-widget-text-field
          class="price-placeholder"
          disabled
          placeholder="Рыночная"
        >
        </ppp-widget-text-field>
      `
    )}
  </template>
`;

export class WidgetTrifectaField extends WidgetTextField {
  @observable
  instrument;

  @attr({ mode: 'boolean' })
  market;

  @attr({ mode: 'boolean' })
  disabled;

  @attr({ mode: 'boolean' })
  zeroable;

  @attr
  kind;

  @attr({ attribute: 'unit' })
  distanceUnit;

  @attr
  value;

  @attr
  placeholder;

  @attr
  appearance;

  appearanceChanged(oldValue, newValue) {
    if (this.$fastController.isConnected) {
      this.input.appearance = newValue;
    }
  }

  @observable
  errorMessage;

  errorMessageChanged(oldValue, newValue) {
    if (this.$fastController.isConnected) {
      this.input.errorMessage = newValue;
    }
  }

  @attr
  step;

  constructor() {
    super();

    this.kind = 'price';
    this.distanceUnit = '';
    this.step = 0.01;

    this.onInputValueChanged.handleChange =
      this.onInputValueChanged.handleChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    this.handleWheel = this.handleWheel.bind(this);

    this.addEventListener('wheel', this.handleWheel);

    Observable.getNotifier(this.input).subscribe(
      this.onInputValueChanged,
      'value'
    );
  }

  disconnectedCallback() {
    this.removeEventListener('wheel', this.handleWheel);

    Observable.getNotifier(this.input).unsubscribe(
      this.onInputValueChanged,
      'value'
    );

    super.disconnectedCallback();
  }

  get distanceString() {
    if (this.kind === 'distance') {
      const value = stringToFloat(this.value);

      if (value > 0) {
        return distanceToString({
          value,
          unit: this.distanceUnit ?? ''
        });
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  toggleUnit() {
    if (!this.distanceUnit) {
      this.distanceUnit = '%';
    } else if (this.distanceUnit === '%') {
      this.distanceUnit = '+';
    } else {
      this.distanceUnit = '';
    }

    this.getAndUpdateStep();

    this.value = '';
    this.input.focus();

    this.$emit('pppunitchange', this);
  }

  getAndUpdateStep(up = true) {
    let result = 1;

    if (this.instrument) {
      const isPrice =
        this.kind === 'price' ||
        (this.kind === 'distance' && this.distanceUnit === '');
      const value = stringToFloat(this.value);

      if (isPrice) {
        result = getInstrumentMinPriceIncrement(this.instrument, value);

        if (value === 1 && up === false && !this.instrument.minPriceIncrement) {
          result = 0.0001;
        }
      } else if (this.kind === 'quantity') {
        result = this.instrument.minQuantityIncrement ?? 1;
      } else if (this.kind === 'distance') {
        switch (this.distanceUnit) {
          case '%':
            result = 0.01;

            break;
          case '+':
            result = 1;
        }
      }
    } else {
      result = 1;
    }

    this.step = result;

    return result;
  }

  inputEndSlotContent() {
    if (!this.instrument) {
      return '';
    }

    if (this.kind === 'price') {
      return priceCurrencySymbol(this.instrument);
    } else if (this.kind === 'quantity') {
      return this.instrument?.lot ? '×' + this.instrument.lot : '';
    } else {
      return '';
    }
  }

  onInputValueChanged = {
    handleChange() {
      if (this.value !== this.input.value) {
        this.value = this.input.value;
      }
    }
  };

  valueChanged(oldValue, newValue) {
    if (this.$fastController.isConnected) {
      this.input.value = newValue;

      if (this.input.appearance === 'error') {
        this.input.appearance = 'default';
      }
    }
  }

  stepUpOrDown(up = true) {
    if (this.instrument) {
      const step = this.getAndUpdateStep(up);

      this.input.control.setAttribute('step', step);

      // Prevent starting from zero.
      if (this.value.endsWith(decSeparator)) {
        this.value = this.value.replace(decSeparator, '');
      }

      this.value = this.input.value.replace(',', '.').replace(/\s*/g, '');

      Updates.enqueue(() => {
        this.input.control.type = 'number';

        if (up) {
          this.input.control.stepUp();
        } else {
          if (
            this.zeroable ||
            stringToFloat(this.input.control.value) !== step
          ) {
            this.input.control.stepDown();
          }
        }

        this.input.control.type = 'text';

        this.input.control.focus();

        const length = this.input.control.value.length;

        this.input.control.setSelectionRange(length, length);
        this.value = this.input.control.value.replace?.('.', decSeparator);
        this.$emit('pppstep', this);
        this.getAndUpdateStep();
      });
    }
  }

  stepUp() {
    this.stepUpOrDown(true);
  }

  stepDown() {
    this.stepUpOrDown(false);
  }

  captureStep(up = true) {
    if (up) {
      this.stepUp();
    } else {
      this.stepDown();
    }

    let timeout;
    let interval;

    const listener = () => {
      clearInterval(interval);
      clearTimeout(timeout);

      document.removeEventListener('pointerup', listener);
      document.removeEventListener('pointercancel', listener);
    };

    document.addEventListener('pointerup', listener);
    document.addEventListener('pointercancel', listener);

    timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (up) {
          this.stepUp();
        } else {
          this.stepDown();
        }
      }, 100);
    }, 250);
  }

  handleWheel(event) {
    if (this.changeViaMouseWheel) {
      if (event.deltaY < 0) this.stepUp();
      else this.stepDown();
    }

    event.returnValue = false;
  }

  handleKeydown({ event }) {
    if (this.instrument) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();

        if (event.key === 'ArrowUp') this.stepUp();
        else this.stepDown();
      } else {
        return true;
      }
    }
  }

  handlePaste({ event }) {
    if (this.instrument && event.clipboardData) {
      const data = event.clipboardData.getData('text/plain').replace(',', '.');
      const step = this.getAndUpdateStep();
      const number = parseFloat(data);

      if (Number.isInteger(step) && !Number.isInteger(number)) {
        return false;
      }

      return !/[e/-/+]/i.test(data) && +data === number;
    }

    return false;
  }

  handleInput() {
    if (this.input.value === decSeparator || this.input.value === '.')
      this.input.value = '';

    this.input.value = this.input.value
      .replaceAll('.', decSeparator)
      .replaceAll(/^00/gi, '0')
      .replace(new RegExp('\\' + decSeparator, 'g'), (val, index, str) =>
        index === str.indexOf(decSeparator) ? val : ''
      );

    const step = this.getAndUpdateStep();

    if (Number.isInteger(step)) {
      this.input.value = this.input.value
        .replaceAll(decSeparator, '')
        .replace(/^0/, '');
    }

    return true;
  }

  handleBeforeInput({ event }) {
    if (this.instrument && event.data) {
      const step = this.getAndUpdateStep();

      if (Number.isInteger(step)) {
        return /[0-9]/.test(event.data);
      } else {
        return /[0-9.,]/.test(event.data);
      }
    }

    return true;
  }
}

export const widgetOptionStyles = css`
  ${listboxOptionStyles}
  :host {
    height: 32px;
    padding: 1px 12px;
  }
`;

export class WidgetOption extends ListboxOption {}

export const widgetSelectStyles = css`
  ${selectStyles}
  :host {
    width: 100%;
  }

  .control {
    height: 32px;
    min-width: unset;
    font-family: ${bodyFont};
    font-size: ${fontSizeWidget};
    font-weight: ${fontWeightWidget};
    line-height: ${lineHeightWidget};
    border-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  :host(:hover:not([disabled])) .control:hover {
    border-color: ${themeConditional(paletteGrayLight1, paletteGrayBase)};
  }

  .label,
  .description {
    display: none;
  }

  .listbox {
    min-height: 32px;
    max-height: 164px;
  }

  :host([open][position='above']) .listbox {
    bottom: 36px;
  }

  :host([open][position='below']) .listbox {
    top: 36px;
  }
`;

export class WidgetSelect extends Select {}

export const widgetButtonStyles = css`
  ${buttonStyles}
  .control {
    width: 100%;
    height: ${buttonHeightWidget};
    font-size: ${fontSizeWidget};
    font-weight: ${fontWeightWidget};
    border-radius: 4px;
    border: none;
  }

  .content-container {
    padding: 0 4px;
  }

  :host(.primary) .control {
    background-color: ${buy};
    color: ${themeConditional(paletteWhite)};
  }

  :host(.primary) .control:hover,
  :host(.primary) .control:active {
    color: ${themeConditional(paletteWhite)};
    background-color: ${buyHover};
  }

  :host(.danger) .control {
    background-color: ${sell};
    color: ${themeConditional(paletteWhite)};
  }

  :host(.danger) .control:hover,
  :host(.danger) .control:active {
    color: ${themeConditional(paletteWhite)};
    background-color: ${sellHover};
  }
`;

export class WidgetButton extends Button {}

export const widgetBoxRadioGroupStyles = css`
  ${display('flex')}
  :host {
    font-family: ${bodyFont};
    margin: 0 auto;
    flex-direction: column;
  }

  .positioning-region {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
  }

  :host([wrap]) .positioning-region {
    flex-wrap: wrap;
  }
`;

export class WidgetBoxRadioGroup extends RadioGroup {}

export const widgetBoxRadioStyles = css`
  ${boxRadioStyles}
  .control {
    max-width: 180px;
    height: 22px;
    font-size: ${fontSizeWidget};
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
    color: ${themeConditional(lighten(paletteGrayBase, 25), paletteGrayLight1)};
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
    border-radius: 4px;
    padding: 0 10px;
  }

  :host(.xsmall) .control {
    padding: 0 5px;
  }

  :host(:not([disabled])) .control:hover {
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight2)};
  }

  :host([checked]) .control {
    border: 1px solid ${paletteBlueLight2};
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight2)};
  }

  :host([disabled]) .control {
    color: ${themeConditional(paletteGrayLight2, paletteGrayBase)};
    border: 1px solid ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
  }
`;

export class WidgetBoxRadio extends BoxRadio {}

export const widgetCheckboxStyles = css`
  ${checkboxStyles}
  .label {
    margin-left: 10px;
    font-size: ${fontSizeWidget};
    font-weight: ${fontWeightWidget};
    line-height: ${lineHeightWidget};
  }
`;

export class WidgetCheckbox extends Checkbox {}

export const widgetCardTemplate = html`
  <template>
    <div class="card" ${ref('card')}>
      <slot name="indicator"></slot>
      <div class="payload">
        <div class="icon">
          <slot name="icon"></slot>
          <slot name="icon-fallback"></slot>
        </div>
        <div class="text-content">
          <div class="text-line first">
            <div class="text-line-inner">
              <span>
                <div>
                  <slot name="title-left"></slot>
                </div>
              </span>
            </div>
            <span style="text-align: right;">
              <slot name="title-right"></slot>
            </span>
          </div>
          <div class="text-line second">
            <div class="text-line-inner">
              <slot name="subtitle-left"></slot>
            </div>
            <span>
              <slot name="subtitle-right"></slot>
            </span>
          </div>
          <div class="text-line third">
            <div class="text-line-inner">
              <slot name="subtitle-left-extra"></slot>
            </div>
            <span>
              <slot name="subtitle-right-extra"></slot>
            </span>
          </div>
        </div>
      </div>
      <div
        class="actions"
        style="display: ${(x) => (x?.slottedActions.length ? 'flex' : 'none')}"
      >
        <slot name="actions" ${slotted('slottedActions')}></slot>
      </div>
      ${when(
        (x) => x.progress > 0,
        html`
          <div class="progress-container">
            <ppp-progress
              ${ref('progressBar')}
              min="0"
              max="100"
              value="${(x) => x.progress}"
            >
            </ppp-progress>
          </div>
        `
      )}
    </div>
  </template>
`;

export const widgetCardStyles = css`
  ${normalize()}
  ${widgetCommonColors()}
  :host {
    position: relative;
  }

  .card {
    display: flex;
    position: relative;
    flex-direction: column;
    min-height: 36px;
    height: auto;
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
    padding: 0 12px;
    border-radius: 4px;
    user-select: none;
    min-width: 200px;
    align-items: center;
    overflow: hidden;
    cursor: default;
  }

  :host([progress]) .card {
    border-radius: 0 0 4px 4px;
  }

  slot[name='indicator']::slotted(div) {
    height: 100%;
    border-radius: 8px 0 0 8px;
    position: absolute;
    width: 4px;
    left: 0;
    top: 0;
    z-index: 1;
  }

  :host([progress]) slot[name='indicator']::slotted(div) {
    border-radius: 0 0 0 8px;
  }

  .progress-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    width: 100%;
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
    overflow: hidden;
  }

  :host(.new) .card {
    background-color: rgba(${toColorComponents(paletteBlueBase)}, 0.3);
  }

  :host([clickable]) .card,
  :host([selectable]) .card {
    cursor: pointer;
  }

  :host([clickable]) .card:hover {
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  :host(.positive) .card {
    background-color: rgba(
      ${toColorComponents(buy)},
      ${ppp.darkMode ? 0.4 : 0.3}
    );
  }

  :host(.negative) .card {
    background-color: rgba(
      ${toColorComponents(sell)},
      ${ppp.darkMode ? 0.4 : 0.3}
    );
  }

  :host(.earth) .card {
    background-color: rgba(
      ${toColorComponents(
        themeConditional(paletteYellowLight2, paletteYellowDark2)
      )},
      ${ppp.darkMode ? 0.4 : 0.3}
    );
  }

  :host(:first-child) {
    padding-top: 8px;
  }

  :host(:last-child) {
    padding-bottom: 8px;
  }

  :host(.multiline) slot[name='title-left']::slotted(span) {
    word-break: break-word;
    white-space: normal;
    display: inline-block;
  }

  slot[name='indicator']::slotted(div.buy),
  slot[name='indicator']::slotted(div.positive) {
    background: linear-gradient(90deg, ${positive} 50%, transparent 0);
  }

  slot[name='indicator']::slotted(div.sell),
  slot[name='indicator']::slotted(div.negative) {
    background: linear-gradient(90deg, ${negative} 50%, transparent 0);
  }

  slot[name='indicator']::slotted(div.earth) {
    background: linear-gradient(
      90deg,
      ${themeConditional(paletteYellowDark2, paletteYellowLight2)} 50%,
      transparent 0
    );
  }

  slot[name='indicator']::slotted(div.alien) {
    background: linear-gradient(
      90deg,
      ${themeConditional(palettePurpleDark2, palettePurpleLight2)} 50%,
      transparent 0
    );
  }

  slot[name='indicator']::slotted(div.ocean) {
    background: linear-gradient(
      90deg,
      ${themeConditional(paletteBlueDark2, paletteBlueLight2)} 50%,
      transparent 0
    );
  }

  .actions {
    position: absolute;
    top: 0;
    right: 0;
    padding-right: 16px;
    width: 116px;
    height: 100%;
    opacity: 0;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0 4px;
    background: linear-gradient(
      90deg,
      rgba(
          ${themeConditional(
            toColorComponents(paletteGrayLight3),
            toColorComponents(paletteGrayDark2)
          )},
          0
        )
        0,
      ${themeConditional(paletteGrayLight3, paletteGrayDark2)} 30%,
      ${themeConditional(paletteGrayLight3, paletteGrayDark2)}
    );
  }

  slot[name='actions']::slotted(button) {
    border-radius: 50%;
    min-height: 24px;
    min-width: 24px;
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    border: none;
    cursor: pointer;
    font-size: ${fontSizeWidget};
    justify-content: center;
    text-align: left;
    vertical-align: middle;
    padding: 0 8px;
  }

  slot[name='actions']::slotted(button:hover) {
    background-color: ${themeConditional(
      darken(paletteGrayLight2, 10),
      paletteGrayBase
    )};
  }

  .card:hover .actions {
    opacity: 1;
  }

  .payload {
    width: 100%;
    padding: 6px 0;
    display: flex;
    align-items: center;
  }

  .icon {
    display: flex;
    position: relative;
    margin-right: 8px;
    justify-content: center;
    align-items: center;
    color: ${themeConditional(paletteGrayLight1, paletteBlack)};
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayBase)};
    min-width: 28px;
    min-height: 28px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    word-wrap: break-word;
    font-size: calc(${fontSizeWidget} + 2px);
    line-height: 20px;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: capitalize;
  }

  slot[name='icon']::slotted(div) {
    width: 28px;
    height: 28px;
    left: 0;
    top: 0;
    position: absolute;
    border-radius: 50%;
    background-size: 100%;
  }

  .text-content {
    display: flex;
    flex-direction: column;
    gap: 1px;
    overflow: hidden;
    flex: 1;
  }

  .text-line {
    display: flex;
    white-space: nowrap;
    justify-content: space-between;
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    letter-spacing: 0;
  }

  .text-line.first {
    font-weight: 500;
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight2)};
  }

  .text-line-inner {
    display: flex;
    align-items: flex-start;
    margin-right: 20px;
    overflow: hidden;
  }

  .text-line-inner > span {
    flex: 1;
    ${ellipsis()};
  }

  .text-line-inner > span > div {
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    font-weight: 500;
    letter-spacing: 0;
    ${ellipsis()};
  }

  .text-line.second,
  .text-line.third {
    font-weight: ${fontWeightWidget};
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }
`;

export class WidgetCard extends PPPElement {
  @attr({ converter: nullableNumberConverter })
  progress;

  @observable
  slottedActions;

  constructor() {
    super();

    this.slottedActions = [];
  }
}

export default {
  WidgetEmptyStateControlComposition: WidgetEmptyStateControl.compose({
    template: widgetEmptyStateControlTemplate,
    styles: widgetEmptyStateControlStyles
  }).define(),
  WidgetGroupControlComposition: WidgetGroupControl.compose({
    template: widgetGroupControlTemplate,
    styles: widgetGroupControlStyles
  }).define(),
  WidgetSearchControlComposition: WidgetSearchControl.compose({
    template: widgetSearchControlTemplate,
    styles: widgetSearchControlStyles
  }).define(),
  WidgetResizeControlsComposition: WidgetResizeControls.compose({
    template: widgetResizeControlsTemplate,
    styles: widgetResizeControlsStyles
  }).define(),
  WidgetNotificationsAreaComposition: WidgetNotificationsArea.compose({
    template: widgetNotificationsAreaTemplate,
    styles: widgetNotificationsAreaStyles
  }).define(),
  WidgetHeaderButtonsComposition: WidgetHeaderButtons.compose({
    template: widgetHeaderButtonsTemplate,
    styles: widgetHeaderButtonsStyles
  }).define(),
  WidgetTabsComposition: WidgetTabs.compose({
    template: tabsTemplate,
    styles: widgetTabsStyles
  }).define(),
  WidgetTabComposition: WidgetTab.compose({
    template: tabTemplate,
    styles: widgetTabStyles
  }).define(),
  WidgetTextFieldComposition: WidgetTextField.compose({
    template: textFieldTemplate,
    styles: widgetTextFieldStyles,
    shadowOptions: {
      delegatesFocus: true
    }
  }).define(),
  WidgetTrifectaFieldComposition: WidgetTrifectaField.compose({
    template: widgetTrifectaFieldTemplate,
    styles: widgetTrifectaFieldStyles,
    shadowOptions: {
      delegatesFocus: true
    }
  }).define(),
  WidgetOptionComposition: WidgetOption.compose({
    template: listboxOptionTemplate,
    styles: widgetOptionStyles
  }).define(),
  WidgetSelectComposition: WidgetSelect.compose({
    template: selectTemplate,
    styles: widgetSelectStyles
  }).define(),
  WidgetButtonComposition: WidgetButton.compose({
    template: buttonTemplate,
    styles: widgetButtonStyles,
    shadowOptions: {
      delegatesFocus: true
    }
  }).define(),
  WidgetBoxRadioGroupComposition: WidgetBoxRadioGroup.compose({
    template: radioGroupTemplate,
    styles: widgetBoxRadioGroupStyles
  }).define(),
  WidgetBoxRadioComposition: WidgetBoxRadio.compose({
    template: boxRadioTemplate,
    styles: widgetBoxRadioStyles
  }).define(),
  WidgetCheckboxComposition: WidgetCheckbox.compose({
    template: checkboxTemplate,
    styles: widgetCheckboxStyles
  }).define(),
  WidgetCardComposition: WidgetCard.compose({
    template: widgetCardTemplate,
    styles: widgetCardStyles
  }).define()
};
