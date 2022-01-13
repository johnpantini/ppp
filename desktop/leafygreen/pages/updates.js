/** @decorator */

import { BasePage } from '../../../shared/page.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { when } from '../../../shared/element/templating/when.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { observable } from '../../../shared/element/observation/observable.js';
import { assert } from '../../../shared/assert.js';
import { formatDate } from '../../../shared/intl.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { settings } from '../icons/settings.js';

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
      this.toastTitle = 'Обновление PPP';

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
      this.toastText = 'Операция не выполнена.'
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
        'Обновление успешно выполнено, обновите страницу. Изменения будут применены в течение нескольких минут';
      this.app.toast.visible = true;

      this.busy = false;
      this.updateComplete = true;
    } catch (e) {
      console.error(e);

      this.busy = false;

      this.app.toast.appearance = 'warning';
      this.app.toast.dismissible = true;
      this.toastText = 'Операция не выполнена.'
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
              <img src="static/update.svg" draggable="false" alt="Update"/>
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
    ${pageStyles}
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

// noinspection JSUnusedGlobalSymbols
export const updatesPage = UpdatesPage.compose({
  baseName: 'updates-page',
  template: updatesPageTemplate,
  styles: updatesPageStyles
});
