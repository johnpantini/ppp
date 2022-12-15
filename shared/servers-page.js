import {
  Page,
  PageWithDocuments,
  PageWithShiftLock
} from './page.js';
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
}

applyMixins(
  ServersPage,
  PageWithDocuments,
  PageWithShiftLock
);
