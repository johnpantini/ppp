import { Page, PageWithDocuments } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import ppp from '../ppp.js';

function onNavigateStart() {
  ppp.app.widgetSelectorModalPage.visible = false;
}

export class WidgetSelectorModalPage extends Page {
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

  async connectedCallback() {
    ppp.app.addEventListener('navigatestart', onNavigateStart, {
      passive: true
    });

    return super.connectedCallback();
  }

  disconnectedCallback() {
    ppp.app.removeEventListener('navigatestart', onNavigateStart);

    super.disconnectedCallback();
  }
}

applyMixins(WidgetSelectorModalPage, PageWithDocuments);
