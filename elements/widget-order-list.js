/** @decorator */

import { html, repeat, observable, ref } from '../vendor/fast-element.min.js';
import { validate } from '../lib/ppp-errors.js';
import {
  ClonableList,
  clonableListStyles,
  cloneControlsTemplate,
  defaultDragEndHandler,
  dragHandleTemplate
} from './clonable-list.js';
import './draggable-stack.js';

export const widgetOrderListTemplate = html`
  <template>
    <ppp-draggable-stack
      class="control-stack"
      @pppdragend="${(x) => defaultDragEndHandler(x)}"
      ${ref('dragList')}
    >
      ${repeat(
        (x) => x.list,
        html`
          <div class="control-line draggable">
            ${dragHandleTemplate()}
            <div class="control-stack">
              <ppp-text-field
                order-name
                style="width: 200px;"
                standalone
                ?disabled="${(x) => x.hidden}"
                placeholder="${(order) => order.name || 'Введите имя'}"
                value="${(order) => order.name}"
              ></ppp-text-field>
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
            <div class="control-stack">
              <ppp-query-select
                order-execution-environment
                deselectable
                standalone
                ?disabled="${(x) => x.hidden}"
                value="${(x) => x.execEnvironmentServiceId}"
                :preloaded="${(x, c) => {
                  return c.parent?.services?.find(
                    (s) => s._id === x.execEnvironmentServiceId
                  );
                }}"
                placeholder="Среда исполнения"
                variant="compact"
                :context="${(x) => x}"
                :query="${() => {
                  return (context) => {
                    return context.services
                      .get('mongodb-atlas')
                      .db('ppp')
                      .collection('services')
                      .find({
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.PPP_ASPIRANT_WORKER%]`,
                        workerPredefinedTemplate: 'pppRuntime'
                      })
                      .sort({ updatedAt: -1 });
                  };
                }}"
                :transform="${() => ppp.decryptDocumentsTransformation()}"
              ></ppp-query-select>
            </div>
            ${cloneControlsTemplate()}
          </div>
        `
      )}
    </ppp-draggable-stack>
  </template>
`;

export class WidgetOrderList extends ClonableList {
  @observable
  services;

  constructor() {
    super();

    this.services = [];
  }

  async validate() {
    for (const field of Array.from(
      this.dragList.querySelectorAll('ppp-text-field')
    )) {
      await validate(field);

      if (!field.nextElementSibling.hasAttribute('disabled')) {
        await validate(field.nextElementSibling);
      }
    }
  }

  get value() {
    const orders = [];

    for (const line of Array.from(
      this.dragList.querySelectorAll('.control-line')
    )) {
      orders.push({
        name: line.querySelector('[order-name]').value,
        orderId: line.querySelector('[order-id]').value,
        execEnvironmentServiceId: line.querySelector(
          '[order-execution-environment]'
        ).value,
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
