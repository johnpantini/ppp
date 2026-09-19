import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { APIS } from '../../lib/const.js';
import '../badge.js';
import '../button.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const apiBitioPageTemplate = html`
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
          <h5>${() => ppp.t('$apiBitioPage.dbApiKey')}</h5>
          <p class="description">
            ${() => ppp.t('$apiBitioPage.dbApiKeyDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="${() => ppp.t('$apiBitioPage.apiKeyPlaceholder')}"
            value="${(x) => x.document.apiKey}"
            ${ref('apiKey')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$apiBitioPage.database')}</h5>
          <p class="description">
            ${() => ppp.t('$apiBitioPage.databaseDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="ppp"
            value="${(x) => x.document.db}"
            ${ref('db')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const apiBitioPageStyles = css`
  ${pageStyles}
`;

export class ApiBitioPage extends Page {
  collection = 'apis';

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]'),
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.BITIO%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.BITIO,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return false;
  }
}

export default ApiBitioPage.compose({
  template: apiBitioPageTemplate,
  styles: apiBitioPageStyles
}).define();
