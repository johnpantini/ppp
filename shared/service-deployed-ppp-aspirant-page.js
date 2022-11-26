import { Page, PageWithService } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { invalidate, validate } from './validate.js';
import { SERVICE_STATE, SERVICES } from './const.js';
import ppp from '../ppp.js';

export async function checkPPPAspirant({ url }) {
  return fetch(new URL('ping_redis', url).toString(), {
    cache: 'no-cache'
  });
}

export class ServiceDeployedPppAspirantPage extends Page {
  collection = 'services';

  async validate() {
    await validate(this.name);
    await validate(this.url);

    try {
      new URL(this.url.value);
    } catch (e) {
      invalidate(this.url, {
        errorMessage: 'Неверный или неполный URL',
        raiseException: true
      });
    }

    try {
      const request = await checkPPPAspirant({
        url: this.url.value.trim()
      });

      if (!request.ok || (await request.text()).toUpperCase() !== 'PONG') {
        invalidate(this.url, {
          errorMessage: 'Неверный адрес',
          raiseException: true
        });
      }
    } catch (e) {
      console.error(e);

      invalidate(this.url, {
        errorMessage: 'Неверный адрес',
        raiseException: true
      });
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]'),
          type: `[%#(await import('./const.js')).SERVICES.DEPLOYED_PPP_ASPIRANT%]`
        });
    };
  }

  async find() {
    return {
      type: SERVICES.DEPLOYED_PPP_ASPIRANT,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        url: this.url.value.trim(),
        version: 1,
        state: SERVICE_STATE.ACTIVE,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: SERVICES.DEPLOYED_PPP_ASPIRANT,
        createdAt: new Date()
      }
    };
  }
}

applyMixins(ServiceDeployedPppAspirantPage, PageWithService);
