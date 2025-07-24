/** @decorator */

import ppp from '../ppp.js';
import { PPPElement } from '../lib/ppp-element.js';
import {
  attr,
  css,
  html,
  Observable,
  observable,
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
  createThemed,
  lineHeightBody1,
  fontWeightBody1,
  fontSizeBody1,
  buy,
  sell
} from '../design/design-tokens.js';
import { unsupportedInstrument } from '../lib/traders/trader-worker.js';
import {
  AuthorizationError,
  ConnectionError,
  ConnectionLimitExceededError,
  NoInstrumentsError,
  TraderTrinityError,
  StaleInstrumentCacheError,
  ValidationError,
  FetchError
} from '../lib/ppp-errors.js';
import { WidgetColumns } from './widget-columns.js';
import { $debounce } from '../lib/ppp-decorators.js';

await ppp.i18n(import.meta.url);

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

export const widgetDefaultHeaderTemplate = (options = {}) => html`
  <div class="widget-header">
    <div class="widget-header-inner">
      <ppp-widget-group-control
        ?hidden="${(x) => !x.instrumentTrader}"
      ></ppp-widget-group-control>
      <ppp-widget-search-control
        ?hidden="${(x) => !x.instrumentTrader}"
      ></ppp-widget-search-control>
      <span class="widget-title">
        <span class="title">${(x) => x.document?.name ?? ''}</span>
      </span>
      <ppp-widget-header-buttons>
        ${options.buttons}
      </ppp-widget-header-buttons>
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
      @change="${(x) => {
        x.switchEnsemble();
        x.syncEnsemble();
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

export const widgetDefaultEmptyStateTemplate = () => html`
  <ppp-widget-empty-state-control loading ?hidden="${(x) => x.initialized}">
    ${() => ppp.t('$widget.emptyState.loading')}
  </ppp-widget-empty-state-control>
  <ppp-widget-empty-state-control
    ?hidden="${(x) => {
      if (!x.instrumentTrader || !x.initialized) {
        return true;
      } else {
        if (x.allowEmptyInstrument) {
          return true;
        }

        return x.instrument;
      }
    }}"
  >
    ${() => ppp.t('$widget.emptyState.selectInstrument')}
  </ppp-widget-empty-state-control>
  <ppp-widget-empty-state-control
    ?hidden="${(x) => {
      if (!x.instrumentTrader || !x.initialized || !x.instrument) {
        return true;
      } else {
        return !x.unsupportedInstrument;
      }
    }}"
  >
    ${() => ppp.t('$widget.emptyState.unsupportedInstrument')}
  </ppp-widget-empty-state-control>
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

  .widget-table .tfoot {
    display: table-footer-group;
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
    overflow: hidden;
    font-weight: ${fontWeightWidget};
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
  }

  .widget-table .th {
    font-weight: 500;
  }

  .widget-table .cell {
    text-align: right;
    padding: 4px 8px;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    position: relative;
    vertical-align: middle;
    ${ellipsis()};
  }

  .widget-table th,
  .widget-table .th {
    text-align: right;
    position: sticky;
    z-index: 100;
    height: 26px;
    padding: 2px 8px;
    white-space: nowrap;
    cursor: pointer;
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark2)};
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    border-bottom: 1px solid
      var(--palette-gray-light-2-with-palette-gray-dark-1);
  }

  .widget-table thead .th,
  .widget-table .thead .th {
    top: 0;
  }

  .widget-table thead .th:hover,
  .widget-table .thead .th:hover {
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight2)};
  }

  .widget-table tfoot .th,
  .widget-table .tfoot .th {
    bottom: 0;
    cursor: default;
  }

  .widget-table th.empty,
  .widget-table .th.empty {
    width: auto;
    padding: 0;
    min-width: 3px;
  }

  .widget-table th .resize-handle,
  .widget-table .th .resize-handle {
    position: absolute;
    width: 16px;
    height: 100%;
    left: 0;
    top: 0;
    opacity: 0;
    cursor: col-resize;
    z-index: 100;
  }

  .widget-table th:first-child .resize-handle,
  .widget-table .th:first-child .resize-handle {
    display: none;
  }

  .widget-table th .resize-handle::before,
  .widget-table .th .resize-handle::before {
    position: absolute;
    content: '';
    background: ${paletteBlueLight1};
    width: 3px;
    height: 26px;
    left: 0;
  }

  .widget-table th:first-child .resize-handle::before,
  .widget-table .th:first-child .resize-handle::before {
    left: 0;
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

  .widget-table .cell ppp-button {
    position: absolute;
    z-index: 10;
    right: 0;
    top: 3px;
  }

  .widget-table .cell:first-of-type {
    text-align: left;
  }

  .widget-table:not(.list-table) .row:nth-of-type(2n),
  .tr.even {
    background-color: ${themeConditional(
      lighten(paletteGrayLight3, 1),
      paletteGrayDark2
    )};
  }

  .widget-table .row,
  .widget-table .total {
    position: relative;
  }

  .widget-table .row:hover {
    background-color: ${themeConditional(
      lighten(paletteGrayLight2, 5),
      darken(paletteGrayDark1, 10)
    )} !important;
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

  .widget-table .row[positive] td,
  .widget-table .row[positive] .td {
    background-color: rgba(${toColorComponents(buy)}, 0.2);
  }

  .widget-table .row[negative] td,
  .widget-table .row[negative] .td {
    background-color: rgba(${toColorComponents(sell)}, 0.2);
  }

  .widget-table .row[earth] td,
  .widget-table .row[earth] .td {
    background-color: rgba(
      ${toColorComponents(
        themeConditional(paletteYellowLight2, paletteYellowDark2)
      )},
      0.2
    );
  }
`;

export const widgetCommonColors = () => css`
  .positive {
    color: ${positive} !important;
  }

  .negative {
    color: ${negative} !important;
  }

  .earth {
    color: ${themeConditional(paletteYellowDark2, paletteYellowLight2)};
  }

  .ocean {
    color: ${themeConditional(paletteBlueDark2, paletteBlueLight2)};
  }

  .alien {
    color: ${themeConditional(palettePurpleDark2, palettePurpleLight2)};
  }
`;

export const widgetCommonContentStyles = () => css`
  ${widgetCommonColors()}
  .header-search-input {
    cursor: text;
    padding: 0 10px;
    font-family: ${bodyFont};
    font-size: ${fontSizeWidget};
    font-weight: ${fontWeightWidget};
    line-height: ${lineHeightWidget};
    text-align: left;
    width: 120px;
    margin: 0 8px;
    height: 20px;
    border-radius: 2px;
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
    border: 1px solid ${themeConditional(paletteGrayLight1, paletteGrayDark1)};
    color: ${themeConditional(paletteBlack, paletteGrayLight1)};
    ${ellipsis()};
  }

  .header-search-input::placeholder {
    color: ${themeConditional(
      paletteGrayLight1,
      darken(paletteGrayLight1, 60)
    )};
  }

  .dot-line {
    align-items: center;
    justify-content: right;
  }

  .dot-divider-line {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0px ${spacing1};
  }

  .subtitle-rows {
    display: flex;
    flex-direction: column;
    gap: 1px 0;
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
    align-items: flex-start;
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

  .widget-text-label-icon {
    cursor: pointer;
    display: flex;
    width: 16px;
    height: 16px;
    margin-top: 2px;
  }

  .widget-text-label:has(.widget-text-label-icon) {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${spacing1};
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
    gap: 0 ${spacing2};
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .widget-summary-line span {
    overflow: hidden;
    white-space: nowrap;
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
    margin-bottom: 8px;
  }

  ${scrollbars('.widget-card-list')}

  .widget-card-list-inner {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    gap: 8px;
  }

  .widget-card-holder {
    margin: 0 8px;
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

  .widget-action-icon {
    width: 16px;
    height: 16px;
  }

  .widget-action-button span svg,
  .widget-action-icon svg {
    width: 16px;
    height: 16px;
  }

  .widget-action-button.positive svg rect,
  .widget-action-button.positive svg path {
    fill: ${positive};
  }

  .widget-action-button.negative svg rect,
  .widget-action-button.negative svg path {
    fill: ${negative};
  }

  .widget-action-button.earth svg rect,
  .widget-action-button.earth svg path {
    fill: ${themeConditional(paletteYellowDark2, paletteYellowLight2)};
  }

  .widget-action-button.ocean svg rect,
  .widget-action-button.ocean svg path {
    fill: ${themeConditional(paletteBlueDark2, paletteBlueLight2)};
  }

  .widget-action-button.alien svg rect,
  .widget-action-button.alien svg path {
    fill: ${themeConditional(palettePurpleDark2, palettePurpleLight2)};
  }

  .control-line {
    display: flex;
    flex-direction: row;
    gap: ${spacing1} ${spacing2};
  }

  .control-line.centered {
    align-items: center;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    position: relative;
  }

  .dot::before {
    content: '';
    position: absolute;
    display: inline-block;
    border-radius: 50%;
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

  ppp-badge {
    height: 16px;
    font-size: calc(${fontSizeWidget} - 1px);
    line-height: 14px;
    font-weight: ${fontWeightWidget};
  }

  .widget-section-h1 {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
  }

  .widget-section-h1 > span {
    word-wrap: break-word;
    font-size: ${fontSizeBody1};
    line-height: ${lineHeightBody1};
    font-weight: ${fontWeightBody1};
    letter-spacing: 0;
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight1)};
    margin-right: 8px;
    ${ellipsis()};
  }
`;

export const widgetStyles = () => css`
  ${display('inline-flex')}
  ${scrollbars('.widget-body')}
  ${widgetTableStyles()}  
  ${widgetCommonContentStyles()}
  .widget-root {
    display: flex;
    flex-direction: column;
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
    cursor: move;
    flex-shrink: 0;
    padding: 0 ${spacing1};
    font-size: ${fontSizeWidget};
    background: ${themeConditional(darken(paletteGrayLight3, 5), paletteBlack)};
    align-items: center;
    justify-content: space-between;
    z-index: 5;
  }

  :host([preview]) .widget-header,
  :host([locked]) .widget-header {
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
    gap: 0 ${spacing1};
  }

  .widget-body {
    display: flex;
    position: relative;
    flex-direction: column;
    flex-shrink: 1;
    height: 100%;
    overflow: auto;
  }

  .widget-body-inner {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  ${scrollbars('.widget-body-inner')}

  .widget-flex-column-content {
    display: flex;
    position: relative;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .widget-header ppp-widget-group-control {
    flex: 0 0 16px;
  }

  .widget-header ppp-widget-search-control {
    height: 20px;
  }

  .widget-title {
    display: flex;
    align-items: center;
    gap: 0 ${spacing2};
    font-size: ${fontSizeWidget};
    font-weight: 500;
    line-height: ${lineHeightWidget};
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    white-space: nowrap;
    overflow: hidden;
    flex-grow: 1;
    padding: 0 ${spacing1};
  }

  .widget-title > .title {
    ${ellipsis()};
  }

  .widget-footer {
    padding: 8px 0;
    position: relative;
  }

  .widget-toolbar {
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
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

export class Widget extends PPPElement {
  sourceID;

  @attr({ mode: 'boolean' })
  dragging;

  @attr({ mode: 'boolean' })
  loading;

  @attr({ mode: 'boolean' })
  resizing;

  @attr({ mode: 'boolean' })
  locked;

  @attr({ attribute: 'column-resizing', mode: 'boolean' })
  columnResizing;

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
    this.saveColumns = $debounce(this.#saveColumns.bind(this), 250);
    this.$$debug = ppp.$debug('widget');
  }

  connectedCallback() {
    this.container = this.getRootNode().host;
    this.container.widgetElement = this;
    this.widgetDefinition ??= this.container.widgetDefinition;
    this.locked = this.container.document.allowLockedWidgets;

    super.connectedCallback();

    this.sourceID = ppp.nextSourceID('W');

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

      this.style.maxHeight = '512px';
      this.style.maxWidth = '544px';
      this.style.minHeight = `${this.widgetDefinition.minHeight ?? 120}px`;

      if (this.container.savedHeight > 0)
        this.style.height = `${this.container.savedHeight}px`;
      else {
        this.style.height = this.widgetDefinition.defaultHeight
          ? `${this.widgetDefinition.defaultHeight}px`
          : `${this.widgetDefinition.minHeight ?? 120}px`;
      }

      this.document = this.container.document;
      this.topLoader = this.container.topLoader;

      if (this.container.mounted) {
        this.document.symbol = ppp.app.mountPoint.widget?.instrument?.symbol;

        Observable.notify(this, 'document');
      }
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

  switchEnsemble() {
    this.document.activeWidgetLink = this.stackSelectorTabs.activeid;

    const bulkWritePayload = [
      {
        updateOne: {
          filter: {
            _id: this.container.document._id,
            'widgets.uniqueID': this.document.uniqueID
          },
          update: {
            $set: {
              'widgets.$.activeWidgetLink': this.document.activeWidgetLink
            }
          }
        }
      }
    ];

    for (const link of this.document.linkedWidgets ?? []) {
      const w = this.container.widgets.find(
        (w) => w.document.uniqueID === link
      );

      if (w) {
        w.document.activeWidgetLink = this.document.activeWidgetLink;

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
                'widgets.$.activeWidgetLink': this.document.activeWidgetLink
              }
            }
          }
        });
      }
    }

    this.restack();

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

  syncEnsemble() {
    const container = this.container;

    if (container.document.ensembleMode !== 'default') {
      container.widgets.forEach((w) => {
        if (container.document.ensembleMode === 'group') {
          const g1 = this.groupControl?.selection ?? '';
          const g2 = w.groupControl?.selection ?? '';

          if (g1 !== g2) {
            return;
          }
        }

        if (w !== this && !w.hasAttribute('hidden')) {
          const tabs = w.stackSelectorTabs;

          if (tabs && !tabs.parentNode.hasAttribute('hidden')) {
            const neededIndex = this.stackSelectorTabs.tabs.findIndex((t) => {
              return t.id === this.stackSelectorTabs.activeid;
            });

            if (
              neededIndex > -1 &&
              w.stackSelectorTabs.tabs.length >= neededIndex + 1
            ) {
              w.stackSelectorTabs.activeid =
                w.stackSelectorTabs.tabs[neededIndex].id;

              w.switchEnsemble();
            }
          }
        }
      });
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

  #saveColumns() {
    !this.preview &&
      ppp.user.functions.updateOne(
        {
          collection: 'workspaces'
        },
        {
          _id: this.container.document._id,
          'widgets.uniqueID': this.document.uniqueID
        },
        {
          $set: {
            'widgets.$.columns': this.document.columns
          }
        }
      );
  }

  beginPossibleColumnResize({ event }) {
    if (this.columns instanceof WidgetColumns || Array.isArray(this.columns)) {
      event.preventDefault();
      event.stopPropagation();

      const handle = event.composedPath()[0];

      if (handle?.classList?.contains?.('resize-handle')) {
        const th = handle.parentNode.previousElementSibling;

        if (th) {
          this.columnResizing = true;

          const x = event.clientX;
          const initialWidth = parseInt(th.style.width);

          const temporaryListener = (e) => {
            if (e.type === 'pointermove') {
              const delta = e.clientX - x;
              const newWidth = Math.max(32, initialWidth + delta);

              th.style.width = `${newWidth}px`;
              th.column.width = newWidth;

              if (Array.isArray(this.document.columns)) {
                // For custom lists like T&S.
                if (typeof th.column.index !== 'number') {
                  th.column.index = this.document.columns.findIndex(
                    (c) => c === th.column
                  );
                }

                this.document.columns[th.column.index].width = newWidth;

                this.saveColumns();
                this.$emit('columnresize', this);
              }
            } else {
              document.removeEventListener('pointermove', temporaryListener);
              document.removeEventListener('pointerup', temporaryListener);
              document.removeEventListener('pointercancel', temporaryListener);

              this.columnResizing = false;
            }
          };

          document.addEventListener('pointermove', temporaryListener);
          document.addEventListener('pointerup', temporaryListener);
          document.addEventListener('pointercancel', temporaryListener);
        }
      }
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
    this.$$debug('[%s] catchException -> %o', this.document.name, e);

    if (e instanceof NoInstrumentsError) {
      return this.notificationsArea.note({
        title: e.trader.document.name,
        text: importInstrumentsSuggestionTemplate(e),
        keep: true
      });
    } else if (e instanceof StaleInstrumentCacheError) {
      return this.notificationsArea.note({
        title: e.trader.document.name,
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
    } else if (e instanceof TraderTrinityError) {
      return this.notificationsArea.error({
        text: 'Трейдер не загружается (проверьте URL).',
        keep: true
      });
    } else if (e instanceof ValidationError) {
      return this.notificationsArea.error({
        text: 'Ошибка валидации данных.',
        keep: true
      });
    } else if (e instanceof FetchError) {
      return this.notificationsArea.error({
        text: 'Ошибка сетевого запроса.',
        keep: true
      });
    } else if (e?.name === 'ConflictError') {
      if (e.message === 'E_TRADER_IS_CLOSED') {
        return this.notificationsArea.error({
          text: 'Трейдер сейчас не работает.'
        });
      }
    } else if (e?.name === 'InternalServerError') {
      return this.notificationsArea.error({
        text: 'Ошибка на стороне сервера.'
      });
    } else {
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

  instrumentChanged(oldValue, newValue) {
    this.unsupportedInstrument =
      newValue?.notSupported &&
      this.instrumentTrader?.adoptInstrument(newValue).notSupported;

    if (this.searchControl) {
      Observable.notify(this.searchControl, 'widget');
    }

    this.clearFields?.();

    this.mayShowContent = this.#updateMayShowContent();

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

                w.instrument =
                  typeof this.instrument === 'undefined'
                    ? this.instrument
                    : adoptedInstrument;
                w.unsupportedInstrument = adoptedInstrument?.notSupported;

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

  @observable
  initialized;

  initializedChanged() {
    this.mayShowContent = this.#updateMayShowContent();
  }

  @observable
  instrumentTrader;

  instrumentTraderChanged(o, n) {
    if (this.searchControl) this.searchControl.trader = n;

    this.mayShowContent = this.#updateMayShowContent();
  }

  @observable
  unsupportedInstrument;

  unsupportedInstrumentChanged() {
    this.mayShowContent = this.#updateMayShowContent();
  }

  @observable
  mayShowContent;

  #updateMayShowContent() {
    if (this.allowEmptyInstrument) {
      return this.initialized && !this.unsupportedInstrument;
    }

    return (
      this.initialized &&
      this.instrumentTrader &&
      this.instrument &&
      !this.unsupportedInstrument
    );
  }

  /**
   * @description Isolated widget ignores instrumentChanged() callback.
   */
  isolated;

  constructor() {
    super();

    this.mayShowContent = false;
  }

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
