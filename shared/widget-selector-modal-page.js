/** @decorator */

import { Page, PageWithDocuments } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { Observable } from './element/observation/observable.js';
import { uuidv4 } from './ppp-crypto.js';
import { later } from './later.js';
import { observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

function onNavigateStart() {
  ppp.app.widgetSelectorModal.visible = false;
}

export class WidgetSelectorModalPage extends Page {
  collection = 'widgets';

  @observable
  activeItem;

  async populate() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .find({
          removed: { $ne: true },
          reportedType: '[%#this.page.view.activeItem%]'
        })
        .sort({ updatedAt: -1 });
    };
  }

  async activeItemChanged(oldValue, newValue) {
    ppp.app.setSetting('widgetSelectorChoice', newValue);

    if (oldValue) await this.populateDocuments();
  }

  connectedCallback() {
    this.activeItem = ppp.app.settings.widgetSelectorChoice ?? 'order';

    ppp.app.addEventListener('navigatestart', onNavigateStart, {
      passive: true
    });

    this.setAttribute('data-disable-auto-populate', true);
    super.connectedCallback();
  }

  disconnectedCallback() {
    ppp.app.removeEventListener('navigatestart', onNavigateStart);

    super.disconnectedCallback();
  }

  async handleTypeSelectorClick({ event }) {
    const item = event
      .composedPath()
      .find((n) => n.tagName?.toLowerCase?.() === 'ppp-side-nav-item');

    if (item) {
      this.activeItem = item.getAttribute('slug');
    }
  }

  async handleWidgetListClick({ event }) {
    if (
      !event.composedPath().find((n) => n.tagName?.toLowerCase?.() === 'button')
    ) {
      const datum = event.composedPath().find((n) => n.datum)?.datum;

      if (datum) {
        await this.selectWidget(datum);
      }
    }
  }

  async reload() {
    await this.page.view.populateDocuments();
  }

  async selectWidget(datum) {
    this.beginOperation('Размещение виджета');

    try {
      const workspacePage =
        ppp.app.shadowRoot.querySelector('ppp-workspace-page');

      // Refs will be OK
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

      workspacePage.locked = true;

      try {
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

        await later(250);
      } finally {
        workspacePage.locked = false;
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

applyMixins(WidgetSelectorModalPage, PageWithDocuments);
