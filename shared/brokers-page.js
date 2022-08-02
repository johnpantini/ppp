import { PageWithDocuments, PageWithShiftLock } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';

export class BrokersPage extends PageWithShiftLock {
  collection = 'brokers';

  async populate() {
    return (context) => {
      return context.services
      .get('mongodb-atlas')
      .db('ppp')
      .collection('[%#this.page.view.collection%]')
      .find()
      .sort({ updatedAt: -1 });
    };
  }
}

applyMixins(BrokersPage, PageWithDocuments);
