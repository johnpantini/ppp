import { Page, PageWithDocuments } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { Observable } from './element/observation/observable.js';
import { uuidv4 } from './ppp-crypto.js';
import ppp from '../ppp.js';

function onNavigateStart() {
  ppp.app.widgetSelectorModal.visible = false;
}

export class WidgetSelectorModalPage extends Page {
  collection = 'widgets';

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

  connectedCallback() {
    ppp.app.addEventListener('navigatestart', onNavigateStart, {
      passive: true
    });

    return super.connectedCallback();
  }

  disconnectedCallback() {
    ppp.app.removeEventListener('navigatestart', onNavigateStart);

    super.disconnectedCallback();
  }

  async reload() {
    if (!this.hasAttribute('data-disable-auto-populate'))
      await this.page.view.populateDocuments();
  }

  async selectWidget(datum) {
    this.beginOperation('Размещение виджета');

    try {
      const workspacePage =
        ppp.app.shadowRoot.querySelector('ppp-workspace-page');

      const widget = await workspacePage.denormalization.denormalize(datum);
      const uniqueID = uuidv4();

      widget.uniqueID = uniqueID;
      widget.x = 0;
      widget.y = 0;

      workspacePage.document.widgets.push(widget);
      workspacePage.document.widgets[
        workspacePage.document.widgets.length - 1
      ].zIndex = workspacePage.zIndex + 1;

      Observable.notify(workspacePage, 'document');
      await workspacePage.placeWidget(widget);
      await ppp.user.functions.updateOne(
        {
          collection: 'workspaces'
        },
        {
          _id: ppp.app.params().document
        },
        {
          $push: {
            widgets: {
              _id: datum._id,
              uniqueID,
              x: 0,
              y: 0,
              zIndex: workspacePage.zIndex
            }
          }
        }
      );

      ppp.app.widgetSelectorModal.visible = false;
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

applyMixins(WidgetSelectorModalPage, PageWithDocuments);
