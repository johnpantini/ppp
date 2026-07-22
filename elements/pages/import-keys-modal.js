import ppp from '../../ppp.js';
import { TAG } from '../../lib/tag.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import '../button.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const importKeysModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$importKeysModalPage.masterPassword')}</h5>
          <p class="description">
            ${() => ppp.t('$importKeysModalPage.masterPasswordDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            value="${() => ppp.keyVault.getKey('master-password') ?? ''}"
            placeholder="${() =>
              ppp.t('$importKeysModalPage.enterPasswordPlaceholder')}"
            ${ref('masterPasswordForImport')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$importKeysModalPage.compactRepresentation')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$importKeysModalPage.compactRepresentationDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="${() =>
              ppp.t('$importKeysModalPage.pasteRepresentationPlaceholder')}"
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
          ${() => ppp.t('$importKeysModalPage.importKeys')}
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const importKeysModalPageStyles = css`
  ${pageStyles}
`;

export class importKeysModalPage extends Page {
  async submitDocument() {
    this.beginOperation();

    try {
      await validate(this.masterPasswordForImport);
      await validate(this.cloudCredentialsData);

      const { iv, data } = JSON.parse(
        atob(this.cloudCredentialsData.value.trim())
      );

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

      if (+TAG > +decryptedCredentials.tag) {
        this.showSuccessNotification(
          ppp.t('$importKeysModalPage.importedKeysAreStale')
        );
      } else {
        this.showSuccessNotification(
          ppp.t('$importKeysModalPage.importedKeysAreOk')
        );
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export default importKeysModalPage
  .compose({
    template: importKeysModalPageTemplate,
    styles: importKeysModalPageStyles
  })
  .define();
