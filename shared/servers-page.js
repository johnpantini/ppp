import {
  Page,
  PageWithDocuments,
  PageWithShiftLock,
  PageWithActionPage
} from './page.js';
import { Observable } from './element/observation/observable.js';
import { applyMixins } from './utilities/apply-mixins.js';

export class ServersPage extends Page {
  collection = 'servers';

  async populate() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .find({
          removed: { $ne: true }
        })
        .sort({ updatedAt: -1 });
    };
  }

  async removeServer(datum) {
    await this.actionPageCall({
      page: 'server',
      documentId: datum._id,
      methodName: 'removeServer'
    });

    const index = this.documents.findIndex((d) => d._id === datum._id);

    if (index > -1) {
      this.documents.splice(index, 1);
    }

    Observable.notify(this, 'documents');
  }
}

applyMixins(
  ServersPage,
  PageWithDocuments,
  PageWithShiftLock,
  PageWithActionPage
);
