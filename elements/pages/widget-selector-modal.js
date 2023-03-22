/** @decorator */

import ppp from '../../ppp.js';
import {
  html,
  css,
  Observable,
  observable
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { later } from '../../lib/ppp-decorators.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';
import { formatDate } from '../../lib/intl.js';
import { scrollbars } from '../../design/styles.js';
import '../banner.js';
import '../button.js';
import '../side-nav.js';
import '../table.js';
import '../text-field.js';

export const widgetSelectorModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-banner
        class="inline"
        appearance="${(x) =>
          !x.isPredefinedWidgetType(x.activeItem) || x.documents.length
            ? 'info'
            : 'warning'}"
        style="margin-bottom: 1rem"
      >
        <div
          style="display: ${(x) =>
            !x.isPredefinedWidgetType(x.activeItem) || x.documents.length
              ? 'initial'
              : 'none'}"
        >
          Найдите виджет, используя боковое меню, а затем нажмите на строку в
          таблице, чтобы разместить в терминале.
        </div>
        <div
          style="display: ${(x) =>
            x.isPredefinedWidgetType(x.activeItem) && !x.documents.length
              ? 'initial'
              : 'none'}"
        >
          Похоже, у вас нет ни одного виджета данного типа. Добавьте и настройте
          их в
          <a
            @click="${(x) => {
              ppp.app.navigate({
                page: 'widget',
                type: x.activeItem
              });
            }}}"
            href="javascript:void(0)"
            >соответствующем разделе</a
          >.
        </div>
      </ppp-banner>
      <div class="selectors">
        <div class="selector-holder">
          <ppp-side-nav
            expanded
            static
            inline
            @click="${(x, c) => x.handleTypeSelectorClick(c)}"
          >
            <ppp-side-nav-group>
              <span slot="title">Тип виджета</span>
              <ppp-side-nav-item
                slug="order"
                ?active="${(x) => x.activeItem === 'order'}"
              >
                <span>Заявка</span>
              </ppp-side-nav-item>
              <ppp-side-nav-item
                slug="scalping-buttons"
                title="Скальперские кнопки"
                ?active="${(x) => x.activeItem === 'scalping-buttons'}"
              >
                <span>Скальперские кнопки</span>
              </ppp-side-nav-item>
              <ppp-side-nav-item
                slug="active-orders"
                ?active="${(x) => x.activeItem === 'active-orders'}"
              >
                <span>Активные заявки</span>
              </ppp-side-nav-item>
              <ppp-side-nav-item
                slug="light-chart"
                ?active="${(x) => x.activeItem === 'light-chart'}"
              >
                <span>Лёгкий график</span>
              </ppp-side-nav-item>
              <ppp-side-nav-item
                slug="orderbook"
                ?active="${(x) => x.activeItem === 'orderbook'}"
              >
                <span>Книга заявок</span>
              </ppp-side-nav-item>
              <ppp-side-nav-item
                slug="time-and-sales"
                ?active="${(x) => x.activeItem === 'time-and-sales'}"
              >
                <span>Лента всех сделок</span>
              </ppp-side-nav-item>
              <ppp-side-nav-item
                slug="portfolio"
                ?active="${(x) => x.activeItem === 'portfolio'}"
              >
                <span>Портфель</span>
              </ppp-side-nav-item>
              <ppp-side-nav-item
                slug="instruments"
                ?active="${(x) => x.activeItem === 'instruments'}"
              >
                <span>Инструменты</span>
              </ppp-side-nav-item>
              <ppp-side-nav-item
                slug="timeline"
                ?active="${(x) => x.activeItem === 'timeline'}"
              >
                <span>Лента операций</span>
              </ppp-side-nav-item>
              <ppp-side-nav-item
                slug="frame"
                ?active="${(x) => x.activeItem === 'frame'}"
              >
                <span>Фрейм</span>
              </ppp-side-nav-item>
              <ppp-side-nav-item
                slug="other"
                title="Специальный виджет"
                ?active="${(x) => x.activeItem === 'other'}"
              >
                <span>Специальный виджет</span>
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
                label: 'Название'
              },
              {
                label: 'Последнее изменение'
              },
              {
                label: 'Коллекция'
              },
              {
                label: 'Действия'
              }
            ]}"
            :rows="${(x) =>
              x.documents?.map((datum) => {
                return {
                  datum,
                  cells: [
                    datum.name ?? '<Без имени>',
                    formatDate(datum.updatedAt ?? datum.createdAt),
                    datum.collection,
                    html`
                      <ppp-button
                        disabled
                        class="xsmall"
                        @click="${() => {
                          ppp.app.navigate({
                            page: 'widget',
                            document: datum._id
                          });

                          return false;
                        }}"
                      >
                        Настройки виджета
                      </ppp-button>
                    `
                  ]
                };
              })}"
          >
          </ppp-table>
        </div>
      </div>
    </form>
  </template>
`;

export const widgetSelectorModalPageStyles = css`
  ${pageStyles}
  ${scrollbars('.table-holder')}
  form[novalidate] {
    padding: 0 25px 25px 25px;
  }

  ppp-banner {
    width: 810px;
  }

  ppp-side-nav {
    position: absolute;
    height: 100%;
  }

  .selectors {
    position: relative;
  }

  .selector-holder {
    width: 183px;
    height: 375px;
    position: relative;
    overflow: hidden;
  }

  .table-holder {
    position: absolute;
    width: calc(100% - 183px);
    height: 100%;
    left: 183px;
    top: 0;
    overflow: auto;
    margin-left: 8px;
    border-left: none;
    border-right: none;
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

  isPredefinedWidgetType(widgetType) {
    return (
      [
        'order',
        'scalping-buttons',
        'active-orders',
        'light-chart',
        'orderbook',
        'time-and-sales',
        'portfolio',
        'instruments',
        'timeline'
      ].indexOf(widgetType) > -1
    );
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
                x: widget.x,
                y: widget.y,
                zIndex: workspacePage.zIndex
              }
            }
          }
        );

        this.mountPointModal.setAttribute('hidden', '');
        await later(250);
      } finally {
        workspacePage.locked = false;
      }
    } catch (e) {
      this.failOperation(e, 'Размещение виджета');
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
