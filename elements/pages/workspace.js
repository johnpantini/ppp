/** @decorator */

import {
  html,
  css,
  ref,
  when,
  attr,
  Observable
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { Denormalization } from '../../lib/ppp-denormalize.js';
import { PAGE_STATUS } from '../../lib/const.js';
import { emptyState, hotkey, typography } from '../../design/styles.js';
import '../button.js';
import '../top-loader.js';

export const workspacePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-top-loader ${ref('topLoader')}></ppp-top-loader>
    ${when(
      (x) =>
        !(
          x.status === PAGE_STATUS.NOT_READY ||
          x.status === PAGE_STATUS.OPERATION_STARTED
        ) && !x.document.widgets?.length,
      html`
        <div class="empty-state">
          <img
            class="picture"
            width="200"
            height="200"
            src="static/svg/empty-state.svg"
            draggable="false"
          />
          <h3>В этом терминале нет виджетов</h3>
          <p>
            Перед тем, как начать торговать, разместите виджеты на рабочей
            области. Чтобы в дальнейшем добавлять виджеты, выберите терминал в
            боковом меню и нажмите&nbsp;<code
              @click="${() => ppp.app.showWidgetSelector()}"
              class="hotkey"
              >+W</code
            >
          </p>
          <ppp-button
            appearance="primary"
            class="large"
            @click="${() => ppp.app.showWidgetSelector()}"
          >
            Разместить виджет
          </ppp-button>
        </div>
      `
    )}
    ${when(
      (x) => x.document.widgets?.length,
      html` <div class="workspace" ${ref('workspace')}></div> `
    )}
  </template>
`;

export const workspacePageStyles = css`
  ${pageStyles}
  ${hotkey()}
  ${typography()}
  ${emptyState()}
`;

export class WorkspacePage extends Page {
  @attr
  workspace;

  collection = 'workspaces';

  zIndex = 10;

  denormalization = new Denormalization();

  sideNavExpandedChanged = {
    handleChange() {
      // this.updateWidgetContainment();
    }
  };

  constructor() {
    super();

    this.document.widgets = [];

    this.sideNavExpandedChanged.handleChange =
      this.sideNavExpandedChanged.handleChange.bind(this);

    Observable.getNotifier(ppp.app.sideNav).subscribe(
      this.sideNavExpandedChanged,
      'expanded'
    );

    this.onDblClick = this.onDblClick.bind(this);

    document.addEventListener('dblclick', this.onDblClick);
  }

  onDblClick(event) {
    if (event.ctrlKey) {
      const value = !ppp.settings.get('sideNavVisible');

      ppp.settings.set('sideNavVisible', value);

      // this.updateWidgetContainment();
    }
  }

  // Place widgets when DOM (.workspace) is ready
  async workspaceChanged(prev, next) {
    if (this.$fastController.isConnected && next) {
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
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
                    environmentCodeSecret: 0,
                    sourceCode: 0,
                    parsingCode: 0,
                    versioningUrl: 0,
                    useVersioning: 0,
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

  async transformDocument() {
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
}

export default WorkspacePage.compose({
  template: workspacePageTemplate,
  styles: workspacePageStyles
}).define();
