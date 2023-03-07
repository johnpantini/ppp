/** @decorator */

import { PPPElement, PPPOffClickElement } from '../lib/ppp-element.js';
import {
  attr,
  css,
  html,
  ref,
  Observable,
  observable,
  repeat,
  when,
  Updates
} from '../vendor/fast-element.min.js';
import { debounce } from '../lib/ppp-decorators.js';
import { display } from '../vendor/fast-utilities.js';
import { ellipsis, normalize } from '../design/styles.js';
import {
  bodyFont,
  darken,
  fontSizeWidget,
  fontWeightWidget,
  lineHeightWidget,
  paletteBlack,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayDark3,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenBase,
  paletteRedBase,
  paletteRedLight2,
  paletteWhite,
  paletteYellowBase,
  paletteYellowDark2,
  paletteYellowLight2,
  spacing1,
  themeConditional
} from '../design/design-tokens.js';
import { circleNotch, search } from '../static/svg/sprite.js';

const searchDebounceTimeout =
  ppp.keyVault.getKey('use-alternative-mongo') === '1' ? 0 : 200;

export const widget = () => css`
  ${display('inline-flex')}
  .widget-root {
    position: relative;
    background: ${themeConditional(paletteWhite, paletteBlack)};
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteBlack)};
    width: 100%;
    height: 100%;
    user-select: none;
  }

  .widget-header {
    display: flex;
    position: relative;
    width: 100%;
    height: 30px;
    cursor: move;
    flex-shrink: 0;
    padding: 0 5px;
    font-size: ${fontSizeWidget};
    background: ${themeConditional(darken(paletteGrayLight3, 5), paletteBlack)};
    align-items: center;
    justify-content: space-between;
  }

  .widget-header::after {
    top: 0;
    left: 0;
    right: 0;
    bottom: -1px;
    content: '';
    position: absolute;
    border-bottom: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
    pointer-events: none;
  }

  .widget-header-inner {
    display: flex;
    width: 100%;
    height: 30px;
    align-items: center;
  }

  .widget-body {
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    height: calc(100% - 30px);
    overflow: auto;
  }

  .widget-header ppp-widget-group-control {
    flex: 0 0 16px;
  }

  .widget-header ppp-widget-search-control {
    height: 20px;
    flex: 0 0 66px;
    margin-left: ${spacing1};
  }

  .widget-title {
    display: flex;
    align-items: center;
    overflow: hidden;
    margin-left: 8px;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    flex-grow: 1;
    padding: 0 ${spacing1};
    margin-right: 6px;
  }
`;

export const widgetEmptyStateTemplate = (text) => `
  <div class="widget-empty-state-holder">

  </div>`;

export class Widget extends PPPElement {
  @attr({ mode: 'boolean' })
  dragging;

  @attr({ mode: 'boolean' })
  preview;

  @observable
  widgetDefinition;

  @observable
  document;

  constructor() {
    super();

    this.document = {};
  }

  connectedCallback() {
    super.connectedCallback();

    this.header = this.shadowRoot.querySelector('.widget-header');

    if (!this.preview) {
      this.header.addEventListener('pointerdown', () => {
        this.style.zIndex = ++this.container.zIndex;
      });
    } else {
      this.style.position = 'relative';
      this.style.display = 'block';

      if (this.container.savedWidth > 0)
        this.style.width = `${this.container.savedWidth}px`;
      else {
        this.style.width = `${
          this.widgetDefinition.defaultWidth ??
          this.widgetDefinition.minWidth ??
          275
        }px`;
      }

      if (this.container.savedHeight > 0)
        this.style.height = `${this.container.savedHeight}px`;
      else {
        this.style.height = `${
          this.widgetDefinition.defaultHeight ??
          this.widgetDefinition.minHeight ??
          395
        }px`;
      }

      this.document = this.container.document;
      this.topLoader = this.container.topLoader;

      if (this.container.savedInstrument)
        this.instrument = this.container.savedInstrument;
    }
  }

  async updateDocumentFragment(widgetUpdateFragment = {}) {
    if (this.preview) return;

    return ppp.user.functions.updateOne(
      {
        collection: 'workspaces'
      },
      {
        'widgets.uniqueID': this.document.uniqueID
      },
      widgetUpdateFragment,
      {
        upsert: true
      }
    );
  }

  async close() {
    if (!this.preview) {
      ppp.user.functions.updateOne(
        {
          collection: 'workspaces'
        },
        {
          _id: ppp.app.params().document
        },
        {
          $pull: {
            widgets: {
              uniqueID: this.document.uniqueID
            }
          }
        }
      );

      const index = this.container.document.widgets.findIndex(
        (w) => w.uniqueID === this.document.uniqueID
      );

      if (index > -1) this.container.document.widgets.splice(index, 1);

      Observable.notify(this.container, 'document');

      this.remove();
    }
  }

  goToSettings() {
    if (!this.preview) {
      console.log('goToSettings');
    }
  }
}

export class WidgetWithInstrument extends Widget {
  @observable
  instrument;

  /**
   * @description Isolated widget ignores instrumentChanged() callback.
   */
  isolated;

  connectedCallback() {
    super.connectedCallback();

    if (!this.preview) {
      this.isolated = true;
      this.instrument = this.document.instrument;
      this.isolated = false;
    }
  }

  async findAndSelectSymbol(findClause = {}, selectOnThis = false) {
    const instrument = await ppp.user.functions.findOne(
      {
        collection: 'instruments'
      },
      findClause
    );

    if (instrument) {
      if (selectOnThis) {
        this.instrument = instrument;
      }

      Array.from(this.container.shadowRoot.querySelectorAll('.widget'))
        .filter(
          (w) =>
            w !== this &&
            w?.instrument?._id !== instrument._id &&
            w?.groupControl?.selection === this.groupControl?.selection
        )
        .forEach((w) => (w.instrument = instrument));
    }

    return instrument;
  }

  instrumentChanged() {
    if (this.preview) return;

    if (!this.isolated) {
      const bulkWritePayload = [];

      Array.from(this.container.shadowRoot.querySelectorAll('.widget')).forEach(
        (w) => {
          if (
            w instanceof WidgetWithInstrument &&
            w.groupControl &&
            w !== this
          ) {
            w.isolated = true;

            if (
              this.groupControl.selection &&
              w.groupControl.selection === this.groupControl.selection
            ) {
              w.instrument = this.instrument;

              bulkWritePayload.push({
                updateOne: {
                  filter: {
                    'widgets.uniqueID': w.document.uniqueID
                  },
                  update: {
                    $set: {
                      'widgets.$.instrumentId': w.instrument?._id
                    }
                  },
                  upsert: true
                }
              });
            }

            w.isolated = false;
          }
        }
      );

      bulkWritePayload.push({
        updateOne: {
          filter: {
            'widgets.uniqueID': this.document.uniqueID
          },
          update: {
            $set: {
              'widgets.$.instrumentId': this.instrument?._id
            }
          },
          upsert: true
        }
      });

      void ppp.user.functions.bulkWrite(
        {
          collection: 'workspaces'
        },
        bulkWritePayload,
        {
          ordered: false
        }
      );
    }
  }

  broadcastPrice(price) {
    if (price > 0 && !this.preview) {
      const widgets = Array.from(
        this.container.shadowRoot.querySelectorAll('.widget')
      ).filter(
        (w) =>
          w !== this.widget &&
          typeof w.setPrice === 'function' &&
          w?.groupControl.selection === this.groupControl.selection &&
          w.instrument
      );

      widgets.forEach((w) => w.setPrice(price));
    }

    return true;
  }
}

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
    font-size: 16px;
    width: 16px;
    height: 16px;
    display: inline-flex;
    position: relative;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .toggle {
    cursor: pointer;
    position: relative;
    background: ${paletteGrayLight1};
    color: ${paletteBlack};
    width: 12px;
    height: 12px;
    font-size: 10px;
    text-align: center;
    line-height: 11px;
  }

  :host(:not([selection])) .toggle::before {
    top: 50%;
    left: 50%;
    width: 6px;
    height: 2px;
    content: '';
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 1px;
    background-color: rgba(9, 19, 44, 0.5);
    transform-origin: 50% 50%;
  }

  .popup {
    top: 100%;
    left: 50%;
    width: 122px;
    margin: 0 -23px;
    z-index: 1000;
    position: absolute;
    border-radius: 4px;
    transform: translate(10px, 12px);
    background: #ffffff;
  }

  .popup::after,
  .popup::before {
    left: 13px;
    width: 0;
    border: solid transparent;
    bottom: 100%;
    height: 0;
    content: '';
    position: absolute;
    transform: translate(-50%, 0);
  }

  .popup::before {
    border-width: 6px;
    border-bottom-color: #ffffff;
  }

  .popup::after {
    border-width: 5px;
    border-bottom-color: #ffffff;
  }

  .toolbar {
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
    width: 16px;
    cursor: pointer;
    height: 16px;
    display: inline-flex;
    position: relative;
    align-items: center;
    justify-content: center;
  }

  .group-icon-holder[selected]::before {
    content: '';
    top: 0;
    left: 0;
    right: 0;
    border: 0.5px solid #d9dae0;
    bottom: 0;
    position: absolute;
  }

  .group-icon {
    color: #ffffff;
    width: 12px;
    height: 12px;
    font-size: 10px;
    text-align: center;
    line-height: 11px;
    border-radius: 2px;
  }

  .no-group {
    position: relative;
    background: #d9dae0;
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
    background-color: rgba(9, 19, 44, 0.5);
    transform-origin: 50% 50%;
  }

  :host([selection='1']) .toggle,
  .group-1 {
    background-color: ${paletteYellowBase};
  }

  :host([selection='2']) .toggle,
  .group-2 {
    background-color: ${paletteRedBase};
  }

  :host([selection='3']) .toggle,
  .group-3 {
    background-color: #a381ff;
  }

  :host([selection='4']) .toggle,
  .group-4 {
    background-color: #4dc3f7;
  }

  :host([selection='5']) .toggle,
  .group-5 {
    background-color: #aed57f;
  }

  :host([selection='6']) .toggle,
  .group-6 {
    background-color: #4da197;
  }

  :host([selection='7']) .toggle,
  .group-7 {
    background-color: #ffb74c;
  }

  :host([selection='8']) .toggle,
  .group-8 {
    background-color: #f8a34d;
  }

  :host([selection='9']) .toggle,
  .group-9 {
    background-color: #ff8863;
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
        .filter((w) => w !== this.widget)
        .find(
          (w) => w?.groupControl.selection === this.selection && w.instrument
        );

      if (
        sourceWidget?.instrument &&
        sourceWidget?.instrument?._id !== this.widget?.instrument?._id
      ) {
        this.widget.isolated = true;
        this.widget.instrument = sourceWidget.instrument;
        this.widget.isolated = false;

        void this.widget.updateDocumentFragment({
          $set: {
            'widgets.$.instrumentId': this.widget.instrument._id
          }
        });
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
  <template @click="${(x, c) => x.handleClick(c)}">
    <input
      readonly
      class="popup-trigger"
      type="text"
      placeholder="Тикер"
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
        (x) => x.widget?.instrument,
        html`
          <div class="menu-item-holder">
            <div
              class="menu-item"
              @click="${(x) => x.selectInstrument(x.widget?.instrument)}"
            >
              <div class="menu-item-icon-holder">
                <div class="menu-item-icon-fallback">
                  <div
                    class="menu-item-icon-logo"
                    style="${(x) =>
                      `background-image:url(${
                        'static/instruments/' +
                        (x.widget?.instrument.isin ??
                          x.widget?.instrument.baseCryptoAsset ??
                          x.widget?.instrument.symbol) +
                        '.svg'
                      })`}"
                  ></div>
                  ${(x) => x.widget?.instrument.fullName[0]}
                </div>
              </div>
              <div class="menu-item-text">
                ${(x) => x.widget?.instrument.fullName}
              </div>
              <div class="menu-item-controls">
                <div class="menu-item-tag">
                  <span>${(x) => x.widget?.instrument.symbol}</span>
                </div>
                <div
                  @click="${(x) => x.selectInstrument()}"
                  class="menu-item-close"
                ></div>
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
              !x.futures.length &&
              !x.cryptocurrencies.length,
            html`
              ${html.partial(
                widgetEmptyStateTemplate('Нет результатов для отображения.')
              )}
            `
          )}
          ${when(
            (x) => x.ticker,
            html`
              <div class="menu-title">Тикер</div>
              <div
                class="menu-item"
                @click="${(x) => x.selectInstrument(x.ticker)}"
              >
                <div class="menu-item-icon-holder">
                  <div class="menu-item-icon-fallback">
                    <div
                      class="menu-item-icon-logo"
                      style="${(x) =>
                        `background-image:url(${
                          'static/instruments/' +
                          (x.ticker?.isin ??
                            x.ticker?.baseCryptoAsset ??
                            x.ticker?.symbol) +
                          '.svg'
                        })`}"
                    ></div>
                    ${(x) => x.ticker?.fullName[0]}
                  </div>
                </div>
                <div class="menu-item-text">${(x) => x.ticker?.fullName}</div>
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
                    @click="${(x, c) => c.parent.selectInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x) =>
                            `background-image:url(${
                              'static/instruments/' + x.isin + '.svg'
                            })`}"
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
            (x) => x.bonds.length,
            html`
              <div class="menu-title">Облигации</div>
              ${repeat(
                (x) => x.bonds,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.selectInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x) =>
                            `background-image:url(${
                              'static/instruments/' + x.isin + '.svg'
                            })`}"
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
            (x) => x.futures.length,
            html`
              <div class="menu-title">Фьючерсы</div>
              ${repeat(
                (x) => x.futures,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.selectInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x) =>
                            `background-image:url(${
                              'static/instruments/' + x.symbol + '.svg'
                            })`}"
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
                    @click="${(x, c) => c.parent.selectInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x) =>
                            `background-image:url(${
                              'static/instruments/' + x.baseCryptoAsset + '.svg'
                            })`}"
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
        </div>
      </div>
    </div>
  </template>
`;

export const widgetSearchControlStyles = css`
  ${normalize()}
  :host {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: default;
    pointer-events: none;
  }

  .popup-trigger {
    cursor: pointer;
    padding: 0 10px;
    padding-bottom: 2px;
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
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
    ${ellipsis()};
  }

  input.popup-trigger::placeholder {
    color: ${paletteGrayLight1};
  }

  .popup-trigger:focus-visible {
    outline: none;
  }

  .popup-trigger:hover {
    border: 1px solid ${themeConditional(darken(paletteGrayLight1, 30))};
  }

  .popup {
    top: 0;
    left: 0;
    width: 330px;
    z-index: 1000;
    position: absolute;
    border: 1px solid ${themeConditional(paletteGrayLight2)};
    background: ${themeConditional(paletteWhite)};
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
    color: ${themeConditional(paletteGrayLight1)};
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
    border-top: 1px solid ${themeConditional(paletteGrayLight2)};
    margin: 6px 12px;
  }

  .suggest-input {
    font-family: ${bodyFont};
    font-size: ${fontSizeWidget};
    font-weight: ${fontWeightWidget};
    line-height: ${lineHeightWidget};
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
    color: rgb(33, 49, 60);
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

  .menu::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .menu::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .menu::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .menu-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: rgb(112, 139, 164);
    padding: 8px 12px;
    cursor: default;
    word-wrap: break-word;
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
    letter-spacing: 0;
  }

  .menu-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: inherit;
    padding: 8px 12px;
    text-decoration: none;
    user-select: none;
    cursor: pointer;
  }

  .menu-item.active,
  .menu-item:hover {
    background-color: rgb(243, 245, 248);
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
    color: rgb(140, 167, 190);
    background-color: rgb(223, 230, 237);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    position: relative;
    word-wrap: break-word;
    font-size: 12px;
    line-height: 16px;
    font-weight: 500;
    letter-spacing: 0;
    box-sizing: border-box;
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
    word-break: break-word;
    flex-grow: 1;
    flex-shrink: 1;
    margin-right: 12px;
    font-size: 12px;
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
    box-sizing: border-box;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    background-color: rgb(206, 216, 225);
    border: none;
    border-radius: 4px;
    box-shadow: none;
    color: rgb(90, 118, 143);
    font-size: 12px;
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
    background-image: url('static/widgets/menu-item-close.svg');
    font-size: 16px;
    margin-left: 8px;
    cursor: pointer;
    width: 16px;
    height: 16px;
  }

  .empty-state-holder {
    width: 100%;
    height: 90%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }

  .empty-state-holder img {
    width: 80px;
    height: 80px;
    margin-left: 16px;
  }

  .empty-state-holder span {
    color: rgba(9, 19, 44, 0.5);
    font-size: 12px;
    margin-top: 4px;
  }
`;

export class WidgetSearchControl extends PPPOffClickElement {
  @attr({ mode: 'boolean' })
  open;

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
  futures;

  @observable
  cryptocurrencies;

  constructor(props) {
    super(props);

    this.stocks = [];
    this.bonds = [];
    this.futures = [];
    this.cryptocurrencies = [];
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

    if (event.key === 'Escape') {
      this.open = false;
    } else if (event.key === 'Enter') {
      this.activeItem && this.activeItem.click();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const items = Array.from(this.menuHolder.querySelectorAll('.menu-item'));

      if (items.length) {
        const activeItemIndex = items.findIndex((i) =>
          i.classList.contains('active')
        );

        if (event.key === 'ArrowDown' && activeItemIndex < items.length - 1) {
          this.activeItem = items[activeItemIndex + 1];

          this.activeItem?.scrollIntoView?.({
            block: 'nearest'
          });
        } else if (event.key === 'ArrowUp' && activeItemIndex > 0) {
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

  activeItemChanged(oldValue, newValue) {
    if (oldValue) {
      oldValue.classList.remove('active');
    }

    if (newValue) {
      newValue.classList.add('active');
    }
  }

  openChanged(oldValue, newValue) {
    if (newValue) this.widget.style.overflow = 'visible';
    else this.widget.style.overflow = 'hidden';

    if (this.widget.preview) {
      if (newValue) {
        this.widget.style.position = 'absolute';
        this.widget.parentNode.style.height = `${
          parseInt(this.widget.style.height) + 8
        }px`;
      } else {
        this.widget.style.position = 'relative';
        this.widget.parentNode.style.height = null;
      }
    }
  }

  selectInstrument(instrument) {
    this.widget.instrument = instrument;
    this.open = false;
    this.suggestInput.value = '';
  }

  handleClick({ event }) {
    if (
      event.composedPath().find((n) => n.classList?.contains('popup-trigger'))
    ) {
      this.open = !this.open;
    }

    if (this.open) {
      Updates.enqueue(() => this.suggestInput.focus());
    }
  }

  @debounce(searchDebounceTimeout)
  search(text) {
    this.searching = true;

    if (text?.trim() && typeof this.trader?.search === 'function') {
      this.trader
        .search(text)
        .then((results = {}) => {
          if (results?.exactSymbolMatch?.length === 1) {
            [this.ticker] = results?.exactSymbolMatch;
          } else {
            this.ticker = null;
          }

          const seen = {};
          const stocks = [];
          const bonds = [];
          const futures = [];
          const cryptocurrencies = [];

          for (const i of results?.regexSymbolMatch ?? []) {
            if (seen[i._id]) continue;

            if (i.type === 'stock') stocks.push(i);
            else if (i.type === 'bond') bonds.push(i);
            else if (i.type === 'future') futures.push(i);
            else if (i.type === 'cryptocurrency') cryptocurrencies.push(i);

            seen[i._id] = true;
          }

          for (const i of results?.regexFullNameMatch ?? []) {
            if (seen[i._id]) continue;

            if (i.type === 'stock') stocks.push(i);
            else if (i.type === 'bond') bonds.push(i);
            else if (i.type === 'future') futures.push(i);
            else if (i.type === 'cryptocurrency') cryptocurrencies.push(i);

            seen[i._id] = true;
          }

          this.stocks = stocks.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          );
          this.bonds = bonds.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          );
          this.futures = futures.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          );
          this.cryptocurrencies = cryptocurrencies.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          );

          this.searching = false;

          Updates.enqueue(() => {
            this.activeItem = this.menuHolder.querySelector('.menu-item');
          });
        })
        .catch((error) => {
          console.error(error);

          this.stocks = [];
          this.bonds = [];
          this.futures = [];
          this.cryptocurrencies = [];
          this.ticker = null;
          this.searching = false;
        });
    } else {
      this.activeItem = null;
      this.stocks = [];
      this.bonds = [];
      this.futures = [];
      this.cryptocurrencies = [];
      this.ticker = null;
      this.searching = false;
    }
  }
}

export const widgetNotificationsAreaTemplate = html`
  <template>
    <div class="widget-notification-ps">
      <div class="widget-notification-holder">
        ${when(
          (x) => x.visible && x.title,
          html`
            <div
              class="widget-notification"
              status="${(x) => x.status ?? 'success'}"
            >
              <div class="widget-notification-icon">
                <img
                  draggable="false"
                  alt="Ошибка"
                  src="${(x) =>
                    `static/widgets/notifications-${
                      x.status ?? 'success'
                    }.svg`}"
                />
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
                class="widget-notification-close-button"
                @click="${(x) => (x.visible = false)}"
              >
                <img
                  draggable="false"
                  alt="Закрыть"
                  src="static/widgets/close.svg"
                />
              </div>
            </div>
          `
        )}
      </div>
    </div>
  </template>
`;

export const widgetNotificationsAreaStyles = css``;

export class WidgetNotificationsArea extends PPPElement {
  @observable
  visible;

  @observable
  title;

  @observable
  text;

  @observable
  status;

  #timeout;

  success({ title, text }) {
    this.status = 'success';
    this.title = title;
    this.text = text;
    this.visible = true;

    clearTimeout(this.#timeout);

    this.#timeout = setTimeout(() => {
      this.visible = false;
    }, 3000);
  }

  error({ title, text }) {
    this.status = 'error';
    this.title = title;
    this.text = text;
    this.visible = true;

    clearTimeout(this.#timeout);

    this.#timeout = setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
}

export default {
  WidgetGroupControlComposition: WidgetGroupControl.compose({
    template: widgetGroupControlTemplate,
    styles: widgetGroupControlStyles
  }).define(),
  WidgetSearchControlComposition: WidgetSearchControl.compose({
    template: widgetSearchControlTemplate,
    styles: widgetSearchControlStyles
  }).define(),
  WidgetNotificationsAreaComposition: WidgetNotificationsArea.compose({
    template: widgetNotificationsAreaTemplate,
    styles: widgetNotificationsAreaStyles
  }).define()
};
