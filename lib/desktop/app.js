/** @decorator */

import { attr } from '../element/components/attributes.js';
import { observable } from '../element/observation/observable.js';
import { FoundationElement } from '../foundation-element/foundation-element.js';

export class App extends FoundationElement {
  @attr
  appearance;

  @attr
  page;

  @observable
  ppp;

  @observable
  pageHasTemplate;

  #onPopState(event) {
    this.page = this.params().page;
  }

  constructor() {
    super(...arguments);

    this.page = this.params().page;
    window.onpopstate = this.#onPopState.bind(this);
  }

  setPageTemplate(condition) {
    if (condition) {
      this.pageHasTemplate = true;

      return true;
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
    this.pageHasTemplate = false;

    if (!newValue) this.navigate(this.url(null));
    else this.navigate(this.url({ page: this.page }));
  }

  handleNewTerminalClick() {}

  handleSignOutClick() {}
}
