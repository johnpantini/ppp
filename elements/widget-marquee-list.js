/** @decorator */

import {
  html,
  repeat,
  observable,
  ref,
  css
} from '../vendor/fast-element.min.js';
import { invalidate, validate } from '../lib/ppp-errors.js';
import {
  ClonableList,
  clonableListStyles,
  defaultDragEndHandler,
  dragControlsTemplate
} from './clonable-list.js';
import { search } from '../static/svg/sprite.js';
import './draggable-stack.js';

export const widgetMarqueeListTemplate = html`
  <template>
    <ppp-draggable-stack
      @pppdragend="${(x) => defaultDragEndHandler(x)}"
      ${ref('dragList')}
    >
      ${repeat(
        (x) => x.list,
        html`
          <div class="control-line draggable draggable-line">
            ${dragControlsTemplate()}
            <div class="control-stack">
              <ppp-query-select
                marquee-trader
                deselectable
                standalone
                ?disabled="${(x) => x.hidden}"
                value="${(x) => x.traderId}"
                :preloaded="${(x, c) => {
                  return c.parent?.traders?.find((t) => t._id === x.traderId);
                }}"
                placeholder="Трейдер L1"
                variant="compact"
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
                :transform="${() => ppp.decryptDocumentsTransformation()}"
              ></ppp-query-select>
              <div class="control-line ticker-search">
                <ppp-text-field
                  marquee-symbol
                  style="width: 200px;"
                  standalone
                  ?disabled="${(x) => x.hidden}"
                  placeholder="${(item) => item.symbol || 'Тикер'}"
                  value="${(item) => item.symbol}"
                ></ppp-text-field>
                <ppp-button
                  ?disabled="${(x) => x.hidden}"
                  class="squared"
                  appearance="default"
                  @click="${async (x, c) => {
                    const cp = c.event.composedPath();
                    const button = cp[0].getRootNode().host;
                    const traderId = button.parentNode.previousElementSibling;
                    const container = c.parent.getRootNode().host;

                    await validate(traderId);
                    await container.requestManualDenormalization();

                    return c.parent.$emit('marqueesearch', {
                      button,
                      trader: await container.denormalization.denormalize(
                        traderId.datum()
                      )
                    });
                  }}"
                >
                  <div class="search-icon">${html.partial(search)}</div>
                </ppp-button>
              </div>
            </div>
            <div class="control-stack">
              <div class="control-line marquee-flags">
                <ppp-checkbox
                  marquee-show-price
                  ?disabled="${(x) => x.hidden}"
                  ?checked="${(x) => x.showPrice ?? true}"
                >
                  Цена
                </ppp-checkbox>
                <ppp-checkbox
                  marquee-show-absolute-change
                  ?disabled="${(x) => x.hidden}"
                  ?checked="${(x) => x.showAbsoluteChange ?? true}"
                >
                  Изм.
                </ppp-checkbox>
                <ppp-checkbox
                  marquee-show-relative-change
                  ?disabled="${(x) => x.hidden}"
                  ?checked="${(x) => x.showRelativeChange ?? true}"
                >
                  Изм., %
                </ppp-checkbox>
              </div>
              <ppp-text-field
                marquee-name
                style="width: 200px;"
                standalone
                ?disabled="${(x) => x.hidden}"
                placeholder="${(item) => item.name || 'Название'}"
                value="${(item) => item.name}"
              ></ppp-text-field>
            </div>
          </div>
        `
      )}
    </ppp-draggable-stack>
  </template>
`;

export const widgetMarqueeListStyles = css`
  ${clonableListStyles}
  .marquee-flags {
    height: 36px;
  }

  [marquee-symbol] {
    text-transform: uppercase;
  }

  .ticker-search {
    gap: 0 4px;
  }

  .search-icon {
    width: 16px;
    height: 16px;
  }
`;

export class WidgetMarqueeList extends ClonableList {
  @observable
  traders;

  constructor() {
    super();

    this.traders = [];
  }

  async validate() {
    for (const line of Array.from(
      this.dragList.querySelectorAll('.draggable-line')
    )) {
      const traderId = line.querySelector('[marquee-trader]');

      await validate(traderId);

      const symbol = line.querySelector('[marquee-symbol]');

      await validate(symbol);

      const realTrader = await ppp.getOrCreateTrader(
        await this.getRootNode().host.denormalization.denormalize(
          traderId.datum()
        )
      );

      if (!realTrader.instruments.has(symbol.value.trim())) {
        invalidate(symbol, {
          errorMessage: 'Тикер не найден в словаре',
          raiseException: true
        });
      }
    }
  }

  get value() {
    const lines = [];

    for (const line of Array.from(
      this.dragList.querySelectorAll('.draggable-line')
    )) {
      lines.push({
        traderId: line.querySelector('[marquee-trader]').value,
        showPrice: line.querySelector('[marquee-show-price]').checked,
        showAbsoluteChange: line.querySelector('[marquee-show-absolute-change]')
          .checked,
        showRelativeChange: line.querySelector('[marquee-show-relative-change]')
          .checked,
        symbol: line.querySelector('[marquee-symbol]').value.trim(),
        name: line.querySelector('[marquee-name]').value.trim(),
        hidden: !line.querySelector('[visibility-toggle]').checked
      });
    }

    return lines;
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default WidgetMarqueeList.compose({
  template: widgetMarqueeListTemplate,
  styles: widgetMarqueeListStyles
}).define();
