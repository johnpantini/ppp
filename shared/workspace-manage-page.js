import { Page } from './page.js';
import { validate } from './validate.js';
import { Observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

export class WorkspaceManagePage extends Page {
  collection = 'workspaces';

  async validate() {
    await validate(this.name);
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]')
        });
    };
  }

  async find() {
    return {
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async update() {
    if (this.document._id) {
      const index = ppp.app.workspaces.findIndex(
        (w) => w._id === this.document._id
      );

      if (index > -1) {
        ppp.app.workspaces[index] = Object.assign(
          {},
          ppp.app.workspaces[index],
          {
            name: this.name.value.trim()
          }
        );

        Observable.notify(ppp.app, 'workspaces');
      }
    }

    return {
      $set: {
        name: this.name.value.trim()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}
