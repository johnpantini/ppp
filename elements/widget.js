/** @decorator */

import {
  PPPAppearanceElement,
  PPPElement,
  PPPOffClickElement
} from '../lib/ppp-element.js';
import {
  attr,
  css,
  html,
  ref,
  Observable,
  observable,
  repeat,
  when,
  slotted,
  Updates
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
  spacing,
  typography
} from '../design/styles.js';
import {
  bodyFont,
  buy,
  buyHover,
  darken,
  fontSizeWidget,
  fontWeightWidget,
  lighten,
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
  paletteGreenBase,
  paletteGreenLight3,
  paletteRedBase,
  paletteRedLight3,
  paletteWhite,
  positive,
  sell,
  sellHover,
  spacing1,
  spacing2,
  themeConditional,
  toColorComponents,
  widgetGroup1,
  widgetGroup2,
  widgetGroup3,
  widgetGroup4,
  widgetGroup5,
  widgetGroup6,
  widgetGroup7,
  widgetGroup8,
  widgetGroup9
} from '../design/design-tokens.js';
import {
  circleNotch,
  close,
  settings,
  search,
  notificationError,
  notificationSuccess,
  emptyWidgetState,
  notificationNote
} from '../static/svg/sprite.js';
import { Tab, Tabs, tabsTemplate, tabTemplate } from './tabs.js';
import { TextField, textFieldStyles, textFieldTemplate } from './text-field.js';
import { Button, buttonStyles, buttonTemplate } from './button.js';
import { RadioGroup, radioGroupTemplate } from './radio-group.js';
import { BoxRadio, boxRadioStyles, boxRadioTemplate } from './radio.js';
import {
  NoInstrumentsError,
  StaleInstrumentCacheError
} from '../lib/ppp-errors.js';

export const importInstrumentsSuggestion = (e) => html`
  <span>
    <a
      class="link"
      href="?page=instruments&tab=import"
      @click="${(x) => x.openInstrumentsImport(e.trader)}"
    >
      Импортируйте</a
    >
    или
    <a
      class="link"
      @click="${async (x) => {
        x.widget.container.beginOperation();

        try {
          await e.trader.syncInstrumentCache(e);
        } finally {
          window.location.reload();
        }
      }}"
    >
      синхронизируйте
    </a>
    торговые инструменты, затем обновите страницу.
  </span>
`;

export const staleInstrumentCacheSuggestion = (e) => html`
  <span>
    Локальные инструменты устарели, необходима
    <a
      class="link"
      @click="${async (x) => {
        x.widget.container.beginOperation();

        try {
          await e.trader.syncInstrumentCache(e);
        } finally {
          window.location.reload();
        }
      }}"
    >
      синхронизация </a
    >.
  </span>
`;

export const widgetEmptyState = () => css`
  .widget-empty-state-holder {
    width: 100%;
    height: 95%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }

  .widget-empty-state-holder > svg {
    color: ${themeConditional(paletteGrayLight2, paletteGrayLight1)};
    width: 60%;
    height: 60%;
    min-width: 32px;
    min-height: 32px;
    max-width: 80px;
    max-height: 80px;
    margin-left: 16px;
  }

  .widget-empty-state-holder > span {
    color: ${paletteGrayLight1};
    font-family: ${bodyFont};
    font-size: ${fontSizeWidget};
    font-weight: ${fontWeightWidget};
    line-height: ${lineHeightWidget};
    margin-top: ${spacing1};
    padding: 0 10px;
    text-align: center;
  }
`;

export const widget = () => css`
  ${display('inline-flex')}
  ${scrollbars('.widget-body')}
  ${widgetEmptyState()}
  .widget-root {
    position: relative;
    background: ${themeConditional(paletteWhite, paletteBlack)};
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
    width: 100%;
    height: 100%;
    user-select: none;
  }

  :host([frozen]) .widget-body,
  :host([dragging]) .widget-body,
  :host([resizing]) .widget-body {
    pointer-events: none !important;
  }

  :host([preview]) .widget-root {
    border: 1px solid ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  :host([dragging]) .widget-root,
  :host([resizing]) .widget-root {
    border: 1px solid ${paletteBlueLight1};
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

  :host([preview]) .widget-header {
    cursor: default;
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
    z-index: 2;
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
    margin-left: 6px;
  }

  .widget-title {
    display: flex;
    gap: 0 6px;
    font-size: ${fontSizeWidget};
    font-weight: 500;
    line-height: ${lineHeightWidget};
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    white-space: nowrap;
    overflow: hidden;
    flex-grow: 1;
    padding: 0 ${spacing1};
    margin-right: 6px;
  }

  ppp-widget-group-control + .widget-title {
    margin-left: 8px;
  }

  ppp-widget-search-control + .widget-title {
    margin-left: 8px;
  }

  .widget-title > .title {
    ${ellipsis()};
  }

  .positive {
    color: ${positive};
  }

  .negative {
    color: ${negative};
  }

  .widget-section {
    width: 100%;
    padding: 0 10px;
    position: relative;
  }

  .widget-section-spacer {
    width: 100%;
    padding: 6px 0;
  }

  .widget-subsection {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
  }

  .widget-subsection ppp-widget-button {
    width: 100%;
  }

  .widget-subsection > :not(:first-child) {
    margin-left: 10px;
  }

  .widget-subsection-item {
    width: 100%;
    position: relative;
  }

  .widget-text-label {
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    font-size: ${fontSizeWidget};
    margin-bottom: 5px;
  }

  .widget-flex-line {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }

  .widget-margin-spacer {
    width: 100%;
    position: relative;
    margin-top: ${spacing2};
  }

  .widget-summary {
    display: flex;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    font-size: ${fontSizeWidget};
    width: 100%;
    text-align: left;
    line-height: 14px;
    flex-direction: column;
  }

  .widget-summary-line {
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .widget-summary-line::after {
    inset: 0;
    content: '';
    position: absolute;
    border-color: ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
    border-style: solid;
    border-width: 0;
    pointer-events: none;
  }

  .widget-summary-line + .widget-summary-line::after {
    border-top-width: 0.5px;
  }

  .widget-summary-line-price {
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 120px;
  }

  .widget-footer {
    padding: 8px 0;
    position: relative;
  }

  .widget-card-holder {
    padding-top: 6px;
    margin: 0 8px;
  }

  .widget-card-holder:first-child {
    padding-top: 0;
  }

  .widget-card-holder:last-child {
    padding-bottom: 8px;
  }

  .widget-card-holder-inner {
    cursor: default;
  }

  .widget-action-button span {
    display: inline-flex;
    flex: 0 0 auto;
    margin: 0 -8px;
    color: ${paletteGrayLight1};
    vertical-align: text-bottom;
  }

  .widget-action-button span svg {
    width: 16px;
    height: 16px;
  }

  tr.table-group {
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    font-weight: 500;
    letter-spacing: 0;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }

  tr.table-group td {
    text-align: left;
    padding: 4px 8px;
    max-width: 134px;
    white-space: nowrap;
  }
`;

export const widgetEmptyStateTemplate = (text) => `
  <div class="widget-empty-state-holder">
    ${emptyWidgetState}
    <span>${text}</span>
  </div>`;

export class Widget extends PPPElement {
  @attr({ mode: 'boolean' })
  dragging;

  @attr({ mode: 'boolean' })
  resizing;

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

    this.adjustTitleEllipsis();

    if (!this.preview) {
      this.addEventListener('pointerdown', () => {
        // Check if not topmost
        if (this.style.zIndex < this.container.zIndex) {
          this.style.zIndex = ++this.container.zIndex;

          void this.updateDocumentFragment({
            $set: {
              'widgets.$.zIndex': this.container.zIndex
            }
          });
        }
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
    }
  }

  catchException(e) {
    const title = this.document.name;

    if (e instanceof NoInstrumentsError) {
      return this.notificationsArea.note({
        title,
        text: importInstrumentsSuggestion(e),
        keep: true
      });
    } else if (e instanceof StaleInstrumentCacheError) {
      return this.notificationsArea.note({
        title,
        text: staleInstrumentCacheSuggestion(e),
        keep: true
      });
    } else {
      console.error(e);

      return this.notificationsArea.error({
        title,
        text: 'Не удалось подключиться к источнику данных.'
      });
    }
  }

  adjustTitleEllipsis() {
    const title = this.shadowRoot.querySelector('.widget-title > .title');

    if (title) {
      if (title.offsetWidth < title.scrollWidth) {
        title.setAttribute('title', title.textContent);
      } else title.removeAttribute('title');
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
}

export class WidgetWithInstrument extends Widget {
  @observable
  instrument;

  @observable
  instrumentTrader;

  instrumentTraderChanged(o, n) {
    if (this.searchControl) this.searchControl.trader = n;
  }

  /**
   * @description Isolated widget ignores instrumentChanged() callback.
   */
  isolated;

  selectInstrument(symbol, options = {}) {
    if (!symbol) return;

    if (this.preview && this.container.savedInstrument) {
      this.instrument = this.container.savedInstrument;

      return this.instrument;
    }

    if (!this.instrumentTrader) {
      return;
    }

    const instrument = this.instrumentTrader.instruments.get(symbol) ?? {
      symbol,
      fullName: 'Инструмент не поддерживается'
    };

    const adoptedInstrument = this.instrumentTrader.adoptInstrument(instrument);

    if (options.isolate) {
      this.isolated = true;
      this.instrument = adoptedInstrument;
      this.isolated = false;

      return adoptedInstrument;
    }

    if (adoptedInstrument) {
      this.isolated = false;
      this.instrument = adoptedInstrument;
    }

    return adoptedInstrument;
  }

  instrumentChanged() {
    if (this.searchControl) {
      Observable.notify(this.searchControl, 'widget');
    }

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
              if (typeof w.instrumentTrader !== 'undefined') {
                const adoptedInstrument = w.instrumentTrader.adoptInstrument(
                  this.instrument
                );

                w.instrument = adoptedInstrument;

                bulkWritePayload.push({
                  updateOne: {
                    filter: {
                      'widgets.uniqueID': w.document.uniqueID
                    },
                    update: {
                      $set: {
                        'widgets.$.symbol': adoptedInstrument?.symbol
                      }
                    },
                    upsert: true
                  }
                });
              }
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
              'widgets.$.symbol': this.instrument?.symbol
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
    position: relative;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
  }

  .toggle {
    font-size: calc(${fontSizeWidget} - 2px);
    line-height: calc(${fontSizeWidget} - 2px);
    cursor: pointer;
    position: relative;
    background: ${paletteGrayLight1};
    color: ${paletteBlack};
    width: 12px;
    height: 12px;
    text-align: center;
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
        .filter((w) => w !== this.widget)
        .find(
          (w) => w?.groupControl.selection === this.selection && w.instrument
        );

      if (
        sourceWidget?.instrument &&
        sourceWidget?.instrument?.symbol !== this.widget?.instrument?.symbol
      ) {
        this.widget.isolated = true;

        if (typeof this.widget.instrumentTrader === 'undefined') {
          return this.widget.notificationsArea.error({
            text: 'Не задан трейдер для работы с инструментом.'
          });
        }

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
              @click="${(x) => x.chooseInstrument(x.widget?.instrument)}"
            >
              <div class="menu-item-icon-holder">
                <div class="menu-item-icon-fallback">
                  <div
                    class="menu-item-icon-logo"
                    style="${(x) =>
                      `background-image:url(${x.getInstrumentIconUrl(
                        x.widget?.instrument
                      )})`}"
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
        </div>
      </div>
    </div>
  </template>
`;

export const widgetSearchControlStyles = css`
  ${normalize()}
  ${widgetEmptyState()}
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
    padding: 0 10px 2px 10px;
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

  @attr
  size;

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

  constructor() {
    super();

    this.stocks = [];
    this.bonds = [];
    this.etfs = [];
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

  openChanged(oldValue, newValue) {
    if (newValue) this.widget.style.overflow = 'visible';
    else this.widget.style.overflow = 'hidden';

    if (this.widget.preview) {
      if (newValue) {
        this.widget.style.position = 'absolute';
        this.widget.container.widgetArea.style.height = `${parseInt(
          this.widget.style.height
        )}px`;
      } else {
        this.widget.style.position = 'relative';
        this.widget.container.widgetArea.style.height = null;
      }
    }
  }

  chooseInstrument(instrument) {
    this.widget.instrument = this.trader.adoptInstrument(instrument);
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

        this.stocks = [];
        this.bonds = [];
        this.etfs = [];
        this.futures = [];
        this.cryptocurrencies = [];

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

            seen[i.symbol] = true;
          }
        });

        Updates.enqueue(() => {
          this.activeItem = this.menuHolder.querySelector('.menu-item');
        });
      } catch (e) {
        console.error(e);

        this.stocks = [];
        this.bonds = [];
        this.etfs = [];
        this.futures = [];
        this.cryptocurrencies = [];
        this.ticker = null;
      } finally {
        this.searching = false;
      }
    } else {
      this.activeItem = null;
      this.stocks = [];
      this.bonds = [];
      this.etfs = [];
      this.futures = [];
      this.cryptocurrencies = [];
      this.ticker = null;
      this.searching = false;
    }
  }
}

export const widgetResizeControlsTemplate = html`
  <template>
    <div class="top"></div>
    <div class="right"></div>
    <div class="bottom"></div>
    <div class="left"></div>
    <div class="ne"></div>
    <div class="se"></div>
    <div class="sw"></div>
    <div class="nw"></div>
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
  }

  onPointerMove({ event }) {
    const handle = this.widget.handle;
    const clientX = this.widget.container.clientX;
    const clientY = this.widget.container.clientY;
    let deltaX = event.clientX - clientX;
    let deltaY = event.clientY - clientY;
    const { minWidth = 275, minHeight = 395 } = this.widget.widgetDefinition;

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

  onPointerUp() {
    if (!this.widget.preview) {
      void this.widget.updateDocumentFragment({
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
          (x) => x.title,
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
    font-size: 12px;
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

  #appearance({ status, title = 'Виджет', text, keep, timeout }) {
    this.status = status;
    this.title = title;
    this.text = text;

    this.removeAttribute('hidden');

    clearTimeout(this.#timeout);

    if (!keep) {
      this.#timeout = setTimeout(() => {
        this.setAttribute('hidden', '');
      }, timeout ?? 3000);
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
    <slot>
      <div class="button" @click="${(x) => x.showWidgetSettings()}">
        ${html.partial(settings)}
      </div>
      <div class="button" @click="${(x) => x.closeWidget()}">
        ${html.partial(close)}
      </div>
    </slot>
  </template>
`;

export const widgetHeaderButtonsStyles = css`
  ${display('flex')}
  .button {
    margin-right: 2px;
    width: 16px;
    height: 16px;
    cursor: pointer;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }
`;

export class WidgetHeaderButtons extends PPPElement {
  connectedCallback() {
    super.connectedCallback();

    this.widget = this.getRootNode().host;
  }

  async showWidgetSettings() {
    if (!this.widget.preview) {
      const page = await ppp.app.mountPage('widget', {
        title: `Виджет - ${this.widget.document.name}`,
        size: 'xxlarge',
        documentId: this.widget.document._id,
        autoRead: true
      });

      const originalMethod = page.submitDocument;
      const that = this;

      page.submitDocument = async function () {
        await originalMethod.call(page);

        const newWidgetDocument = Object.assign(
          {},
          that.widget.document,
          page.document,
          {
            x: parseInt(that.widget.style.left),
            y: parseInt(that.widget.style.top),
            width: parseInt(that.widget.style.width),
            height: parseInt(that.widget.style.height)
          }
        );

        that.widget.remove();
        that.widget.container.document.widgets.push(newWidgetDocument);

        return that.widget.container.placeWidget(newWidgetDocument);
      };
    }
  }

  closeWidget() {
    this.widget.close();
  }
}

export const widgetTabsStyles = css`
  ${normalize()}
  ${display('grid')}
  :host {
    border-bottom: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  .tablist {
    display: flex;
    position: relative;
    align-items: center;
    border: none;
    flex: 0 0 auto;
    margin: 0;
    padding: 0;
  }
`;

export class WidgetTabs extends Tabs {}

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
    border-radius: 4px 0 0 4px;
    padding: 0 0 1px 8px;
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
`;

export class WidgetTextField extends TextField {}

export const widgetButtonStyles = css`
  ${buttonStyles}
  .control {
    width: 100%;
    height: 32px;
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

export const widgetCardTemplate = html`
  <template>
    <div class="card">
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
            <span>
              <slot name="title-right"></slot>
            </span>
          </div>
          <div class="text-line second">
            <div class="text-line-inner">
              <div>
                <slot name="subtitle-left"></slot>
              </div>
            </div>
            <span>
              <slot name="subtitle-right"></slot>
            </span>
          </div>
        </div>
      </div>
      <div
        class="actions"
        style="display: ${(x) => (x.slottedActions.length ? 'flex' : 'none')}"
      >
        <slot name="actions" ${slotted('slottedActions')}></slot>
      </div>
    </div>
  </template>
`;

export const widgetCardStyles = css`
  ${normalize()}
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

  :host(.new) .card {
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

  :host([clickable]) .card {
    cursor: pointer;
  }

  :host([clickable]) .card:hover {
  }

  :host(:first-child) {
    padding-top: 8px;
  }

  :host(:last-child) {
    padding-bottom: 8px;
  }

  slot[name='indicator']::slotted(div) {
    height: 100%;
    border-radius: 8px 0 0 8px;
    position: absolute;
    width: 4px;
    left: 0;
    top: 0;
  }

  slot[name='indicator']::slotted(div.buy) {
    background: linear-gradient(90deg, ${positive} 50%, transparent 0);
  }

  slot[name='indicator']::slotted(div.sell) {
    background: linear-gradient(90deg, ${negative} 50%, transparent 0);
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
    padding: 8px 0;
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
    overflow: hidden;
    flex: 1;
  }

  .text-line {
    display: flex;
    white-space: nowrap;
    justify-content: space-between;
    align-items: center;
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    letter-spacing: 0;
  }

  .text-line.first {
    font-weight: 500;
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight2)};
  }

  .text-line-inner {
    display: flex;
    align-items: center;
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

  .text-line.second {
    font-weight: ${fontWeightWidget};
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }
`;

export class WidgetCard extends PPPElement {
  @observable
  slottedActions;

  constructor() {
    super();

    this.slottedActions = [];
  }

  connectedCallback() {
    super.connectedCallback();

    if (
      this.classList.contains('new') &&
      document.visibilityState === 'visible'
    ) {
      setTimeout(() => {
        this.classList.remove('new');
      }, 3000);
    }
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
  WidgetCardComposition: WidgetCard.compose({
    template: widgetCardTemplate,
    styles: widgetCardStyles
  }).define()
};
