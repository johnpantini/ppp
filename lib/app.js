/** @decorator */

import { attr } from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';
import { FoundationElement } from './foundation-element/foundation-element.js';

globalThis.i18nImport = async (list = []) => {
  return Promise.all(
    list.map((i) => import(`../i18n/${globalThis.locale}/${i}.i18n.js`))
  );
};

export class App extends FoundationElement {
  @attr
  appearance;

  @attr
  page;

  @observable
  ppp;

  @observable
  pageHasTemplate;

  #onPopState() {
    this.navigate(this.url(this.params()));
  }

  constructor() {
    super(...arguments);

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

  setPageTemplate(condition) {
    if (condition) {
      this.pageHasTemplate = true;

      return true;
    }
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

  pageChanged(oldValue, newValue) {
    this.pageHasTemplate = false;

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

  handleNewTerminalClick() {}
}
