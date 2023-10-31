import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
import '../button.js';
import '../checkbox.js';
import '../text-field.js';

export const settingsWorkspacePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>Прилипание виджетов</h5>
          <p class="description">
            Дистанция срабатывания определяет минимальное расстояние между
            вертикальными или горизонтальными границами виджетов, при котором
            активируется прилипание, и виджеты притягиваются друг к другу на
            величину отступа. Параметры задаются в пикселях. Чтобы отключить
            прилипание, установите оба значение в 0.
          </p>
        </div>
        <div class="input-group">
          <div class="settings-grid snap">
            <div class="row">
              <ppp-text-field
                type="number"
                min="0"
                placeholder="5"
                value="${(x) => x.document.workspaceSnapDistance ?? '5'}"
                ${ref('workspaceSnapDistance')}
              >
                <span slot="label">Дистанция срабатывания</span>
              </ppp-text-field>
              <ppp-text-field
                type="number"
                min="0"
                placeholder="1"
                value="${(x) => x.document.workspaceSnapMargin ?? '1'}"
                ${ref('workspaceSnapMargin')}
              >
                <span slot="label">Отступ между виджетами</span>
              </ppp-text-field>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Подтверждать закрытие виджетов</h5>
          <p class="description">
            Если настройка активна, при попытке закрытия виджета будет показано
            диалоговое окно для подтверждения.
          </p>
        </div>
        <div class="input-group">
          <ppp-checkbox
            ?checked="${(x) => x.document.confirmWidgetClosing ?? false}"
            ${ref('confirmWidgetClosing')}
          >
            Подтверждать закрытие виджетов
          </ppp-checkbox>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Время удержания уведомлений виджетов</h5>
          <p class="description">
            Настройка распространяется только на уведомления, исчезающие со
            временем. Задаётся в миллисекундах. Нулевое значение отключает показ
            уведомлений.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            min="0"
            placeholder="3000"
            value="${(x) => x.document.widgetNotificationTimeout ?? '3000'}"
            ${ref('widgetNotificationTimeout')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Базовый URL виджетов Psina</h5>
          <p class="description">
            Позволяет указать альтернативный источник для загрузки виджетов.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="url"
            placeholder="https://psina.pages.dev"
            value="${(x) =>
              x.document.psinaBaseUrl ?? 'https://psina.pages.dev'}"
            ${ref('psinaBaseUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Инсталляция в пустом терминале</h5>
        </div>
        <div class="input-group">
          <ppp-checkbox
            ?checked="${(x) => x.document.hideEmptyWorkspaceGizmo ?? false}"
            ${ref('hideEmptyWorkspaceGizmo')}
          >
            Не показывать
          </ppp-checkbox>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Сохранить параметры
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const settingsWorkspacePageStyles = css`
  ${pageStyles}
`;

export class SettingsWorkspacePage extends Page {
  collection = 'app';

  getDocumentId() {
    return {
      _id: '@settings'
    };
  }

  async read() {
    return Object.fromEntries(ppp.settings);
  }

  async validate() {
    await validate(this.workspaceSnapDistance);
    await validate(this.workspaceSnapMargin);
    await validate(this.psinaBaseUrl);

    for (const input of [
      this.workspaceSnapDistance,
      this.workspaceSnapMargin
    ]) {
      await validate(input, {
        hook: async (value) => value >= 0,
        errorMessage: 'Значение должно быть неотрицательным'
      });
    }

    await validate(this.workspaceSnapMargin, {
      hook: async (value) => value <= +this.workspaceSnapDistance.value,
      errorMessage: `Значение должно быть не больше ${this.workspaceSnapDistance.value}`
    });

    try {
      await maybeFetchError(
        await fetch(
          new URL('/widgets/psina.js', this.psinaBaseUrl.value).toString()
        )
      );
    } catch (e) {
      invalidate(this.psinaBaseUrl, {
        errorMessage: 'Этот URL не может быть использован',
        raiseException: true
      });
    }
  }

  async submit() {
    const workspaceSnapDistance = Math.trunc(this.workspaceSnapDistance.value);
    const workspaceSnapMargin = Math.trunc(this.workspaceSnapMargin.value);
    const confirmWidgetClosing = this.confirmWidgetClosing.checked;
    const hideEmptyWorkspaceGizmo = this.hideEmptyWorkspaceGizmo.checked;
    const widgetNotificationTimeout = Math.abs(
      Math.trunc(this.widgetNotificationTimeout.value)
    );
    const psinaBaseUrl = new URL(this.psinaBaseUrl.value).origin;

    ppp.settings.set('workspaceSnapDistance', workspaceSnapDistance);
    ppp.settings.set('workspaceSnapMargin', workspaceSnapMargin);
    ppp.settings.set('confirmWidgetClosing', confirmWidgetClosing);
    ppp.settings.set('widgetNotificationTimeout', widgetNotificationTimeout);
    ppp.settings.set('psinaBaseUrl', psinaBaseUrl);
    ppp.settings.set('hideEmptyWorkspaceGizmo', hideEmptyWorkspaceGizmo);

    return {
      $set: {
        workspaceSnapDistance,
        workspaceSnapMargin,
        confirmWidgetClosing,
        widgetNotificationTimeout,
        psinaBaseUrl,
        hideEmptyWorkspaceGizmo
      }
    };
  }
}

export default SettingsWorkspacePage.compose({
  template: settingsWorkspacePageTemplate,
  styles: settingsWorkspacePageStyles
}).define();
