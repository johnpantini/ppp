import ppp from '../../../ppp.js';
import { html, ref, Updates } from '../../../vendor/fast-element.min.js';
import { COLUMN_SOURCE } from '../../../lib/const.js';
import { search } from '../../../static/svg/sprite.js';
import '../../widget-column-list.js';
import { validate, invalidate } from '../../../lib/ppp-errors.js';

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

class ListSource {}

export async function listDefinition() {
  return {
    pagination: false,
    validate: async (widget) => {
      await widget.container.columnList.validate();
    },
    source: ListSource,
    submit: async (widget) => {
      return {
        columns: widget.container.columnList.value
      };
    },
    settings: html`
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Выбор инструментов для списка</h5>
          <p class="description">
            Укажите трейдера, после чего нажмите на кнопку поиска. Выбирайте
            инструмент в поисковой строке виджета.
          </p>
        </div>
        <div class="widget-settings-input-group">
          <div class="control-stack widget-ignore-changes">
            <ppp-query-select
              ${ref('level1TraderId')}
              deselectable
              standalone
              placeholder="Трейдер L1"
              variant="compact"
              value="${(x) => x.granary.level1TraderId}"
              :preloaded="${(x, c) => {
                return x.columnList?.traders?.find(
                  (t) => t._id === x.granary.level1TraderId
                );
              }}"
              :context="${(x) => x}"
              :query="${() => {
                return (context) => {
                  return context.services
                    .get('mongodb-atlas')
                    .db('ppp')
                    .collection('traders')
                    .find({
                      caps: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADER_CAPS.CAPS_LEVEL1%]`
                    })
                    .sort({ updatedAt: -1 });
                };
              }}"
              @change="${(x) => {
                x.granary.level1TraderId = x.level1TraderId.value;
              }}"
              :transform="${() => ppp.decryptDocumentsTransformation()}"
            ></ppp-query-select>
            <ppp-button
              appearance="default"
              @click="${async (x) => {
                x.topLoader.start();

                try {
                  await validate(x.level1TraderId);
                  await x.requestManualDenormalization();

                  const trader = await x.denormalization.denormalize(
                    x.level1TraderId.datum()
                  );
                  const widget =
                    x.widgetPreview.shadowRoot.querySelector('ppp-list-widget');

                  if (widget) {
                    try {
                      widget.instrument = void 0;
                      widget.searchControl.suggestInput.value = '';
                      widget.searchControl.reset();

                      widget.instrumentTrader = await ppp.getOrCreateTrader(
                        trader
                      );
                    } catch (e) {
                      widget.catchException(e);

                      return;
                    }

                    widget.searchControl.open = true;

                    const listener = () => {
                      console.log(widget.instrument);

                      widget.searchControl.removeEventListener(
                        'chooseinstrument',
                        listener
                      );

                      widget.pppListLocked = false;

                      widget.container.applyModifications();
                    };

                    if (!widget.pppListLocked) {
                      widget.pppListLocked = true;

                      widget.searchControl.addEventListener(
                        'chooseinstrument',
                        listener
                      );
                    }

                    Updates.enqueue(() => {
                      widget.searchControl.suggestInput.focus();
                    });
                  }
                } finally {
                  x.topLoader.stop();
                }
              }}"
            >
              <span class="icon" slot="end">${html.partial(search)}</span>
              Выбрать инструмент
            </ppp-button>
          </div>
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
          :mainTraderColumns="${(x) => Object.values(COLUMN_SOURCE)}"
          :list="${(x) => x.document.columns ?? DEFAULT_COLUMNS}"
          :traders="${(x) => x.document.traders}"
        ></ppp-widget-column-list>
      </div>
    `
  };
}
