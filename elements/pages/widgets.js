/** @decorator */

import ppp from '../../ppp.js';
import {
  css,
  html,
  repeat,
  when,
  observable
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import { WIDGET_TYPES, isPredefinedWidgetType } from '../../lib/const.js';
import { pin } from '../../static/svg/sprite.js';
import '../badge.js';
import '../button.js';
import '../side-nav.js';
import '../table.js';

const FILTERED_WIDGET_TYPES = {};

for (const key in WIDGET_TYPES) {
  if ([WIDGET_TYPES.MIGRATION].includes(WIDGET_TYPES[key])) {
    continue;
  }

  FILTERED_WIDGET_TYPES[key] = WIDGET_TYPES[key];
}

await ppp.i18n(import.meta.url);

export const widgetsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <div class="page-level control-stack">
        <ppp-page-header>
          Список шаблонов виджетов
          <ppp-button
            appearance="primary"
            slot="controls"
            @click="${() =>
              ppp.app.navigate({
                page: 'widget'
              })}"
          >
            Добавить шаблон виджета
          </ppp-button>
        </ppp-page-header>
        <div class="table-with-selector">
          <div class="selector-holder">
            <ppp-side-nav
              expanded
              static
              inline
              @click="${(x, c) => x.handleWidgetTypeSelectorClick(c)}"
            >
              <ppp-side-nav-group>
                <span slot="title">Или</span>
                <ppp-side-nav-item slug="" ?active="${(x) => !x.activeItem}">
                  <span>Все шаблоны</span>
                </ppp-side-nav-item>
              </ppp-side-nav-group>
              <ppp-side-nav-group>
                <span slot="title">Или по типу</span>
                ${repeat(
                  (x) => Object.keys(FILTERED_WIDGET_TYPES),
                  html`
                    <ppp-side-nav-item
                      slug="${(x) => FILTERED_WIDGET_TYPES[x]}"
                      ?active="${(x, c) =>
                        c.parent.activeItem === FILTERED_WIDGET_TYPES[x]}"
                    >
                      ${when(
                        (x, c) =>
                          isPredefinedWidgetType(FILTERED_WIDGET_TYPES[x]),
                        html`<span slot="start">${html.partial(pin)}</span>`
                      )}
                      <span
                        >${(x) =>
                          ppp.t(
                            `$const.widget.${FILTERED_WIDGET_TYPES[x]}`
                          )}</span
                      >
                    </ppp-side-nav-item>
                  `
                )}
              </ppp-side-nav-group>
            </ppp-side-nav>
          </div>
          <div class="table-holder">
            <ppp-table
              sticky
              @cleanup="${(x, c) =>
                x.cleanupFromListing({
                  pageName: 'widget',
                  documentId: c.event.detail.datum._id
                })}"
              :columns="${() => [
                {
                  label: 'Название'
                },
                {
                  label: 'Тип'
                },
                {
                  label: 'Коллекция'
                },
                {
                  label: 'Дата создания'
                },
                {
                  label: 'Последнее изменение'
                },
                {
                  label: 'Действия'
                }
              ]}"
              :rows="${(x) =>
                x.documents.map((datum) => {
                  return {
                    datum,
                    cells: [
                      html`<a
                        class="link"
                        @click="${() => {
                          ppp.app.navigate({
                            page: 'widget',
                            document: datum._id
                          });

                          return false;
                        }}"
                        href="?page=widget&document=${datum._id}"
                      >
                        ${datum.name}
                      </a>`,
                      datum.type === 'custom'
                        ? html`
                            <div class="control-stack">
                              <div>
                                ${(_) =>
                                  ppp.t(`$const.widget.${datum.reportedType}`)}
                              </div>
                              <ppp-badge appearance="yellow"
                                >По ссылке</ppp-badge
                              >
                            </div>
                          `
                        : ppp.t(`$const.widget.${datum.reportedType}`),
                      datum.collection,
                      formatDate(datum.createdAt),
                      formatDate(datum.updatedAt ?? datum.createdAt),
                      html`
                        <ppp-button
                          action="cleanup"
                          :datum="${() => datum}"
                          class="xsmall"
                        >
                          Удалить
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

export const widgetsPageStyles = css`
  ${pageStyles}
`;

export class WidgetsPage extends Page {
  collection = 'widgets';

  @observable
  activeItem;

  async activeItemChanged(oldValue, newValue) {
    ppp.app.setURLSearchParams({
      type: this.activeItem || ''
    });

    if (typeof oldValue !== 'undefined') await this.populateDocuments();
  }

  handleWidgetTypeSelectorClick({ event }) {
    const item = event
      .composedPath()
      .find((n) => n.tagName?.toLowerCase?.() === 'ppp-side-nav-item');

    if (item) {
      this.activeItem = item.getAttribute('slug') || '';
    }
  }

  async connectedCallback() {
    this.activeItem = ppp.app.params()?.type || '';

    return super.connectedCallback();
  }

  async populate() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .find({
          removed: { $ne: true },
          reportedType: '[%#this.activeItem%]' || { $exists: true }
        })
        .sort({ updatedAt: -1 });
    };
  }
}

export default WidgetsPage.compose({
  template: widgetsPageTemplate,
  styles: widgetsPageStyles
}).define();
