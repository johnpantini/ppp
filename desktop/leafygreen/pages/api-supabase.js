import { ApiSupabasePage } from '../../../shared/pages/api-supabase.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { when } from '../../../shared/element/templating/when.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles, loadingIndicator } from '../page.js';

export const apiSupabasePageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>Внешние API - Supabase
    </ppp-page-header>
    <form ${ref('form')} onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              ?disabled="${x => x.api}"
              placeholder="Supabase"
              value="${x => x.api?._id}"
              ${ref('apiName')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>URL проекта</h5>
            <p>Можно найти в панели управления проектом Supabase в подразделе
              API раздела Settings. Смотрите секцию Config, поле URL.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="url"
              placeholder="https://ppp.supabase.co"
              value="${x => x.api?.url}"
              ${ref('apiUrl')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Ключ проекта</h5>
            <p>Можно найти в панели управления проектом Supabase в подразделе
              API раздела Settings. Смотрите секцию Project API keys, поле anon
              public. Будет сохранён в зашифрованном виде.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Ключ API"
              value="${x => x.api?.key}"
              ${ref('apiKey')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>База данных</h5>
            <p>Название базы данных для подключения.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="postgres"
              value="${x => x.api?.db ?? 'postgres'}"
              ${ref('dbName')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Порт</h5>
            <p>Порт для подключения к базе данных.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="number"
              placeholder="5432"
              value="${x => x.api?.port ?? '5432'}"
              ${ref('dbPort')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Пользователь</h5>
            <p>Имя пользователя для подключения к базе данных.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="postgres"
              value="${x => x.api?.user ?? 'postgres'}"
              ${ref('dbUser')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Пароль</h5>
            <p>Пароль для подключения к базе данных. Будет сохранён в
              зашифрованном виде.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="Пароль"
              value="${x => x.api?.password}"
              ${ref('dbPassword')}
            ></ppp-text-field>
          </div>
        </section>
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => x.busy}"
            type="submit"
            @click="${(x) => x.connectApi()}"
            appearance="primary"
          >
            Подключить API
          </ppp-button>
        </div>
      </section>
    </form>
    </div>
  </template>
`;

export const apiSupabasePageStyles = (context, definition) =>
  css`
    ${pageStyles}
  `;

// noinspection JSUnusedGlobalSymbols
export const apiSupabasePage = ApiSupabasePage.compose({
  baseName: 'api-supabase-page',
  template: apiSupabasePageTemplate,
  styles: apiSupabasePageStyles
});
