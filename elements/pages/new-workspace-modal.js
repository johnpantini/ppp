import ppp from '../../ppp.js';
import {
  html,
  css,
  Observable,
  ref,
  Updates
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { ConflictError, validate, invalidate } from '../../lib/ppp-errors.js';
import '../button.js';
import '../query-select.js';
import '../text-field.js';
import { uuidv4 } from '../../lib/ppp-crypto.js';

export const newWorkspaceModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group full">
          <h5>Название</h5>
          <p class="description">Будет отображаться в боковой панели.</p>
          <ppp-text-field
            placeholder="Название терминала"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
          <p class="description">
            Можно выбрать существующий терминал - из него будут скопированы все
            виджеты:
          </p>
          <ppp-query-select
            ${ref('workspaceId')}
            deselectable
            placeholder="Опционально, нажмите для выбора"
            value="${(x) => x.document.workspaceId}"
            :context="${(x) => x}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('workspaces')
                  .find({
                    removed: { $ne: true }
                  })
                  .sort({ order: 1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
        </div>
      </section>
      <section>
        <div class="label-group full">
          <h5>Комментарий</h5>
          <ppp-text-field
            optional
            placeholder="Произвольное описание"
            value="${(x) => x.document.comment}"
            ${ref('comment')}
          ></ppp-text-field>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Создать пространство
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const newWorkspaceModalPageStyles = css`
  ${pageStyles}
  section:first-of-type {
    padding-top: 10px;
  }

  .label-group ppp-select,
  .label-group ppp-text-field,
  .label-group ppp-query-select {
    max-width: unset;
  }
`;

export class NewWorkspaceModalPage extends Page {
  collection = 'workspaces';

  getDocumentId() {
    return false;
  }

  documentChanged(prev, next) {
    // Just inserted
    if (prev && !prev._id && next?._id) {
      ppp.workspaces.push(ppp.structuredClone(next));
      Observable.notify(ppp, 'workspaces');

      this.document = {
        name: next.name,
        workspaceId: this.workspaceId.value
      };

      Updates.enqueue(() => {
        location.reload();
      });
    }
  }

  async connectedCallback() {
    await super.connectedCallback();

    this.failOperation = this.failOperation.bind(this);
  }

  failOperation(e) {
    if (e instanceof ConflictError) {
      invalidate(this.name, {
        errorMessage: 'Рабочее пространство с таким названием уже существует'
      });
    } else {
      super.failOperation(e);
    }
  }

  async validate() {
    await validate(this.name);
  }

  async find() {
    return {
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    const workspaceToClone = this.workspaceId.datum();
    const seen = {};

    return {
      $set: {
        name: this.name.value.trim(),
        comment: this.comment.value.trim(),
        widgets: workspaceToClone
          ? workspaceToClone.widgets?.map((w) => {
              // Change every uniqueID.
              if (seen[w.uniqueID]) {
                w.uniqueID = seen[w.uniqueID];
              } else {
                seen[w.uniqueID] = uuidv4();
                w.uniqueID = seen[w.uniqueID];
              }

              if (w.activeWidgetLink) {
                if (seen[w.activeWidgetLink]) {
                  w.activeWidgetLink = seen[w.activeWidgetLink];
                } else {
                  seen[w.activeWidgetLink] = uuidv4();
                  w.activeWidgetLink = seen[w.activeWidgetLink];
                }
              }

              if (Array.isArray(w.linkedWidgets)) {
                w.linkedWidgets = w.linkedWidgets.map((lw) => {
                  if (!seen[lw]) {
                    seen[lw] = uuidv4();
                  }

                  return seen[lw];
                });
              }

              return w;
            })
          : [],
        order: ppp.workspaces.length + 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default NewWorkspaceModalPage.compose({
  template: newWorkspaceModalPageTemplate,
  styles: newWorkspaceModalPageStyles
}).define();
