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
import { getMongoDBRealmAccessToken } from '../../lib/realm.js';
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
          <div class="control-stack">
            <ppp-query-select
              ${ref('endpointSelector')}
              :context="${(x) => x}"
              :placeholder="${() => 'Нажмите, чтобы выбрать конечную точку'}"
              :query="${() => {
                return (context) => {
                  if (typeof context.http === 'undefined') {
                    return fetch(
                      new URL(
                        '/api/admin/v3.0/groups/[%#ppp.keyVault.getKey("mongo-group-id")%]/apps/[%#ppp.keyVault.getKey("mongo-app-id")%]/endpoints',
                        '[%#ppp.keyVault.getKey("global-proxy-url")%]'
                      ).toString(),
                      {
                        headers: {
                          Authorization:
                            'Bearer [%#(await this.getMongoDBRealmAccessToken())%]',
                          'X-Host': 'realm.mongodb.com',
                          'X-Allowed-Headers': 'Authorization'
                        }
                      }
                    )
                      .then((response) => response.json())
                      .catch(() => Promise.resolve([]));
                  }

                  return context.http
                    .get({
                      url: 'https://realm.mongodb.com/api/admin/v3.0/groups/[%#ppp.keyVault.getKey("mongo-group-id")%]/apps/[%#ppp.keyVault.getKey("mongo-app-id")%]/endpoints',
                      headers: {
                        Authorization: [
                          'Bearer [%#(await this.getMongoDBRealmAccessToken())%]'
                        ]
                      }
                    })
                    .then((response) => EJSON.parse(response.body.text()))
                    .catch(() => Promise.resolve([]));
                };
              }}"
              :transform="${() => (d) => {
                return d
                  .filter((e) => {
                    return (
                      !e.route.startsWith('/cloud_credentials') &&
                      !e.route.startsWith('/psina')
                    );
                  })
                  .map((e) => {
                    return {
                      _id: e._id,
                      name: e.function_name,
                      value: e.route
                    };
                  });
              }}"
            ></ppp-query-select>
            <ppp-button
              @click="${(x) => x.setWebhookUrlByEndpoint()}"
              appearance="primary"
            >
              Установить ссылку по конечной точке
            </ppp-button>
          </div>
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

  async getMongoDBRealmAccessToken({ username, apiKey } = {}) {
    return getMongoDBRealmAccessToken({
      username,
      apiKey
    });
  }

  async setWebhookUrlByEndpoint() {
    const datum = this.endpointSelector.datum();

    if (!datum) {
      invalidate(this.endpointSelector, {
        errorMessage: 'Сначала выберите конечную точку',
        skipScrollIntoView: true
      });
    } else {
      const locationUrl = ppp.keyVault.getKey('mongo-location-url');

      if (!locationUrl) {
        invalidate(ppp.app.toast, {
          errorMessage:
            'Не получается сгенерировать ссылку - соединитесь с облачной базой данных MongoDB Realm хотя бы один раз.',
          raiseException: true
        });
      }

      this.webhook.appearance = 'default';
      this.webhook.value =
        locationUrl.replace('aws.stitch.mongodb', 'aws.data.mongodb-api') +
        `/app/${ppp.keyVault.getKey('mongo-app-client-id')}/endpoint${
          datum.value
        }`;
    }
  }

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
