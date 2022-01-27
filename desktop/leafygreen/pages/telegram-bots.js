import { TelegramBotsPage } from '../../../shared/pages/telegram-bots.js';
import { html } from '../../../shared/template.js';
import { css } from '../../../shared/element/styles/css.js';
import { when } from '../../../shared/element/templating/when.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { formatDate } from '../../../shared/intl.js';
import { trash } from '../icons/trash.js';

export const telegramBotsPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      <${'ppp-button'}
        appearance="primary"
        slot="controls"
        @click="${(x) =>
          x.app.navigate({
            page: 'telegram-bot'
          })}"
      >
        Добавить бота
      </ppp-button>
      Список ботов Telegram
    </ppp-page-header>
    <div class="loading-wrapper" ?busy="${(x) => x.busy}">
      <${'ppp-table'}
        ${ref('table')}
        :columns="${(x) => x.columns}"
        :rows="${(x) =>
          x.rows.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  @click="${() => {
                    x.app.navigate({
                      page: 'telegram-bot',
                      bot: datum._id
                    });

                    return false;
                  }}"
                  href="?page=telegram-bot&bot=${datum._id}"
                  >${datum.name}</a
                >`,
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                datum.version,
                html`
                  <${'ppp-button'}
                    class="xsmall"
                    @click="${() => x.simpleRemove('bots', datum._id)}"
                  >
                    ${trash()}
                  </ppp-button>`
              ]
            };
          })}"
      >
      </ppp-table>
      ${when((x) => x.busy, html`${loadingIndicator()}`)}
    </div>
  </template>
`;

export const telegramBotsPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    .loading-wrapper {
      margin-top: 8px;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const telegramBotsPage = TelegramBotsPage.compose({
  baseName: 'telegram-bots-page',
  template: telegramBotsPageTemplate,
  styles: telegramBotsPageStyles
});
