import ppp from '../../ppp.js';
import { html, css, Observable, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { ConflictError, validate, invalidate } from '../../lib/ppp-errors.js';
import '../button.js';
import '../text-field.js';

export const newExtensionModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group full">
          <h5>Манифест</h5>
          <p class="description">
            Введите URL манифеста (адрес файла ppp.json).
          </p>
          <ppp-text-field
            type="url"
            placeholder="https://example.com/ppp.json"
            ${ref('url')}
          ></ppp-text-field>
        </div>
      </section>
      <section class="last">
        <div class="label-group full">
          <h5>Название</h5>
          <p class="description">
            Название для отображения в боковой панели в разделе дополнений.
          </p>
          <ppp-text-field
            optional
            placeholder="Введите название"
            ${ref('extensionTitle')}
          ></ppp-text-field>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Установить дополнение
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const newExtensionModalPageStyles = css`
  ${pageStyles}
  section:first-of-type {
    padding-top: 10px;
  }

  .label-group ppp-select,
  .label-group ppp-text-field {
    max-width: unset;
  }
`;

export class NewExtensionModalPage extends Page {
  collection = 'extensions';

  getDocumentId() {
    return false;
  }

  documentChanged(prev, next) {
    // Just inserted
    if (prev && !prev._id && next?._id) {
      ppp.extensions.push(ppp.structuredClone(next));
      Observable.notify(ppp, 'extensions');

      this.document = {
        title: next.title,
        url: next.url
      };
    }
  }

  async connectedCallback() {
    await super.connectedCallback();

    this.failOperation = this.failOperation.bind(this);
  }

  failOperation(e) {
    if (e instanceof ConflictError) {
      invalidate(this.url, {
        errorMessage: 'Это дополнение уже добавлено'
      });
    } else {
      super.failOperation(e);
    }
  }

  async validate() {
    await validate(this.url);
  }

  async find() {
    return {
      url: this.url.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    let url;
    let urlToStore;

    try {
      if (this.url.value.startsWith('/')) {
        const rootUrl = window.location.origin;

        if (rootUrl.endsWith('.github.io'))
          url = new URL('/ppp' + this.url.value, rootUrl);
        else url = new URL(this.url.value, rootUrl);

        urlToStore = this.url.value.trim();
      } else {
        url = new URL(this.url.value);
        urlToStore = url.toString();
      }
    } catch (e) {
      invalidate(this.url, {
        errorMessage: 'Неверный URL манифеста',
        raiseException: true
      });
    }

    if (!url.pathname.endsWith('/ppp.json')) {
      invalidate(this.url, {
        errorMessage: 'Этот манифест не может быть прочитан',
        raiseException: true
      });
    }

    const manifest = await (
      await fetch(url.toString(), {
        cache: 'no-cache'
      })
    ).json();

    if (
      !manifest.page.trim() ||
      !manifest.title.trim() ||
      !manifest.author.trim() ||
      isNaN(manifest.version) ||
      parseInt(manifest.version) < 1
    ) {
      invalidate(this.url, {
        errorMessage: 'Манифест содержит ошибки и не может быть использован',
        raiseException: true
      });
    }

    const title = this.extensionTitle.value.trim() || manifest.title.trim();

    return {
      $set: {
        url: urlToStore,
        title,
        repository: manifest.repository,
        page: manifest.page.trim(),
        author: manifest.author.trim(),
        version: manifest.version,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}

export default NewExtensionModalPage.compose({
  template: newExtensionModalPageTemplate,
  styles: newExtensionModalPageStyles
}).define();
