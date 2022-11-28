/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { attr } from './element/components/attributes.js';
import { Observable, observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

export class Widget extends FoundationElement {
  @attr({ mode: 'boolean' })
  preview;

  @observable
  widgetDefinition;

  @observable
  document;

  @observable
  notificationVisible;

  @observable
  notificationTitle;

  @observable
  notificationText;

  @observable
  notificationStatus;

  #notificationTimeout;

  constructor() {
    super();

    this.document = {};
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.preview) {
      $(this)
        .draggable({
          grid: [1, 1],
          containment: [
            ppp.app.settings.sideNavVisible
              ? parseInt(
                  getComputedStyle(ppp.app.sideNav).getPropertyValue('width')
                )
              : 0,
            0,
            9999,
            9999
          ],
          addClasses: false,
          handle: this.querySelector('.widget-header'),
          cancel:
            'ppp-widget-group-control,input,textarea,button,select,option,.instrument-search-holder',
          start: (event) => {
            if (event.ctrlKey) $(this).draggable('option', 'grid', [1, 1]);

            this.style.zIndex = ++this.container.zIndex;
          },
          stop: (event, ui) => {
            $(this).draggable('option', 'grid', [1, 1]);

            return this.onDragEnd(event, ui);
          }
        })
        .resizable({
          maxHeight: this.widgetDefinition.maxHeight ?? 512,
          maxWidth: this.widgetDefinition.maxWidth ?? 365,
          minHeight: this.widgetDefinition.minHeight ?? 395,
          minWidth: this.widgetDefinition.minWidth ?? 275,
          grid: [1, 1],
          start: (event) => {
            if (event.ctrlKey) $(this).resizable('option', 'grid', [1, 1]);
          },
          stop: (event, ui) => {
            $(this).resizable('option', 'grid', [1, 1]);

            this.onResizeEnd(event, ui);
          }
        });

      this.querySelector('.widget-header').addEventListener(
        'pointerdown',
        () => {
          this.style.zIndex = ++this.container.zIndex;
        },
        {
          passive: true
        }
      );
    } else {
      this.parentNode.style.width = `${
        this.widgetDefinition.defaultWidth ??
        this.widgetDefinition.minWidth ?? 275
      }px`;
      this.parentNode.style.height = `${
        this.widgetDefinition.defaultHeight ??
        this.widgetDefinition.minHeight ??
        395
      }px`;

      this.document = this.container.document;
      this.topLoader = this.container.topLoader;

      if (this.container.savedInstrument)
        this.instrument = this.container.savedInstrument;
    }
  }

  onDragEnd(event, ui) {
    const { document } = ui.helper.get(0);

    ppp.user.functions.updateOne(
      {
        collection: 'workspaces'
      },
      {
        'widgets.uniqueID': document.uniqueID
      },
      {
        $set: {
          'widgets.$.x': ui.position.left,
          'widgets.$.y': ui.position.top,
          'widgets.$.zIndex': this.container.zIndex
        }
      }
    );
  }

  onResizeEnd(event, ui) {
    const { document } = ui.helper.get(0);

    document.uniqueID &&
      ppp.user.functions.updateOne(
        {
          collection: 'workspaces'
        },
        {
          'widgets.uniqueID': document.uniqueID
        },
        {
          $set: {
            'widgets.$.width': ui.size.width,
            'widgets.$.height': ui.size.height
          }
        }
      );
  }

  formatQuantity(qty) {
    if (typeof qty !== 'number') return '—';

    return qty;
  }

  async applyChanges(widgetUpdateFragment = {}) {
    if (this.preview) return;

    return ppp.user.functions.updateOne(
      {
        collection: 'workspaces'
      },
      {
        'widgets.uniqueID': this.document.uniqueID
      },
      widgetUpdateFragment,
      {
        upsert: true
      }
    );
  }

  async close() {
    if (!this.preview) {
      ppp.user.functions.updateOne(
        {
          collection: 'workspaces'
        },
        {
          _id: ppp.app.params().document
        },
        {
          $pull: {
            widgets: {
              uniqueID: this.document.uniqueID
            }
          }
        }
      );

      const index = this.container.document.widgets.findIndex(
        (w) => w.uniqueID === this.document.uniqueID
      );

      if (index > -1) this.container.document.widgets.splice(index, 1);

      Observable.notify(this.container, 'document');

      this.remove();
    }
  }

  success({ title, text }) {
    this.notificationStatus = 'success';
    this.notificationTitle = title;
    this.notificationText = text;
    this.notificationVisible = true;

    clearTimeout(this.#notificationTimeout);

    this.#notificationTimeout = setTimeout(() => {
      this.notificationVisible = false;
    }, 3000);
  }

  error({ title, text }) {
    this.notificationStatus = 'error';
    this.notificationTitle = title;
    this.notificationText = text;
    this.notificationVisible = true;

    clearTimeout(this.#notificationTimeout);

    this.#notificationTimeout = setTimeout(() => {
      this.notificationVisible = false;
    }, 3000);
  }
}
