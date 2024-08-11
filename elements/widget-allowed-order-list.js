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

export const widgetAllowedOrderListTemplate = html`
  <template>
    <ppp-draggable-stack
      style="flex-flow: row wrap; gap: 24px 16px;"
      @pppdragend="${(x) => defaultDragEndHandler(x)}"
      ${ref('dragList')}
    >
      ${repeat(
        (x) => x.list,
        html`
          <div
            class="control-line draggable draggable-line"
            style="align-items: center"
          >
            ${dragControlsTemplate()}

            <ppp-query-select
              order-id
              deselectable
              standalone
              ?disabled="${(x) => x.hidden}"
              value="${(x) => x.orderId}"
              :preloaded="${(x, c) => {
                return c.parent?.orders?.find((o) => o._id === x.orderId);
              }}"
              placeholder="Шаблон заявки"
              variant="compact"
              :context="${(x) => x}"
              :query="${() => {
                return (context) => {
                  return context.services
                    .get('mongodb-atlas')
                    .db('ppp')
                    .collection('orders')
                    .find()
                    .sort({ updatedAt: -1 });
                };
              }}"
              :transform="${() => ppp.decryptDocumentsTransformation()}"
            ></ppp-query-select>
          </div>
        `
      )}
    </ppp-draggable-stack>
  </template>
`;

export class WidgetAllowedOrderList extends ClonableList {
  async validate() {
    for (const field of Array.from(
      this.dragList.querySelectorAll('[order-id]')
    )) {
      if (!field.hasAttribute('disabled')) {
        await validate(field);
      }
    }
  }

  get value() {
    const orders = [];

    for (const line of Array.from(
      this.dragList.querySelectorAll('.draggable-line')
    )) {
      orders.push({
        orderId: line.querySelector('[order-id]').value,
        hidden: !line.querySelector('[visibility-toggle]').checked
      });
    }

    return orders;
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default WidgetAllowedOrderList.compose({
  template: widgetAllowedOrderListTemplate,
  styles: clonableListStyles
}).define();
