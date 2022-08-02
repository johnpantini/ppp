import { ApiAstraDbPage } from '../../shared/api-astradb-page.js';
import { pageStyles } from './page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';

export const apiAstraDbPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) =>
            x.document.name
              ? `Внешний API - AstraDB - ${x.document.name}`
              : 'Внешний API - AstraDB'}
        </span>
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Astra"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Идентификатор базы данных</h5>
            <p>Можно найти в панели управления базой данных, ключ
              ASTRA_DB_ID.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="ASTRA_DB_ID"
              value="${(x) => x.document.dbID}"
              ${ref('dbID')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Регион базы данных</h5>
            <p>Можно найти в панели управления базой данных, ключ
              ASTRA_DB_REGION.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="europe-west1"
              value="${(x) => x.document.dbRegion}"
              ${ref('dbRegion')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Пространство ключей</h5>
            <p>Можно найти в панели управления базой данных, ключ
              ASTRA_DB_KEYSPACE.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="ASTRA_DB_KEYSPACE"
              value="${(x) => x.document.dbKeyspace}"
              ${ref('dbKeyspace')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Токен доступа</h5>
            <p>Хранится в переменной окружения ASTRA_DB_APPLICATION_TOKEN.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="password"
              placeholder="ASTRA_DB_APPLICATION_TOKEN"
              value="${(x) => x.document.dbToken}"
              ${ref('dbToken')}
            ></ppp-text-field>
          </div>
        </section>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ApiAstraDbPage.compose({
  baseName: 'api-astradb-page',
  template: apiAstraDbPageTemplate,
  styles: pageStyles
});
