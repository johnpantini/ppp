import { ApiCloudflarePage } from '../../shared/api-cloudflare-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';

export const apiCloudflarePageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Внешний API - Cloudflare - ${x.document.name}`
              : 'Внешний API - Cloudflare'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Cloudflare"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>ID учётной записи</h5>
            <p>Можно получить в панели управления в разделе Workers.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="ID учётной записи"
              value="${(x) => x.document.accountID}"
              ${ref('accountID')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>E-mail учётной записи</h5>
            <p>Адрес электронной почты учётной записи Cloudflare.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="email"
              placeholder="mail@example.com"
              value="${(x) => x.document.email}"
              ${ref('email')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Ключ API</h5>
            <p>Global API Key. Можно найти по <a
              href="https://dash.cloudflare.com/profile/api-tokens"
              target="_blank" rel="noopener">ссылке</a>.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="Global API Key"
              value="${(x) => x.document.apiKey}"
              ${ref('apiKey')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ApiCloudflarePage.compose({
  template: apiCloudflarePageTemplate,
  styles: pageStyles
});
