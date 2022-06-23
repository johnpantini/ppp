import { ApiSupabasePage } from '../../../shared/pages/api-supabase.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { pageStyles } from '../page.js';

export const apiSupabasePageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
      <span slot="header">
        ${(x) =>
          x.document.name
            ? `Внешний API - Supabase - ${x.document.name}`
            : 'Внешний API - Supabase'}
      </span>
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>
              Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.
            </p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Supabase"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>URL проекта</h5>
            <p>
              Можно найти в панели управления проектом Supabase в подразделе API
              раздела Settings. Смотрите секцию Config, поле URL.
            </p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="url"
              placeholder="https://ppp.supabase.co"
              value="${(x) => x.document.url}"
              ${ref('url')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Ключ проекта</h5>
            <p>
              Можно найти в панели управления проектом Supabase в подразделе API
              раздела Settings. Смотрите секцию Project API keys, поле anon
              public.
              Будет сохранён в зашифрованном виде.
            </p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Ключ API"
              value="${(x) => x.document.key}"
              ${ref('key')}
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
              value="${(x) => x.document.db ?? 'postgres'}"
              ${ref('db')}
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
              value="${(x) => x.document.port ?? '5432'}"
              ${ref('port')}
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
              value="${(x) => x.document.user ?? 'postgres'}"
              ${ref('user')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Пароль</h5>
            <p>
              Пароль для подключения к базе данных. Будет сохранён в
              зашифрованном
              виде.
            </p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="Пароль"
              value="${(x) => x.document.password}"
              ${ref('password')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ApiSupabasePage.compose({
  template: apiSupabasePageTemplate,
  styles: pageStyles
});
