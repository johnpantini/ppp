import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { BROKERS } from '../../lib/const.js';
import { getAspirantBaseUrl } from './service-ppp-aspirant-worker.js';
import { later } from '../../lib/ppp-decorators.js';
import '../badge.js';
import '../button.js';
import '../query-select.js';
import '../text-field.js';

export const brokerIbPageTemplate = html`
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
            placeholder="IB"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Хост TWS</h5>
          <p class="description">Хост Trader Workstation.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="host.docker.internal"
            value="${(x) => x.document.twsHost ?? 'host.docker.internal'}"
            ${ref('twsHost')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Порт TWS</h5>
          <p class="description">Порт Trader Workstation.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="7496"
            value="${(x) => x.document.twsPort ?? 7496}"
            ${ref('twsPort')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ссылка на шлюз TWS API</h5>
          <p class="description">
            Конечная точка, которая будет использована для взаимодействия с IB.
            Можно установить по сервису:
          </p>
          <ppp-query-select
            ${ref('ibGatewayServiceId')}
            :context="${(x) => x}"
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
                      { workerPredefinedTemplate: 'ibGateway' },
                      { removed: { $ne: true } }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
          <div class="spacing2"></div>
          <ppp-button
            ?disabled="${(x) => !x.ibGatewayServiceId.value}"
            appearance="primary"
            @click="${async (x) => {
              x.beginOperation();

              try {
                const datum = x.ibGatewayServiceId.datum();
                let aspirantUrl = await getAspirantBaseUrl(
                  await ppp.decrypt(
                    await ppp.user.functions.findOne(
                      {
                        collection: 'services'
                      },
                      { _id: datum.aspirantServiceId }
                    )
                  )
                );

                if (!aspirantUrl.endsWith('/')) {
                  aspirantUrl = `${aspirantUrl}/`;
                }

                x.ibGatewayUrl.value = `${aspirantUrl}workers/${datum._id}/`;
              } catch (e) {
                x.failOperation(e, 'Ссылка на шлюз');
              } finally {
                x.endOperation();
              }
            }}"
          >
            Взять ссылку из сервиса
          </ppp-button>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="https://example.com/"
            value="${(x) => x.document.ibGatewayUrl}"
            ${ref('ibGatewayUrl')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const brokerIbPageStyles = css`
  ${pageStyles}
`;

export class BrokerIbPage extends Page {
  collection = 'brokers';

  async validate() {
    await validate(this.name);
    await validate(this.twsHost);
    await validate(this.twsPort);
    await validate(this.ibGatewayUrl);

    let gatewayUrl = this.ibGatewayUrl.value.trim();

    if (!gatewayUrl.endsWith('/')) {
      gatewayUrl = `${gatewayUrl}/`;
    }

    const connectionRequest = await fetch(`${gatewayUrl}call`, {
      method: 'POST',
      body: JSON.stringify({
        method: 'connect',
        body: {
          host: this.twsHost.value.trim(),
          port: Math.abs(+this.twsPort.value)
        }
      })
    });

    await maybeFetchError(connectionRequest, 'Нет связи со шлюзом.');
    await later(3000);

    const timeRequest = await fetch(`${gatewayUrl}call`, {
      method: 'POST',
      body: JSON.stringify({
        method: 'getCurrentTime'
      })
    });

    await maybeFetchError(timeRequest, 'Шлюз не выполнил запрос времени.');

    const { result } = await timeRequest.json();

    if (typeof result !== 'number') {
      invalidate(ppp.app.toast, {
        errorMessage: 'Шлюз ответил ошибкой на запрос времени.',
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
          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.IB%]`
        });
    };
  }

  async find() {
    return {
      type: BROKERS.IB,
      name: this.name.value.trim()
    };
  }

  async submit() {
    return {
      $set: {
        name: this.name.value.trim(),
        twsHost: this.twsHost.value.trim(),
        twsPort: Math.abs(+this.twsPort.value),
        ibGatewayUrl: this.ibGatewayUrl.value.trim(),
        version: 1,
        type: BROKERS.IB,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default BrokerIbPage.compose({
  template: brokerIbPageTemplate,
  styles: brokerIbPageStyles
}).define();
