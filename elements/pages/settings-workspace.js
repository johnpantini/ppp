import {
  html,
  css,
  ref
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { validate } from '../../lib/ppp-errors.js';
import '../banner.js';
import '../button.js';
import '../radio-group.js';
import '../select.js';
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
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
          ${ref('submitControl')}
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
  }

  async submit() {
    return {
      $set: {
        workspaceSnapDistance: Math.trunc(this.workspaceSnapDistance.value),
        workspaceSnapMargin: Math.trunc(this.workspaceSnapMargin.value)
      }
    };
  }
}

export default SettingsWorkspacePage.compose({
  template: settingsWorkspacePageTemplate,
  styles: settingsWorkspacePageStyles
}).define();
