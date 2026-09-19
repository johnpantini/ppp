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
import '../badge.js';
import '../button.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const apiSeatablePageTemplate = html`
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
            placeholder="Seatable"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$apiSeatablePage.baseToken')}</h5>
          <p class="description">
            ${() => ppp.t('$apiSeatablePage.baseTokenDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Token"
            value="${(x) => x.document.baseToken}"
            ${ref('baseToken')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const apiSeatablePageStyles = css`
  ${pageStyles}
`;

export async function checkSeatableCredentials({ baseToken }) {
  return ppp.fetch(
    'https://cloud.seatable.io/api/v2.1/dtable/app-access-token/',
    {
      headers: {
        Authorization: `Token ${baseToken}`
      }
    }
  );
}

export class ApiSeatablePage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.baseToken);

    if (
      !(
        await checkSeatableCredentials({
          baseToken: this.baseToken.value.trim()
        })
      ).ok
    ) {
      invalidate(this.baseToken, {
        errorMessage: ppp.t('$page.invalidToken'),
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.SEATABLE%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.SEATABLE,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        baseToken: this.baseToken.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.SEATABLE,
        createdAt: new Date()
      }
    };
  }
}

export default ApiSeatablePage.compose({
  template: apiSeatablePageTemplate,
  styles: apiSeatablePageStyles
}).define();
