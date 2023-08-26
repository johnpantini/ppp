import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { invalidate } from '../../lib/ppp-errors.js';
import '../button.js';
import '../text-field.js';

export const settingsConnectionsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>Прокси-ресурс уровня приложения</h5>
          <p class="description">
            Используется для совершения запросов к внешним API и сервисам. Если
            не задан, в качестве замены будет использована сервисная машина.
            Рекомендуется создать по
            <a
              class="link"
              rel="noopener"
              target="_blank"
              href="${() =>
                ppp.rootUrl}/salt/states/ppp/lib/global-proxy-deno-example.js"
              >образцу</a
            >
            на платформе
            <a
              class="link"
              rel="noopener"
              target="_blank"
              href="https://deno.com/deploy"
              >Deno Deploy</a
            >.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
            placeholder="https://deno.dev"
            value="${(x) => x.document.globalProxyUrl}"
            ${ref('globalProxyUrl')}
          ></ppp-text-field>
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

export const settingsConnectionsPageStyles = css`
  ${pageStyles}
`;

export class SettingsConnectionsPage extends Page {
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
    const url = this.globalProxyUrl.value;

    if (url) {
      try {
        new URL(url);
      } catch (e) {
        invalidate(this.globalProxyUrl, {
          errorMessage: 'Неверный или неполный URL',
          raiseException: true
        });
      }
    }
  }

  async submit() {
    const globalProxyUrl = this.globalProxyUrl.value;

    ppp.settings.set('globalProxyUrl', globalProxyUrl);

    return {
      $set: {
        globalProxyUrl
      }
    };
  }
}

export default SettingsConnectionsPage.compose({
  template: settingsConnectionsPageTemplate,
  styles: settingsConnectionsPageStyles
}).define();
