/** @decorator */

import { Page, PageWithDocument } from './page.js';
import { observable } from './element/observation/observable.js';
import { applyMixins } from './utilities/apply-mixins.js';

export class WorkspacePage extends Page {
  collection = 'workspaces';

  @observable
  widgets;

  constructor() {
    super();

    this.widgets = [];
  }

  async read() {
    return (context) => {
      return context.services
      .get('mongodb-atlas')
      .db('ppp')
      .collection('[%#this.page.view.collection%]')
      .findOne({
        _id: new BSON.ObjectId('[%#payload.documentId%]')
      }, {
        _id: 0,
        widgets: 1
      });
    };
  }

  async connectedCallback() {
    await super.connectedCallback();
  }
}

applyMixins(WorkspacePage, PageWithDocument);
