import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { APIS } from '../../lib/const.js';
import { checkAstraDbCredentials } from '../../lib/astradb.js';
import '../button.js';
import '../text-field.js';

export const apiAstraDbPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name
            ? `Внешние API - AstraDB - ${x.document.name}`
            : 'Внешние API - AstraDB'}
      </ppp-page-header>
      <section>
        <div class="label-group">
          <h5>Название подключения</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="AstraDB"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Идентификатор базы данных</h5>
          <p class="description">
            Можно найти в панели управления базой данных, ключ ASTRA_DB_ID.
          </p>
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
          <p class="description">
            Можно найти в панели управления базой данных, ключ ASTRA_DB_REGION.
          </p>
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
          <p class="description">
            Можно найти в панели управления базой данных, ключ
            ASTRA_DB_KEYSPACE.
          </p>
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
          <p class="description">
            Хранится в переменной окружения ASTRA_DB_APPLICATION_TOKEN.
          </p>
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
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Сохранить изменения
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const apiAstraDbPageStyles = css`
  ${pageStyles}
`;

export class ApiAstraDbPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.dbID);
    await validate(this.dbRegion);
    await validate(this.dbKeyspace);
    await validate(this.dbToken);

    if (
      !(
        await checkAstraDbCredentials({
          dbUrl: `https://${this.dbID.value.trim()}-${this.dbRegion.value.trim()}.apps.astra.datastax.com`,
          dbKeyspace: this.dbKeyspace.value.trim(),
          dbToken: this.dbToken.value.trim(),
          serviceMachineUrl: ppp.keyVault.getKey('service-machine-url')
        })
      ).ok
    ) {
      invalidate(this.dbToken, {
        errorMessage: 'Неверный токен',
        raiseException: true
      });
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]'),
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.ASTRADB%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.ASTRADB,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        dbID: this.dbID.value.trim(),
        dbRegion: this.dbRegion.value.trim(),
        dbKeyspace: this.dbKeyspace.value.trim(),
        dbToken: this.dbToken.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.ASTRADB,
        createdAt: new Date()
      }
    };
  }
}

export default ApiAstraDbPage.compose({
  name: 'ppp-api-astradb-page',
  template: apiAstraDbPageTemplate,
  styles: apiAstraDbPageStyles
}).define();
