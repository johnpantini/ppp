import { ApiAstraDbPage } from '../../../shared/pages/api-astradb.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { when } from '../../../shared/element/templating/when.js';
import { css } from '../../../shared/element/styles/css.js';
import { pageStyles, loadingIndicator } from '../page.js';

export const apiAstraDbPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      ${(x) =>
        x.api
          ? `Внешний API - AstraDB - ${x.api?.name}`
          : 'Внешний API - AstraDB'}
    </ppp-page-header>
    <form ${ref('form')} novalidate onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        <section>
          <div class="label-group">
            <h5>Название подключения</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="AstraDb"
              value="${(x) => x.api?.name}"
              ${ref('apiName')}
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
              value="${(x) => x.api?.dbID}"
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
              value="${(x) => x.api?.dbRegion}"
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
              value="${(x) => x.api?.dbKeyspace}"
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
              placeholder="ASTRA_DB_APPLICATION_TOKEN"
              value="${(x) => x.api?.dbToken}"
              ${ref('dbToken')}
            ></ppp-text-field>
          </div>
        </section>
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => x.busy || x.api?.removed}"
            type="submit"
            @click="${(x) => x.connectApi()}"
            appearance="primary"
          >
            ${(x) => (x.api ? 'Обновить API' : 'Подключить API')}
          </ppp-button>
        </div>
      </section>
    </form>
    </div>
  </template>
`;

export const apiAstraDbPageStyles = (context, definition) =>
  css`
    ${pageStyles}
  `;

// noinspection JSUnusedGlobalSymbols
export const apiAstradbPage = ApiAstraDbPage.compose({
  baseName: 'api-astradb-page',
  template: apiAstraDbPageTemplate,
  styles: apiAstraDbPageStyles
});
