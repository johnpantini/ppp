/** @decorator */

import ppp from '../../ppp.js';
import {
  html,
  css,
  Observable,
  observable,
  Updates
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';
import { formatDate } from '../../lib/intl.js';
import { settings } from '../../static/svg/sprite.js';
import { isPredefinedWidgetType } from '../../lib/const.js';
import '../banner.js';
import '../button.js';
import '../side-nav.js';
import '../table.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const widgetSelectorModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <div class="control-stack">
        <ppp-banner class="inline" appearance="warning">
          <div
            style="display: ${(x) =>
              !isPredefinedWidgetType(x.activeItem) || x.documents.length
                ? 'initial'
                : 'none'}"
          >
            ${() => ppp.t('$widgetSelectorModalPage.findTemplateHintPrefix')}
            <a
              class="link"
              style="font-weight: 700"
              @click="${(x) => {
                ppp.app.navigate({
                  page: 'widget',
                  type: isPredefinedWidgetType(x.activeItem)
                    ? x.activeItem
                    : 'custom'
                });
              }}}"
              href="javascript:void(0)"
              >${() =>
                ppp.t('$widgetSelectorModalPage.createNewOneLink')}</a
            >.
          </div>
          <div
            style="display: ${(x) =>
              isPredefinedWidgetType(x.activeItem) && !x.documents.length
                ? 'initial'
                : 'none'}"
          >
            ${() => ppp.t('$widgetSelectorModalPage.noWidgetsOfTypePrefix')}
            <a
              class="link"
              style="font-weight: 700"
              @click="${(x) => {
                ppp.app.navigate({
                  page: 'widget',
                  type: x.activeItem
                });
              }}}"
              href="javascript:void(0)"
              >${() =>
                ppp.t('$widgetSelectorModalPage.correspondingSectionLink')}</a
            >.
          </div>
        </ppp-banner>
        <div class="table-with-selector">
          <div class="selector-holder">
            <ppp-side-nav
              expanded
              static
              inline
              @click="${(x, c) => x.handleTypeSelectorClick(c)}"
            >
              <ppp-side-nav-group>
                <span slot="title">
                  ${() => ppp.t('$widgetSelectorModalPage.widgetTypeHeader')}
                </span>
                <ppp-side-nav-item
                  slug="order"
                  ?active="${(x) => x.activeItem === 'order'}"
                >
                  <span>${() => ppp.t('$const.widget.order')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="scalping-buttons"
                  title="${() => ppp.t('$const.widget.scalping-buttons')}"
                  ?active="${(x) => x.activeItem === 'scalping-buttons'}"
                >
                  <span>
                    ${() => ppp.t('$const.widget.scalping-buttons')}
                  </span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="active-orders"
                  ?active="${(x) => x.activeItem === 'active-orders'}"
                >
                  <span>${() => ppp.t('$const.widget.active-orders')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="light-chart"
                  ?active="${(x) => x.activeItem === 'light-chart'}"
                >
                  <span>${() => ppp.t('$const.widget.light-chart')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="orderbook"
                  ?active="${(x) => x.activeItem === 'orderbook'}"
                >
                  <span>${() => ppp.t('$const.widget.orderbook')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="time-and-sales"
                  ?active="${(x) => x.activeItem === 'time-and-sales'}"
                >
                  <span>${() => ppp.t('$const.widget.time-and-sales')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="portfolio"
                  ?active="${(x) => x.activeItem === 'portfolio'}"
                >
                  <span>${() => ppp.t('$const.widget.portfolio')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="balances"
                  ?active="${(x) => x.activeItem === 'balances'}"
                >
                  <span>${() => ppp.t('$const.widget.balances')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="list"
                  ?active="${(x) => x.activeItem === 'list'}"
                >
                  <span>${() => ppp.t('$const.widget.list')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="timeline"
                  ?active="${(x) => x.activeItem === 'timeline'}"
                >
                  <span>${() => ppp.t('$const.widget.timeline')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="clock"
                  ?active="${(x) => x.activeItem === 'clock'}"
                >
                  <span>${() => ppp.t('$const.widget.clock')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="marquee"
                  ?active="${(x) => x.activeItem === 'marquee'}"
                >
                  <span>${() => ppp.t('$const.widget.marquee')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="tcc"
                  ?active="${(x) => x.activeItem === 'tcc'}"
                >
                  <span>${() => ppp.t('$const.widget.tcc')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="frame"
                  ?active="${(x) => x.activeItem === 'frame'}"
                >
                  <span>${() => ppp.t('$const.widget.frame')}</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="noii"
                  title="NOII"
                  ?active="${(x) => x.activeItem === 'noii'}"
                >
                  <span>NOII</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="other"
                  title="${() => ppp.t('$const.widget.other')}"
                  ?active="${(x) => x.activeItem === 'other'}"
                >
                  <span>${() => ppp.t('$const.widget.other')}</span>
                </ppp-side-nav-item>
              </ppp-side-nav-group>
            </ppp-side-nav>
          </div>
          <div class="table-holder">
            <ppp-table
              selectable
              sticky
              @click="${(x, c) => x.handleWidgetListClick(c)}"
              :columns="${() => [
                {
                  label: ppp.t('$g.name')
                },
                {
                  label: ppp.t('$widgetSelectorModalPage.lastModifiedColumn')
                },
                {
                  label: ppp.t('$widgetSelectorModalPage.collectionColumn')
                },
                {
                  label: ppp.t('$widgetSelectorModalPage.actionsColumn')
                }
              ]}"
              :rows="${(x) =>
                x.documents?.map((datum) => {
                  return {
                    datum,
                    cells: [
                      datum.name ?? ppp.t('$widgetSelectorModalPage.unnamed'),
                      formatDate(datum.updatedAt ?? datum.createdAt),
                      datum.collection,
                      html`
                        <ppp-button
                          class="xsmall"
                          @click="${() => {
                            ppp.app.navigate({
                              page: 'widget',
                              document: datum._id
                            });

                            return false;
                          }}"
                        >
                          <span slot="start"> ${html.partial(settings)} </span>
                          ${() => ppp.t('$widgetSelectorModalPage.toSettings')}
                        </ppp-button>
                      `
                    ]
                  };
                })}"
            >
            </ppp-table>
          </div>
        </div>
      </div>
    </form>
  </template>
`;

export const widgetSelectorModalPageStyles = css`
  ${pageStyles}
  form[novalidate] {
    padding: 0 25px 25px 25px;
  }

  ppp-banner {
    width: 810px;
  }

  .control-stack {
    height: 500px;
  }
`;

export class WidgetSelectorModalPage extends Page {
  collection = 'widgets';

  @observable
  activeItem;

  async activeItemChanged(oldValue, newValue) {
    ppp.settings.set('widgetSelectorChoice', newValue);

    if (oldValue) await this.populateDocuments();
  }

  async connectedCallback() {
    this.activeItem = ppp.settings.get('widgetSelectorChoice') ?? 'order';

    return super.connectedCallback();
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

  async selectWidget(datum) {
    this.beginOperation();

    try {
      const workspacePage = ppp.app.shadowRoot.querySelector('.page');
      // Refs will be OK
      const widget = await workspacePage.denormalization.denormalize(datum);
      const uniqueID = uuidv4();

      widget.uniqueID = uniqueID;

      workspacePage.document.widgets.push(widget);
      workspacePage.document.widgets[
        workspacePage.document.widgets.length - 1
      ].zIndex = workspacePage.zIndex + 1;

      Observable.notify(workspacePage, 'document');

      workspacePage.locked = true;

      // Fix for undefined workspace ref (hidden behind "when()" when there are no widgets)
      Updates.enqueue(async () => {
        try {
          const widgetElement = await workspacePage.placeWidget(widget);

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
                  x: widget.x,
                  y: widget.y,
                  zIndex: workspacePage.zIndex
                }
              }
            }
          );

          this.mountPointModal.setAttribute('hidden', '');
          widgetElement.setAttribute('placed', '');
        } finally {
          workspacePage.locked = false;
        }
      });
    } catch (e) {
      this.failOperation(
        e,
        ppp.t('$widgetSelectorModalPage.widgetPlacementTitle')
      );
    } finally {
      this.endOperation();
    }
  }

  async populate() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .find({
          removed: { $ne: true },
          reportedType: '[%#this.activeItem%]'
        })
        .sort({ updatedAt: -1 });
    };
  }

  async submitDocument() {}
}

export default WidgetSelectorModalPage.compose({
  template: widgetSelectorModalPageTemplate,
  styles: widgetSelectorModalPageStyles
}).define();
