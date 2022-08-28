/** @decorator */

import { attr } from './element/components/attributes.js';
import { Observable, observable } from './element/observation/observable.js';
import { FoundationElement } from './foundation-element.js';
import { requireComponent } from './template.js';
import { debounce } from './ppp-throttle.js';
import ppp from '../ppp.js';

function onNavigateStart() {
  ppp?.app?.terminalModal && (ppp.app.terminalModal.visible = false);
}

export class App extends FoundationElement {
  /**
   * The current page.
   * @type {string}
   */
  @attr
  page;

  /**
   * The current workspace.
   * @type {string}
   */
  @attr
  workspace;

  /**
   * The active extension _id.
   * @type {string}
   */
  @attr
  extension;

  /**
   *
   * @type {array}
   */
  @observable
  workspaces;

  /**
   *
   * @type {array}
   */
  @observable
  extensions;

  @observable
  toastTitle;

  @observable
  toastText;

  @observable
  settings;

  /**
   * True if the page was loaded.
   * @type {boolean}
   */
  @observable
  pageConnected;

  /**
   * True if the page was not found.
   * @type {boolean}
   */
  @observable
  pageNotFound;

  toastTitleChanged() {
    Observable.notify(this.toast, 'source');
  }

  toastTextChanged() {
    Observable.notify(this.toast, 'source');
  }

  #onPopState() {
    this.extension = this.params()?.extension;

    this.navigate(this.url(this.params()));
  }

  constructor() {
    super(...arguments);

    this.workspaces = [];
    this.extensions = [];
    this.settings = {};
    this.page = this.params().page ?? 'cloud-services';

    window.addEventListener('popstate', this.#onPopState.bind(this), {
      passive: true
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('navigatestart', onNavigateStart, {
      passive: true
    });

    this.sideNav.expandedChanged = (oldValue, newValue) => {
      this.setSetting('sideNavCollapsed', !newValue);
    };

    this.extension = this.params()?.extension;

    const params = this.params();

    this.navigate(
      this.url(
        Object.assign(params, {
          page: this.page
        })
      ),
      {
        replace: true
      }
    );
  }

  disconnectedCallback() {
    this.removeEventListener('navigatestart', onNavigateStart);

    super.disconnectedCallback();
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

  setURLSearchParams(params = {}) {
    const searchParams = new URLSearchParams(
      window.location.search.substring(1)
    );

    for (const param of Object.keys(params)) {
      searchParams.set(param, params[param]);
    }

    window.history.replaceState(
      '',
      '',
      `${window.location.origin}${
        window.location.pathname
      }?${searchParams.toString()}`
    );
  }

  params() {
    return Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );
  }

  url(query) {
    if (query === null) return location.pathname;

    if (typeof query === 'object') query = this.query(query);

    if (query) return location.pathname + '?' + query;
    else return location.pathname + location.search;
  }

  async navigate(url, params = {}) {
    this.$emit('navigatestart');

    this.pageConnected = false;

    if (typeof url === 'object') url = this.url(url);

    if (url === window.location.pathname + window.location.search)
      params.replace = true;

    if (params.replace)
      window.history.replaceState({}, '', params.replaceUrl ?? url);
    else window.history.pushState({}, '', url);

    // Force unload
    this.page = 'blank';
    this.page = this.params().page;

    if (this.page === 'workspace') {
      this.workspace = this.params().document;
    }

    if (this.page) {
      try {
        const extensionId = this.params().extension;

        if (extensionId) {
          const extension = this.extensions.find((e) => e._id === extensionId);

          if (extension) {
            if (extension.url.startsWith('/')) {
              extension.url = this.ppp.rootUrl + extension.url;
            }

            const eUrl = new URL(extension.url);
            const baseExtensionUrl = eUrl.href.slice(
              0,
              eUrl.href.lastIndexOf('/')
            );
            const pageUrl = `${baseExtensionUrl}/${ppp.appType}/${ppp.theme}/${this.page}-page.js`;
            const module = await import(pageUrl);

            ppp.DesignSystem.getOrCreate().register(
              (
                await module.extension?.({
                  ppp,
                  baseExtensionUrl,
                  metaUrl: import.meta.url,
                  extension
                })
              )()
            );
          } else {
            this.pageNotFound = true;

            return;
          }
        } else {
          this.extension = void 0;

          await requireComponent(`ppp-${this.page}-page`);
        }

        this.pageNotFound = false;
      } catch (e) {
        console.error(e);

        this.pageNotFound = true;
      } finally {
        this.pageConnected = true;

        this.$emit('navigateend');
      }
    } else {
      this.$emit('navigateend');

      return this.navigate({ page: 'cloud-services' });
    }
  }

  getVisibleModal() {
    return (
      ppp.app.shadowRoot.querySelector('ppp-modal[visible]') ??
      ppp.app.shadowRoot
      .querySelector(`ppp-${ppp.app.page}-page`)
      .shadowRoot.querySelector('ppp-modal[visible]')
    );
  }

  async handleNewWorkspaceClick() {
    await requireComponent('ppp-modal');
    await requireComponent('ppp-new-workspace-modal-page');

    this.newWorkspaceModal.visible = true;
  }

  async showWidgetSelector() {
    await requireComponent('ppp-modal');
    await requireComponent('ppp-widget-selector-modal-page');

    this.widgetSelectorModal.visible = true;
  }

  async openTerminal(title) {
    await requireComponent('ppp-terminal');
    await requireComponent('ppp-modal');

    if (title) {
      this.terminalModalTitle.textContent = title;
    }

    this.terminalModal.visible = true;

    return this.terminalWindow.terminal;
  }
}
