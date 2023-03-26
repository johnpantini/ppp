import ppp from '../../ppp.js';
import { css, html, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles, PageWithShiftLock } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import { hotkey } from '../../design/styles.js';
import '../badge.js';
import '../button.js';
import '../table.js';

export const telegramBotsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        Список ботов Telegram
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() =>
            ppp.app.navigate({
              page: 'telegram-bot'
            })}"
        >
          Добавить бота
        </ppp-button>
      </ppp-page-header>
      <ppp-table
        ${ref('shiftLockContainer')}
        :columns="${() => [
          {
            label: 'Название'
          },
          {
            label: 'Дата создания'
          },
          {
            label: 'Последнее изменение'
          },
          {
            label: 'Версия'
          },
          {
            label: html`
              <div class="control-line centered">
                <span>Действия</span><code class="hotkey static">Shift</code>
              </div>
            `
          }
        ]}"
        :rows="${(x) =>
          x.documents.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  class="link"
                  @click="${() => {
                    ppp.app.navigate({
                      page: 'telegram-bot',
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=telegram-bot&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <ppp-badge appearance="green">
                    ${() => datum.version}
                  </ppp-badge>
                `,
                html`
                  <ppp-button
                    disabled
                    shiftlock
                    class="xsmall"
                    @click="${() => x.removeDocumentFromListing(datum)}"
                  >
                    Удалить
                  </ppp-button>
                `
              ]
            };
          })}"
      >
      </ppp-table>
    </form>
  </template>
`;

export const telegramBotsPageStyles = css`
  ${pageStyles}
  ${hotkey()}
`;

export class TelegramBotsPage extends Page {
  collection = 'bots';

  async populate() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .find({
          removed: { $ne: true }
        })
        .sort({ updatedAt: -1 });
    };
  }
}

applyMixins(TelegramBotsPage, PageWithShiftLock);

export default TelegramBotsPage.compose({
  template: telegramBotsPageTemplate,
  styles: telegramBotsPageStyles
}).define();
