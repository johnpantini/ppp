/** @decorator */

import {
  widgetStyles,
  WidgetWithInstrument,
  widgetEmptyStateTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import {
  html,
  css,
  when,
  ref,
  observable,
  repeat,
  attr,
  Observable
} from '../../vendor/fast-element.min.js';
import { WIDGET_TYPES } from '../../lib/const.js';
import { normalize } from '../../design/styles.js';
import { invalidate, validate } from '../../lib/ppp-errors.js';
import { WidgetColumns } from '../widget-columns.js';
import { trash } from '../../static/svg/sprite.js';
import '../button.js';
import '../query-select.js';
import '../radio-group.js';
import '../snippet.js';
import '../text-field.js';
import '../widget-controls.js';

export const listWidgetTemplate = html`
  <template>
    <div class="widget-root">
      <div class="widget-header">
        <div class="widget-header-inner">
          <ppp-widget-group-control></ppp-widget-group-control>
          <ppp-widget-search-control
            readonly
            ?hidden="${(x) => !x.preview || !x.instrumentTrader}"
          ></ppp-widget-search-control>
          ${when(
            (x) => !x.instrumentTrader,
            html`<span class="no-spacing"></span>`
          )}
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
        ${widgetStackSelectorTemplate()} ${(x) => x?.extraControls}
        ${when(
          (x) => !x?.document?.listSource?.length,
          html`${html.partial(widgetEmptyStateTemplate('Список пуст.'))}`,
          html`
            <table class="widget-table" ${ref('table')}>
              <thead>
                <tr>
                  ${repeat(
                    (x) => x?.columns?.array,
                    html`
                      <th source="${(x) => x.source}">
                        <div class="resize-handle"></div>
                        <div>${(x) => x.name}</div>
                      </th>
                    `
                  )}
                  <th class="empty">
                    <div class="resize-handle"></div>
                    <div></div>
                  </th>
                </tr>
              </thead>
              <tbody @click="${(x, c) => x.handleListTableClick(c)}">
                ${repeat(
                  (x) => x?.getSortedSource(),
                  html`
                    <tr class="row" symbol="${(x, c) => c.parent.symbol}">
                      ${repeat(
                        (instrument, c) => c.parent.columns?.array,
                        html`
                          <td
                            class="cell"
                            :payload="${(x, c) => c.parent}"
                            :trader="${(x, c) => c.parent.traderId}"
                            :column="${(x) => x}"
                          >
                            ${(x, c) =>
                              c.parentContext.parent.columns.columnElement(x)}
                          </td>
                        `
                      )}
                    </tr>
                  `
                )}
              </tbody>
            </table>
          `
        )}
        <ppp-widget-notifications-area></ppp-widget-notifications-area>
      </div>
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
  lastSortTime;

  /**
   * @type {WidgetColumns}
   */
  @observable
  columns;

  @attr({ mode: 'boolean' })
  deletion;

  @observable
  deletionAvailable;

  control;

  async connectedCallback() {
    super.connectedCallback();

    if (this.preview) {
      if (this.document.listType === 'url' && !this.document.listWidgetUrl) {
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
        return this.notificationsArea.error({
          text: 'Не удалось загрузить список.',
          keep: true
        });
      }

      const { settings, validate, submit, extraControls, pagination, control } =
        await mod.listDefinition();

      if (typeof control === 'function') {
        this.control = new control();
      }

      this.extraControls = extraControls;
      this.pagination = pagination;

      if (
        this.preview &&
        this.container.setupStep.value === '2' &&
        !this.container.extraSettings
      ) {
        this.container.extraSettings = settings;
        this.container.granary.validate = validate;
        this.container.granary.submit = submit;
        // Container and widget share the same source.
        this.document.listSource = structuredClone(this.document.listSource);
      }

      this.columns = new WidgetColumns({
        columns: this.document.columns ?? []
      });

      await this.columns.registerColumns();
      await this.control?.connectedCallback?.(this);

      setTimeout(() => {
        this.document.listSource = this.document.listSource.sort();

        Observable.notify(this, 'document');
      }, 5000);
    } catch (e) {
      console.error(e);

      return this.notificationsArea.error({
        text: 'Не удалось загрузить список.',
        keep: true
      });
    }
  }

  async disconnectedCallback() {
    await this.control?.disconnectedCallback?.(this);

    return super.disconnectedCallback();
  }

  getSortedSource() {
    // TODO
    return this.document?.listSource;
  }

  handleListTableClick({ event }) {
    if (!this.document?.listSource?.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    let index = -1;
    let column;

    const cp = event.composedPath();
    const rows = Array.from(this.table.querySelectorAll('.row'));

    for (const n of cp) {
      if (n.classList?.contains?.('row')) {
        index = rows.indexOf(n);

        break;
      } else if (n.classList?.contains?.('cell')) {
        column = n.firstElementChild;
      }
    }

    if (index > -1 && column) {
      if (this.deletion) {
        this.control?.removeElement?.(index, this, column);
      } else if (column.defaultTrader) {
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

    await this.container.granary?.validate?.(this);
  }

  async submit() {
    const submission = await this.container.granary?.submit?.(this);

    return {
      $set: {
        listType: this.container.listType.value,
        listWidgetUrl: this.container.listWidgetUrl.value,
        setupStep: this.container.setupStep.value,
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
        <div class="widget-settings-input-group">
          <ppp-radio-group
            ?disabled="${(x) => x.setupStep.value === '2'}"
            orientation="vertical"
            value="${(x) => x.document.listType ?? 'instruments'}"
            ${ref('listType')}
          >
            <ppp-radio value="instruments">Инструменты</ppp-radio>
            <ppp-radio value="mru">Недавние инструменты</ppp-radio>
            <ppp-radio value="url">По ссылке</ppp-radio>
          </ppp-radio-group>
          <ppp-text-field
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
        ?hidden="${(x) => x.setupStep.value === '2'}"
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
          } catch (e) {
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
