/** @decorator */

import {
  html,
  repeat,
  observable,
  ref,
  when
} from '../vendor/fast-element.min.js';
import { PPPElement } from '../lib/ppp-element.js';
import { COLUMN_SOURCE } from '../lib/const.js';
import { validate } from '../lib/ppp-errors.js';
import {
  ClonableList,
  clonableListStyles,
  defaultDragEndHandler,
  dragControlsTemplate
} from './clonable-list.js';
import './draggable-stack.js';
import './query-select.js';
import './select.js';
import './text-field.js';

export const widgetColumnListItemTemplate = html`
  <template>
    <div class="control-line">
      <div class="control-stack">
        <ppp-text-field
          ${ref('name')}
          class="name"
          standalone
          ?disabled="${(x) => x.column.hidden}"
          placeholder="${(x) => x.column.name || 'Введите название'}"
          value="${(x) => x.column.name}"
        ></ppp-text-field>
        <ppp-query-select
          ${ref('traderId')}
          deselectable
          standalone
          ?disabled="${(x) => {
            return (
              x.column.hidden || x.mainTraderColumns.includes(x.column.source)
            );
          }}"
          value="${(x) => x.column.traderId}"
          :preloaded="${(x) => {
            return x.traders?.find((t) => t._id === x.column.traderId);
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
        ${when(
          (x) => x.source?.value === COLUMN_SOURCE.POSITION_AVAILABLE,
          html`
            <ppp-checkbox
              ${ref('hideBalances')}
              value="${(x) => x.column.hideBalances}"
              ?checked="${(x) => x.column.hideBalances}"
            >
              Скрывать валютные балансы
            </ppp-checkbox>
          `
        )}
        ${when(
          (x) =>
            x.source?.value === COLUMN_SOURCE.LAST_PRICE ||
            x.source?.value === COLUMN_SOURCE.EXTENDED_LAST_PRICE,
          html`
            <ppp-checkbox
              ${ref('highlightChanges')}
              value="${(x) => x.column.highlightChanges}"
              ?checked="${(x) => x.column.highlightChanges}"
            >
              Выделять изменения цветом
            </ppp-checkbox>
          `
        )}
      </div>
      <div class="control-stack">
        <ppp-select
          ${ref('source')}
          variant="compact"
          standalone
          ?disabled="${(x) => x.column.hidden}"
          placeholder="${(x) =>
            ppp.t(`$const.columnSource.${x.column.source}`)}"
          value="${(x) => x.column.source}"
        >
          ${repeat(
            (x) => x.availableColumns ?? Object.keys(COLUMN_SOURCE),
            html`
              <ppp-option value="${(x) => COLUMN_SOURCE[x]}">
                ${(x) => ppp.t(`$const.columnSource.${COLUMN_SOURCE[x]}`)}
              </ppp-option>
            `
          )}
        </ppp-select>
        <ppp-query-select
          ${ref('extraTraderId')}
          deselectable
          standalone
          ?disabled="${(x, c) =>
            x.column.hidden || x.mainTraderColumns.includes(x.column.source)}"
          value="${(x) => x.column.extraTraderId}"
          :preloaded="${(x) => {
            return x.traders?.find((t) => t._id === x.column.extraTraderId);
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
  </template>
`;

export class WidgetColumnListItem extends PPPElement {
  @observable
  column;

  // Select.
  @observable
  source;

  @observable
  traders;

  @observable
  availableColumns;

  @observable
  mainTraderColumns;

  constructor() {
    super();

    this.column = {};
  }

  async validate() {
    await validate(this.name);
  }

  get value() {
    const value = {
      source: this.source.value,
      name: this.name.value.trim(),
      hidden: !this.parentNode.querySelector('[visibility-toggle]').checked
    };

    value.traderId = this.traderId.value;
    value.extraTraderId = this.extraTraderId.value;

    if (value.source === COLUMN_SOURCE.POSITION_AVAILABLE) {
      value.hideBalances = this.hideBalances.checked;
    }

    if (
      value.source === COLUMN_SOURCE.LAST_PRICE ||
      value.source === COLUMN_SOURCE.EXTENDED_LAST_PRICE
    ) {
      value.highlightChanges = this.highlightChanges.checked;
    }

    return value;
  }
}

export const widgetColumnListTemplate = html`
  <template>
    <ppp-draggable-stack
      @pppdragend="${(x) => defaultDragEndHandler(x)}"
      ${ref('dragList')}
    >
      ${repeat(
        (x) => x.list ?? [],
        html`
          <div class="control-line draggable draggable-line">
            ${dragControlsTemplate()}
            <ppp-widget-column-list-item
              :column="${(x) => x}"
              :traders="${(x, c) => c.parent.traders}"
              :mainTraderColumns="${(x, c) =>
                c.parent.mainTraderColumns ?? [
                  COLUMN_SOURCE.INSTRUMENT,
                  COLUMN_SOURCE.SYMBOL,
                  COLUMN_SOURCE.POSITION_AVAILABLE,
                  COLUMN_SOURCE.POSITION_AVERAGE
                ]}"
              :availableColumns="${(x, c) => c.parent.availableColumns}"
            ></ppp-widget-column-list-item>
          </div>
        `
      )}
    </ppp-draggable-stack>
  </template>
`;

export class WidgetColumnList extends ClonableList {
  @observable
  availableColumns;

  // Only the main trader may modify.
  @observable
  mainTraderColumns;

  @observable
  traders;

  async validate() {
    for (const item of Array.from(
      this.dragList.querySelectorAll('ppp-widget-column-list-item')
    )) {
      await item.validate();
    }
  }

  get value() {
    const result = [];

    for (const item of Array.from(
      this.dragList.querySelectorAll('ppp-widget-column-list-item')
    )) {
      result.push(item.value);
    }

    return result;
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default {
  WidgetColumnListComposition: WidgetColumnList.compose({
    template: widgetColumnListTemplate,
    styles: clonableListStyles
  }).define(),
  WidgetColumnListItemComposition: WidgetColumnListItem.compose({
    template: widgetColumnListItemTemplate,
    styles: clonableListStyles
  }).define()
};
