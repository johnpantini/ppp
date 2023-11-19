import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { BROKERS } from '../../lib/const.js';
import { getAspirantWorkerBaseUrl } from './service-ppp-aspirant-worker.js';
import { HMAC } from '../../lib/ppp-crypto.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../select.js';
import '../text-field.js';

export const brokerBybitPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
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
            placeholder="Bybit"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ключ API</h5>
          <p class="description">
            Ключ и секрет можно сгенерировать по
            <a
              class="link"
              href="https://www.bybit.com/app/user/api-management"
              target="_blank"
              rel="noopener"
              >ссылке</a
            >.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="API Key"
            value="${(x) => x.document.key}"
            ${ref('key')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>API Secret</h5>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="password"
            placeholder="API Secret"
            value="${(x) => x.document.secret}"
            ${ref('secret')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Конечная точка</h5>
        </div>
        <div class="input-group">
          <ppp-select
            value="${(x) => x.document.endpoint ?? 'https://api.bybit.com'}"
            ${ref('endpoint')}
          >
            <ppp-option value="https://api.bybit.com">
              https://api.bybit.com
            </ppp-option>
            <ppp-option value="https://api.bytick.com">
              https://api.bytick.com
            </ppp-option>
          </ppp-select>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Сервис-соединитель</h5>
          <p class="description">
            Будет использован для совершения запросов к API Bybit.
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('connectorServiceId')}
            :context="${(x) => x}"
            value="${(x) => x.document.connectorServiceId}"
            :preloaded="${(x) => x.document.connectorService ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('services')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.PPP_ASPIRANT_WORKER%]`
                      },
                      { workerPredefinedTemplate: 'connectors' },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          {
                            _id: `[%#this.document.connectorServiceId ?? ''%]`
                          }
                        ]
                      }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const brokerBybitPageStyles = css`
  ${pageStyles}
`;

export async function checkBybitCredentials({
  connectorUrl,
  endpoint,
  key,
  secret
}) {
  const timestamp = Date.now().toString();
  const signature = await HMAC(
    secret,
    [timestamp, key, 5000, 'accountType=UNIFIED'].join(''),
    {
      format: 'hex'
    }
  );

  const response = await fetch(`${connectorUrl}fetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      method: 'GET',
      url: `${endpoint}/v5/account/wallet-balance?accountType=UNIFIED`,
      headers: {
        'X-BAPI-API-KEY': key,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-SIGN': signature,
        'X-BAPI-RECV-WINDOW': '5000'
      }
    })
  });

  if (!response.ok) {
    return response;
  } else {
    const json = await response.json();

    return {
      ok: json.retCode === 0,
      retCode: json.retCode
    };
  }
}

export class BrokerBybitPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.key);
    await validate(this.secret);
    await validate(this.connectorServiceId);

    const connector = this.connectorServiceId.datum();
    const connectorUrl = await getAspirantWorkerBaseUrl(connector);

    if (
      !(
        await checkBybitCredentials({
          connectorUrl,
          endpoint: this.endpoint.value,
          key: this.key.value.trim(),
          secret: this.secret.value.trim()
        })
      ).ok
    ) {
      invalidate(this.secret, {
        errorMessage: 'Не удалось выполнить проверочный запрос к API Bybit',
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
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]'),
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.BYBIT%]`
            }
          },
          {
            $lookup: {
              from: 'services',
              localField: 'connectorServiceId',
              foreignField: '_id',
              as: 'connectorService'
            }
          },
          {
            $unwind: {
              path: '$connectorService',
              preserveNullAndEmptyArrays: true
            }
          }
        ]);
    };
  }

  async find() {
    return {
      type: BROKERS.BYBIT,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        key: this.key.value.trim(),
        secret: this.secret.value.trim(),
        endpoint: this.endpoint.value,
        connectorServiceId: this.connectorServiceId.value,
        version: 1,
        type: BROKERS.BYBIT,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BrokerBybitPage.compose({
  template: brokerBybitPageTemplate,
  styles: brokerBybitPageStyles
}).define();
