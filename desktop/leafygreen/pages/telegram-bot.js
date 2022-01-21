import { TelegramBotPage } from '../../../shared/pages/telegram-bot.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { when } from '../../../shared/element/templating/when.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles, loadingIndicator } from '../page.js';

export const telegramBotPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      ${x => x.bot ? `Бот Telegram - ${x.bot?.name}` : 'Бот Telegram'}
    </ppp-page-header>
    <form ${ref('form')} novalidate onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        <section>
          <div class="label-group">
            <h5>Название бота</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="My bot"
              value="${(x) => x.bot?.name}"
              ${ref('botName')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Токен бота</h5>
            <p>
              Будет сохранён в зашифрованном виде. Получить можно у
              <a target="_blank" href="https://telegram.me/BotFather"
              >@BotFather</a
              > - отправьте ему команду /newbot
            </p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Токен бота"
              value="${(x) => x.bot?.token}"
              ${ref('botToken')}
            ></ppp-text-field>
          </div>
        </section>
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => x.busy || x.bot?.removed}"
            type="submit"
            @click="${(x) => x.addTelegramBot()}"
            appearance="primary"
          >
            ${x => x.bot ? 'Обновить бота' : 'Добавить бота'}
          </ppp-button>
        </div>
      </section>
    </form>
    </div>
  </template>
`;

export const telegramBotPageStyles = (context, definition) =>
  css`
    ${pageStyles}
  `;

// noinspection JSUnusedGlobalSymbols
export const telegramBotPage = TelegramBotPage.compose({
  baseName: 'telegram-bot-page',
  template: telegramBotPageTemplate,
  styles: telegramBotPageStyles
});
