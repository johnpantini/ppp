import { Page, PageWithDocuments, PageWithShiftLock } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';

export class ExtensionsPage extends Page {
  collection = 'extensions';

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

applyMixins(ExtensionsPage, PageWithDocuments, PageWithShiftLock);
