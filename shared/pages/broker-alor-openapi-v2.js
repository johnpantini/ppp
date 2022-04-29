/** @decorator */

import { BasePage } from '../page.js';
import { invalidate, validate } from '../validate.js';
import { generateIV, bufferToString } from '../ppp-crypto.js';
import { SUPPORTED_BROKERS } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';
import { maybeFetchError } from '../fetch-error.js';

export async function checkAlorOAPIV2RefreshToken({ refreshToken }) {
  return fetch(`https://oauth.alor.ru/refresh?token=${refreshToken}`, {
    cache: 'no-cache',
    method: 'POST'
  });
}

export class BrokerAlorOpenapiV2Page extends BasePage {
  @observable
  broker;

  async connectedCallback() {
    super.connectedCallback();

    const brokerIdId = this.app.params()?.broker;

    if (brokerIdId) {
      this.beginOperation();

      try {
        this.broker = await this.app.ppp.user.functions.findOne(
          {
            collection: 'brokers'
          },
          {
            _id: brokerIdId,
            type: SUPPORTED_BROKERS.ALOR_OPENAPI_V2
          }
        );

        if (!this.broker) {
          this.failOperation(404);
          await this.notFound();
        } else {
          this.broker.refreshToken = await this.app.ppp.crypto.decrypt(
            this.broker.iv,
            this.broker.refreshToken
          );

          Observable.notify(this, 'broker');
        }
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    }
  }

  async connectBroker() {
    this.beginOperation();

    try {
      await validate(this.brokerName);
      await validate(this.alorRefreshToken);

      const rAlorCredentials = await checkAlorOAPIV2RefreshToken({
        refreshToken: this.alorRefreshToken.value.trim()
      });

      if (!rAlorCredentials.ok) {
        invalidate(this.alorRefreshToken, {
          errorMessage: 'Неверный токен'
        });

        await maybeFetchError(rAlorCredentials);
      }

      const iv = generateIV();
      const encryptedToken = await this.app.ppp.crypto.encrypt(
        iv,
        this.alorRefreshToken.value.trim()
      );

      if (this.broker) {
        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'brokers'
          },
          {
            _id: this.broker._id
          },
          {
            $set: {
              name: this.brokerName.value.trim(),
              version: 1,
              iv: bufferToString(iv),
              refreshToken: encryptedToken,
              updatedAt: new Date()
            }
          }
        );
      } else {
        const existingBroker = await this.app.ppp.user.functions.findOne(
          {
            collection: 'brokers'
          },
          {
            removed: { $not: { $eq: true } },
            type: SUPPORTED_BROKERS.ALOR_OPENAPI_V2,
            name: this.brokerName.value.trim()
          },
          {
            _id: 1
          }
        );

        if (existingBroker) {
          return this.failOperation({
            href: `?page=broker-${SUPPORTED_BROKERS.ALOR_OPENAPI_V2}&broker=${existingBroker._id}`,
            error: 'E11000'
          });
        }

        await this.app.ppp.user.functions.insertOne(
          {
            collection: 'brokers'
          },
          {
            name: this.brokerName.value.trim(),
            version: 1,
            type: SUPPORTED_BROKERS.ALOR_OPENAPI_V2,
            createdAt: new Date(),
            updatedAt: new Date(),
            iv: bufferToString(iv),
            refreshToken: encryptedToken
          }
        );
      }

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}
