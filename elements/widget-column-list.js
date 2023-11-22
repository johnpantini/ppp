/** @decorator */

import { html, repeat, observable, ref } from '../vendor/fast-element.min.js';
import { COLUMN_SOURCE } from '../lib/const.js';
import { validate } from '../lib/ppp-errors.js';
import {
  ClonableList,
  clonableListStyles,
  defaultDragEndHandler,
  dragControlsTemplate
} from './clonable-list.js';
import './draggable-stack.js';

export const widgetColumnListTemplate = html`
  <template>
    <ppp-draggable-stack
      @pppdragend="${(x) => defaultDragEndHandler(x)}"
      ${ref('dragList')}
    >
      ${repeat(
        (x) => x.list,
        html`
          <div class="control-line draggable main-line">
            ${dragControlsTemplate()}
            <div class="control-stack">
              <ppp-text-field
                column-name
                style="width: 200px;"
                standalone
                ?disabled="${(x) => x.hidden}"
                placeholder="${(column) => column.name || 'Введите имя'}"
                value="${(column) => column.name}"
              ></ppp-text-field>
              <ppp-query-select
                column-trader
                deselectable
                standalone
                ?disabled="${(x, c) =>
                  x.hidden ||
                  (
                    c.parent.mainTraderColumns ?? [
                      COLUMN_SOURCE.INSTRUMENT,
                      COLUMN_SOURCE.SYMBOL,
                      COLUMN_SOURCE.POSITION_AVAILABLE,
                      COLUMN_SOURCE.POSITION_AVERAGE
                    ]
                  ).includes(x.source)}"
                value="${(x) => x.traderId}"
                :preloaded="${(x, c) => {
                  return c.parent?.traders?.find((t) => t._id === x.traderId);
                }}"
                placeholder="Трейдер #1"
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
            </div>
            <div class="control-stack">
              <ppp-select
                column-source
                variant="compact"
                standalone
                ?disabled="${(x) => x.hidden}"
                placeholder="${(x, c) =>
                  ppp.t(`$const.columnSource.${c.source?.source}`)}"
                @change="${(x, c) => {
                  const hidden = (
                    c.parent.mainTraderColumns ?? [
                      COLUMN_SOURCE.INSTRUMENT,
                      COLUMN_SOURCE.SYMBOL,
                      COLUMN_SOURCE.POSITION_AVAILABLE,
                      COLUMN_SOURCE.POSITION_AVERAGE
                    ]
                  ).includes(c.event.detail.value);

                  if (hidden) {
                    c.event.detail.nextElementSibling.setAttribute(
                      'hidden',
                      ''
                    );
                    c.event.detail.parentNode.previousElementSibling.lastElementChild.setAttribute(
                      'hidden',
                      ''
                    );
                  } else {
                    c.event.detail.nextElementSibling.removeAttribute('hidden');
                    c.event.detail.parentNode.previousElementSibling.lastElementChild.removeAttribute(
                      'hidden'
                    );
                  }
                }}"
                value="${(x, c) => c.source?.source}"
              >
                ${repeat(
                  (x, c) =>
                    c.parent.availableColumns ?? Object.keys(COLUMN_SOURCE),
                  html`
                    <ppp-option value="${(x) => COLUMN_SOURCE[x]}">
                      ${(x) => ppp.t(`$const.columnSource.${COLUMN_SOURCE[x]}`)}
                    </ppp-option>
                  `
                )}
              </ppp-select>
              <ppp-query-select
                column-extra-trader
                deselectable
                standalone
                ?disabled="${(x, c) =>
                  x.hidden ||
                  (
                    c.parent.mainTraderColumns ?? [
                      COLUMN_SOURCE.INSTRUMENT,
                      COLUMN_SOURCE.SYMBOL,
                      COLUMN_SOURCE.POSITION_AVAILABLE,
                      COLUMN_SOURCE.POSITION_AVERAGE
                    ]
                  ).includes(x.source)}"
                value="${(x) => x.extraTraderId}"
                :preloaded="${(x, c) => {
                  return c.parent?.traders?.find(
                    (t) => t._id === x.extraTraderId
                  );
                }}"
                placeholder="Трейдер #2"
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
            </div>
          </div>
        `
      )}
    </ppp-draggable-stack>
  </template>
`;

export class WidgetColumnList extends ClonableList {
  @observable
  availableColumns;

  @observable
  mainTraderColumns;

  @observable
  traders;

  constructor() {
    super();

    this.mainTraderColumns = [
      COLUMN_SOURCE.INSTRUMENT,
      COLUMN_SOURCE.SYMBOL,
      COLUMN_SOURCE.POSITION_AVAILABLE,
      COLUMN_SOURCE.POSITION_AVERAGE
    ];
    this.availableColumns = Object.keys(COLUMN_SOURCE);
    this.traders = [];
  }

  async validate() {
    for (const field of Array.from(
      this.dragList.querySelectorAll('ppp-text-field')
    )) {
      await validate(field);
    }
  }

  get value() {
    const columns = [];

    for (const line of Array.from(
      this.dragList.querySelectorAll('.main-line')
    )) {
      const column = {
        source: line.querySelector('[column-source]').value,
        name: line.querySelector('[column-name]').value,
        hidden: !line.querySelector('[visibility-toggle]').checked
      };

      const traderSelect = line.querySelector('[column-trader]:not([hidden])');

      if (traderSelect) {
        column.traderId = traderSelect.value;
      }

      const extraTraderSelect = line.querySelector(
        '[column-extra-trader]:not([hidden])'
      );

      if (extraTraderSelect) {
        column.extraTraderId = extraTraderSelect.value;
      }

      columns.push(column);
    }

    return columns;
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default WidgetColumnList.compose({
  template: widgetColumnListTemplate,
  styles: clonableListStyles
}).define();
