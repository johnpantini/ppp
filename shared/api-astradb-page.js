import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { APIS } from './const.js';
import { checkAstraDbCredentials } from './astradb.js';
import ppp from '../ppp.js';

export class ApiAstraDbPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.dbID);
    await validate(this.dbRegion);
    await validate(this.dbKeyspace);
    await validate(this.dbToken);

    if (
      !(await checkAstraDbCredentials({
        dbUrl: `https://${this.dbID.value.trim()}-${this.dbRegion.value.trim()}.apps.astra.datastax.com`,
        dbKeyspace: this.dbKeyspace.value.trim(),
        dbToken: this.dbToken.value.trim(),
        serviceMachineUrl: ppp.keyVault.getKey('service-machine-url')
      })).ok
    ) {
      invalidate(this.dbToken, {
        errorMessage: 'Неверный токен',
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
          type: `[%#(await import('./const.js')).APIS.ASTRADB%]`
        });
    };
  }

  async find() {
    return {
      type: APIS.ASTRADB,
      name: this.name.value.trim()
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        dbID: this.dbID.value.trim(),
        dbRegion: this.dbRegion.value.trim(),
        dbKeyspace: this.dbKeyspace.value.trim(),
        dbToken: this.dbToken.value.trim(),
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: APIS.ASTRADB,
        createdAt: new Date()
      }
    };
  }
}
