import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { BROKERS, TRADER_CAPS, TRADERS } from '../../lib/const.js';
import { getAspirantBaseUrl } from './service-ppp-aspirant-worker.js';
import '../badge.js';
import '../button.js';
import '../checkbox.js';
import '../radio-group.js';
import '../query-select.js';
import '../text-field.js';

export const traderAlpacaV2PlusTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>Название трейдера</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Alpaca"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Профиль брокера</h5>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('brokerId')}
            value="${(x) => x.document.brokerId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.broker ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('brokers')
                  .find({
                    $and: [
                      {
                        $or: [
                          {
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.UTEX%]`
                          },
                          {
                            type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).BROKERS.PSINA%]`
                          }
                        ]
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          { _id: `[%#this.document.brokerId ?? ''%]` }
                        ]
                      }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
          <div class="spacing2"></div>
          <div class="control-line">
            <ppp-button
              @click="${() =>
                ppp.app.mountPage('broker-utex', {
                  size: 'xlarge',
                  adoptHeader: true
                })}"
              appearance="primary"
            >
              Добавить профиль UTEX
            </ppp-button>
            <ppp-button
              @click="${() =>
                ppp.app.mountPage('broker-psina', {
                  size: 'xlarge',
                  adoptHeader: true
                })}"
              appearance="primary"
            >
              Добавить профиль Psina
            </ppp-button>
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>URL для подключения к общему потоку рыночных данных</h5>
          <p class="description">
            Ссылка для передачи данных книги заявок и ленты всех сделок. Можно
            сформировать по сервису, если таковой имеется (воспользуйтесь
            выпадающим списком).
          </p>
          <div>
            <ppp-query-select
              ${ref('aspirantWorkerSelector')}
              :context="${(x) => x}"
              :placeholder="${() => 'Нажмите, чтобы выбрать сервис'}"
              :query="${() => {
                return (context) => {
                  return context.services
                    .get('mongodb-atlas')
                    .db('ppp')
                    .collection('services')
                    .find({
                      $and: [
                        { removed: { $ne: true } },
                        {
                          workerPredefinedTemplate: 'utexAlpaca'
                        },
                        {
                          type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.PPP_ASPIRANT_WORKER%]`
                        }
                      ]
                    })
                    .sort({ updatedAt: -1 });
                };
              }}"
              :transform="${() => ppp.decryptDocumentsTransformation()}"
            ></ppp-query-select>
            <div class="spacing2"></div>
            <ppp-button
              ?disabled="${(x) => !x.aspirantWorkerSelector.value}"
              appearance="primary"
              @click="${(x) => x.generateLink(x.aspirantWorkerSelector.value)}"
            >
              Сформировать ссылку
            </ppp-button>
          </div>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="wss://example.com"
            value="${(x) => x.document.wsUrl}"
            ${ref('wsUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Тайм-аут восстановления соединения</h5>
          <p class="description">
            Время, по истечении которого будет предпринята очередная попытка
            восстановить прерванное подключение к серверу. Задаётся в
            миллисекундах, по умолчанию 1000 мс.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
            type="number"
            placeholder="1000"
            value="${(x) => x.document.reconnectTimeout}"
            ${ref('reconnectTimeout')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Параметры рыночных данных</h5>
        </div>
        <div class="input-group">
          <ppp-checkbox
            ?checked="${(x) => x.document.useLots}"
            ${ref('useLots')}
          >
            Передавать объёмы акций в книге заявок в лотах
          </ppp-checkbox>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const traderAlpacaV2PlusStyles = css`
  ${pageStyles}
`;

const checkConnection = async (control, login, password) => {
  try {
    new URL(control.value);
  } catch (e) {
    invalidate(control, {
      errorMessage: 'Неверный или неполный URL',
      raiseException: true
    });
  }

  await validate(control, {
    hook: async (value) => {
      const url = new URL(value);

      return url.protocol === 'wss:' || url.protocol === 'ws:';
    },
    errorMessage: 'Недопустимый протокол URL'
  });

  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(reject, 5000);
      const ws = new WebSocket(control.value);

      ws.onmessage = ({ data }) => {
        const payload = JSON.parse(data);

        if (Array.isArray(payload) && payload[0]?.msg === 'connected') {
          ws.send(
            JSON.stringify({
              action: 'auth',
              key: login,
              secret: password
            })
          );
        } else if (
          Array.isArray(payload) &&
          payload[0]?.msg === 'authenticated'
        ) {
          ws.close();
          clearTimeout(timer);
          resolve();
        } else {
          ws.close();
          clearTimeout(timer);
          reject();
        }
      };
      ws.onerror = () => {
        clearTimeout(timer);
        reject();
      };
    });
  } catch (e) {
    invalidate(control, {
      errorMessage: 'Не удалось соединиться, проверьте ссылку и брокера',
      raiseException: true
    });
  }
};

export class TraderAlpacaV2PlusPage extends Page {
  collection = 'traders';

  async generateLink() {
    const datum = this.aspirantWorkerSelector.datum();

    if (datum?.workerPredefinedTemplate === 'utexAlpaca') {
      const aspirantUrl = new URL(
        await getAspirantBaseUrl(
          await ppp.decrypt(
            await ppp.user.functions.findOne(
              {
                collection: 'services'
              },
              { _id: datum.aspirantServiceId }
            )
          )
        )
      );

      this.wsUrl.value = `${
        aspirantUrl.protocol === 'https:' ? 'wss://' : 'ws://'
      }${aspirantUrl.host}/workers/${datum._id}/`;
    }
  }

  async validate() {
    await validate(this.name);
    await validate(this.brokerId);
    await validate(this.wsUrl);

    const login = this.brokerId.datum().login;
    const password = this.brokerId.datum().password;

    await checkConnection(this.wsUrl, login, password);

    if (this.reconnectTimeout.value.trim()) {
      await validate(this.reconnectTimeout, {
        hook: async (value) => +value >= 100 && +value <= 10000,
        errorMessage: 'Введите значение в диапазоне от 100 до 10000'
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).TRADERS.ALPACA_V2_PLUS%]`
            }
          },
          {
            $lookup: {
              from: 'brokers',
              localField: 'brokerId',
              foreignField: '_id',
              as: 'broker'
            }
          },
          {
            $unwind: '$broker'
          }
        ]);
    };
  }

  async find() {
    return {
      type: TRADERS.ALPACA_V2_PLUS,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    if (ppp.traders.has(this.document._id)) {
      ppp.traders.delete(this.document._id);
    }

    const caps = [TRADER_CAPS.CAPS_MIC];
    const brokerType = this.brokerId.datum().type;

    if (brokerType === BROKERS.PSINA) {
      const port = parseInt(new URL(this.wsUrl.value).port);

      if (port === 38744) {
        caps.push(TRADER_CAPS.CAPS_US_NBBO);
        caps.push(TRADER_CAPS.CAPS_ORDERBOOK);
      } else if (port === 38643) {
        caps.push(TRADER_CAPS.CAPS_NSDQ_TOTALVIEW);
        caps.push(TRADER_CAPS.CAPS_ORDERBOOK);
      } else if (port === 38943) {
        caps.push(TRADER_CAPS.CAPS_NOII);
      } else if (port === 38844) {
        caps.push(TRADER_CAPS.CAPS_TIME_AND_SALES);
        caps.push(TRADER_CAPS.CAPS_LEVEL1);
        caps.push(TRADER_CAPS.CAPS_EXTENDED_LEVEL1);
      } else if (port === 38099 || port === 38199) {
        caps.push(TRADER_CAPS.CAPS_ORDERBOOK);
        caps.push(TRADER_CAPS.CAPS_ARCABOOK);
      }
    } else if (brokerType === BROKERS.UTEX) {
      caps.push(TRADER_CAPS.CAPS_ORDERBOOK);
      caps.push(TRADER_CAPS.CAPS_TIME_AND_SALES);
    }

    return {
      $set: {
        name: this.name.value.trim(),
        brokerId: this.brokerId.value,
        wsUrl: this.wsUrl.value.trim(),
        reconnectTimeout: this.reconnectTimeout.value
          ? Math.abs(this.reconnectTimeout.value)
          : void 0,
        useLots: this.useLots.checked,
        caps,
        version: 1,
        type: TRADERS.ALPACA_V2_PLUS,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default TraderAlpacaV2PlusPage.compose({
  name: 'ppp-trader-alpaca-v2-plus-page',
  template: traderAlpacaV2PlusTemplate,
  styles: traderAlpacaV2PlusStyles
}).define();
