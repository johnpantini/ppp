/** @decorator */

import { Page } from '../../shared/page.js';
import { when } from '../../shared/element/templating/when.js';
import { html } from '../../shared/template.js';
import { css } from '../../shared/element/styles/css.js';
import { observable } from '../../shared/element/observation/observable.js';
import { formatDate } from '../../shared/intl.js';
import { pageStyles } from './page.js';
import { maybeFetchError } from '../../shared/fetch-error.js';
import ppp from '../../ppp.js';

export class UpdatesPage extends Page {
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
    this.beginOperation();

    try {
      this.currentCommit = void 0;
      this.targetCommit = void 0;

      const rTargetRef = await fetch(
        'https://api.github.com/repos/johnpantini/ppp/git/refs/heads/main',
        {
          cache: 'no-cache',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${ppp.keyVault.getKey('github-token')}`
          }
        }
      );

      await maybeFetchError(rTargetRef);

      const targetRef = await rTargetRef.json();
      const rTargetCommit = await fetch(targetRef.object.url, {
        cache: 'no-cache',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${ppp.keyVault.getKey('github-token')}`
        }
      });

      await maybeFetchError(rTargetCommit);

      this.targetCommit = await rTargetCommit.json();

      const rGitHubUser = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${ppp.keyVault.getKey('github-token')}`
        }
      });

      await maybeFetchError(rGitHubUser);

      const user = await rGitHubUser.json();
      const rCurrentRef = await fetch(
        `https://api.github.com/repos/${user.login}/ppp/git/refs/heads/main`,
        {
          cache: 'no-cache',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${ppp.keyVault.getKey('github-token')}`
          }
        }
      );

      await maybeFetchError(rCurrentRef);

      const currentRef = await rCurrentRef.json();
      const rCurrentCommit = await fetch(currentRef.object.url, {
        cache: 'no-cache',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${ppp.keyVault.getKey('github-token')}`
        }
      });

      await maybeFetchError(rCurrentCommit);

      this.currentCommit = await rCurrentCommit.json();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async updateApp() {
    this.beginOperation();

    try {
      const rGitHubUser = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${ppp.keyVault.getKey('github-token')}`
        }
      });

      await maybeFetchError(rGitHubUser);

      const user = await rGitHubUser.json();
      const rUpdateHeads = await fetch(
        `https://api.github.com/repos/${user.login}/ppp/git/refs/heads/main`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${ppp.keyVault.getKey('github-token')}`
          },
          body: JSON.stringify({
            sha: this.targetCommit.sha
          })
        }
      );

      await maybeFetchError(rUpdateHeads);

      const rPagesBuildRequest = await fetch(
        `https://api.github.com/repos/${user.login}/ppp/pages/builds`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${ppp.keyVault.getKey('github-token')}`
          }
        }
      );

      await maybeFetchError(rPagesBuildRequest);

      this.updateComplete = true;

      this.succeedOperation(
        'Обновление успешно выполнено, обновите страницу. Изменения будут применены в течение нескольких минут'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export const updatesPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
      <span slot="header">
        Обновление PPP
      </span>
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
                  ?disabled="${(x) => x.page.loading || x.updateComplete}"
                  type="submit"
                  @click="${(x) => x.updateApp()}"
                  appearance="primary"
                >
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
                Приложение ppp получает обновления из ветви
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
        <span slot="actions"></span>
      </ppp-page>
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
export default UpdatesPage.compose({
  template: updatesPageTemplate,
  styles: updatesPageStyles
});
