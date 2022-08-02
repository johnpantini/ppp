import { Page, PageWithDocument } from './page.js';
import { invalidate, validate } from './validate.js';
import ppp from '../ppp.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { Observable } from './element/observation/observable.js';

export class NewWorkspaceModalPage extends Page {
  collection = 'workspaces';

  getDocumentId() {
    return false;
  }

  documentChanged(prev, next) {
    // Just inserted
    if (prev && !prev._id && next?._id) {
      ppp.app.workspaces.push(Object.assign({}, next));
      Observable.notify(ppp.app, 'workspaces');

      this.document = {
        name: next.name
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
      name: this.name.value.trim()
    };
  }

  async update() {
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

applyMixins(NewWorkspaceModalPage, PageWithDocument);
