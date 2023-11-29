/** @decorator */

import {
  widgetStyles,
  WidgetWithInstrument,
  widgetDefaultHeaderTemplate,
  widgetStackSelectorTemplate
} from '../widget.js';
import {
  html,
  css,
  when,
  ref,
  observable
} from '../../vendor/fast-element.min.js';
import { WIDGET_TYPES } from '../../lib/const.js';
import { normalize } from '../../design/styles.js';
import { invalidate, validate } from '../../lib/ppp-errors.js';
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
            ?hidden="${(x) => !x.instrumentTrader}"
          ></ppp-widget-search-control>
          ${when(
            (x) => !x.instrumentTrader,
            html`<span class="no-spacing"></span>`
          )}
          <span class="widget-title">
            <span class="title">${(x) => x.document?.name ?? ''}</span>
          </span>
          <ppp-widget-header-buttons></ppp-widget-header-buttons>
        </div>
      </div>
      <div class="widget-body">
        ${widgetStackSelectorTemplate()}
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
  listDefinition;

  async connectedCallback() {
    super.connectedCallback();

    try {
      const url = new URL(
        this.document.listType === 'url'
          ? this.document.listWidgetUrl
          : `${ppp.rootUrl}/elements/widgets/lists/instruments.js`
      );

      const module = await import(url);

      this.listDefinition = module.listDefinition;

      if (typeof this.listDefinition !== 'function') {
        return this.notificationsArea.error({
          text: 'Не удалось загрузить список.',
          keep: true
        });
      }

      const { settings, validate, submit } = await this.listDefinition();

      if (
        this.preview &&
        this.container.setupStep.value === '2' &&
        !this.container.extraSettings
      ) {
        this.container.extraSettings = settings;
        this.container.granary.validate = validate;
        this.container.granary.submit = submit;
      }
    } catch (e) {
      return this.notificationsArea.error({
        text: 'Не удалось загрузить список.',
        keep: true
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
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
            <ppp-radio value="instruments">Список инструментов</ppp-radio>
            <ppp-radio value="url">Реализация по ссылке</ppp-radio>
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
                : `${ppp.rootUrl}/elements/widgets/lists/instruments.js`
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
