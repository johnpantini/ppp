/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import {
  html,
  css,
  repeat,
  observable,
  ref,
  Updates
} from '../vendor/fast-element.min.js';
import { drag, plus, trash } from '../static/svg/sprite.js';
import { COLUMN_SOURCE } from '../lib/const.js';
import {
  paletteGrayBase,
  paletteGrayLight1,
  themeConditional
} from '../design/design-tokens.js';
import { validate } from '../lib/ppp-errors.js';
import './draggable-stack.js';

export const widgetColumnListTemplate = html`
  <template>
    <ppp-draggable-stack class="control-stack" ${ref('dragList')}>
      ${repeat(
        (x) => x.columns?.filter?.(Boolean) ?? [],
        html`
          <div class="control-line draggable">
            <div class="control-stack">
              <span class="drag-handle">${html.partial(drag)}</span>
              <ppp-checkbox
                column-visible
                ?checked="${(x) => !x.hidden}"
              ></ppp-checkbox>
            </div>
            <div class="control-stack">
              <ppp-text-field
                column-name
                style="width: 200px;"
                standalone
                placeholder="${(column) => column.name}"
                value="${(column) => column.name}"
              ></ppp-text-field>
              <ppp-query-select
                ?hidden="${(x) =>
                  [
                    COLUMN_SOURCE.INSTRUMENT,
                    COLUMN_SOURCE.SYMBOL,
                    COLUMN_SOURCE.POSITION_AVAILABLE,
                    COLUMN_SOURCE.POSITION_AVERAGE
                  ].indexOf(x.source) !== -1}"
                column-trader
                deselectable
                standalone
                value="${(x) => x.traderId}"
                :preloaded="${(x, c) => {
                  return c.parent?.traders?.find((t) => t._id === x.traderId);
                }}"
                placeholder="Выберите трейдера"
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
                placeholder="Выберите столбец"
                @change="${async (x, c) => {
                  const hidden =
                    [
                      COLUMN_SOURCE.INSTRUMENT,
                      COLUMN_SOURCE.SYMBOL,
                      COLUMN_SOURCE.POSITION_AVAILABLE,
                      COLUMN_SOURCE.POSITION_AVERAGE
                    ].indexOf(c.event.detail.value) !== -1;

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
                  () => Object.keys(COLUMN_SOURCE),
                  html`
                    <ppp-option value="${(x) => COLUMN_SOURCE[x]}">
                      ${(x) => ppp.t(`$const.columnSource.${COLUMN_SOURCE[x]}`)}
                    </ppp-option>
                  `
                )}
              </ppp-select>
              <ppp-query-select
                ?hidden="${(x) =>
                  [
                    COLUMN_SOURCE.INSTRUMENT,
                    COLUMN_SOURCE.SYMBOL,
                    COLUMN_SOURCE.POSITION_AVAILABLE,
                    COLUMN_SOURCE.POSITION_AVERAGE
                  ].indexOf(x.source) !== -1}"
                column-extra-trader
                deselectable
                standalone
                value="${(x) => x.extraTraderId}"
                :preloaded="${(x, c) => {
                  return c.parent?.traders?.find(
                    (t) => t._id === x.extraTraderId
                  );
                }}"
                placeholder="Выберите трейдера"
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
            <span
              class="line-control-icon add"
              @click="${(x, c) => {
                const controlLine = c.event
                  .composedPath()[0]
                  .closest('.control-line');
                const index = Array.from(
                  controlLine.parentNode.children
                ).indexOf(controlLine);
                const value = c.parent.value;

                value.splice(index + 1, 0, {
                  source: COLUMN_SOURCE.SYMBOL,
                  name: ppp.t(`$const.columnSource.${COLUMN_SOURCE.SYMBOL}`)
                });

                Updates.enqueue(() => {
                  c.parent.columns = value;
                });
              }}"
            >
              ${html.partial(plus)}
            </span>
            <span
              class="line-control-icon remove"
              ?hidden="${(x, c) => c.parent.columns?.length <= 1}"
              @click="${(column, c) => {
                const cp = c.event.composedPath();
                const controlLine = cp[0].closest('.control-line');
                const index = Array.from(
                  controlLine.parentNode.children
                ).indexOf(controlLine);

                controlLine.remove();
                c.parent.columns.splice(index, 1);

                Array.from(
                  c.parent.shadowRoot.querySelectorAll(
                    '.line-control-icon.remove'
                  )
                ).forEach((icon) => {
                  if (c.parent.columns.length <= 1) {
                    icon.setAttribute('hidden', '');
                  } else {
                    icon.removeAttribute('hidden');
                  }
                });
              }}"
            >
              ${html.partial(trash)}
            </span>
          </div>
        `,
        { recycle: false }
      )}
    </ppp-draggable-stack>
  </template>
`;

export const widgetColumnListStyles = css`
  .control-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .control-line {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .line-control-icon,
  .drag-handle {
    display: flex;
    cursor: pointer;
    width: 16px;
    height: 16px;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }

  .drag-handle {
    cursor: grab;
  }

  .dragging.drag-handle,
  .dragging .drag-handle {
    cursor: grabbing !important;
  }

  .filler {
    height: 0;
  }

  .control-stack:has(> .error) + .control-stack {
    gap: 40px;
  }

  .control-stack:has(> .error) + .control-stack ppp-select:has(+ [hidden]) {
    top: -12px;
  }

  [hidden] {
    display: none !important;
  }
`;

export class WidgetColumnList extends PPPElement {
  @observable
  columns;

  @observable
  traders;

  constructor() {
    super();

    this.columns = [];
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
      this.dragList.querySelectorAll('.control-line')
    )) {
      const column = {
        source: line.querySelector('[column-source]').value,
        name: line.querySelector('[column-name]').value,
        hidden: !line.querySelector('[column-visible]').checked
      };

      const traderSelect = line.querySelector('[column-trader]');

      if (traderSelect) {
        column.traderId = traderSelect.value;
      }

      const extraTraderSelect = line.querySelector('[column-extra-trader]');

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
  styles: widgetColumnListStyles
}).define();
