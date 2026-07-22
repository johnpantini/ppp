import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { BROKERS } from '../../lib/const.js';
import '../badge.js';
import '../button.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const brokerAlorPageTemplate = html`
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
            placeholder="Alor"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$brokerAlorPage.apiTokenTitle')}</h5>
          <p class="description">
            ${() => ppp.t('$brokerAlorPage.apiTokenDescription')}
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://alor.dev/open-api-tokens"
              >${() => ppp.t('$brokerAlorPage.link')}</a
            >. ${() => ppp.t('$brokerAlorPage.firstTimeHint')}
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://alor.dev/register"
              >${() => ppp.t('$brokerAlorPage.registerLink')}</a
            >
            ${() => ppp.t('$brokerAlorPage.beforehand')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="Alor refresh token"
            value="${(x) => x.document.refreshToken}"
            ${ref('refreshToken')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const brokerAlorPageStyles = css`
  ${pageStyles}
`;

export async function checkAlorOAPIV2RefreshToken({ refreshToken }) {
  return fetch(`https://oauth.alor.ru/refresh?token=${refreshToken}`, {
    cache: 'no-cache',
    method: 'POST'
  });
}

export class BrokerAlorPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.refreshToken);

    if (
      !(
        await checkAlorOAPIV2RefreshToken({
          refreshToken: this.refreshToken.value.trim()
        })
      ).ok
    ) {
      invalidate(this.refreshToken, {
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.ALOR%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.ALOR,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        refreshToken: this.refreshToken.value.trim(),
        version: 1,
        type: BROKERS.ALOR,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BrokerAlorPage.compose({
  template: brokerAlorPageTemplate,
  styles: brokerAlorPageStyles
}).define();
