/** @decorator */

import { Page, PageWithDocument } from './page.js';
import { validate } from './validate.js';
import { Observable, observable } from './element/observation/observable.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { DOM } from './element/dom.js';
import ppp from '../ppp.js';

export class WidgetPage extends Page {
  collection = 'widgets';

  @observable
  widget;

  constructor() {
    super();

    this.widget = {};
  }

  async syncWidget() {
    if (typeof this.widgetElement.validate === 'function')
      await this.widgetElement.validate();

    this.widgetElement && Observable.notify(this.widgetElement, 'document');
  }

  async validate() {
    await validate(this.name);

    if (this.document.type === 'custom') await validate(this.url);

    if (typeof this.widgetElement.validate === 'function')
      return this.widgetElement.validate();
  }

  getWidgetTagName() {
    if (typeof this.widget.customElement === 'function') {
      return this.widget.customElement().definition.baseName;
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]')
        });
    };
  }

  async find() {
    return {
      name: this.name.value.trim()
    };
  }

  async update() {
    let widgetUpdateResult = {};

    const $set = {
      name: this.name.value.trim(),
      updatedAt: new Date()
    };

    const $setOnInsert = {
      type: this.document.type,
      reportedType: this.widget.type,
      collection: this.widget.collection,
      createdAt: new Date()
    };

    if (this.document.type === 'custom') {
      $setOnInsert.url = this.url.value.trim();
    }

    const result = {
      $set,
      $setOnInsert
    };

    if (typeof this.widgetElement.update === 'function') {
      widgetUpdateResult = await this.widgetElement.update();

      if (typeof widgetUpdateResult === 'object') {
        for (const key in widgetUpdateResult) {
          result[key] = Object.assign(
            {},
            result[key] ?? {},
            widgetUpdateResult[key]
          );
        }
      }
    }

    return result;
  }

  getWidgetUrl() {
    const type = this.document.type;

    if (type === 'custom') {
      return this.url?.value?.trim() ?? '';
    } else {
      return `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/${type}-widget.js`;
    }
  }

  async loadWidget(url = this.getWidgetUrl()) {
    this.widget.loaded = false;

    if (!url && this.document.type === 'custom') {
      this.widget.settings = null;
      this.widget.title = 'Загружаемый виджет';
      this.widget.tags = ['Произвольная реализация'];
      this.widget.collection = null;
      this.widget.description =
        'Укажите URL в секции базовых настроек, чтобы продолжить.';

      Observable.notify(this, 'widget');
    }

    if (url) {
      this.beginOperation();

      try {
        const module = await import(url);
        const wUrl = new URL(url);
        const baseWidgetUrl = wUrl.href.slice(0, wUrl.href.lastIndexOf('/'));

        this.widget = await module.widget?.({
          ppp,
          baseWidgetUrl
        });

        ppp.DesignSystem.getOrCreate().register(this.widget.customElement());

        this.widget.loaded = true;

        Observable.notify(this, 'widget');
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    }
  }

  async connectedCallback() {
    await super.connectedCallback();

    if (!this.lastError) {
      if (!this.document.type) {
        this.document.type = 'order';
      }

      Observable.notify(this, 'document');
    }
  }

  async handleWidgetTypeChange(event) {
    if (!this.document._id) {
      const name = this.name.value.trim();

      this.document.type = event.target.value;

      Observable.notify(this, 'document');
      DOM.queueUpdate(() => (this.name.value = name));
    }

    await this.loadWidget();
  }
}

applyMixins(WidgetPage, PageWithDocument);
