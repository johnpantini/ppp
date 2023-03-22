import ppp from '../../ppp.js';
import { html, css, ref, Observable } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import { Page, pageStyles } from '../page.js';
import { BROKERS } from '../../lib/const.js';
import '../text-field.js';
import '../button.js';

export const workspaceManagePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        ${(x) =>
          x.document.name ? `Терминал - ${x.document.name}` : 'Терминал'}
      </ppp-page-header>
      <section>
        <div class="label-group">
          <h5>Название терминала</h5>
          <p class="description">
            Название будет отображаться в боковой панели в списке терминалов.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="PPP"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Сохранить изменения
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const workspaceManagePageStyles = css`
  ${pageStyles}
`;

export class WorkspaceManagePage extends Page {
  collection = 'workspaces';

  async validate() {
    await validate(this.name);
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]')
        });
    };
  }

  async find() {
    return {
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    if (this.document._id) {
      const index = ppp.workspaces.findIndex(
        (w) => w._id === this.document._id
      );

      if (index > -1) {
        ppp.workspaces[index] = Object.assign({}, ppp.workspaces[index], {
          name: this.name.value.trim()
        });

        const itemInSideNav = ppp.app.sideNav.querySelector(
          `[id="${this.document._id}"]`
        );

        if (itemInSideNav) {
          itemInSideNav.firstElementChild.textContent = this.name.value.trim();
        }

        Observable.notify(ppp.app, 'workspaces');
      }
    }

    return {
      $set: {
        name: this.name.value.trim()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default WorkspaceManagePage.compose({
  template: workspaceManagePageTemplate,
  styles: workspaceManagePageStyles
}).define();
