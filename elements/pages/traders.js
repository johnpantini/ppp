/** @decorator */

import ppp from '../../ppp.js';
import {
  css,
  html,
  repeat,
  observable
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import { TRADERS } from '../../lib/const.js';
import '../badge.js';
import '../button.js';
import '../side-nav.js';
import '../table.js';

await ppp.i18n(import.meta.url);

export const tradersPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <div class="page-level control-stack">
        <ppp-page-header>
          Список трейдеров
          <ppp-button
            appearance="primary"
            slot="controls"
            @click="${() =>
              ppp.app.navigate({
                page: 'trader'
              })}"
          >
            Добавить трейдера
          </ppp-button>
        </ppp-page-header>
        <div class="table-with-selector">
          <div class="selector-holder">
            <ppp-side-nav
              expanded
              static
              inline
              @click="${(x, c) => x.handleTraderTypeSelectorClick(c)}"
            >
              <ppp-side-nav-group>
                <span slot="title">Или</span>
                <ppp-side-nav-item slug="" ?active="${(x) => !x.activeItem}">
                  <span>Все трейдеры</span>
                </ppp-side-nav-item>
                <ppp-side-nav-item
                  slug="removed"
                  ?active="${(x) => x.activeItem === 'removed'}"
                >
                  <span>Удалённые трейдеры</span>
                </ppp-side-nav-item>
              </ppp-side-nav-group>
              <ppp-side-nav-group>
                <span slot="title">Или по типу</span>
                ${repeat(
                  (x) => Object.keys(TRADERS),
                  html`
                    <ppp-side-nav-item
                      slug="${(x) => TRADERS[x]}"
                      ?active="${(x, c) => c.parent.activeItem === TRADERS[x]}"
                    >
                      <span
                        >${(x) => ppp.t(`$const.trader.${TRADERS[x]}`)}</span
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
              @cleanup="${(x, c) => {
                let type = c.event.detail.datum.type;

                if (type === TRADERS.PSINA_ALOR_OPENAPI_V2) {
                  type = TRADERS.CUSTOM;
                }

                x.cleanupFromListing({
                  pageName: `trader-${type}`,
                  documentId: c.event.detail.datum._id,
                  removed: c.event.detail.datum.removed
                });
              }}"
              :columns="${() => [
                {
                  label: 'Название'
                },
                {
                  label: 'Тип'
                },
                {
                  label: 'Дата создания'
                },
                {
                  label: 'Последнее изменение'
                },
                {
                  label: 'Версия'
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
                          let type = datum.type;

                          if (type === TRADERS.PSINA_ALOR_OPENAPI_V2) {
                            type = TRADERS.CUSTOM;
                          }

                          ppp.app.navigate({
                            page: `trader-${type}`,
                            document: datum._id
                          });

                          return false;
                        }}"
                        href="?page=trader-${datum.type}&document=${datum._id}"
                      >
                        ${datum.name}
                      </a>`,
                      ppp.t(`$const.trader.${datum.type}`),
                      formatDate(datum.createdAt),
                      formatDate(datum.updatedAt ?? datum.createdAt),
                      html`
                        <ppp-badge appearance="green">
                          ${() => datum.version}
                        </ppp-badge>
                      `,
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

export const tradersPageStyles = css`
  ${pageStyles}
`;

export class TradersPage extends Page {
  collection = 'traders';

  @observable
  activeItem;

  async activeItemChanged(oldValue, newValue) {
    ppp.app.setURLSearchParams({
      type: this.activeItem || ''
    });

    if (typeof oldValue !== 'undefined') await this.populateDocuments();
  }

  handleTraderTypeSelectorClick({ event }) {
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
          removed: {
            '[%#(this.activeItem === "removed" ? "$eq" : "$ne")%]': true
          },
          type: '[%#(this.activeItem === "removed" ? "" : this.activeItem)%]' || {
            $exists: true
          }
        })
        .sort({ updatedAt: -1 });
    };
  }
}

export default TradersPage.compose({
  template: tradersPageTemplate,
  styles: tradersPageStyles
}).define();
