import ppp from '../../../ppp.js';
import { html, Observable, ref } from '../../../vendor/fast-element.min.js';
import { COLUMN_SOURCE, TRADER_CAPS } from '../../../lib/const.js';
import { validate } from '../../../lib/ppp-errors.js';
import { TraderRuntime } from '../../../lib/traders/runtime.js';
import '../../widget-column-list.js';

const DEFAULT_COLUMNS = [
  {
    source: COLUMN_SOURCE.INSTRUMENT
  },
  {
    source: COLUMN_SOURCE.SYMBOL
  },
  {
    source: COLUMN_SOURCE.LAST_PRICE
  },
  {
    source: COLUMN_SOURCE.LAST_PRICE_ABSOLUTE_CHANGE
  },
  {
    source: COLUMN_SOURCE.LAST_PRICE_RELATIVE_CHANGE
  },
  {
    source: COLUMN_SOURCE.BEST_BID
  },
  {
    source: COLUMN_SOURCE.BEST_ASK
  }
].map((column) => {
  column.name = ppp.t(`$const.columnSource.${column.source}`);

  return column;
});

export async function listDefinition() {
  return {
    extraControls: null,
    pagination: false,
    control: class {
      connectedCallback(widget) {
        if (!widget.preview) {
          widget.deletionAvailable = true;

          // A fake one.
          widget.instrumentTrader = {
            adoptInstrument: (i) => i
          };

          this.listener ??= (event) => {
            const { source, newValue: instrument } = event.detail;

            if (source !== widget && widget.groupControl.selection) {
              if (
                instrument &&
                widget.groupControl.selection === source.groupControl?.selection
              ) {
                widget.document.listSource ??= [];

                for (const trader of [
                  source.instrumentTrader,
                  source.level1Trader,
                  source.extraLevel1Trader,
                  source.extraLevel1Trader2
                ]) {
                  const adopted = trader?.adoptInstrument(instrument);

                  if (
                    trader instanceof TraderRuntime &&
                    trader.hasCap(TRADER_CAPS.CAPS_LEVEL1) &&
                    !adopted?.notSupported
                  ) {
                    if (
                      widget.document.listSource.find(
                        (e) => e.symbol === trader.getSymbol(instrument)
                      )
                    ) {
                      return;
                    }

                    let depth = widget.document.depth;

                    if (depth < 1) {
                      depth = 1;
                    }

                    if (typeof depth !== 'number' || depth > 100) {
                      depth = 100;
                    }

                    if (widget.document.listSource.length >= depth) {
                      const ae = widget.slot.assignedElements();
                      const tr = ae[ae.length - 1];
                      const index = parseInt(tr.getAttribute('index'));

                      this.removeRow(index, widget);
                      tr.remove();
                    }

                    const row = {
                      symbol: adopted.symbol,
                      traderId: trader.document._id
                    };

                    widget.document.listSource.push(row);
                    widget.appendRow(row);
                    widget.saveListSource();
                    Observable.notify(widget, 'document');
                  }
                }
              }
            }
          };

          document.addEventListener('instrumentchange', this.listener);
        }

        for (let i = 0; i < widget.document?.listSource?.length ?? 0; i++) {
          widget.appendRow(widget.document.listSource[i], i);
        }
      }

      disconnectedCallback() {
        document.removeEventListener('instrumentchange', this.listener);
      }

      removeRow(index, widget) {
        const arrayIndex = widget.document.listSource.findIndex(
          (payload) => payload.index === index
        );

        if (arrayIndex > -1) {
          widget.document.listSource.splice(arrayIndex, 1);

          if (!widget.preview) {
            widget.saveListSource();
          }

          Observable.notify(widget, 'document');
        }
      }
    },
    validate: async (widget) => {
      await validate(widget.container.depth);

      await validate(widget.container.depth, {
        hook: async (value) => +value >= 1 && +value <= 100,
        errorMessage: 'Введите значение от 1 до 100'
      });
    },
    submit: async (widget) => {
      return {
        depth: +Math.abs(widget.container.depth.value) || 100
      };
    },
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Глубина списка</h5>
          <p class="description">Введите значение от 1 до 100.</p>
        </div>
        <div class="widget-settings-input-group">
          <ppp-text-field
            type="number"
            placeholder="100"
            value="${(x) => x.document.depth ?? 100}"
            ${ref('depth')}
          ></ppp-text-field>
        </div>
      </div>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Столбцы таблицы инструментов</h5>
        </div>
        <div class="spacing2"></div>
        <ppp-widget-column-list
          ${ref('columnList')}
          :stencil="${() => {
            return {
              source: COLUMN_SOURCE.SYMBOL,
              name: ppp.t(`$const.columnSource.${COLUMN_SOURCE.SYMBOL}`)
            };
          }}"
          :mainTraderColumns="${() => Object.values(COLUMN_SOURCE)}"
          :list="${(x) => x.document.columns ?? DEFAULT_COLUMNS}"
          :traders="${(x) => x.document.traders}"
        ></ppp-widget-column-list>
      </div>
    `
  };
}
