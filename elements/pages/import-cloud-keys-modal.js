import ppp from '../../ppp.js';
import { TAG } from '../../lib/tag.js';
import { html, css, ref, Observable } from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import '../button.js';
import '../text-field.js';

export const importCloudKeysModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
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
          @click="${(x) => x.submitDocument()}"
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

export class ImportCloudKeysModalPage extends Page {
  modalNotifier = {
    handleChange: (modal, attr) => {
      if (modal.hasAttribute(attr)) {
        ppp.app.toast.setAttribute('hidden', '');
      }
    }
  };

  async connectedCallback() {
    await super.connectedCallback();

    Observable.getNotifier(this.closest('ppp-modal')).subscribe(
      this.modalNotifier,
      'hidden'
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    Observable.getNotifier(this.closest('ppp-modal')).unsubscribe(
      this.modalNotifier,
      'hidden'
    );
  }

  async submitDocument() {
    this.beginOperation();

    try {
      await validate(this.masterPasswordForImport);
      await validate(this.cloudCredentialsData);

      const { s, u } = JSON.parse(atob(this.cloudCredentialsData.value.trim()));
      const { iv, data } = await (
        await fetch(new URL('fetch', s).toString(), {
          cache: 'no-cache',
          method: 'POST',
          body: JSON.stringify({
            method: 'GET',
            url: u
          })
        })
      ).json();

      ppp.crypto.resetKey();

      const decryptedCredentials = JSON.parse(
        await ppp.crypto.decrypt(
          iv,
          data,
          this.masterPasswordForImport.value.trim()
        )
      );

      ppp.keyVault.setKey(
        'master-password',
        this.masterPasswordForImport.value.trim()
      );

      Object.keys(decryptedCredentials).forEach((k) => {
        ppp.keyVault.setKey(k, decryptedCredentials[k]);
      });

      ppp.keyVault.setKey('service-machine-url', s);

      if (+TAG > +decryptedCredentials.tag) {
        this.showSuccessNotification(
          'Импортированные ключи устарели. Обновите страницу и сохраните их заново.'
        );
      } else {
        this.showSuccessNotification(
          'Всё в порядке. Обновите страницу, чтобы пользоваться приложением.'
        );
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export default ImportCloudKeysModalPage.compose({
  template: importCloudKeysModalPageTemplate,
  styles: importCloudKeysModalPageStyles
}).define();
