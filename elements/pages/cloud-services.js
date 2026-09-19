/** @decorator */

import ppp from '../../ppp.js';
import { css, html, ref, observable } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { bufferToString, generateIV } from '../../lib/ppp-crypto.js';
import {
  cloud,
  importExport,
  numberedCircle,
  trash
} from '../../static/svg/sprite.js';
import { invalidate, maybeFetchError, validate } from '../../lib/ppp-errors.js';
import '../pages/import-keys-modal.js';
import { TAG } from '../../lib/tag.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../copyable.js';
import '../modal.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const cloudServicesPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${() => ppp.t('$sideNav.cloudServices')}
        <ppp-badge slot="controls" appearance="yellow">
          ${() =>
            ppp.t('$cloudServicesPage.version', {
              version: localStorage.getItem('ppp-version') ?? '1.0.0'
            })}
        </ppp-badge>
        <ppp-button
          ?disabled="${() => !ppp.keyVault.ok()}"
          appearance="primary"
          slot="controls"
          @click="${(x) => x.backupMongoDB()}"
        >
          ${() => ppp.t('$cloudServicesPage.backupDatabase')}
        </ppp-button>
        <ppp-button
          ?disabled="${() => !ppp.keyVault.ok()}"
          slot="controls"
          @click="${(x) => x.restoreMongoDB()}"
        >
          ${() => ppp.t('$cloudServicesPage.restoreDatabase')}
          <span slot="start">
            ${html.partial(cloud)}
          </span>
        </ppp-button>
        <ppp-button
          appearance="default"
          slot="controls"
          @click="${(x) => x.importKeysModal.removeAttribute('hidden')}"
        >
          ${() => ppp.t('$cloudServicesPage.importKeys')}
          <span slot="start">${html.partial(importExport)}</span>
        </ppp-button>
      </ppp-page-header>
      <ppp-modal ${ref('importKeysModal')} class="large" hidden dismissible>
        <span slot="title">
          ${() => ppp.t('$cloudServicesPage.importKeysTitle')}
        </span>
        <div slot="description">
          ${() => ppp.t('$cloudServicesPage.importKeysDescription')}
        </div>
        <ppp-import-keys-modal-page slot="body"></ppp-import-keys-modal-page>
      </ppp-modal>
      <section ?hidden="${() => !ppp.keyVault.ok()}">
        <div class="control-stack">
          <ppp-banner class="inline" appearance="warning">
            <span>
              ${() => ppp.t('$cloudServicesPage.compactRepresentationBanner')}
            </span>
          </ppp-banner>
          <ppp-copyable> ${(x) => x.cloudCredentialsString} </ppp-copyable>
        </div>
      </section>
      <section ?hidden="${() => ppp.keyVault.ok()}">
        <div class="control-stack">
          <ppp-banner class="inline" appearance="warning">
            ${() => ppp.t('$cloudServicesPage.saveAgainPrefix')}
            <a
              class="link"
              @click="${(x) => x.importKeysModal.removeAttribute('hidden')}"
              href="javascript:void(0)"
              >${() => ppp.t('$cloudServicesPage.importLink')}</a
            >
            ${() => ppp.t('$cloudServicesPage.saveAgainSuffix')}
          </ppp-banner>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(1))}</div>
        <div class="label-group">
          <h6>${() => ppp.t('$cloudServicesPage.masterPassword')}</h6>
          <p class="description">
            ${() => ppp.t('$cloudServicesPage.masterPasswordDescription')}
          </p>
          <div class="spacing2"></div>
          <ppp-banner class="inline" appearance="warning">
            ${() => ppp.t('$cloudServicesPage.masterPasswordBanner')}
          </ppp-banner>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="${() =>
              ppp.t('$cloudServicesPage.enterPasswordPlaceholder')}"
            value="${() => ppp.keyVault.getKey('master-password')}"
            ${ref('masterPassword')}
          ></ppp-text-field>
          <div class="spacing4"></div>
          <ppp-text-field
            type="password"
            placeholder="${() =>
              ppp.t('$cloudServicesPage.repeatMasterPasswordPlaceholder')}"
            ${ref('masterPasswordConfirmation')}
          >
            <span slot="label">
              ${() => ppp.t('$cloudServicesPage.passwordConfirmation')}
            </span>
          </ppp-text-field>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(2))}</div>
        <div class="label-group">
          <h6>${() => ppp.t('$cloudServicesPage.proxyResource')}</h6>
          <p class="description">
            ${() => ppp.t('$cloudServicesPage.proxyDescriptionPrefix')}
            <a
              class="link"
              rel="noopener"
              target="_blank"
              href="https://johnpantini.gitbook.io/learn-ppp/cloud-services/ppp-proxy"
              >${() => ppp.t('$cloudServicesPage.instructionsLink')}</a
            >
            ${() => ppp.t('$cloudServicesPage.proxyDescriptionInfix')}
            <a
              class="link"
              rel="noopener"
              target="_blank"
              href="https://app.netlify.com/login"
              >Netlify</a
            >.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="https://example.deno.dev"
            value="${() => ppp.keyVault.getKey('global-proxy-url')}"
            ${ref('globalProxyUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(3))}</div>
        <div class="label-group">
          <h6>${() => ppp.t('$cloudServicesPage.personalGitHubToken')}</h6>
          <p class="description">
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://johnpantini.gitbook.io/learn-ppp/cloud-services/personal-github-token"
            >
              ${() => ppp.t('$cloudServicesPage.tokenLink')}
            </a>
            ${() => ppp.t('$cloudServicesPage.gitHubTokenDescriptionSuffix')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="${() => ppp.t('$page.token')}"
            value="${() => ppp.keyVault.getKey('github-token')}"
            ${ref('gitHubToken')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="section-index-icon">${html.partial(numberedCircle(4))}</div>
        <div class="label-group">
          <h6>${() => ppp.t('$cloudServicesPage.mongoDbGateway')}</h6>
          <p class="description">
            ${() => ppp.t('$cloudServicesPage.mongoDbGatewayDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="url"
            placeholder="http://0.0.0.0:14444"
            value="${() => ppp.keyVault.getKey('mongo-proxy-url')}"            
            ${ref('mongoProxyUrl')}
          ></ppp-text-field>
        </div>
      </section>
            <section>
        <div class="section-index-icon">${html.partial(numberedCircle(5))}</div>
        <div class="label-group">
          <h6>${() => ppp.t('$cloudServicesPage.mongoDbConnection')}</h6>
          <p class="description">
            ${() => ppp.t('$cloudServicesPage.mongoDbConnectionDescription')}
          </p>      
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="mongodb://0.0.0.0:27017"
            value="${() => ppp.keyVault.getKey('mongo-connection-uri')}"
            ${ref('mongoConnectionUri')}
          ></ppp-text-field>
        </div>
      </section>
      <footer>
        <ppp-button
          appearance="danger"
          @click="${(x) => x.clearKeys()}"
        >
          ${() => ppp.t('$cloudServicesPage.clearPasswordAndKeys')}
          <span slot="start"> ${html.partial(trash)} </span>
        </ppp-button>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          ${() => ppp.t('$cloudServicesPage.checkAndSaveKeys')}
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const cloudServicesPageStyles = css`
  ${pageStyles}
`;

export async function checkGitHubToken({ token }) {
  return fetch('https://api.github.com/user', {
    cache: 'no-cache',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${token}`
    }
  });
}

export class CloudServicesPage extends Page {
  @observable
  cloudCredentialsString;

  async connectedCallback() {
    await super.connectedCallback();

    if (!ppp.keyVault.ok()) {
      this.cloudCredentialsString = ppp.t(
        '$cloudServicesPage.enterAllKeysAndMasterPassword'
      );
    } else {
      this.cloudCredentialsString = ppp.t(
        '$cloudServicesPage.generatingCompactRepresentation'
      );

      try {
        this.cloudCredentialsString = btoa(
          JSON.stringify(await this.generateCloudCredentialsString())
        );
      } catch (e) {
        this.cloudCredentialsString = ppp.t(
          '$cloudServicesPage.compactRepresentationError'
        );
      }
    }
  }

  async generateCloudCredentialsString() {
    const iv = generateIV();
    const data = await ppp.crypto.encrypt(
      iv,
      JSON.stringify({
        'global-proxy-url': ppp.keyVault.getKey('global-proxy-url'),
        'github-login': ppp.keyVault.getKey('github-login'),
        'github-token': ppp.keyVault.getKey('github-token'),
        'mongo-proxy-url': ppp.keyVault.getKey('mongo-proxy-url'),
        'mongo-connection-uri': ppp.keyVault.getKey('mongo-connection-uri'),
        tag: TAG
      })
    );

    return {
      iv: bufferToString(iv),
      data
    };
  }

  async backupMongoDB() {
    this.beginOperation();

    try {
      await ppp.app.mountPage('backup-mongodb-modal', {
        title: ppp.t('$cloudServicesPage.saveDatabaseTitle'),
        size: 'large'
      });
    } catch (e) {
      this.failOperation(e, ppp.t('$cloudServicesPage.backupCreationTitle'));
    } finally {
      this.endOperation();
    }
  }

  async restoreMongoDB() {
    this.beginOperation();

    try {
      await ppp.app.mountPage('restore-mongodb-modal', {
        title: ppp.t('$cloudServicesPage.restoreDatabaseTitle'),
        size: 'medium'
      });
    } catch (e) {
      this.failOperation(e, ppp.t('$cloudServicesPage.backupRestoreTitle'));
    } finally {
      this.endOperation();
    }
  }

  async submitDocument() {
    this.beginOperation();

    try {
      await validate(this.masterPassword);
      await validate(this.masterPasswordConfirmation);
      await validate(this.masterPasswordConfirmation, {
        hook: async (value) => value === this.masterPassword.value,
        errorMessage: ppp.t('$cloudServicesPage.passwordsDoNotMatch')
      });
      await validate(this.globalProxyUrl);
      await validate(this.gitHubToken);
      await validate(this.mongoConnectionUri);
      await validate(this.mongoProxyUrl);
      ppp.keyVault.setKey('tag', TAG);
      ppp.keyVault.setKey('master-password', this.masterPassword.value.trim());
      await caches.delete('offline');

      let globalProxyUrl;

      // Check the global proxy URL.
      try {
        globalProxyUrl = new URL(this.globalProxyUrl.value);

        this.progressOperation(
          25,
          ppp.t('$cloudServicesPage.checkingProxy')
        );

        await maybeFetchError(
          await fetch(new URL('zen', globalProxyUrl.origin).toString(), {
            method: 'GET',
            cache: 'no-cache',
            headers: {
              'X-Host': 'api.github.com'
            }
          })
        );
      } catch (e) {
        ppp.$$debug('proxy: %o', e);

        return invalidate(this.globalProxyUrl, {
          errorMessage: ppp.t('$cloudServicesPage.resourceCannotBeProxy'),
          raiseException: true
        });
      }

      ppp.keyVault.setKey('global-proxy-url', globalProxyUrl.origin);
      this.progressOperation(
        50,
        ppp.t('$cloudServicesPage.checkingGitHubToken')
      );

      // Check GitHub token, store repo owner.
      const rGitHub = await checkGitHubToken({
        token: this.gitHubToken.value.trim()
      });

      if (!rGitHub.ok) {
        ppp.$$debug('github: %o, text: %s', rGitHub, await rGitHub.text());

        return invalidate(this.gitHubToken, {
          errorMessage: ppp.t('$cloudServicesPage.invalidOrExpiredToken'),
          raiseException: true
        });
      }

      ppp.keyVault.setKey('github-login', (await rGitHub.json()).login);
      ppp.keyVault.setKey('github-token', this.gitHubToken.value.trim());

      // Check gateway connection.
      this.progressOperation(
        75,
        ppp.t('$cloudServicesPage.checkingMongoDbGateway')
      );

      let mongoProxyUrl = this.mongoProxyUrl.value
        .trim()
        .replace('0.0.0.0', 'localhost');

      if (!mongoProxyUrl.endsWith('/')) mongoProxyUrl = `${mongoProxyUrl}/`;

      try {
        await maybeFetchError(
          await fetch(mongoProxyUrl, {
            cache: 'no-cache'
          })
        );
      } catch (e) {
        ppp.$$debug('gateway: %o', e);

        return invalidate(this.mongoProxyUrl, {
          errorMessage: ppp.t('$cloudServicesPage.gatewayRequestFailed'),
          raiseException: true
        });
      }

      ppp.keyVault.setKey('mongo-proxy-url', this.mongoProxyUrl.value.trim());

      // Check database connection.
      this.progressOperation(
        90,
        ppp.t('$cloudServicesPage.checkingMongoDbConnection')
      );

      try {
        await maybeFetchError(
          await fetch(mongoProxyUrl + 'mongodb', {
            method: 'POST',
            cache: 'no-cache',
            body: JSON.stringify({
              mongoDbUri: this.mongoConnectionUri.value.trim()
            })
          })
        );
      } catch (e) {
        ppp.$$debug('mongodb: %o', e);

        return invalidate(this.mongoConnectionUri, {
          errorMessage: ppp.t('$cloudServicesPage.mongoDbRequestFailed'),
          raiseException: true
        });
      }

      ppp.keyVault.setKey(
        'mongo-connection-uri',
        this.mongoConnectionUri.value.trim()
      );
      this.showSuccessNotification(
        ppp.t('$cloudServicesPage.operationDoneRefreshPage')
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async clearKeys() {
    if (
      await ppp.app.confirm(
        ppp.t('$cloudServicesPage.keysCleanupTitle'),
        ppp.t('$cloudServicesPage.confirmKeysCleanup')
      )
    ) {
      const version = localStorage.getItem('ppp-version');

      localStorage.clear();

      localStorage.setItem('ppp-version', version);
      window.location.reload();
    }
  }
}

export default CloudServicesPage.compose({
  template: cloudServicesPageTemplate,
  styles: cloudServicesPageStyles
}).define();
