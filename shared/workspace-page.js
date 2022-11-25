/** @decorator */

import { Page } from './page.js';
import { Denormalization } from './ppp-denormalize.js';
import { Observable, observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

export class WorkspacePage extends Page {
  /**
   * A holder of widgets.
   */
  @observable
  workspace;

  zIndex = 10;

  collection = 'workspaces';

  denormalization = new Denormalization();

  constructor() {
    super();
    this.document.widgets = [];

    this.sideNavExpandedChanged.handleChange =
      this.sideNavExpandedChanged.handleChange.bind(this);

    Observable.getNotifier(ppp.app.sideNav).subscribe(
      this.sideNavExpandedChanged,
      'expanded'
    );

    this.onAuxClick = this.onAuxClick.bind(this);

    document.addEventListener('auxclick', this.onAuxClick);
  }

  updateWidgetContainment() {
    for (const widget of this.document.widgets) {
      $(widget.widgetElement).draggable('option', 'containment', [
        ppp.app.settings.sideNavVisible
          ? ppp.app.sideNav.expanded
            ? 183
            : 48
          : 0,
        0,
        9999,
        9999
      ]);
    }
  }

  sideNavExpandedChanged = {
    handleChange() {
      this.updateWidgetContainment();
    }
  };

  onAuxClick(event) {
    if (event.ctrlKey && event.button === 1) {
      const value = !ppp.app.settings.sideNavVisible;

      ppp.app.settings['sideNavVisible'] = value;
      ppp.app.setSetting('sideNavVisible', value);
      Observable.notify(ppp.app, 'settings');

      this.updateWidgetContainment();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    Observable.getNotifier(ppp.app.sideNav).unsubscribe(
      this.sideNavExpandedChanged,
      'expanded'
    );

    document.removeEventListener('auxclick', this.onAuxClick);
  }

  // Place widgets when DOM (.workspace) is ready
  async workspaceChanged(prev, next) {
    if (next) {
      this.beginOperation('Загрузка рабочего пространства');

      try {
        const widgets = this.document.widgets ?? [];

        if (widgets.length) {
          await import(`${ppp.rootUrl}/vendor/jquery.slim.min.js`);
          await import(`${ppp.rootUrl}/vendor/jquery-ui.min.js`);
        }

        for (const w of widgets) {
          // Skip first widget added from modal
          if (w.type) await this.placeWidget(w);
        }
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]')
            }
          },
          {
            $project: {
              _id: 1,
              widgets: 1
            }
          },
          {
            $lookup: {
              from: 'widgets',
              localField: 'widgets._id',
              foreignField: '_id',
              as: 'denormalizedWidgets'
            }
          },
          {
            $lookup: {
              from: 'instruments',
              localField: 'widgets.instrumentId',
              foreignField: '_id',
              as: 'instruments'
            }
          },
          {
            $lookup: {
              from: 'apis',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0
                  }
                }
              ],
              as: 'apis'
            }
          },
          {
            $lookup: {
              from: 'traders',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0
                  }
                }
              ],
              as: 'traders'
            }
          },
          {
            $lookup: {
              from: 'brokers',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0
                  }
                }
              ],
              as: 'brokers'
            }
          },
          {
            $lookup: {
              from: 'bots',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0,
                    webhook: 0,
                    type: 0
                  }
                }
              ],
              as: 'bots'
            }
          },
          {
            $lookup: {
              from: 'services',
              pipeline: [
                {
                  $project: {
                    updatedAt: 0,
                    createdAt: 0,
                    version: 0,
                    constsCode: 0,
                    formatterCode: 0,
                    instrumentsCode: 0,
                    symbolsCode: 0,
                    environmentCode: 0,
                    sourceCode: 0,
                    parsingCode: 0,
                    tableSchema: 0,
                    insertTriggerCode: 0,
                    deleteTriggerCode: 0,
                    proxyHeaders: 0
                  }
                }
              ],
              as: 'services'
            }
          }
        ]);
    };
  }

  async transform() {
    const widgets = [];

    this.denormalization.fillRefs(this.document);

    for (const [i, w] of this.document.widgets?.entries?.() ?? []) {
      widgets.push(
        Object.assign(
          {},
          // Denormalize instrumentId, if present.
          await this.denormalization.denormalize(w),
          // Denormalize everything else.
          await this.denormalization.denormalize(
            this.document.denormalizedWidgets.find(
              (widget) => widget._id === w._id
            )
          )
        )
      );
    }

    return {
      _id: this.document._id,
      widgets
    };
  }

  getWidgetUrl(widget) {
    const type = widget.type;

    if (type === 'custom') {
      return widget.url?.value?.trim() ?? '';
    } else {
      return `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/${widget.type}-widget.js`;
    }
  }

  async placeWidget(widgetDocument) {
    const url = await this.getWidgetUrl(widgetDocument);
    const module = await import(url);
    const wUrl = new URL(url);
    const baseWidgetUrl = wUrl.href.slice(0, wUrl.href.lastIndexOf('/'));

    widgetDocument.widgetDefinition = await module.widgetDefinition?.({
      ppp,
      baseWidgetUrl
    });

    ppp.DesignSystem.getOrCreate().register(
      widgetDocument.widgetDefinition.customElement()
    );

    const tagName =
      widgetDocument.widgetDefinition.customElement().definition.baseName;
    const domElement = document.createElement(`ppp-${tagName}`);

    const minWidth = widgetDocument.widgetDefinition.minWidth ?? '275';
    const minHeight = widgetDocument.widgetDefinition.minHeight ?? '395';

    domElement.style.left = `${parseInt(widgetDocument.x ?? '0')}px`;
    domElement.style.top = `${parseInt(widgetDocument.y ?? '0')}px`;
    domElement.style.width = `${parseInt(widgetDocument.width ?? minWidth)}px`;
    domElement.style.height = `${parseInt(
      widgetDocument.height ?? minHeight
    )}px`;

    if (typeof widgetDocument.zIndex === 'number') {
      this.zIndex = Math.max(this.zIndex, widgetDocument.zIndex);

      domElement.style.zIndex = widgetDocument.zIndex;
    } else {
      domElement.style.zIndex = (++this.zIndex).toString();
    }

    domElement.widgetDefinition = widgetDocument.widgetDefinition;
    domElement.document = widgetDocument;

    widgetDocument.widgetElement = this.workspace.appendChild(domElement);
    widgetDocument.widgetElement.container = this;
    widgetDocument.widgetElement.topLoader = this.topLoader;
    widgetDocument.widgetElement.classList.add('widget');
  }
}
