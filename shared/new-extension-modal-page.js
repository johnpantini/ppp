import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { Observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

export class NewExtensionModalPage extends Page {
  collection = 'extensions';

  getDocumentId() {
    return false;
  }

  documentChanged(prev, next) {
    // Just inserted
    if (prev && !prev._id && next?._id) {
      ppp.app.extensions.push(Object.assign({}, next));
      Observable.notify(ppp.app, 'extensions');

      this.document = {
        title: next.title,
        url: next.url
      };
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this.page.failOperation = this.failOperation.bind(this);

    this.closest('ppp-modal').visibleChanged = (oldValue, newValue) =>
      !newValue && (ppp.app.toast.visible = false);
  }

  failOperation(e) {
    if (e.name === 'ConflictError') {
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

  async update() {
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
