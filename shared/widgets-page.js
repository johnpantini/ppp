import { PageWithShiftLock, PageWithDocuments } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';

export class WidgetsPage extends PageWithShiftLock {
  collection = 'widgets';

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

applyMixins(WidgetsPage, PageWithDocuments);
