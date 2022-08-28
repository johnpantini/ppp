import { Page, PageWithDocuments, PageWithShiftLock } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { requireComponent } from './template.js';

export class ExtensionsPage extends Page {
  collection = 'extensions';

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

  async handleNewExtensionClick() {
    await requireComponent('ppp-modal');
    await requireComponent('ppp-new-extension-modal-page');

    this.newExtensionModal.visible = true;
  }
}

applyMixins(ExtensionsPage, PageWithDocuments, PageWithShiftLock);
