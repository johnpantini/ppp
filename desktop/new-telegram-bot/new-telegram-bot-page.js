import { NewTelegramBotPage } from '../../base/new-telegram-bot/new-telegram-bot-page.js';
import { html } from '../../lib/template.js';
import { ref } from '../../lib/element/templating/ref.js';
import { css } from '../../lib/element/styles/css.js';
import { when } from '../../lib/element/templating/when.js';

import {
  basePageStyles,
  circleSvg,
  loadingIndicator
} from '../../design/leafygreen/styles/page.js';

import { settings } from '../../design/leafygreen/icons/settings.js';

export const newTelegramBotPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'}>Новый бот Telegram</ppp-page-header>
    <form ${ref(
      'form'
    )} id="new-telegram-bot" name="new-telegram-bot" onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => !!x.busy}">
        <section>
          <div class="section-index-icon">${circleSvg(1)}</div>
          <div class="label-group">
            <h6>Название профиля</h6>
            <p>
              Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.
            </p>
            <${'ppp-text-field'}
              placeholder="Введите имя"
              name="profileName"
              ${ref('profileName')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="section-index-icon">${circleSvg(2)}</div>
          <div class="label-group">
            <h6>Токен бота</h6>
            <${'ppp-banner'} class="inline margin-top" appearance="warning">
              Токен будет сохранён в зашифрованном виде (по алгоритму
              AES-GCM).
            </ppp-banner>
            <p>
              Получить можно у
              <a target="_blank" href="https://telegram.me/BotFather"
              >@BotFather</a
              >. Отправьте ему команду /newbot
            </p>
            <ppp-text-field
              placeholder="Bot token"
              name="botToken"
              ${ref('botToken')}
            ></ppp-text-field>
          </div>
        </section>
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => !!x.busy}"
            type="submit"
            @click="${(x) => x.addTelegramBot()}"
            appearance="primary"
          >
            ${when(
              (x) => !!x.busy,
              settings({
                slot: 'end',
                cls: 'spinner-icon'
              })
            )}
            ${i18n.t('save')}
          </ppp-button>
        </div>
      </section>
    </form>
  </template>
`;

export const newTelegramBotPageStyles = (context, definition) =>
  css`
    ${basePageStyles}
    section ppp-text-field,
    section ppp-banner {
      max-width: 600px;
    }
  `;

export const newTelegramBotPage = NewTelegramBotPage.compose({
  baseName: 'new-telegram-bot-page',
  template: newTelegramBotPageTemplate,
  styles: newTelegramBotPageStyles
});
