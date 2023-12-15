/** @decorator */

import ppp from '../ppp.js';
import { PPPElement } from '../lib/ppp-element.js';
import {
  attr,
  css,
  html,
  Observable,
  observable,
  when,
  ref,
  repeat
} from '../vendor/fast-element.min.js';
import { display } from '../vendor/fast-utilities.js';
import { ellipsis, scrollbars } from '../design/styles.js';
import {
  bodyFont,
  fontSizeWidget,
  fontWeightWidget,
  lineHeightWidget,
  negative,
  paletteBlack,
  paletteBlueLight1,
  paletteBlueLight2,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenBase,
  paletteWhite,
  positive,
  spacing1,
  spacing2,
  darken,
  lighten,
  themeConditional,
  paletteBlueDark2,
  paletteGreenDark2,
  paletteGreenLight2,
  palettePurpleDark2,
  palettePurpleLight2,
  paletteGreenDark1,
  paletteYellowLight2,
  paletteYellowDark2,
  paletteRedDark2,
  paletteRedLight2,
  toColorComponents,
  createThemed
} from '../design/design-tokens.js';
import { emptyWidgetState } from '../static/svg/sprite.js';
import { unsupportedInstrument } from '../lib/traders/trader-worker.js';
import {
  AuthorizationError,
  ConnectionError,
  ConnectionLimitExceededError,
  NoInstrumentsError,
  SerializationError,
  StaleInstrumentCacheError
} from '../lib/ppp-errors.js';
import { uuidv4 } from '../lib/ppp-crypto.js';

window.Observable = Observable;

export const importInstrumentsSuggestionTemplate = (e) => html`
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
          await e.trader.syncDictionary(e);
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

export const staleInstrumentCacheSuggestionTemplate = (e) => html`
  <span>
    Локальные инструменты устарели, необходима
    <a
      class="link"
      @click="${async (x) => {
        x.widget.container.beginOperation();

        try {
          await e.trader.syncDictionary(e);
        } finally {
          window.location.reload();
        }
      }}"
    >
      синхронизация </a
    >.
  </span>
`;

export const widgetUnsupportedInstrumentTemplate = () => html`
  ${when(
    (x) =>
      x.instrument?.symbol && x.instrumentTrader && x.unsupportedInstrument,
    html`${html.partial(
      widgetEmptyStateTemplate('Инструмент не поддерживается.')
    )}`
  )}
`;

export const widgetWithInstrumentBodyTemplate = (
  widgetBodyLayout,
  options = {}
) => html`
  ${when(
    (x) => !x.instrument?.symbol,
    html`${html.partial(
      widgetEmptyStateTemplate(options.emptyStateText ?? 'Выберите инструмент.')
    )}`
  )}
  ${widgetUnsupportedInstrumentTemplate()}
  ${when(
    (x) =>
      x.instrument?.symbol && x.instrumentTrader && !x.unsupportedInstrument,
    widgetBodyLayout
  )}
`;

export const widgetDefaultHeaderTemplate = () => html`
  <div class="widget-header">
    <div class="widget-header-inner">
      <ppp-widget-group-control
        ?hidden="${(x) => !x.instrumentTrader}"
      ></ppp-widget-group-control>
      <ppp-widget-search-control
        ?hidden="${(x) => !x.instrumentTrader}"
      ></ppp-widget-search-control>
      ${when(
        (x) => !x.instrumentTrader,
        html`<span class="no-spacing"></span>`
      )}
      <span class="widget-title">
        <span class="title">${(x) => x.document?.name ?? ''}</span>
      </span>
      <ppp-widget-header-buttons></ppp-widget-header-buttons>
    </div>
  </div>
`;

export const widgetStackSelectorTemplate = () => html`
  <div
    ?hidden=${(x) => !x.document.linkedWidgets?.length}
    class="widget-stack-selector"
    ${ref('stackSelector')}
  >
    <ppp-widget-tabs
      ${ref('stackSelectorTabs')}
      activeid="${(x) => x.document.activeWidgetLink}"
      @change="${(self) => {
        self.document.activeWidgetLink = self.stackSelectorTabs.activeid;

        const bulkWritePayload = [
          {
            updateOne: {
              filter: {
                _id: self.container.document._id,
                'widgets.uniqueID': self.document.uniqueID
              },
              update: {
                $set: {
                  'widgets.$.activeWidgetLink': self.document.activeWidgetLink
                }
              }
            }
          }
        ];

        for (const link of self.document.linkedWidgets ?? []) {
          const w = self.container.widgets.find(
            (w) => w.document.uniqueID === link
          );

          if (w) {
            w.document.activeWidgetLink = self.document.activeWidgetLink;

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
                    'widgets.$.activeWidgetLink': self.document.activeWidgetLink
                  }
                }
              }
            });
          }
        }

        self.restack();

        return ppp.user.functions.bulkWrite(
          {
            collection: 'workspaces'
          },
          bulkWritePayload,
          {
            ordered: false
          }
        );
      }}"
    >
      ${repeat(
        (x) =>
          // Sort explicitly to ensure stable ordering.
          [
            ...new Set(
              x.container.document?.widgets
                ?.filter(
                  (w) =>
                    w.uniqueID === x.document.uniqueID ||
                    x.document.linkedWidgets?.includes(w.uniqueID)
                )
                ?.map((w) => w.uniqueID)
            )
          ],
        html`
          <ppp-widget-tab id="${(x) => x}">
            ${(x, c) => {
              return (
                c.parent.container.getWidgetNameWhenStacked(x) || c.index + 1
              );
            }}
          </ppp-widget-tab>
          <ppp-tab-panel id="${(x) => `${x}-panel`}"></ppp-tab-panel>
        `,
        {
          positioning: true
        }
      )}
    </ppp-widget-tabs>
  </div>
`;

export const widgetEmptyStateTemplate = (text) => `
  <div class="widget-empty-state-holder">
    ${emptyWidgetState}
    <span>${text}</span>
  </div>`;

export const widgetEmptyStateStyles = () => css`
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

export const widgetTableStyles = () => css`
  .widget-table {
    contain: layout;
    display: table;
    table-layout: fixed;
    text-indent: initial;
    min-width: 140px;
    width: 100%;
    padding: 0;
    user-select: none;
    border-collapse: separate;
    border-spacing: 0;
  }

  .widget-table .thead {
    display: table-header-group;
    vertical-align: middle;
  }

  .widget-table .tbody {
    display: table-row-group;
    vertical-align: middle;
  }

  .widget-table .tr {
    display: table-row;
    vertical-align: middle;
  }

  .widget-table .td,
  .widget-table .th {
    display: table-cell;
    vertical-align: middle;
  }

  .widget-table th,
  .widget-table .th {
    text-align: right;
    position: sticky;
    top: 0;
    z-index: 100;
    width: 50%;
    height: 26px;
    padding: 2px 8px;
    white-space: nowrap;
    cursor: pointer;
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    border-bottom: 1px solid
      var(--palette-gray-light-2-with-palette-gray-dark-1);
  }

  .widget-table th.empty,
  .widget-table .th.empty {
    width: 3px;
    padding: 0;
    min-width: 3px;
  }

  .widget-table th > div,
  .widget-table .th > div {
    text-align: right;
    overflow: hidden;
    font-weight: 500;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    ${ellipsis()};
  }

  .widget-table th .resize-handle,
  .widget-table .th .resize-handle {
    position: absolute;
    width: 18px;
    height: 100%;
    left: -9px;
    top: 0;
    opacity: 0;
    cursor: col-resize;
    z-index: 10;
  }

  .widget-table th .resize-handle::before,
  .widget-table .th .resize-handle::before {
    position: absolute;
    content: '';
    background: ${paletteBlueLight1};
    width: 3px;
    height: 26px;
    left: 8px;
  }

  .widget-table th .resize-handle:hover,
  .widget-table .th .resize-handle:hover {
    opacity: 1;
  }

  .widget-table th + th,
  .widget-table .th + .th {
    border-left: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark1)};
  }

  .widget-table th:hover,
  .widget-table .th:hover {
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight2)};
  }

  .widget-table .cell {
    text-align: right;
    padding: 4px 8px;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    white-space: nowrap;
    position: relative;
    vertical-align: middle;
  }

  .widget-table .cell ppp-button {
    position: absolute;
    z-index: 10;
    right: 0;
    top: 3px;
  }

  .widget-table .cell:first-of-type {
    text-align: left;
  }

  .widget-table:not(.list-table) .row:nth-of-type(2n) {
    background-color: ${themeConditional(
      lighten(paletteGrayLight3, 1),
      paletteGrayDark2
    )};
  }

  .widget-table .row {
    position: relative;
  }

  .widget-table .row:hover {
    background-color: ${themeConditional(
      lighten(paletteGrayLight2, 5),
      darken(paletteGrayDark1, 10)
    )};
  }

  .widget-table .row td:first-child::before,
  .widget-table .row .td:first-child::before {
    content: '';
    position: absolute;
    background-color: transparent;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 2px;
    transform: scaleY(0);
    pointer-events: none;
  }

  .widget-table .row[active] td:first-child::before,
  .widget-table .row[active] .td:first-child::before {
    transform: scaleY(1);
    background-color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }
`;

export const widgetCommonContentStyles = () => css`
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
    align-items: end;
    justify-content: space-between;
    gap: 10px;
  }

  .widget-subsection ppp-widget-button {
    width: 100%;
  }

  .widget-button-line {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 10px;
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

  .widget-card-list {
    height: 100%;
    width: 100%;
    position: relative;
    overflow-x: hidden;
  }

  ${scrollbars('.widget-card-list')};

  .widget-card-list-inner {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
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

  .control-line {
    display: flex;
    flex-direction: row;
    gap: 0 ${spacing2};
  }

  .dot-divider {
    margin: 0 4px;
  }

  .dot {
    width: 5px;
    height: 5px;
    position: relative;
  }

  .dot::before {
    content: '';
    position: absolute;
    border-radius: 50%;
    display: inline-block;
    width: 5px;
    height: 5px;
    top: 0;
    left: 0;
  }

  .dot-1::before {
    background-color: ${themeConditional(paletteBlueDark2, paletteBlueLight2)};
  }

  .dot-2::before {
    background-color: ${themeConditional(
      paletteGreenDark2,
      paletteGreenLight2
    )};
  }

  .dot-3::before {
    background-color: ${themeConditional(
      palettePurpleDark2,
      palettePurpleLight2
    )};
  }

  .dot-4::before {
    background-color: ${themeConditional(
      paletteYellowDark2,
      paletteYellowLight2
    )};
  }

  .dot-5::before {
    background-color: ${themeConditional(paletteRedDark2, paletteRedLight2)};
  }

  .link {
    padding-bottom: 2px;
  }

  .sort-holder {
    position: absolute;
    left: ${spacing2};
    height: 18px;
    width: 16px;
  }

  .sort-icon svg {
    width: 16px;
    height: 16px;
    z-index: 10;
    display: inline-block;
    position: relative;
  }

  .sort-shadow {
    pointer-events: none;
    z-index: 9;
    width: 36px;
    height: 20px;
    position: absolute;
    top: 0;
    left: -12px;
    background: linear-gradient(
      90deg,
      rgba(
        ${themeConditional(
          toColorComponents(paletteGrayLight3),
          toColorComponents(paletteGrayDark2)
        )},
        0
      ),
      ${themeConditional(paletteGrayLight3, paletteGrayDark2)} 25%,
      ${themeConditional(paletteGrayLight3, paletteGrayDark2)} 75%,
      rgba(
        ${themeConditional(
          toColorComponents(paletteGrayLight3),
          toColorComponents(paletteGrayDark2)
        )},
        0
      )
    );
  }
`;

export const widgetStyles = () => css`
  ${display('inline-flex')}
  ${scrollbars('.widget-body')}
  ${widgetEmptyStateStyles()}
  ${widgetTableStyles()}
  ${widgetCommonContentStyles()}
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
  :host([resizing]) .widget-root,
  :host([placed]) .widget-root {
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
    align-items: center;
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

  .widget-footer {
    padding: 8px 0;
    position: relative;
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

  .dot-line {
    align-items: center;
    justify-content: right;
  }
`;

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

  @observable
  container;

  constructor() {
    super();

    this.canChangeInstrument = true;
    this.document = {};
  }

  connectedCallback() {
    super.connectedCallback();

    this.sourceID = uuidv4();

    this.restack();
    this.adjustTitleEllipsis();

    if (!this.preview) {
      this.addEventListener('pointerdown', () => {
        this.removeAttribute('placed');

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

      this.style.maxHeight = `512px`;
      this.style.minHeight = `${this.widgetDefinition.minHeight ?? 120}px`;

      if (this.container.savedHeight > 0)
        this.style.height = `${this.container.savedHeight}px`;
      else {
        this.style.height = `auto`;
      }

      this.document = this.container.document;
      this.topLoader = this.container.topLoader;
    }

    const header = this.shadowRoot.querySelector('.widget-header');

    if (header) {
      const title = header.querySelector('.widget-title');

      const headerBg =
        this.document[`headerBg${ppp.darkMode ? 'Dark' : 'Light'}`];

      if (headerBg && headerBg !== 'default') {
        let opacity = Math.trunc(Math.abs(this.document.headerBgOpacity));

        if (typeof opacity !== 'number' || isNaN(opacity)) {
          opacity = 20;
        }

        if (opacity > 100) {
          opacity = 100;
        }

        header.style.backgroundColor = `rgba(${toColorComponents(
          createThemed(headerBg)
        ).createCSS()}, ${(opacity / 100).toFixed(2)})`;
      }

      if (title) {
        const color =
          this.document[`headerColor${ppp.darkMode ? 'Dark' : 'Light'}`];

        if (color && color !== 'default') {
          title.style.color = createThemed(color).createCSS();
        }
      }
    }
  }

  restack() {
    if (typeof this.stackSelectorTabs === 'undefined') {
      return;
    }

    // Called after linkedWidgets modification.
    if (!this.document.linkedWidgets?.length) {
      this.removeAttribute('hidden');
    } else if (this.document.activeWidgetLink === this.document.uniqueID) {
      this.removeAttribute('hidden');
    } else {
      this.setAttribute('hidden', '');
    }
  }

  async repositionLinkedWidgets(isolatedResize) {
    const bulkWritePayload = [];

    for (const link of this.document.linkedWidgets ?? []) {
      const w = this.container.widgets.find(
        (w) => w.document.uniqueID === link
      );

      if (w) {
        w.x = parseInt(this.style.left);
        w.y = parseInt(this.style.top);

        w.style.left = this.style.left;
        w.style.top = this.style.top;

        if (!isolatedResize) {
          w.width = parseInt(this.style.width);
          w.height = parseInt(this.style.height);

          w.style.width = this.style.width;
          w.style.height = this.style.height;
        }

        bulkWritePayload.push({
          updateOne: {
            filter: {
              _id: w.container.document._id,
              'widgets.uniqueID': w.document.uniqueID
            },
            update: {
              $set: {
                'widgets.$.x': w.x,
                'widgets.$.y': w.y,
                'widgets.$.width': w.width,
                'widgets.$.height': w.height
              }
            }
          }
        });
      }
    }

    if (bulkWritePayload.length) {
      return ppp.user.functions.bulkWrite(
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

  catchException(e) {
    if (e instanceof NoInstrumentsError) {
      return this.notificationsArea.note({
        text: importInstrumentsSuggestionTemplate(e),
        keep: true
      });
    } else if (e instanceof StaleInstrumentCacheError) {
      return this.notificationsArea.note({
        text: staleInstrumentCacheSuggestionTemplate(e),
        keep: true
      });
    } else if (e instanceof AuthorizationError) {
      return this.notificationsArea.error({
        text: 'Ошибка авторизации в источнике данных.',
        keep: true
      });
    } else if (e instanceof ConnectionLimitExceededError) {
      return this.notificationsArea.error({
        text: 'Исчерпан лимит доступных соединений.',
        keep: true
      });
    } else if (e instanceof ConnectionError) {
      return this.notificationsArea.error({
        text: 'Ошибка соединения с источником данных.',
        keep: true
      });
    } else if (e instanceof SerializationError) {
      return this.notificationsArea.error({
        text: 'Ошибка сериализации.',
        keep: true
      });
    } else {
      console.error(e);

      return this.notificationsArea.error({
        text: 'Неизвестная ошибка, подробности в консоли.'
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

    if (widgetUpdateFragment.$set) {
      for (const key in widgetUpdateFragment.$set) {
        const prop = key.split('widgets.$.')?.[1];

        if (prop) {
          this.document[prop] = widgetUpdateFragment.$set[key];
        }
      }
    }

    return ppp.user.functions.updateOne(
      {
        collection: 'workspaces'
      },
      {
        _id: ppp.app.params().document,
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

  @observable
  unsupportedInstrument;

  instrumentTraderChanged(o, n) {
    if (this.searchControl) this.searchControl.trader = n;
  }

  /**
   * @description Isolated widget ignores instrumentChanged() callback.
   */
  isolated;

  selectInstrument(symbol, options = {}) {
    if (this.preview && this.container.savedInstrument) {
      this.instrument = this.container.savedInstrument;

      return this.instrument;
    }

    if (!symbol || !this.instrumentTrader) return;

    let adoptedInstrument = unsupportedInstrument(symbol);

    if (this.instrumentTrader.instruments.has(symbol)) {
      adoptedInstrument = this.instrumentTrader.adoptInstrument(
        this.instrumentTrader.instruments.get(symbol)
      );
    } else {
      const [s, exchange] = symbol.split('~');
      const i = this.instrumentTrader.instruments.get(s);

      if (i?.exchange === exchange) {
        adoptedInstrument = this.instrumentTrader.adoptInstrument(i);
      }
    }

    if (options.isolate) {
      this.isolated = true;
      this.instrument = adoptedInstrument;
      this.isolated = false;
    } else {
      this.isolated = false;
      this.instrument = adoptedInstrument;
    }

    return adoptedInstrument;
  }

  instrumentChanged(oldValue, newValue) {
    this.unsupportedInstrument =
      newValue?.notSupported &&
      this.instrumentTrader?.adoptInstrument(newValue).notSupported;

    if (this.searchControl) {
      Observable.notify(this.searchControl, 'widget');
    }

    this.clearFields?.();

    this.$emit('instrumentchange', {
      source: this,
      oldValue,
      newValue
    });

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
              this.groupControl?.selection &&
              w.groupControl?.selection === this.groupControl?.selection
            ) {
              if (typeof w.instrumentTrader !== 'undefined') {
                const adoptedInstrument = w.instrumentTrader.adoptInstrument(
                  this.instrument
                );

                w.instrument = adoptedInstrument;
                w.unsupportedInstrument = adoptedInstrument.notSupported;

                bulkWritePayload.push({
                  updateOne: {
                    filter: {
                      _id: ppp.app.params().document,
                      'widgets.uniqueID': w.document.uniqueID
                    },
                    update: {
                      $set: {
                        'widgets.$.symbol': adoptedInstrument.notSupported
                          ? ''
                          : adoptedInstrument.symbol
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
            _id: ppp.app.params().document,
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

      return ppp.user.functions.bulkWrite(
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
          w?.groupControl?.selection === this.groupControl?.selection &&
          w.instrument
      );

      widgets.forEach((w) => w.setPrice(price));
    }

    return true;
  }
}
