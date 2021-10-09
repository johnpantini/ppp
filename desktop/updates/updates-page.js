/** @decorator */

import { BasePage } from '../../lib/page/page.js';
import { ref } from '../../lib/element/templating/ref.js';
import { when } from '../../lib/element/templating/when.js';
import { html } from '../../lib/template.js';
import { css } from '../../lib/element/styles/css.js';
import { observable } from '../../lib/element/observation/observable.js';
import { assert } from '../../lib/assert.js';

import {
  basePageStyles,
  loadingIndicator
} from '../../design/leafygreen/styles/page.js';

// TODO -theme
import { settings } from '../../design/leafygreen/icons/settings.js';

await i18nImport(['validation', 'updates']);

export class UpdatesPage extends BasePage {
  @observable
  targetCommit;

  @observable
  currentCommit;

  formatDate(date) {
    // TODO - refactor later
    return new Intl.DateTimeFormat('ru-RU', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZone: 'Europe/Moscow'
    }).format(new Date(date));
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.currentCommit = void 0;
    this.targetCommit = void 0;
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
        status: e.status
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

      this.app.toast.dismissible = true;
      this.toastText =
        'Обновление успешно выполнено. Изменения будут применены в течение нескольких минут';
      this.app.toast.visible = true;
      this.busy = false;
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
                <p>${(x) => x.formatDate(x.currentCommit?.author.date)} MSK</p>
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
                <p>${(x) => x.formatDate(x.targetCommit?.author.date)} MSK</p>
              </div>
            </section>
            <section class="last">
              <div class="footer-actions">
                <${'ppp-button'}
                  ?disabled="${(x) => !!x.busy}"
                  type="submit"
                  @click="${(x) => x.updateApp()}"
                  appearance="primary"
                >
                  ${when(
                    (x) => !!x.busy,
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="52"
                viewBox="0 0 32 52"
              >
                <path
                  fill="#16CC62"
                  d="M477.000739,31.9992285 L467.002585,31.9992285 C465.467224,31.9992285 464.504667,30.3404775 465.26642,29.0073354 L481.263465,1.01093583 C482.280821,-0.769537249 484.999261,-0.0475757284 484.999261,2.00308611 L484.999261,20.0007715 L494.997415,20.0007715 C496.532776,20.0007715 497.495333,21.6595225 496.73358,22.9926646 L480.736535,50.9890642 C479.719179,52.7695372 477.000739,52.0475757 477.000739,49.9969139 L477.000739,31.9992285 Z M470.448308,27.9997428 L479.000369,27.9997428 C480.104735,27.9997428 481,28.8950582 481,29.9994856 L481,42.4667534 L491.551692,24.0002572 L482.999631,24.0002572 C481.895265,24.0002572 481,23.1049418 481,22.0005144 L481,9.53324657 L470.448308,27.9997428 Z"
                  transform="translate(-465)"
                ></path>
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
