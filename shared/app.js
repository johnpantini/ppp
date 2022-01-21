/** @decorator */

import { attr } from './element/components/attributes.js';
import { Observable, observable } from './element/observation/observable.js';
import { FoundationElement } from './foundation-element.js';
import { requireComponent } from './template.js';
import { invalidate, validate } from './validate.js';
import { uuidv4 } from './ppp-crypto.js';
import { debounce } from './ppp-throttle.js';
import ppp from '../ppp.js';

export class App extends FoundationElement {
  @observable
  busy;

  @attr
  appearance;

  @attr
  page;

  @attr
  workspace;

  @observable
  workspaces;

  @observable
  ppp;

  @observable
  toastTitle;

  @observable
  toastText;

  @observable
  settings;

  @observable
  pageConnected;

  @observable
  pageNotFound;

  workspaceChanged(oldValue, newValue) {
    if (newValue) {
      this.navigate(
        this.url({
          page: 'workspace',
          workspace: newValue || void 0
        })
      );
    }
  }

  toastTitleChanged() {
    Observable.notify(this.toast, 'source');
  }

  toastTextChanged() {
    Observable.notify(this.toast, 'source');
  }

  #onPopState() {
    this.workspace = this.params()?.workspace;

    this.navigate(this.url(this.params()));
  }

  constructor() {
    super(...arguments);

    this.workspaces = [];
    this.settings = {};

    const params = this.params();

    this.navigate(
      this.url(
        Object.assign(params, {
          page: params.page ?? 'cloud-services'
        })
      ),
      {
        replace: !params.page
      }
    );

    window.addEventListener('popstate', this.#onPopState.bind(this), {
      passive: true
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this.sideNav.expandedChanged = (oldValue, newValue) => {
      this.setSetting('sideNavCollapsed', !newValue);
    };

    this.workspace = this.params()?.workspace;
  }

  @debounce(100)
  setSetting(key, value) {
    this.settings[key] = value;

    if (this.ppp.keyVault.ok()) {
      this.ppp.user.functions.updateOne(
        {
          collection: 'app'
        },
        {
          _id: '@settings'
        },
        {
          $set: {
            [key]: value
          }
        },
        {
          upsert: true
        }
      );
    }
  }

  setting(key, value) {
    if (typeof value === 'undefined') return this.settings[key];

    return this.setSetting(key, value);
  }

  query(params = {}) {
    const filtered = {};

    for (const p of Object.keys(params)) {
      if (typeof params[p] !== 'undefined') filtered[p] = params[p];
    }

    return new URLSearchParams(filtered).toString();
  }

  params() {
    return Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );
  }

  navigate(url, params = {}) {
    if (typeof url === 'object') url = this.url(url);

    if (url === window.location.pathname + window.location.search)
      params.replace = true;

    if (params.replace) window.history.replaceState({}, '', url);
    else window.history.pushState({}, '', url);

    if (!params.skipPage) this.page = this.params().page || 'cloud-services';
  }

  url(query) {
    if (query === null) return location.pathname;

    if (typeof query === 'object') query = this.query(query);

    if (query) return location.pathname + '?' + query;
    else return location.pathname + location.search;
  }

  async pageChanged(oldValue, newValue) {
    this.pageConnected = false;

    if (newValue !== 'workspace') {
      this.workspace = void 0;
    }

    if (newValue) {
      try {
        await requireComponent(
          `ppp-${newValue}-page`,
          `../${ppp.appType}/${ppp.theme}/pages/${newValue}.js`
        );

        this.pageNotFound = false;
      } catch (e) {
        console.error(e);

        this.pageNotFound = true;
        this.pageConnected = true;
      }
    }

    if (!newValue)
      this.navigate(
        this.url({
          page: 'cloud-services'
        }),
        {
          skipPage: true
        }
      );
    else if (newValue !== this.params().page)
      this.navigate(this.url({ page: newValue }), {
        skipPage: true
      });
  }

  async handleNewWorkspaceClick() {
    await requireComponent('ppp-modal');

    this.newWorkspaceModal.visible = true;
  }

  async createWorkspace() {
    try {
      this.busy = true;
      this.toast.visible = false;
      this.toast.source = this;
      this.toastTitle = 'Новый терминал';

      this.newWorkspaceModal.visibleChanged = (oldValue, newValue) =>
        !newValue && (this.toast.visible = false);

      await validate(this.workspaceName);

      const payload = {
        _id: this.workspaceName.value.trim(),
        uuid: uuidv4(),
        comment: this.workspaceComment.value.trim(),
        created_at: new Date()
      };

      await this.ppp.user.functions.insertOne(
        {
          collection: 'workspaces'
        },
        payload
      );

      this.workspaces.push(payload);
      Observable.notify(this, 'workspaces');

      this.toast.appearance = 'success';
      this.toast.dismissible = true;
      this.toastText = i18n.t('operationDone');
      this.toast.visible = true;
    } catch (e) {
      this.busy = false;
      console.error(e);

      if (/E11000/i.test(e.error)) {
        invalidate(this.toast, {
          errorMessage: 'Пространство с таким названием уже существует'
        });
      } else {
        invalidate(this.toast, {
          errorMessage: i18n.t('operationFailed')
        });
      }
    } finally {
      this.busy = false;
    }
  }
}
