import { TelegramBotPage } from '../../shared/telegram-bot-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const telegramBotPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Бот Telegram - ${x.document.name}`
              : 'Бот Telegram'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название бота</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="My bot"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Токен бота</h5>
            <p>
              Будет сохранён в зашифрованном виде. Получить можно у
              <a target="_blank" rel="noopener"
                 href="https://telegram.me/BotFather"
              >@BotFather</a
              > - отправьте ему команду /newbot
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
        <div class="folding">
          <div class="folding-header" @click="${(x, c) =>
            c.event.target.parentNode.classList.toggle('folding-open')}"
          >
            <div class="folding-header-toggle">
              <img slot="logo" draggable="false" alt="Toggle"
                   src="static/fa/angle-down.svg"/>
            </div>
            <div class="folding-header-text">Webhook</div>
          </div>
          <div class="folding-content">
            <section>
              <div class="label-group">
                <h5>Webhook</h5>
                <p>
                  Укажите webhook для привязки к боту. Чтобы удалить webhook,
                  оставьте поле пустым.
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
                  <${'ppp-collection-select'}
                    ${ref('endpointSelector')}
                    :context="${(x) => x}"
                    :placeholder="${() =>
                      'Нажмите, чтобы выбрать конечную точку'}"
                    :query="${() => {
                      return (context) => {
                        return context.http
                          .get({
                            url: 'https://realm.mongodb.com/api/admin/v3.0/groups/[%#ppp.keyVault.getKey("mongo-group-id")%]/apps/[%#ppp.keyVault.getKey("mongo-app-id")%]/endpoints',
                            headers: {
                              Authorization: [
                                'Bearer [%#(await ppp.getMongoDBRealmAccessToken())%]'
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
                  ></ppp-collection-select>
                  <${'ppp-button'}
                    class="margin-top"
                    @click="${(x) => x.setWebhookUrlByEndpoint()}"
                    appearance="primary"
                  >
                    Установить ссылку по конечной точке
                  </ppp-button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default TelegramBotPage.compose({
  template: telegramBotPageTemplate,
  styles: pageStyles
});
