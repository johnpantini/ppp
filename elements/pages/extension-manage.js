import ppp from '../../ppp.js';
import { html, css, ref, Observable } from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import '../badge.js';
import '../button.js';
import '../text-field.js';

export const extensionManagePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>Название</h5>
          <p class="description">
            Название для отображения в боковой панели в разделе дополнений.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="PPP"
            value="${(x) => x.document.title}"
            ${ref('titleInput')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const extensionManagePageStyles = css`
  ${pageStyles}
`;

export class ExtensionManagePage extends Page {
  collection = 'extensions';

  async validate() {
    await validate(this.titleInput);
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
      title: this.titleInput.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    if (this.document._id) {
      const index = ppp.extensions.findIndex(
        (e) => e._id === this.document._id
      );

      if (index > -1) {
        ppp.extensions[index] = Object.assign({}, ppp.extensions[index], {
          title: this.titleInput.value.trim()
        });

        const itemInSideNav = ppp.app.sideNav.querySelector(
          `[id="${this.document._id}"]`
        );

        if (itemInSideNav) {
          itemInSideNav.firstElementChild.textContent =
            this.titleInput.value.trim();
        }

        Observable.notify(ppp.app, 'extensions');
      }
    }

    return {
      $set: {
        title: this.titleInput.value.trim(),
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }

  async cleanup() {
    const index = ppp.extensions.findIndex((e) => e._id === this.document._id);

    if (index > -1) {
      ppp.extensions.splice(index, 1);
      Observable.notify(ppp, 'extensions');
    }
  }
}

export default ExtensionManagePage.compose({
  template: extensionManagePageTemplate,
  styles: extensionManagePageStyles
}).define();
