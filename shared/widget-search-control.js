/** @decorator */

import { OffClickElement } from './off-click-element.js';
import { attr } from './element/components/attributes.js';
import { DOM } from './element/dom.js';
import { observable } from './element/observation/observable.js';
import { debounce } from './ppp-throttle.js';

export class WidgetSearchControl extends OffClickElement {
  @attr({ mode: 'boolean' })
  open;

  @attr({ mode: 'boolean' })
  searching;

  @observable
  widget;

  @observable
  ticker;

  @observable
  stocks;

  @observable
  bonds;

  constructor(props) {
    super(props);

    this.stocks = [];
    this.bonds = [];
  }

  documentOffClickHandler() {
    this.open = false;
  }

  documentKeydownHandler(event) {
    if (event.key === 'Escape') {
      this.open = false;
    }
  }

  openChanged(oldValue, newValue) {
    if (newValue) this.widget.style.overflow = 'visible';
    else this.widget.style.overflow = 'hidden';
  }

  selectInstrument(instrument) {
    this.widget.instrument = instrument;
    this.open = false;
  }

  handleClick({ event }) {
    if (
      event.composedPath().find((n) => n.classList?.contains('popup-trigger'))
    ) {
      this.open = !this.open;
    }

    if (this.open) {
      DOM.queueUpdate(() => this.suggestInput.focus());
    }
  }

  @debounce(200)
  search(text) {
    this.searching = true;

    if (text?.trim() && typeof this.trader?.search === 'function') {
      this.trader
        .search(text)
        .then((results = {}) => {
          if (results?.exactSymbolMatch?.length === 1) {
            [this.ticker] = results?.exactSymbolMatch;
          } else {
            this.ticker = null;
          }

          const seen = {};
          const stocks = [];
          const bonds = [];

          for (const i of results?.regexSymbolMatch ?? []) {
            if (seen[i._id]) continue;

            if (i.type === 'stock') stocks.push(i);
            else if (i.type === 'bond') bonds.push(i);

            seen[i._id] = true;
          }

          for (const i of results?.regexFullNameMatch ?? []) {
            if (seen[i._id]) continue;

            if (i.type === 'stock') stocks.push(i);
            else if (i.type === 'bond') bonds.push(i);

            seen[i._id] = true;
          }

          this.stocks = stocks.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          );
          this.bonds = bonds.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          );
          this.searching = false;
        })
        .catch((error) => {
          console.error(error);

          this.stocks = [];
          this.bonds = [];
          this.ticker = null;
          this.searching = false;
        });
    } else {
      this.stocks = [];
      this.bonds = [];
      this.ticker = null;
      this.searching = false;
    }
  }
}
