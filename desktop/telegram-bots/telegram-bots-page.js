/** @decorator */

import { TelegramBotsPage } from '../../base/telegram-bots/telegram-bots-page.js';
import { html } from '../../lib/template.js';
import { css } from '../../lib/element/styles/css.js';
import { when } from '../../lib/element/templating/when.js';
import { ref } from '../../lib/element/templating/ref.js';
import {
  basePageStyles,
  loadingIndicator
} from '../../design/leafygreen/styles/page.js';

export const telegramBotsPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>
      <${'ppp-button'}
        appearance="primary"
        slot="controls"
        @click="${(x) => (x.app.page = 'new-telegram-bot')}"
      >
        Добавить бота
      </ppp-button>
      Список ботов Telegram
    </ppp-page-header>
    <div class="loading-wrapper" ?busy="${(x) => x.busy}">
      <${'ppp-table'} ${ref('table')}
        :columns="${(x) => x.columns}">
      </ppp-table>
      ${when((x) => x.busy, html`${loadingIndicator()}`)}
    </div>
  </template>
`;

export const telegramBotsPageStyles = (context, definition) =>
  css`
    ${basePageStyles}
    .loading-wrapper {
      margin-top: 8px;
    }
  `;

export const telegramBotsPage = TelegramBotsPage.compose({
  baseName: 'telegram-bots-page',
  template: telegramBotsPageTemplate,
  styles: telegramBotsPageStyles
});
