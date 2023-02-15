/** @decorator */

import ppp from '../../ppp.js';
import { maybeFetchError } from '../../lib/ppp-errors.js';
import {
  html,
  when,
  css,
  ref,
  observable
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { emptyState, typography } from '../../design/styles.js';
import { framedCloud } from '../../static/svg/sprite.js';
import '../text-field.js';
import '../button.js';

export const updatesPageTemplate = html`
  <template>
    <form novalidate>
      <ppp-page-header>Центр обновлений</ppp-page-header>
      ${when(
        (x) =>
          x.currentCommit?.sha && x.currentCommit?.sha === x.targetCommit?.sha,
        html` <div class="empty-state">
          ${html` <div class="picture">${html.partial(framedCloud)}</div>`}
          <h3>Приложение обновлено до последней версии</h3>
          <p class="body1">
            Текущая версия приложения:
            ${() => localStorage.getItem('ppp-version') ?? '1.0.0'}
          </p>
          <ppp-button
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
  ${typography()}
  ${emptyState()}
`;

export class UpdatesPage extends Page {
  @observable
  updateComplete;

  @observable
  targetCommit;

  @observable
  currentCommit;

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

      await maybeFetchError(
        rTargetRef,
        'Не удалось получить ссылку HEAD на ветку main официального репозитория PPP. Убедитесь, что токен GitHub не истёк.'
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
        'Не удалось получить последний commit ветки main официального репозитория PPP.'
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

      await maybeFetchError(
        rPagesBuildRequest,
        'Не удалось выполнить запрос на принудительную сборку GitHub Pages.'
      );

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

export default UpdatesPage.compose({
  template: updatesPageTemplate,
  styles: updatesPageStyles
}).define();
