/** @decorator */

import {
  html,
  css,
  ref,
  when,
  observable,
  Updates,
  attr
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { Denormalization } from '../../lib/ppp-denormalize.js';
import {
  emptyState,
  hotkey,
  scrollbars,
  typography
} from '../../design/styles.js';
import '../button.js';
import '../top-loader.js';
import {
  paletteGrayDark4,
  paletteGrayLight2,
  scrollBarSize,
  themeConditional
} from '../../design/design-tokens.js';
import { dragAndDrop } from '../../static/svg/sprite.js';
import ppp from '../../ppp.js';

export const workspacePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-top-loader ${ref('topLoader')}></ppp-top-loader>
    ${when(
      (x) => x.isSteady() && !x.document.widgets?.length,
      html`
        <div class="empty-state">
          <div class="picture">${html.partial(dragAndDrop)}</div>
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
      (x) => x.isSteady() && x.document.widgets?.length,
      html` <div class="workspace" ${ref('workspace')}></div> `
    )}
  </template>
`;

export const workspacePageStyles = css`
  ${pageStyles}
  ${hotkey()}
  ${typography()}
  ${emptyState()}
  ${scrollbars('.workspace')}
  :host {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .workspace {
    position: relative;
    z-index: 1;
    overflow-y: auto;
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark4)};
    width: 100%;
    height: 100%;
  }

  .workspace::-webkit-scrollbar {
    width: calc(${scrollBarSize} * 2px);
    height: calc(${scrollBarSize} * 2px);
  }

  .widget {
    position: absolute;
    overflow: hidden;
  }

  .empty-state .picture svg {
    width: 110px;
  }
`;

export class WorkspacePage extends Page {
  @attr({ mode: 'boolean' })
  dragging;

  @observable
  workspace;

  collection = 'workspaces';

  zIndex = 10;

  denormalization = new Denormalization();

  get widgets() {
    return Array.from(this.shadowRoot.querySelectorAll('.widget'));
  }

  constructor() {
    super();

    this.document.widgets = [];

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onDblClick = this.onDblClick.bind(this);
  }

  onPointerDown(event) {
    const cp = event.composedPath();

    if (
      cp.find((n) => n?.classList?.contains('widget-header')) &&
      !cp.find((n) =>
        /ppp-widget-group-control|ppp-widget-search-control/.test(
          n?.tagName?.toLowerCase?.()
        )
      )
    ) {
      this.dragging = true;
      this.clientX = event.clientX;
      this.clientY = event.clientY;
      this.x = this.getBoundingClientRect().x;

      const widget = cp.find((n) => n?.classList?.contains('widget'));

      if (widget) {
        widget.dragging = true;
        this.draggedWidget = widget;
        this.draggedWidgetBCR = this.draggedWidget.getBoundingClientRect();

        this.rectangles = this.widgets
          .filter((w) => w !== widget)
          .map((w) => w.getBoundingClientRect());

        this.rectangles.push(this.getBoundingClientRect());

        const styles = getComputedStyle(widget);

        widget.x = parseInt(styles.left);
        widget.y = parseInt(styles.top);
      }
    }
  }

  onPointerMove(event) {
    if (this.dragging) {
      const deltaX = event.clientX - this.clientX;
      const deltaY = event.clientY - this.clientY;

      let newTop = this.draggedWidget.y + deltaY;
      let newLeft = this.draggedWidget.x + deltaX;
      const newRight = newLeft + this.draggedWidgetBCR.width;
      const newBottom = newTop + this.draggedWidgetBCR.height;

      this.rectangles.forEach((rect) => {
        const hasVerticalIntersection =
          (newTop >= rect.top && newTop <= rect.bottom) ||
          (newBottom >= rect.top && newBottom <= rect.bottom) ||
          (newTop <= rect.top && newBottom >= rect.bottom);

        if (hasVerticalIntersection) {
          // 1. Vertical, this.left -> rect.right
          const deltaLeftRight = Math.abs(
            newLeft - (rect.x - this.x + rect.width)
          );

          if (deltaLeftRight <= this.snapDistance) {
            newLeft = rect.x - this.x + rect.width + this.snapMargin;
          }

          // 2. Vertical, this.left -> rect.left
          const deltaLeftLeft = Math.abs(newLeft - (rect.x - this.x));

          if (deltaLeftLeft <= this.snapDistance) {
            newLeft = rect.x - this.x;
          }

          // 3. Vertical, this.right -> rect.right
          const deltaRightRight = Math.abs(
            newRight - (rect.x - this.x + rect.width)
          );

          if (deltaRightRight <= this.snapDistance) {
            newLeft =
              rect.x - this.x + rect.width - this.draggedWidgetBCR.width;
          }

          // 4. Vertical, this.right -> rect.left
          const deltaRightLeft = Math.abs(newRight - (rect.x - this.x));

          if (deltaRightLeft <= this.snapDistance) {
            newLeft =
              rect.x - this.x - this.draggedWidgetBCR.width - this.snapMargin;
          }
        }

        const hasHorizontalIntersection =
          (newLeft >= rect.left && newLeft <= rect.right) ||
          (newRight >= rect.left && newRight <= rect.right) ||
          (newLeft <= rect.left && newRight >= rect.right);

        if (hasHorizontalIntersection) {
          // 1. Horizontal, this.top -> rect.bottom
          const deltaTopBottom = Math.abs(newTop - rect.bottom);

          if (deltaTopBottom <= this.snapDistance) {
            newTop = rect.bottom + this.snapMargin;
          }

          // 2. Horizontal, this.top -> rect.top
          const deltaTopTop = Math.abs(newTop - rect.y);

          if (deltaTopTop <= this.snapDistance) {
            newTop = rect.y;
          }

          // 3. Horizontal, this.bottom -> rect.bottom
          const deltaBottomBottom = Math.abs(
            rect.bottom - (newTop + this.draggedWidgetBCR.height)
          );

          if (deltaBottomBottom <= this.snapDistance) {
            newTop = rect.bottom - this.draggedWidgetBCR.height;
          }

          // 4. Horizontal, this.bottom -> rect.top
          const deltaBottomTop = Math.abs(
            rect.y - (newTop + this.draggedWidgetBCR.height)
          );

          if (deltaBottomTop <= this.snapDistance) {
            newTop = rect.y - this.draggedWidgetBCR.height - this.snapMargin;
          }
        }
      });

      if (newLeft < 0) newLeft = 0;

      if (newTop < 0) newTop = 0;

      this.draggedWidget.style.left = `${newLeft}px`;
      this.draggedWidget.style.top = `${newTop}px`;
    }
  }

  onPointerUp() {
    if (this.dragging) {
      void this.draggedWidget.updateDocumentFragment({
        $set: {
          'widgets.$.x': parseInt(this.draggedWidget.style.left),
          'widgets.$.y': parseInt(this.draggedWidget.style.top),
          'widgets.$.zIndex': this.zIndex
        }
      });

      this.dragging = false;
      this.draggedWidget = null;
      this.draggedWidgetBCR = {};
      this.rectangles = [];

      this.widgets.forEach((w) => {
        w.dragging = false;
      });
    }
  }

  async connectedCallback() {
    await super.connectedCallback();

    this.snapDistance = ppp.settings.get('workspaceSnapDistance') ?? 5;
    this.snapMargin = ppp.settings.get('workspaceSnapMargin') ?? 1;

    document.addEventListener('dblclick', this.onDblClick);
    document.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointercancel', this.onPointerUp);
  }

  disconnectedCallback() {
    document.removeEventListener('dblclick', this.onDblClick);
    document.removeEventListener('pointerdown', this.onPointerDown);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointercancel', this.onPointerUp);

    super.disconnectedCallback();
  }

  onDblClick(event) {
    if (event.ctrlKey) {
      const value = !ppp.settings.get('sideNavVisible');

      ppp.settings.set('sideNavVisible', value);
    }
  }

  // Place widgets when DOM (.workspace) is ready
  async workspaceChanged(prev, next) {
    if (this.$fastController.isConnected && next) {
      this.beginOperation();

      try {
        const widgets = this.document.widgets ?? [];

        for (const w of widgets) {
          // Skip first widget added from modal
          if (!this.locked && typeof w.type !== 'undefined')
            await this.placeWidget(w);
        }
      } catch (e) {
        this.failOperation(e, 'Загрузка терминала');
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
      return new URL(widget.url).toString();
    } else {
      return `${ppp.rootUrl}/elements/widgets/${widget.type}.js`;
    }
  }

  async placeWidget(widgetDocument) {
    const url = await this.getWidgetUrl(widgetDocument);
    const module = await import(url);
    const wUrl = new URL(url);
    const baseWidgetUrl = wUrl.href.slice(0, wUrl.href.lastIndexOf('/'));

    // TODO - remove in v2
    try {
      widgetDocument.widgetDefinition = await module.widgetDefinition?.({
        ppp,
        baseWidgetUrl
      });

      const tagName = widgetDocument.widgetDefinition.customElement.name;
      const domElement = document.createElement(tagName);
      const minWidth = widgetDocument.widgetDefinition.minWidth ?? '275';
      const minHeight = widgetDocument.widgetDefinition.minHeight ?? '395';

      domElement.style.left = `${parseInt(widgetDocument.x ?? '0')}px`;
      domElement.style.top = `${parseInt(widgetDocument.y ?? '0')}px`;
      domElement.style.width = `${parseInt(
        widgetDocument.width ??
          widgetDocument.widgetDefinition.defaultWidth ??
          minWidth
      )}px`;
      domElement.style.height = `${parseInt(
        widgetDocument.height ??
          widgetDocument.widgetDefinition.defaultHeight ??
          minHeight
      )}px`;

      if (typeof widgetDocument.zIndex === 'number') {
        this.zIndex = Math.max(this.zIndex, widgetDocument.zIndex);

        domElement.style.zIndex = widgetDocument.zIndex;
      } else {
        domElement.style.zIndex = (++this.zIndex).toString();
      }

      domElement.widgetDefinition = widgetDocument.widgetDefinition;
      domElement.document = widgetDocument;

      return new Promise((resolve) => {
        Updates.enqueue(() => {
          widgetDocument.widgetElement = this.workspace.appendChild(domElement);
          widgetDocument.widgetElement.container = this;
          widgetDocument.widgetElement.topLoader = this.topLoader;
          widgetDocument.widgetElement.classList.add('widget');
        });

        resolve();
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export default WorkspacePage.compose({
  template: workspacePageTemplate,
  styles: workspacePageStyles
}).define();
