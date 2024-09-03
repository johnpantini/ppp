/** @decorator */

import {
  widgetStyles,
  WidgetWithInstrument,
  widgetEmptyStateTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import { PPPElement } from '../../lib/ppp-element.js';
import {
  html,
  css,
  when,
  ref,
  observable,
  repeat,
  attr,
  Updates
} from '../../vendor/fast-element.min.js';
import { $throttle } from '../../lib/ppp-decorators.js';
import { COLUMN_SOURCE, WIDGET_TYPES } from '../../lib/const.js';
import { normalize, ellipsis } from '../../design/styles.js';
import { invalidate, validate } from '../../lib/ppp-errors.js';
import { WidgetColumns } from '../widget-columns.js';
import { sortAsc, sortDesc, trash } from '../../static/svg/sprite.js';
import {
  themeConditional,
  toColorComponents,
  fontSizeWidget,
  lineHeightWidget,
  paletteGrayLight3,
  paletteGrayDark2,
  spacing2
} from '../../design/design-tokens.js';
import '../button.js';
import '../query-select.js';
import '../radio-group.js';
import '../text-field.js';
import '../widget-controls.js';

await ppp.i18n(import.meta.url);

const listWidgetThCellTemplate = html`
  <template sort="${(x) => x.sort}" source="${(x) => x.source}">
    <div class="sort-holder" ?hidden="${(x) => !x.sort}">
      <span class="sort-icon">
        ${(x) => html`${html.partial(x.sort === 'asc' ? sortAsc : sortDesc)}`}
      </span>
      <div class="sort-shadow"></div>
    </div>
    <slot></slot>
  </template>
`;

const listWidgetThCellStyles = css`
  :host {
    display: block;
    width: 100%;
    positive
    text-align: right;
    overflow: hidden;
    font-weight: 500;
    font-size: ${fontSizeWidget};
    line-height: ${lineHeightWidget};
    ${ellipsis()};
  }

  .sort-holder {
    position: absolute;
    left: ${spacing2};
    height: 18px;
    width: 16px;
  }

  .sort-icon svg {
    width: 16px;
    height: 16px;
    z-index: 10;
    display: inline-block;
    position: relative;
  }

  .sort-shadow {
    pointer-events: none;
    z-index: 9;
    width: 36px;
    height: 20px;
    position: absolute;
    top: 0;
    left: -12px;
    background: linear-gradient(
      90deg,
      rgba(
        ${themeConditional(
          toColorComponents(paletteGrayLight3),
          toColorComponents(paletteGrayDark2)
        )},
        0
      ),
      ${themeConditional(paletteGrayLight3, paletteGrayDark2)} 25%,
      ${themeConditional(paletteGrayLight3, paletteGrayDark2)} 75%,
      rgba(
        ${themeConditional(
          toColorComponents(paletteGrayLight3),
          toColorComponents(paletteGrayDark2)
        )},
        0
      )
    );
  }
`;

class ListWidgetThCell extends PPPElement {
  @attr
  sort;

  @attr
  source;

  @observable
  column;

  toggleSort() {
    if (!this.sort) {
      this.sort = 'asc';
    } else if (this.sort === 'asc') {
      this.sort = 'desc';
    } else if (this.sort === 'desc') {
      this.sort = null;
    }

    this.column.sort = this.sort;

    this.$emit('columnsort', this);
  }
}

export const listWidgetTemplate = html`
  <template
    @columnsort="${(x, { event }) => {
      const column = event.detail.column;

      if (Array.isArray(x.document.columns)) {
        x.document.columns[column.index].sort = column.sort;
      }

      x.saveColumns();

      return x.internalSort();
    }}"
  >
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <ppp-widget-group-control></ppp-widget-group-control>
          <ppp-widget-search-control readonly></ppp-widget-search-control>
          <span class="widget-title">
            ${when(
              (x) => x.deletionAvailable && x.deletion,
              html`<span class="negative">Режим удаления</span>`,
              html`
                <span class="title">${(x) => x.document?.name ?? ''}</span>
              `
            )}
          </span>
          <ppp-widget-header-buttons>
            <div
              ?hidden="${(x) => !x.deletionAvailable}"
              class="button${(x) => (x.deletion ? ' negative' : '')}"
              slot="start"
              @click="${(x) => x.toggleDeletionMode()}"
            >
              ${html.partial(trash)}
            </div>
          </ppp-widget-header-buttons>
        </div>
      </div>
      <div class="widget-body">
        ${widgetStackSelectorTemplate()}${(x) => x?.extraControls}
        ${when(
          (x) => !x.initialized,
          html`${html.partial(
            widgetEmptyStateTemplate(ppp.t('$widget.emptyState.loading'), {
              extraClass: 'loading-animation'
            })
          )}`
        )}
        ${when(
          (x) => x.initialized && !x?.document?.listSource?.length,
          html`
            ${html.partial(
              widgetEmptyStateTemplate(
                ppp.t('$widget.emptyState.noDataToDisplay')
              )
            )}
          `
        )}
        <div
          class="widget-table list-table"
          ${ref('table')}
          ?hidden="${(x) => !x.initialized || !x?.document?.listSource?.length}"
        >
          <div class="thead">
            <div
              class="tr"
              @pointerdown="${(x, c) => x.beginPossibleColumnResize(c)}"
            >
              ${repeat(
                (x) => x.columnsArray ?? [],
                html`
                  <div
                    class="th"
                    :column="${(x) => x}"
                    title="${(x) => x.name}"
                    style="width:${(x, c) => c.parent.getColumnWidth(x)}"
                    @pointerdown="${(x, c) => {
                      const cp = c.event.composedPath();

                      for (const node of cp) {
                        if (node.classList?.contains?.('th')) {
                          node.lastElementChild.toggleSort();

                          break;
                        } else if (
                          node.classList?.contains?.('resize-handle')
                        ) {
                          break;
                        }
                      }
                    }}"
                  >
                    <div class="resize-handle"></div>
                    <ppp-list-widget-th-cell
                      sort="${(x) => x.sort}"
                      source="${(x) => x.source}"
                      :column="${(x) => x}"
                    >
                      ${(x) => x.name}
                    </ppp-list-widget-th-cell>
                  </div>
                `
              )}
              <div class="th empty">
                <div class="resize-handle"></div>
                <div></div>
              </div>
            </div>
          </div>
          <div
            class="tbody"
            ?hidden="${(x) => !x.initialized}"
            @click="${(x, c) => x.handleListTableClick(c)}"
            ${ref('tableBody')}
          ></div>
          <div class="tfoot" ${ref('tableFoot')}></div>
        </div>
      </div>
      <ppp-widget-notifications-area></ppp-widget-notifications-area>
      <ppp-widget-resize-controls></ppp-widget-resize-controls>
    </div>
  </template>
`;

export const listWidgetStyles = css`
  ${normalize()}
  ${widgetStyles()}
`;

export class ListWidget extends WidgetWithInstrument {
  @observable
  extraControls;

  @observable
  pagination;

  @observable
  columnsArray;

  @attr({ mode: 'boolean' })
  deletion;

  @observable
  deletionAvailable;

  control;

  maxSeenIndex = -1;

  slot;

  columns;

  #sortLoop;

  constructor() {
    super();

    this.sort = $throttle(this.internalSort, 500);
    this.updateHeaderCounter = 1;
  }

  async connectedCallback() {
    super.connectedCallback();

    // Prevent attachShadow() duplicate calls. See below.
    if (this.tableBody.shadowRoot) {
      this.initialized = true;

      return;
    }

    if (this.preview) {
      if (this.document.listType === 'url' && !this.document.listWidgetUrl) {
        this.initialized = true;

        return;
      }
    }

    try {
      const url = new URL(
        this.document.listType === 'url'
          ? this.document.listWidgetUrl
          : `${ppp.rootUrl}/elements/widgets/lists/${
              this.document.listType ?? 'instruments'
            }.js`
      );

      const mod = await import(url);

      if (typeof mod.listDefinition !== 'function') {
        this.initialized = true;

        return this.notificationsArea.error({
          text: 'Не удалось загрузить список.',
          keep: true
        });
      }

      const {
        settings,
        validate,
        submit,
        extraControls,
        pagination,
        control,
        defaultColumns
      } = await mod.listDefinition();

      if (typeof control === 'function') {
        this.control = new control();
      }

      this.extraControls = extraControls;
      this.pagination = pagination;

      if (
        this.preview &&
        this.container.setupStep?.value === '2' &&
        !this.container.extraSettings
      ) {
        this.container.extraSettings = settings;
        this.container.granary.validate = validate;
        this.container.granary.submit = submit;
        // Container and widget share the same source by default.
        this.document.listSource = structuredClone(this.document.listSource);
      }

      this.tableBody.attachShadow({ mode: 'open', slotAssignment: 'manual' });

      this.slot = document.createElement('slot');

      this.tableBody.shadowRoot.append(this.slot);

      await this.control?.preRegisterColumnsCallback?.(this);

      this.columns = new WidgetColumns({
        columns: this.document.columns ?? defaultColumns
      });

      await this.columns.registerColumns();

      // One-time assignment.
      this.columnsArray = this.columns.array;

      await this.control?.connectedCallback?.(this);
      this.internalSort();

      this.#sortLoop = setInterval(() => {
        let needSort = false;

        for (let i = 0; i < this.columnsArray.length; i++) {
          if (this.columnsArray[i].sort) {
            needSort = true;

            break;
          }
        }

        needSort && this.internalSort();
      }, 500);

      this.initialized = true;
    } catch (e) {
      this.initialized = true;

      console.error(e);

      return this.notificationsArea.error({
        text: 'Не удалось загрузить содержимое.',
        keep: true
      });
    }
  }

  async disconnectedCallback() {
    clearInterval(this.#sortLoop);
    await this.control?.disconnectedCallback?.(this);

    return super.disconnectedCallback();
  }

  getColumnWidth(column) {
    if (typeof column.width === 'number') {
      return `${Math.max(48, column.width)}px`;
    } else {
      switch (column.source) {
        case COLUMN_SOURCE.INSTRUMENT:
          return '128px';
        case COLUMN_SOURCE.TRADING_STATUS:
          return '100px';
        case COLUMN_SOURCE.EXTENDED_LAST_PRICE:
          return '80px';
        case COLUMN_SOURCE.SYMBOL:
        case COLUMN_SOURCE.INSTRUMENT_TYPE:
          return '60px';
        default:
          return '70px';
      }
    }
  }

  internalSort() {
    // 1. ORDER BY index DESC by default (preserve insertion order).
    const sortedByDefault = Array.from(this.tableBody.children).sort((a, d) => {
      return (
        parseInt(d.getAttribute('index')) - parseInt(a.getAttribute('index'))
      );
    });

    // 2. ORDER BY individual columns sort direction.
    const comparator = (a, d) => {
      let result;

      for (let i = 0; i < this.columnsArray.length; i++) {
        const sort = this.columnsArray[i].sort;
        const aValue = a.children[i].firstElementChild.value;
        const dValue = d.children[i].firstElementChild.value;

        if (sort === 'asc') {
          if (typeof aValue === 'number' || typeof dValue === 'number') {
            if (typeof result === 'undefined') {
              result = (aValue ?? 0) - (dValue ?? 0);
            } else {
              result ||= (aValue ?? 0) - (dValue ?? 0);
            }
          } else if (typeof aValue === 'string' || typeof dValue === 'string') {
            if (typeof result === 'undefined') {
              result = (aValue ?? '').localeCompare(dValue ?? '');
            } else {
              result ||= (aValue ?? '').localeCompare(dValue ?? '');
            }
          } else if (
            typeof aValue === 'boolean' ||
            typeof dValue === 'boolean'
          ) {
            if (typeof result === 'undefined') {
              result = (aValue ?? false) - (dValue ?? false);
            } else {
              result ||= (aValue ?? false) - (dValue ?? false);
            }
          }
        } else if (sort === 'desc') {
          if (typeof aValue === 'number' || typeof dValue === 'number') {
            if (typeof result === 'undefined') {
              result = (dValue ?? 0) - (aValue ?? 0);
            } else {
              result ||= (dValue ?? 0) - (aValue ?? 0);
            }
          } else if (typeof aValue === 'string' || typeof dValue === 'string') {
            if (typeof result === 'undefined') {
              result = (dValue ?? '').localeCompare(aValue ?? '');
            } else {
              result ||= (dValue ?? '').localeCompare(aValue ?? '');
            }
          } else if (
            typeof aValue === 'boolean' ||
            typeof dValue === 'boolean'
          ) {
            if (typeof result === 'undefined') {
              result = (dValue ?? false) - (aValue ?? false);
            } else {
              result ||= (dValue ?? false) - (aValue ?? false);
            }
          }
        }
      }

      return result;
    };

    this.slot.assign(
      ...sortedByDefault.sort(comparator).map((r, i) => {
        if ((i + 1) % 2 === 0) {
          r.classList.add('even');
        } else {
          r.classList.remove('even');
        }

        return r;
      })
    );
  }

  appendRow(payload, fallbackIndex) {
    let index = payload.index;

    if (typeof index !== 'number') {
      index = fallbackIndex ?? this.maxSeenIndex + 1;

      payload.index = index;
    }

    if (!payload.symbol) {
      return;
    }

    const tr = document.createElement('div');

    tr.setAttribute('class', 'tr');
    tr.setAttribute('symbol', payload.symbol);
    tr.setAttribute('index', index);
    tr.classList.add('row');

    for (const col of this.columns.array) {
      const cell = document.createElement('div');

      cell.setAttribute('class', 'td cell');

      const column = document.createElement(col.definition.name);

      cell.column = col;
      cell.payload = payload;
      cell.trader = payload.traderId;

      cell.appendChild(column);
      tr.appendChild(cell);
    }

    const lastEmptyCell = document.createElement('div');

    lastEmptyCell.setAttribute('class', 'td cell');
    tr.appendChild(lastEmptyCell);
    this.tableBody.appendChild(tr);

    this.maxSeenIndex = Math.max(this.maxSeenIndex, index);

    this.sort();

    return tr;
  }

  async saveListSource() {
    return ppp.user.functions.updateOne(
      {
        collection: 'workspaces'
      },
      {
        _id: this.container.document._id,
        'widgets.uniqueID': this.document.uniqueID
      },
      {
        $set: {
          'widgets.$.listSource': this.document.listSource?.map((payload) => {
            const result = {
              symbol: payload.symbol,
              traderId: payload.traderId
            };

            if (typeof payload.index === 'number') {
              result.index = payload.index;
            }

            return result;
          })
        }
      }
    );
  }

  async handleListTableClick({ event }) {
    if (!this.document?.listSource?.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    let index = -1;
    let column;

    const cp = event.composedPath();
    let row;

    for (const n of cp) {
      if (n.hasAttribute?.('index')) {
        index = parseInt(n.getAttribute('index'));

        row = n;

        break;
      } else if (n.classList?.contains?.('cell')) {
        column = n.firstElementChild;
      }
    }

    if (index > -1 && column) {
      if (this.deletion) {
        await this.control?.removeRow?.(index, this, column);
        row.remove();
        this.sort();
      } else if (column.defaultTrader && column.instrument) {
        this.instrumentTrader = column.defaultTrader;

        if (this.groupControl.selection && !this.preview) {
          this.selectInstrument(column.instrument.symbol);
        }
      }
    }
  }

  toggleDeletionMode() {
    this.deletion = !this.deletion;
  }

  async validate() {
    this.container.listType.value === 'url' &&
      (await validate(this.container.listWidgetUrl));

    if (this.container.setupStep.value !== '2') {
      invalidate(ppp.app.toast, {
        errorMessage:
          'Продолжите настройку виджета перед тем, как сохраняться.',
        raiseException: true
      });
    }

    await this.container.columnList?.validate();
    await this.container.granary?.validate?.(this);
  }

  async submit() {
    const submission = await this.container.granary?.submit?.(this);

    return {
      $set: {
        listType: this.container.listType.value,
        listWidgetUrl: this.container.listWidgetUrl.value,
        setupStep: this.container.setupStep.value,
        // columnList is undefined when setupStep === 1.
        columns: this.container.columnList?.value ?? null,
        ...(submission ?? {})
      }
    };
  }
}

export async function widgetDefinition() {
  return {
    type: WIDGET_TYPES.LIST,
    collection: 'PPP',
    title: html`Список`,
    description: html`<span class="positive">Список</span> позволяет создавать
      листинги инструментов и любых других данных, которые можно оформить в
      таблицу.`,
    customElement: ListWidget.compose({
      template: listWidgetTemplate,
      styles: listWidgetStyles
    }).define(),
    minWidth: 275,
    minHeight: 120,
    defaultWidth: 620,
    defaultHeight: 350,
    settings: html`
      <ppp-text-field
        hidden
        value="${(x) => x.document.setupStep ?? '1'}"
        ${ref('setupStep')}
      ></ppp-text-field>
      <div class="widget-settings-section">
        <div class="widget-settings-label-group">
          <h5>Тип списка</h5>
        </div>
        <div class="spacing2"></div>
        <div class="widget-settings-input-group">
          <ppp-radio-group
            class="widget-ignore-changes"
            ?disabled="${(x) => x.setupStep.value === '2'}"
            orientation="vertical"
            value="${(x) => x.document.listType ?? 'instruments'}"
            ${ref('listType')}
          >
            <ppp-radio value="instruments">Инструменты</ppp-radio>
            <ppp-radio value="mru">Недавние инструменты</ppp-radio>
            <ppp-radio value="intraday-stats">
              Статистика внутри дня
            </ppp-radio>
            <ppp-radio value="url">По ссылке</ppp-radio>
          </ppp-radio-group>
          <ppp-text-field
            ?disabled="${(x) => x.setupStep.value === '2'}"
            ?hidden="${(x) => x.listType.value !== 'url'}"
            type="url"
            placeholder="https://example.com/list.js"
            value="${(x) => x.document.listWidgetUrl}"
            ${ref('listWidgetUrl')}
          ></ppp-text-field>
        </div>
      </div>
      <div class="spacing2"></div>
      <ppp-button
        ?hidden="${(x) => x.setupStep?.value === '2'}"
        appearance="primary"
        class="xsmall"
        @click="${async (x) => {
          try {
            const url = new URL(
              x.listType.value === 'url'
                ? x.listWidgetUrl.value
                : `${ppp.rootUrl}/elements/widgets/lists/${x.listType.value}.js`
            );

            const { listDefinition } = await import(url);

            if (typeof listDefinition !== 'function') {
              throw new TypeError();
            }

            x.setupStep.value = '2';

            const { settings, validate, submit } = await listDefinition();

            x.granary.validate = validate;
            x.granary.submit = submit;
            x.extraSettings = settings;

            Updates.enqueue(() => x.applyModifications());
          } catch (e) {
            console.error(e);
            invalidate(x.listWidgetUrl, {
              errorMessage: 'Этот URL не может быть использован',
              raiseException: true
            });
          }
        }}"
      >
        Продолжить
      </ppp-button>
      <div class="spacing2"></div>
      ${(x) => x.extraSettings}
    `
  };
}

export default ListWidgetThCell.compose({
  template: listWidgetThCellTemplate,
  styles: listWidgetThCellStyles
}).define();
