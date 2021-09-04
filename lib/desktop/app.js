/** @decorator */

import { attr } from '../element/components/attributes.js';
import { observable } from '../element/observation/observable.js';
import { FoundationElement } from '../foundation-element/foundation-element.js';

export class App extends FoundationElement {
  @attr
  appearance;

  @attr({ attribute: 'data-page' })
  page;

  @observable
  ppp;

  #onPopState(event) {
    this.setCurrentPage();
  }

  constructor() {
    super(...arguments);

    this.setCurrentPage();
    window.onpopstate = this.#onPopState.bind(this);
  }

  setCurrentPage(url = this.url()) {
    const params = this.params(url);

    if (!params.page) this.page = 'profile';
    else {
      const allowedPages = [
        'profile',
        'widgets',
        'analytics',
        'settings',
        'ppp-dashboard',
        'ppp-billing',
        'ppp-achievements',
        'ppp-settings',
        'cloud-services',
        'personal-server',
        'warden-keys',
        'updates',
        'guides'
      ];

      if (
        !params.page.startsWith('terminal-') &&
        !~allowedPages.indexOf(params.page)
      )
        this.page = void 0;
      else this.page = params.page;
    }
  }

  query(params = {}) {
    return new URLSearchParams(params).toString();
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
  }

  url(query) {
    if (query === null) return location.pathname;

    if (typeof query === 'object') query = this.query(query);

    if (query) return location.pathname + '?' + query;
    else return location.pathname + location.search;
  }

  pageChanged(oldValue, newValue) {
    if (!newValue) this.navigate(this.url(null));
    else this.navigate(this.url({ page: this.page }));
  }

  handleSignOutClick() {}
}
