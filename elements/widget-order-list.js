/** @decorator */

import { html, repeat, ref } from '../vendor/fast-element.min.js';
import { validate } from '../lib/ppp-errors.js';
import {
  ClonableList,
  clonableListStyles,
  defaultDragEndHandler,
  dragControlsTemplate
} from './clonable-list.js';
import { getTraderSelectOptionColor } from '../design/styles.js';
import './draggable-stack.js';
import './query-select.js';

export const widgetOrderListTemplate = html`
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
              <ppp-text-field
                order-name
                style="width: 200px;"
                standalone
                ?disabled="${(x) => x.hidden}"
                placeholder="Название"
                value="${(order) => order.name}"
              ></ppp-text-field>
              <ppp-query-select
                trader1-id
                deselectable
                standalone
                ?disabled="${(x) => x.hidden}"
                value="${(order) => order.trader1Id}"
                :preloaded="${(x, c) => {
                  return c.parent?.traders?.find((t) => t._id === x.trader1Id);
                }}"
                :displayValueFormatter="${() => (item) =>
                  html`
                    <span style="color:${getTraderSelectOptionColor(item)}">
                      ${item?.name}
                    </span>
                  `}"
                placeholder="Трейдер #1"
                variant="compact"
                :context="${(x) => x}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('traders')
                      .find({ removed: { $ne: true } })
                      .sort({ updatedAt: -1 });
                  };
                }}"
                :transform="${() => ppp.decryptDocumentsTransformation()}"
              ></ppp-query-select>
              <ppp-query-select
                trader3-id
                deselectable
                standalone
                ?disabled="${(x) => x.hidden}"
                value="${(order) => order.trader3Id}"
                :preloaded="${(x, c) => {
                  return c.parent?.traders?.find((t) => t._id === x.trader3Id);
                }}"
                :displayValueFormatter="${() => (item) =>
                  html`
                    <span style="color:${getTraderSelectOptionColor(item)}">
                      ${item?.name}
                    </span>
                  `}"
                placeholder="Трейдер #3"
                variant="compact"
                :context="${(x) => x}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('traders')
                      .find({ removed: { $ne: true } })
                      .sort({ updatedAt: -1 });
                  };
                }}"
                :transform="${() => ppp.decryptDocumentsTransformation()}"
              ></ppp-query-select>
            </div>
            <div class="control-stack">
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
              <ppp-query-select
                trader2-id
                deselectable
                standalone
                ?disabled="${(x) => x.hidden}"
                value="${(order) => order.trader2Id}"
                :preloaded="${(x, c) => {
                  return c.parent?.traders?.find((t) => t._id === x.trader2Id);
                }}"
                :displayValueFormatter="${() => (item) =>
                  html`
                    <span style="color:${getTraderSelectOptionColor(item)}">
                      ${item?.name}
                    </span>
                  `}"
                placeholder="Трейдер #2"
                variant="compact"
                :context="${(x) => x}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('traders')
                      .find({ removed: { $ne: true } })
                      .sort({ updatedAt: -1 });
                  };
                }}"
                :transform="${() => ppp.decryptDocumentsTransformation()}"
              ></ppp-query-select>
              <ppp-query-select
                trader4-id
                deselectable
                standalone
                ?disabled="${(x) => x.hidden}"
                value="${(order) => order.trader4Id}"
                :preloaded="${(x, c) => {
                  return c.parent?.traders?.find((t) => t._id === x.trader4Id);
                }}"
                :displayValueFormatter="${() => (item) =>
                  html`
                    <span style="color:${getTraderSelectOptionColor(item)}">
                      ${item?.name}
                    </span>
                  `}"
                placeholder="Трейдер #4"
                variant="compact"
                :context="${(x) => x}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('traders')
                      .find({ removed: { $ne: true } })
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

export class WidgetOrderList extends ClonableList {
  async validate() {
    for (const field of Array.from(
      this.dragList.querySelectorAll('[order-name]')
    )) {
      await validate(field);
    }

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
        name: line.querySelector('[order-name]').value,
        orderId: line.querySelector('[order-id]').value,
        trader1Id: line.querySelector('[trader1-id]').value,
        trader2Id: line.querySelector('[trader2-id]').value,
        trader3Id: line.querySelector('[trader3-id]').value,
        trader4Id: line.querySelector('[trader4-id]').value,
        hidden: !line.querySelector('[visibility-toggle]').checked
      });
    }

    return orders;
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default WidgetOrderList.compose({
  template: widgetOrderListTemplate,
  styles: clonableListStyles
}).define();
