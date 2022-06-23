import { ApiPusherPage } from '../../../shared/pages/api-pusher.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles } from '../page.js';

export const apiPusherPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
      <span slot="header">
        ${(x) =>
          x.document.name
            ? `Внешний API - Pusher - ${x.document.name}`
            : 'Внешний API - Pusher'}
      </span>
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Pusher"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Id приложения</h5>
            <p>Смотрите раздел App Keys панели управления Pusher.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="app_id"
              value="${(x) => x.document.appid}"
              ${ref('appid')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Ключ приложения</h5>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="key"
              value="${(x) => x.document.key}"
              ${ref('key')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Секрет приложения</h5>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="secret"
              value="${(x) => x.document.secret}"
              ${ref('secret')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Кластер</h5>
            <p>Датацентр, где размещено приложение.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="eu"
              value="${(x) => x.document.cluster ?? 'eu'}"
              ${ref('cluster')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ApiPusherPage.compose({
  template: apiPusherPageTemplate,
  styles: pageStyles
});
