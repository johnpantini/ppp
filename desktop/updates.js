/** @decorator */

import { BasePage } from '../lib/page/page.js';
import { ref } from '../lib/element/templating/ref.js';
import { when } from '../lib/element/templating/when.js';
import { html } from '../lib/template.js';
import { css } from '../lib/element/styles/css.js';
import { observable } from '../lib/element/observation/observable.js';
import { assert } from '../lib/assert.js';
import { formatDate } from '../lib/intl.js';

import {
  basePageStyles,
  loadingIndicator
} from '../design/leafygreen/styles/page.js';

// TODO -theme
import { settings } from '../design/leafygreen/icons/settings.js';

await i18nImport(['validation', 'updates']);

export class UpdatesPage extends BasePage {
  @observable
  updateComplete;

  @observable
  targetCommit;

  @observable
  currentCommit;

  disconnectedCallback() {
    super.disconnectedCallback();

    this.currentCommit = void 0;
    this.targetCommit = void 0;
    this.updateComplete = false;
  }

  connectedCallback() {
    super.connectedCallback();
    void this.checkForUpdates();
  }

  async checkForUpdates() {
    try {
      this.currentCommit = void 0;
      this.targetCommit = void 0;
      this.busy = true;
      this.app.toast.source = this;
      this.toastTitle = i18n.t('$pages.updates.toast.title');

      const r1 = await fetch(
        'https://api.github.com/repos/johnpantini/ppp/git/refs/heads/main',
        {
          cache: 'no-cache',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${this.app.ppp.keyVault.getKey(
              'github-token'
            )}`
          }
        }
      );

      assert(r1);

      const targetRef = await r1.json();
      const r2 = await fetch(targetRef.object.url, {
        cache: 'no-cache',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${this.app.ppp.keyVault.getKey('github-token')}`
        }
      });

      assert(r2);

      this.targetCommit = await r2.json();

      const r3 = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${this.app.ppp.keyVault.getKey('github-token')}`
        }
      });

      assert(r3);

      const user = await r3.json();
      const r4 = await fetch(
        `https://api.github.com/repos/${user.login}/ppp/git/refs/heads/main`,
        {
          cache: 'no-cache',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${this.app.ppp.keyVault.getKey(
              'github-token'
            )}`
          }
        }
      );

      assert(r4);

      const currentRef = await r4.json();
      const r5 = await fetch(currentRef.object.url, {
        cache: 'no-cache',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${this.app.ppp.keyVault.getKey('github-token')}`
        }
      });

      assert(r5);

      this.currentCommit = await r5.json();
      this.busy = false;
    } catch (e) {
      console.error(e);

      this.app.toast.appearance = 'warning';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationFailedWithStatus', {
        status: e.status || 503
      });
      this.app.toast.visible = true;
    }
  }

  async updateApp() {
    try {
      this.busy = true;
      this.app.toast.visible = false;

      const r1 = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${this.app.ppp.keyVault.getKey('github-token')}`
        }
      });

      assert(r1);

      const user = await r1.json();
      const r2 = await fetch(
        `https://api.github.com/repos/${user.login}/ppp/git/refs/heads/main`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${this.app.ppp.keyVault.getKey(
              'github-token'
            )}`
          },
          body: JSON.stringify({
            sha: this.targetCommit.sha
          })
        }
      );

      assert(r2);

      const r3 = await fetch(
        `https://api.github.com/repos/${user.login}/ppp/pages/builds`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${this.app.ppp.keyVault.getKey(
              'github-token'
            )}`
          }
        }
      );

      assert(r3);

      this.app.toast.appearance = 'success';
      this.app.toast.dismissible = true;
      this.toastText =
        'Обновление успешно выполнено. Изменения будут применены в течение нескольких минут';
      this.app.toast.visible = true;

      this.busy = false;
      this.updateComplete = true;
    } catch (e) {
      console.error(e);

      this.busy = false;

      this.app.toast.appearance = 'warning';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationFailedWithStatus', {
        status: e.status
      });
      this.app.toast.visible = true;
    }
  }
}

export const updatesPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Обновление</ppp-page-header>
    <form ${ref('form')} id="updates" name="updates" onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        ${when(
          (x) =>
            x.currentCommit?.sha &&
            x.targetCommit?.sha &&
            x.currentCommit?.sha !== x.targetCommit?.sha,
          html`
            <${'ppp-banner'} class="inline margin-top" appearance="info">
              Для полного применения обновления может потребоваться до 10 минут.
            </ppp-banner>
            <section>
              <div class="label-group">
                <h6>Текущая версия</h6>
                <${'ppp-badge'} appearance="lightgray"><a
                  target="_blank"
                  href="${(x) => x.currentCommit?.html_url}"
                >
                  ${(x) => x.currentCommit?.sha}
                </a>
                </ppp-badge>
                <p>${(x) => formatDate(x.currentCommit?.author.date)} MSK</p>
              </div>
            </section>
            <section>
              <div class="label-group">
                <h6>Доступное обновление</h6>
                <${'ppp-badge'} appearance="green"><a
                  target="_blank"
                  href="${(x) => x.targetCommit?.html_url}"
                >
                  ${(x) => x.targetCommit?.sha}
                </a>
                </ppp-badge>
                <p>${(x) => formatDate(x.targetCommit?.author.date)} MSK</p>
              </div>
            </section>
            <section class="last">
              <div class="footer-actions">
                <${'ppp-button'}
                  ?disabled="${(x) => x.busy || x.updateComplete}"
                  type="submit"
                  @click="${(x) => x.updateApp()}"
                  appearance="primary"
                >
                  ${when(
                    (x) => x.busy,
                    settings({
                      slot: 'end',
                      cls: 'spinner-icon'
                    })
                  )}
                  Обновить PPP
                </ppp-button>
              </div>
            </section>`
        )}
        ${when(
          (x) =>
            x.currentCommit?.sha &&
            x.currentCommit?.sha === x.targetCommit?.sha,
          html`
            <div class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="58"
                   viewBox="0 0 64 58" fill="none">
                <path
                  d="M16 4.09998C16 4.09998 30 8.09998 48 4.09998M64 24.9H61.9M61.9 24.9C58.8 24.9 56.3 27.4 56.3 30.5V48.8C56.3 53.3 52.6 57 48.1 57H16C11.5 57 7.8 53.3 7.8 48.8V30.6C7.8 27.5 5.3 25 2.2 25H0M61.9 24.9C58.8 24.9 56.3 22.4 56.3 19.3V9.2C56.3 4.7 52.6 1 48.1 1H16.1C11.6 1 7.9 4.7 7.9 9.2V19.3C7.9 22.4 5.4 24.9 2.3 24.9H0"
                  stroke="#001E2B" stroke-miterlimit="10"/>
                <path
                  d="M39.0414 28.5301C38.6816 24.8621 35.6943 22 32.0624 22C29.2391 22 26.7755 23.7781 25.6599 26.2757C25.5639 26.4906 25.3397 26.62 25.1049 26.6048C25.0041 26.5982 24.9024 26.5949 24.8 26.5949C22.5846 26.4034 20 28.4406 20 31.1897C20 33.9389 22.149 36 24.8 36H40.4923C42.4296 36 44 34.5389 44 32.5299C44 30.5209 42.4296 28.8923 40.4923 28.8923C40.2684 28.8923 40.0201 28.9449 39.7779 29.0178C39.4372 29.1205 39.0762 28.8842 39.0414 28.5301Z"
                  fill="#00ED64" stroke="#001E2B"/>
              </svg>
              <h1>У вас последняя версия PPP</h1>
              <h2>
                Приложение PPP получает обновления из ветви
                <${'ppp-badge'} appearance="lightgray">main</ppp-badge>
                официального <a target="_blank"
                                href="https://github.com/johnpantini/ppp"
              >GitHub-репозитория</a>
              </h2>
              <button
                @click="${(x) => x.checkForUpdates()}"
                type="button"
                class="cta"
                aria-disabled="false"
                role="link"
              >
                <div class="text">Проверить ещё раз</div>
              </button>
            </div>`
        )}
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
    </form>
  </template>
`;

export const updatesPageStyles = (context, definition) =>
  css`
    ${basePageStyles}
    ppp-badge {
      margin-top: 10px;
    }

    ppp-badge a {
      text-transform: uppercase;
      font-size: 12px;
      color: inherit;
    }

    .empty-state ppp-badge {
      text-transform: none;
    }
  `;

export const updatesPage = UpdatesPage.compose({
  baseName: 'updates-page',
  template: updatesPageTemplate,
  styles: updatesPageStyles
});
