/** @decorator */

import { widgetStyles, WidgetWithInstrument } from '../widget.js';
import {
  html,
  css,
  ref,
  observable,
  repeat,
  when,
  Updates
} from '../../vendor/fast-element.min.js';
import { COLUMN_SOURCE, WIDGET_TYPES } from '../../lib/const.js';
import { WidgetColumns } from '../widget-columns.js';
import { normalize } from '../../design/styles.js';
import { $debounce } from '../../lib/ppp-decorators.js';
import {
  fontSizeWidget,
  monospaceFont,
  paletteGrayBase,
  paletteGrayLight1,
  themeConditional
} from '../../design/design-tokens.js';
import {
  StaleInstrumentCacheError,
  NoInstrumentsError
} from '../../lib/ppp-exceptions.js';
import { invalidate } from '../../lib/ppp-errors.js';
import '../button.js';
import '../checkbox.js';
import '../radio-group.js';
import '../tabs.js';
import '../text-field.js';
import '../widget-controls.js';
import '../widget-marquee-list.js';

const DEFAULT_MARQUEE = [
  {
    name: '',
    hidden: true
  }
];

export const marqueeWidgetTemplate = html`
  <template ensemble="disabled">
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <ppp-widget-group-control></ppp-widget-group-control>
          <ppp-widget-search-control
            readonly
            ?hidden="${(x) => !x.preview}"
          ></ppp-widget-search-control>
          <div class="root">
            <div class="inner">
              <div
                class="line"
                @pointerdown="${(x, { event }) => x.handleLineClick(event)}"
              >
                ${when(
                  (x) => x.syncNeeded,
                  html`
                    <ppp-button
                      appearance="primary"
                      class="xsmall"
                      @click="${async (x) => {
                        x.container.beginOperation();

                        try {
                          await x.traderError.trader.syncDictionary(
                            x.traderError
                          );
                        } finally {
                          window.location.reload();
                        }
                      }}"
                    >
                      Синхронизация
                    </ppp-button>
                  `
                )}
                ${when(
                  (x) => x.importNeeded,
                  html`
                    <ppp-button
                      appearance="primary"
                      class="xsmall"
                      @click="${(x) => {
                        x.notificationsArea.openInstrumentsImport(
                          x.traderError.trader
                        );
                      }}"
                    >
                      Импорт
                    </ppp-button>
                  `
                )}
                ${repeat(
                  (x) => x.marquee ?? [],
                  html`
                    <div
                      class="item"
                      symbol="${(x) => x.symbol}"
                      index="${(x, c) => c.index}"
                    >
                      <span class="widget-title">
                        <span class="symbol">${(x) => x.name || x.symbol}</span>
                        <span
                          ?hidden="${(x) => !x.showPrice}"
                          :trader="${(x) => x.pppTrader}"
                          :payload="${(x, c) => ({
                            instrument: x.pppTrader?.instruments?.get(x.symbol)
                          })}"
                          :column="${(x, c) =>
                            c.parent.columnsBySource.get(
                              COLUMN_SOURCE.LAST_PRICE
                            )}"
                          class="price"
                        >
                          ${(x, c) =>
                            c.parent.columns.columnElement(
                              c.parent.columnsBySource.get(
                                COLUMN_SOURCE.LAST_PRICE
                              )
                            )}
                        </span>
                        <span
                          ?hidden="${(x) => !x.showAbsoluteChange}"
                          :trader="${(x) => x.pppTrader}"
                          :payload="${(x) => ({
                            instrument: x.pppTrader?.instruments?.get(x.symbol)
                          })}"
                          :column="${(x, c) =>
                            c.parent.columnsBySource.get(
                              COLUMN_SOURCE.LAST_PRICE_ABSOLUTE_CHANGE
                            )}"
                          class="price"
                        >
                          ${(x, c) =>
                            c.parent.columns.columnElement(
                              c.parent.columnsBySource.get(
                                COLUMN_SOURCE.LAST_PRICE_ABSOLUTE_CHANGE
                              )
                            )}
                        </span>
                        <span
                          ?hidden="${(x) => !x.showRelativeChange}"
                          :trader="${(x) => x.pppTrader}"
                          :payload="${(x) => ({
                            instrument: x.pppTrader?.instruments?.get(x.symbol)
                          })}"
                          :column="${(x, c) =>
                            c.parent.columnsBySource.get(
                              COLUMN_SOURCE.LAST_PRICE_RELATIVE_CHANGE
                            )}"
                          class="price"
                        >
                          ${(x, c) =>
                            c.parent.columns.columnElement(
                              c.parent.columnsBySource.get(
                                COLUMN_SOURCE.LAST_PRICE_RELATIVE_CHANGE
                              )
                            )}
                        </span>
                      </span>
                    </div>
                  `,
                  { positioning: true }
                )}
              </div>
            </div>
          </div>
          <ppp-widget-header-buttons
            ensemble="disabled"
          ></ppp-widget-header-buttons>
        </div>
      </div>
      <div class="widget-body">
        <ppp-widget-notifications-area hidden></ppp-widget-notifications-area>
      </div>
      <ppp-widget-resize-controls
        :ignoredHandles="${(x) => x.getIgnoredHandles()}"
      ></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const marqueeWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
  .root {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  .inner {
    position: absolute;
    padding: 0 8px;
    width: max-content;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .line {
    display: flex;
    align-items: center;
    gap: 0 12px;
  }

  .item {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-family: ${monospaceFont};
  }

  .item > .widget-title {
    font-size: calc(${fontSizeWidget} + 1px);
    margin-right: unset;
  }

  .item > .symbol {
    margin-right: 6px;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
    font-feature-settings: 'tnum';
    word-wrap: break-word;
    font-size: ${fontSizeWidget};
    line-height: 20px;
    font-weight: 400;
    letter-spacing: 0;
  }

  .item > .price {
    font-weight: bold;
  }

  .widget-header::after {
    border-bottom: none;
  }
`;

export class MarqueeWidget extends WidgetWithInstrument {
  @observable
  marquee;

  @observable
  importNeeded;

  @observable
  syncNeeded;

  traderError;

  /**
   * @type {WidgetColumns}
   */
  @observable
  columns;

  columnsBySource = new Map();

  constructor() {
    super();

    this.marquee = [];

    this.onWindowResize = this.onWindowResize.bind(this);
    this.recalculateDimensionsDelayed = $debounce(
      this.recalculateDimensions,
      100
    );
  }

  catchException(e) {
    if (e instanceof NoInstrumentsError) {
      this.traderError = e;
      this.importNeeded = true;

      return;
    } else if (e instanceof StaleInstrumentCacheError) {
      this.traderError = e;
      this.syncNeeded = true;

      return;
    }

    return super.catchException(e);
  }

  handleLineClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const cp = event.composedPath();
    const node = cp.find((n) => n?.hasAttribute?.('symbol'));

    if (node) {
      const marqueeItem = this.marquee[parseInt(node.getAttribute('index'))];

      if (marqueeItem?.pppTrader) {
        this.instrumentTrader = marqueeItem.pppTrader;
        this.selectInstrument(marqueeItem.symbol);
      }
    }
  }

  recalculateDimensions() {
    const { left } = getComputedStyle(this);

    if (this.document.snapToLeft) {
      this.style.left = '0';
    }

    if (this.document.snapToRight) {
      this.style.width = `calc(100% - ${
        this.document.snapToLeft ? '0px' : left
      })`;
    }
  }

  onWindowResize() {
    return this.recalculateDimensionsDelayed();
  }

  getIgnoredHandles() {
    const always = ['top', 'bottom', 'ne', 'se', 'nw', 'sw'];

    if (this.document.snapToLeft) {
      always.push('left');
    }

    if (this.document.snapToRight) {
      always.push('right');
    }

    return always;
  }

  async connectedCallback() {
    try {
      super.connectedCallback();

      this.style.overflow = 'unset';

      window.addEventListener('resize', this.onWindowResize);
      this.recalculateDimensions();

      this.columns = new WidgetColumns({
        columns: [
          {
            source: COLUMN_SOURCE.LAST_PRICE,
            highlightChanges: this.document.highlightLastPriceChanges
          },
          {
            source: COLUMN_SOURCE.LAST_PRICE_ABSOLUTE_CHANGE
          },
          {
            source: COLUMN_SOURCE.LAST_PRICE_RELATIVE_CHANGE
          }
        ]
      });

      await this.columns.registerColumns();

      this.columns.array.forEach((column) => {
        this.columnsBySource.set(column.source, column);
      });

      for (const m of this.document.marquee ?? []) {
        if (m.hidden) {
          continue;
        }

        const denormalized = await this.container.denormalization.denormalize(
          m
        );
        const trader = await ppp.getOrCreateTrader(denormalized.trader);

        denormalized.pppTrader = trader;

        this.marquee.push(denormalized);
      }
    } catch (e) {
      return this.catchException(e);
    }
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.onWindowResize);
    super.disconnectedCallback();
  }

  afterResize() {
    this.recalculateDimensions();
  }

  afterDrag() {
    this.recalculateDimensions();
  }

  async validate() {
    await this.container.marqueeList.validate();
  }

  async submit() {
    return {
      $set: {
        snapToLeft: this.container.snapToLeft.checked,
        snapToRight: this.container.snapToRight.checked,
        marquee: this.container.marqueeList.value,
        highlightLastPriceChanges:
          this.container.highlightLastPriceChanges.checked
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.MARQUEE,
    collection: 'PPP',
    title: html`Строка котировок`,
    description: html`Виджет
      <span class="positive">Строка котировок</span> служит для отображения
      котировок инструментов в виде компактной строки.`,
    customElement: MarqueeWidget.compose({
      template: marqueeWidgetTemplate,
      styles: marqueeWidgetStyles
    }).define(),
    minWidth: 115,
    minHeight: 32,
    defaultWidth: 360,
    settings: html`
      <ppp-tabs activeid="main">
        <ppp-tab id="instruments">Инструменты</ppp-tab>
        <ppp-tab id="ui">UI</ppp-tab>
        <ppp-tab-panel id="instruments-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Список инструментов</h5>
            </div>
            <div class="spacing2"></div>
            <ppp-widget-marquee-list
              @marqueesearch="${async (x, c) => {
                const { event, source } = c;
                const button = event.detail.button;
                const symbol = button.previousElementSibling;
                const trader = event.detail.trader;
                const widget =
                  source.widgetPreview.shadowRoot.querySelector(
                    'ppp-marquee-widget'
                  );

                if (widget) {
                  widget.searchControl.reset();

                  try {
                    widget.instrumentTrader = await ppp.getOrCreateTrader(
                      trader
                    );
                  } catch (e) {
                    if (e instanceof NoInstrumentsError) {
                      widget.importNeeded = true;
                      widget.traderError = e;

                      invalidate(ppp.app.toast, {
                        errorMessage:
                          'Один или более трейдеров требуют импортировать инструменты кнопкой в заголовке виджета. Затем обновите страницу.'
                      });

                      return;
                    }
                  }

                  widget.searchControl.open = true;

                  const listener = () => {
                    symbol.value = widget.instrument?.symbol ?? '';

                    widget.searchControl.removeEventListener(
                      'chooseinstrument',
                      listener
                    );

                    widget.pppMarqueeLocked = false;

                    widget.container.applyModifications();
                  };

                  if (!widget.pppMarqueeLocked) {
                    widget.pppMarqueeLocked = true;

                    widget.searchControl.addEventListener(
                      'chooseinstrument',
                      listener
                    );
                  }

                  Updates.enqueue(() =>
                    widget.searchControl.suggestInput.focus()
                  );
                }
              }}}"
              ${ref('marqueeList')}
              :stencil="${() => {
                return {};
              }}"
              :list="${(x) => x.document.marquee ?? DEFAULT_MARQUEE}"
              :traders="${(x) => x.document.traders}"
            ></ppp-widget-marquee-list>
          </div>
        </ppp-tab-panel>
        <ppp-tab-panel id="ui-panel">
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Прилипание к краю окна</h5>
            </div>
            <div class="widget-settings-input-group">
              <div class="control-stack">
                <ppp-checkbox
                  ?checked="${(x) => x.document.snapToLeft}"
                  ${ref('snapToLeft')}
                >
                  Слева
                </ppp-checkbox>
                <ppp-checkbox
                  ?checked="${(x) => x.document.snapToRight}"
                  ${ref('snapToRight')}
                >
                  Справа
                </ppp-checkbox>
              </div>
            </div>
          </div>
          <div class="widget-settings-section">
            <div class="widget-settings-label-group">
              <h5>Интерфейс</h5>
            </div>
            <div class="widget-settings-input-group">
              <div class="control-stack">
                <ppp-checkbox
                  ?checked="${(x) => x.document.highlightLastPriceChanges}"
                  ${ref('highlightLastPriceChanges')}
                >
                  Выделять изменения цены цветом
                </ppp-checkbox>
              </div>
            </div>
          </div>
        </ppp-tab-panel>
      </ppp-tabs>
    `
  };
}
