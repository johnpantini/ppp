import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import '../text-field.js';
import '../button.js';

export const importCloudKeysModalPageTemplate = html`
  <template>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>Мастер-пароль</h5>
          <p class="description">Задавался при первой настройке приложения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            value="${() => ppp.keyVault.getKey('master-password') ?? ''}"
            placeholder="Введите пароль"
            ${ref('masterPasswordForImport')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Компактное представление</h5>
          <p class="description">Формат Base64.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Вставьте представление"
            ${ref('cloudCredentialsData')}
          ></ppp-text-field>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.saveDocument()}"
        >
          Импортировать ключи
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const importCloudKeysModalPageStyles = css`
  ${pageStyles}
`;

export class ImportCloudKeysModalPage extends Page {}

export default ImportCloudKeysModalPage.compose({
  template: importCloudKeysModalPageTemplate,
  styles: importCloudKeysModalPageStyles
}).define();
