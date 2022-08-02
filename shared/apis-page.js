import { PageWithDocuments, PageWithShiftLock } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';

export class ApisPage extends PageWithShiftLock {
  collection = 'apis';

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

applyMixins(ApisPage, PageWithDocuments);
