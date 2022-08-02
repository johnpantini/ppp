import { Page, PageWithDocument } from './page.js';
import { invalidate, validate } from './validate.js';
import { maybeFetchError } from './fetch-error.js';
import { uuidv4 } from './ppp-crypto.js';
import { SERVICES } from './const.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { Observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

export class ServiceSpbexHaltsPage extends Page {
  collection = 'services';

  async callInstrumentsFunction() {
    this.beginOperation();

    try {
      await validate(this.api);
      await validate(this.instrumentsCode);

      const funcName = `pg_temp.ppp_${uuidv4().replaceAll('-', '_')}`;
      // Temporary function, no need to drop
      const query = `create or replace function ${funcName}()
        returns json as
        $$
          ${this.instrumentsCode.value}
        $$ language plv8;

        select ${funcName}();
        `;
      const api = this.apis.find((a) => a._id === this.api.value);
      const password = await this.app.ppp.crypto.decrypt(api.iv, api.password);
      const rTestSQL = await fetch(
        new URL(
          'pg',
          this.app.ppp.keyVault.getKey('service-machine-url')
        ).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            connectionString: this.getConnectionString(
              Object.assign({}, api, { password })
            )
          })
        }
      );

      await maybeFetchError(rTestSQL);

      console.table(
        JSON.parse(
          (await rTestSQL.json()).results.find(
            (r) => r.command.toUpperCase() === 'SELECT'
          ).rows[0]
        )
      );

      this.succeedOperation(
        'База данных выполнила функцию успешно. Смотрите результат в консоли браузера.'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async setProxyURLFromPPPAspirant() {
    const datum = this.aspirantId.datum();

    if (!datum) {
      invalidate(this.aspirantId, {
        errorMessage: 'Сначала выберите сервис',
        skipScrollIntoView: true
      });
    } else {
      const deploymentApi = await ppp.user.functions.findOne(
        {
          collection: 'apis'
        },
        {
          _id: datum.deploymentApiId
        },
        {
          _id: 0,
          token: 1,
          iv: 1
        }
      );

      if (deploymentApi) {
        const token = (await ppp.decrypt(deploymentApi)).token;

        // TODO - use real ids
        const serviceRequest = await fetch(
          new URL(
            'fetch',
            ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            body: JSON.stringify({
              method: 'GET',
              url: `https://api.northflank.com/v1/projects/ppp/services/ppp-aspirant`,
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          }
        );

        const json = await serviceRequest.json();
        const port = json.data?.ports?.find((p) => p.internalPort === 32456);

        if (port) {
          this.document.proxyURL = `https://${port.dns}/fetch`;

          Observable.notify(this, 'document');
        } else {
          invalidate(this.aspirantId, {
            errorMessage: 'Проблема с получением ссылки - порт не найден',
            skipScrollIntoView: true,
            raiseException: true
          });
        }
      } else
        invalidate(this.aspirantId, {
          errorMessage: 'Проблема с сервисом',
          skipScrollIntoView: true,
          raiseException: true
        });
    }
  }

  async validate() {
    await validate(this.name);
    await validate(this.supabaseApiId);
    await validate(this.proxyURL);

    try {
      new URL(this.proxyURL.value);
    } catch (e) {
      invalidate(this.proxyURL, {
        errorMessage: 'Неверный или неполный URL',
        raiseException: true
      });
    }

    await validate(this.interval);
    await validate(this.interval, {
      hook: async (value) => +value > 0 && +value <= 1000,
      errorMessage: 'Введите значение в диапазоне от 1 до 1000'
    });
    await validate(this.instrumentsCode);
    await validate(this.botId);
    await validate(this.channel);
    await validate(this.formatterCode);
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]'),
              type: `[%#(await import('./const.js')).SERVICES.SPBEX_HALTS%]`
            }
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'supabaseApiId',
              foreignField: '_id',
              as: 'supabaseApi'
            }
          },
          {
            $unwind: '$supabaseApi'
          },
          {
            $lookup: {
              from: 'bots',
              localField: 'botId',
              foreignField: '_id',
              as: 'bot'
            }
          },
          {
            $unwind: '$bot'
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.SPBEX_HALTS,
      name: this.name.value.trim()
    };
  }

  async update() {
    return [
      {
        $set: {
          name: this.name.value.trim(),
          proxyURL: this.proxyURL.value.trim(),
          version: 1,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.SPBEX_HALTS,
          createdAt: new Date()
        }
      }
    ];
  }
}

applyMixins(ServiceSpbexHaltsPage, PageWithDocument);
