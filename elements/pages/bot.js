import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { checkTelegramBotToken, TelegramBot } from '../../lib/telegram.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../text-field.js';

export const botPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>Название бота</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="My bot"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Токен бота</h5>
          <p class="description">
            Будет сохранён в зашифрованном виде. Получить можно у
            <a
              target="_blank"
              rel="noopener"
              href="https://telegram.me/BotFather"
              >@BotFather</a
            >
            - отправьте ему команду /newbot
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Токен бота"
            value="${(x) => x.document.token}"
            ${ref('token')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Webhook</h5>
          <p class="description">
            Укажите webhook для привязки к боту. Чтобы удалить webhook, оставьте
            поле пустым.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="url"
            value="${(x) => x.document.webhook}"
            placeholder="https://example.com"
            ${ref('webhook')}
          >
          </ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const botPageStyles = css`
  ${pageStyles}
`;

export class BotPage extends Page {
  collection = 'bots';

  async validate() {
    await validate(this.name);
    await validate(this.token);

    if (
      !(
        await checkTelegramBotToken({
          token: this.token.value.trim()
        })
      ).ok
    ) {
      invalidate(this.token, {
        errorMessage: 'Неверный токен',
        raiseException: true
      });
    }

    const webhook = this.webhook.value.trim();

    if (webhook) {
      try {
        new URL(webhook);
      } catch (e) {
        invalidate(this.webhook, {
          errorMessage: 'Неверный или неполный URL',
          raiseException: true
        });
      }
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]')
        });
    };
  }

  async find() {
    return {
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const token = this.token.value.trim();
    const webhook = this.webhook.value.trim();
    const telegramBot = new TelegramBot({
      token
    });

    if (this.webhook.value) {
      await maybeFetchError(
        await telegramBot.setWebhook(new URL(this.webhook.value).toString()),
        'Ошибка установки webhook.'
      );
    } else {
      await maybeFetchError(
        await telegramBot.deleteWebhook(),
        'Ошибка удаления webhook.'
      );
    }

    return {
      $set: {
        name: this.name.value.trim(),
        token,
        webhook,
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BotPage.compose({
  template: botPageTemplate,
  styles: botPageStyles
}).define();
