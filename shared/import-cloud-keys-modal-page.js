import { Page } from './page.js';
import { validate } from './validate.js';
import { TAG } from './tag.js';
import ppp from '../ppp.js';

export class ImportCloudKeysModalPage extends Page {
  connectedCallback() {
    super.connectedCallback();

    this.closest('ppp-modal').visibleChanged = (oldValue, newValue) =>
      !newValue && (ppp.app.toast.visible = false);
  }

  async save() {
    this.beginOperation('Импортировать ключи');

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
        this.succeedOperation(
          'Операция успешно выполнена, но ваши сохранённые ключи устарели. Обновите страницу и сохраните их заново'
        );
      } else {
        this.succeedOperation(
          'Операция успешно выполнена. Обновите страницу, чтобы пользоваться приложением'
        );
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}
