import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { APIS } from '../../lib/const.js';
import { checkPostgreSQLCredentials } from './api-supabase.js';
import '../badge.js';
import '../button.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const apiPostgreSqlPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$page.connectionName')}</h5>
          <p class="description">
            ${() => ppp.t('$page.arbitraryProfileName')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="PostgreSQL"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$apiPostgresqlPage.hostname')}</h5>
          <p class="description">
            ${() => ppp.t('$apiPostgresqlPage.hostnameDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="example.com"
            value="${(x) => x.document.hostname}"
            ${ref('hostname')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$apiPostgresqlPage.database')}</h5>
          <p class="description">
            ${() => ppp.t('$apiPostgresqlPage.databaseDescription')}
          </p>
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
          <h5>${() => ppp.t('$apiPostgresqlPage.port')}</h5>
          <p class="description">
            ${() => ppp.t('$apiPostgresqlPage.portDescription')}
          </p>
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
          <h5>${() => ppp.t('$apiPostgresqlPage.user')}</h5>
          <p class="description">
            ${() => ppp.t('$apiPostgresqlPage.userDescription')}
          </p>
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
          <h5>${() => ppp.t('$apiPostgresqlPage.password')}</h5>
          <p class="description">
            ${() => ppp.t('$apiPostgresqlPage.passwordDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="${() => ppp.t('$apiPostgresqlPage.password')}"
            value="${(x) => x.document.password}"
            ${ref('password')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const apiPostgreSqlPageStyles = css`
  ${pageStyles}
`;

export class ApiPostgreSqlPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.hostname);
    await validate(this.db);
    await validate(this.port);
    await validate(this.user);
    await validate(this.password);

    // TODO - check credentials.
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]'),
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.POSTGRESQL%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.POSTGRESQL,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        hostname: this.hostname.value.trim(),
        db: this.db.value.trim(),
        port: +Math.abs(this.port.value),
        user: this.user.value.trim(),
        password: this.password.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.POSTGRESQL,
        createdAt: new Date()
      }
    };
  }
}

export default ApiPostgreSqlPage.compose({
  name: 'ppp-api-postgresql-page',
  template: apiPostgreSqlPageTemplate,
  styles: apiPostgreSqlPageStyles
}).define();
