/** @decorator */

import ppp from '../../ppp.js';
import { maybeFetchError } from '../../lib/ppp-errors.js';
import { html, when, css, observable } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { emptyState } from '../../design/styles.js';
import { framedCloud } from '../../static/svg/sprite.js';
import { formatDate } from '../../lib/intl.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../text-field.js';

const isAlwaysUpToDateDomain =
  window.location.origin === 'https://johnpantini.johnpantini.pages.dev' ||
  window.location.origin === 'https://johnpantini.pages.dev';

export const updatesPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>Центр обновлений</ppp-page-header>
      ${when(
        (x) =>
          !isAlwaysUpToDateDomain &&
          x.currentCommit?.sha &&
          x.targetCommit?.sha &&
          x.currentCommit?.sha !== x.targetCommit?.sha,
        html`
          <div class="spacing2"></div>
          <ppp-banner class="inline margin-top" appearance="info">
            Для полного применения обновления может потребоваться несколько
            минут.
          </ppp-banner>
          <section>
            <div class="label-group">
              <h6>Текущая версия</h6>
              <div class="spacing2"></div>
              <ppp-badge appearance="yellow">
                ${(x) => x.currentCommit?.sha}
              </ppp-badge>
              <p class="description">
                ${(x) => formatDate(x.currentCommit?.author.date)} MSK
              </p>
            </div>
          </section>
          <section>
            <div class="label-group">
              <h6>Последняя версия</h6>
              <div class="spacing2"></div>
              <ppp-badge appearance="green">
                ${(x) => x.targetCommit?.sha}
              </ppp-badge>
              <p class="description">
                ${(x) => formatDate(x.targetCommit?.author.date)} MSK
              </p>
            </div>
          </section>
          <section class="last">
            <div class="footer-actions">
              <ppp-button
                type="submit"
                appearance="primary"
                @click="${(x) => x.updateApp()}"
              >
                Обновить приложение
              </ppp-button>
            </div>
          </section>
        `
      )}
      ${when(
        (x) =>
          isAlwaysUpToDateDomain ||
          (x.currentCommit?.sha &&
            x.currentCommit?.sha === x.targetCommit?.sha),
        html` <div class="empty-state">
          <div class="picture">${html.partial(framedCloud)}</div>
          <h3>Репозиторий приложения синхронизирован с последней версией</h3>
          <p class="body1">
            Текущая версия приложения:
            ${() => localStorage.getItem('ppp-version') ?? '1.0.0'}
          </p>
          <ppp-button
            ?hidden="${() => isAlwaysUpToDateDomain}"
            appearance="primary"
            class="large"
            @click="${(x) => x.checkForUpdates()}"
          >
            Проверить ещё раз
          </ppp-button>
        </div>`
      )}
    </form>
  </template>
`;

export const updatesPageStyles = css`
  ${pageStyles}
  ${emptyState()}
`;

export class UpdatesPage extends Page {
  @observable
  targetCommit;

  @observable
  currentCommit;

  async connectedCallback() {
    await super.connectedCallback();

    return this.checkForUpdates();
  }

  async checkForUpdates() {
    if (isAlwaysUpToDateDomain) return;

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

      await maybeFetchError(
        rTargetRef,
        'Не удалось получить ссылку HEAD на ветку main официального репозитория. Убедитесь, что токен GitHub не истёк.'
      );

      const targetRef = await rTargetRef.json();
      const rTargetCommit = await fetch(targetRef.object.url, {
        cache: 'no-cache',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${ppp.keyVault.getKey('github-token')}`
        }
      });

      await maybeFetchError(
        rTargetCommit,
        'Не удалось получить последний commit ветки main официального репозитория.'
      );

      this.targetCommit = await rTargetCommit.json();

      const rGitHubUser = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${ppp.keyVault.getKey('github-token')}`
        }
      });

      await maybeFetchError(
        rGitHubUser,
        'Не удалось получить профиль пользователя GitHub.'
      );

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

      await maybeFetchError(
        rCurrentRef,
        'Не удалось получить ссылку HEAD на ветку main в текущем репозитории.'
      );

      const currentRef = await rCurrentRef.json();
      const rCurrentCommit = await fetch(currentRef.object.url, {
        cache: 'no-cache',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${ppp.keyVault.getKey('github-token')}`
        }
      });

      await maybeFetchError(
        rCurrentCommit,
        'Не удалось получить последний commit ветки main в текущем репозитории.'
      );

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

      await maybeFetchError(
        rGitHubUser,
        'Не удалось получить профиль пользователя GitHub.'
      );

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

      await maybeFetchError(
        rUpdateHeads,
        'Не удалось изменить ссылку HEAD на ветку main в текущем репозитории.'
      );

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

      // The repository does not have a GitHub Pages site.
      if (rPagesBuildRequest.status !== 403) {
        await maybeFetchError(
          rPagesBuildRequest,
          'Не удалось выполнить запрос на принудительную сборку GitHub Pages.'
        );
      }

      this.currentCommit = this.targetCommit;

      this.showSuccessNotification(
        'Приложение синхронизировано с последней версией. Когда обновление будет готово, вы получите уведомление.'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export default UpdatesPage.compose({
  template: updatesPageTemplate,
  styles: updatesPageStyles
}).define();
