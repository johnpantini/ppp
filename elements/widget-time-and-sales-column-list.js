/** @decorator */

import { html, repeat, ref } from '../vendor/fast-element.min.js';
import { validate } from '../lib/ppp-errors.js';
import {
  ClonableList,
  clonableListStyles,
  defaultDragEndHandler,
  dragControlsTemplate
} from './clonable-list.js';
import './draggable-stack.js';
import './query-select.js';

export const widgetTimeAndSalesColumnListTemplate = html`
  <template>
    <ppp-draggable-stack
      @pppdragend="${(x) => defaultDragEndHandler(x)}"
      ${ref('dragList')}
    >
      ${repeat(
        (x) => x.list,
        html`
          <div
            class="control-line draggable draggable-line"
            :column="${(x) => x}"
          >
            ${dragControlsTemplate({
              add: false,
              remove: false
            })}
            <ppp-text-field
              column-name
              style="width: 200px;"
              standalone
              ?disabled="${(column) => column.hidden}"
              placeholder="${(column) =>
                ppp.t(`$timeAndSalesWidget.columns.${column.source}`)}"
              value="${(column) => column.name}"
            ></ppp-text-field>
            <ppp-select
              column-source
              variant="compact"
              standalone
              disabled
              value="${(column) => column.source ?? 'price'}"
            >
              <ppp-option value="price">
                ${() => ppp.t('$timeAndSalesWidget.columns.price')}
              </ppp-option>
              <ppp-option value="volume">
                ${() => ppp.t('$timeAndSalesWidget.columns.volume')}
              </ppp-option>
              <ppp-option value="amount">
                ${() => ppp.t('$timeAndSalesWidget.columns.amount')}
              </ppp-option>
              <ppp-option value="time">
                ${() => ppp.t('$timeAndSalesWidget.columns.time')}
              </ppp-option>
              <ppp-option value="pool">
                ${() => ppp.t('$timeAndSalesWidget.columns.pool')}
              </ppp-option>
            </ppp-select>
          </div>
        `
      )}
    </ppp-draggable-stack>
  </template>
`;

export class WidgetTimeAndSalesColumnList extends ClonableList {
  async validate() {
    for (const field of Array.from(
      this.dragList.querySelectorAll('[column-name]')
    )) {
      await validate(field);
    }
  }

  get value() {
    const columns = [];

    for (const line of Array.from(
      this.dragList.querySelectorAll('.draggable-line')
    )) {
      columns.push({
        name: line.querySelector('[column-name]').value,
        width: line.column.width,
        source: line.querySelector('[column-source]').value,
        hidden: !line.querySelector('[visibility-toggle]').checked
      });
    }

    return columns;
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default WidgetTimeAndSalesColumnList.compose({
  template: widgetTimeAndSalesColumnListTemplate,
  styles: clonableListStyles
}).define();
