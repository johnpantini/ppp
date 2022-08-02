import { ImportCloudKeysModalPage } from '../../shared/import-cloud-keys-modal-page.js';
import { pageStyles } from './page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import ppp from '../../ppp.js';

export const importCloudKeysModalPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'} modal headless>
        <section>
          <div class="label-group full">
            <h6>Мастер-пароль</h6>
            <ppp-text-field
              type="password"
              value="${(x) => ppp?.keyVault.getKey('master-password')}"
              placeholder="Введите пароль"
              ${ref('masterPasswordForImport')}
            ></ppp-text-field>
          </div>
        </section>
        <section class="last">
          <div class="label-group full">
            <h6>Компактное представление сохранённых ключей (base64)</h6>
            <${'ppp-text-field'}
              placeholder="Вставьте текст"
              ${ref('cloudCredentialsData')}
            ></ppp-text-field>
          </div>
        </section>
        <div class="footer-border"></div>
        <footer slot="actions">
          <div class="footer-actions">
            <${'ppp-button'}
              @click="${(x) =>
                (x.parent.importCloudKeysModal.visible = false)}">
              Отмена
            </ppp-button>
            <${'ppp-button'}
              ?disabled="${(x) => x.page.loading}"
              type="submit"
              @click="${(x) => x.page.saveDocument()}"
              appearance="primary"
            >
              <slot name="submit-control-text">Импортировать ключи</slot>
            </ppp-button>
          </div>
        </footer>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ImportCloudKeysModalPage.compose({
  template: importCloudKeysModalPageTemplate,
  styles: pageStyles
});
