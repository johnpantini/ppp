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
  activeItem;

  @observable
  ticker;

  @observable
  stocks;

  @observable
  bonds;

  @observable
  futures;

  constructor(props) {
    super(props);

    this.stocks = [];
    this.bonds = [];
    this.futures = [];
  }

  documentOffClickHandler() {
    this.open = false;
  }

  documentKeydownHandler(event) {
    if (!event.composedPath().find((n) => n === this)) return;

    if (event.key === 'Escape') {
      this.open = false;
    } else if (event.key === 'Enter') {
      this.activeItem && this.activeItem.click();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const items = Array.from(this.menuHolder.querySelectorAll('.menu-item'));

      if (items.length) {
        const activeItemIndex = items.findIndex((i) =>
          i.classList.contains('active')
        );

        if (event.key === 'ArrowDown' && activeItemIndex < items.length - 1) {
          this.activeItem = items[activeItemIndex + 1];

          this.activeItem?.scrollIntoView?.({
            block: 'nearest'
          });
        } else if (event.key === 'ArrowUp' && activeItemIndex > 0) {
          this.activeItem = items[activeItemIndex - 1];

          if (activeItemIndex === 1) {
            this.activeItem?.scrollIntoView?.({
              block: 'center'
            });
          } else
            this.activeItem?.scrollIntoView?.({
              block: 'nearest'
            });
        }
      }
    }
  }

  activeItemChanged(oldValue, newValue) {
    if (oldValue) {
      oldValue.classList.remove('active');
    }

    if (newValue) {
      newValue.classList.add('active');
    }
  }

  openChanged(oldValue, newValue) {
    if (newValue) this.widget.style.overflow = 'visible';
    else this.widget.style.overflow = 'hidden';

    if (this.widget.preview) {
      if (newValue) {
        this.widget.style.position = 'absolute';
        this.widget.parentNode.style.height = `${
          parseInt(this.widget.style.height) + 8
        }px`;
      } else {
        this.widget.style.position = 'relative';
        this.widget.parentNode.style.height = null;
      }
    }
  }

  selectInstrument(instrument) {
    this.widget.instrument = instrument;
    this.open = false;
    this.suggestInput.value = '';
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
          const futures = [];

          for (const i of results?.regexSymbolMatch ?? []) {
            if (seen[i._id]) continue;

            if (i.type === 'stock') stocks.push(i);
            else if (i.type === 'bond') bonds.push(i);
            else if (i.type === 'future') futures.push(i);

            seen[i._id] = true;
          }

          for (const i of results?.regexFullNameMatch ?? []) {
            if (seen[i._id]) continue;

            if (i.type === 'stock') stocks.push(i);
            else if (i.type === 'bond') bonds.push(i);
            else if (i.type === 'future') futures.push(i);

            seen[i._id] = true;
          }

          this.stocks = stocks.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          );
          this.bonds = bonds.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          );
          this.futures = futures.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          );

          this.searching = false;

          DOM.queueUpdate(() => {
            this.activeItem = this.menuHolder.querySelector('.menu-item');
          });
        })
        .catch((error) => {
          console.error(error);

          this.stocks = [];
          this.bonds = [];
          this.futures = [];
          this.ticker = null;
          this.searching = false;
        });
    } else {
      this.activeItem = null;
      this.stocks = [];
      this.bonds = [];
      this.futures = [];
      this.ticker = null;
      this.searching = false;
    }
  }
}
