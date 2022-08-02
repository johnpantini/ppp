import { PageWithShiftLock, PageWithDocuments } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';

export class WorkspacesPage extends PageWithShiftLock {
  collection = 'workspaces';

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

applyMixins(WorkspacesPage, PageWithDocuments);
