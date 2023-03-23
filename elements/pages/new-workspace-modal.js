/** @decorator */

import ppp from '../../ppp.js';
import { html, css, Observable, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { ConflictError, validate, invalidate } from '../../lib/ppp-errors.js';
import '../button.js';
import '../text-field.js';

export const newWorkspaceModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group full">
          <h5>Название</h5>
          <p class="description">Будет отображаться в боковой панели.</p>
          <ppp-text-field
            placeholder="Название пространства"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section class="last">
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

  .label-group ppp-select, .label-group ppp-text-field {
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
        name: next.name
      };
    }
  }

  async connectedCallback() {
    await super.connectedCallback();

    this.failOperation = this.failOperation.bind(this);
  }

  failOperation(e) {
    if (e instanceof ConflictError) {
      invalidate(ppp.app.toast, {
        errorMessage: 'Рабочее пространство с таким названием уже существует.'
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
    return {
      $set: {
        name: this.name.value.trim(),
        comment: this.comment.value.trim(),
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
