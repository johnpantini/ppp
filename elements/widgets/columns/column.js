/** @decorator */

import ppp from '../../../ppp.js';
import { PPPElement } from '../../../lib/ppp-element.js';
import {
  Observable,
  css,
  observable
} from '../../../vendor/fast-element.min.js';
import { widgetColumns } from '../../../design/styles.js';
import { widgetStyles } from '../../widget.js';
import { display } from '../../../vendor/fast-utilities.js';
import { TraderRuntime } from '../../../lib/traders/runtime.js';

export const columnStyles = css`
  ${widgetColumns()}
  ${widgetStyles()}
  ${display('inline')}
  :host {
    text-rendering: optimizeSpeed;
  }
`;

class Column extends PPPElement {
  sourceID;

  #denormalizedColumn;

  @observable
  instrument;

  @observable
  isBalance;

  @observable
  widget;

  // Instrument (or symbol) and any other column dynamic data.
  @observable
  payload;

  /** @type {WidgetColumn} */
  @observable
  column;

  @observable
  defaultTrader;

  @observable
  trader;

  @observable
  extraTrader;

  async connectedCallback() {
    super.connectedCallback();

    this.sourceID = ppp.nextSourceID();
    this.widget = this.getRootNode().host;
    this.payload = this.parentNode.payload;
    this.column = this.parentNode.column;

    return this.updateInstrument();
  }

  async updateInstrument() {
    this.isBalance = this.hasAttribute('balance');

    if (!this.parentNode.trader) {
      this.defaultTrader = this.widget?.instrumentTrader;
    } else if (this.parentNode.trader instanceof TraderRuntime) {
      this.defaultTrader = this.parentNode.trader;
    } else if (typeof this.parentNode.trader === 'string') {
      // Trader ID.
      this.column.defaultTraderId = this.parentNode.trader;
    }

    // Populate trader and extraTrader fields to the column here.
    this.#denormalizedColumn ??=
      await this.widget?.container.denormalization.denormalize(this.column);

    try {
      if (this.#denormalizedColumn?.defaultTraderId) {
        this.defaultTrader = await ppp.getOrCreateTrader(
          this.#denormalizedColumn.defaultTrader
        );
      }

      if (this.payload?.instrument) {
        this.instrument = this.payload.instrument;
      } else if (this.payload?.symbol && this.defaultTrader) {
        this.instrument = this.defaultTrader.instruments.get(
          this.payload.symbol
        );
        this.payload.instrument = this.instrument;

        Observable.notify(this, 'payload');
      }

      if (this.#denormalizedColumn?.trader) {
        this.trader = await ppp.getOrCreateTrader(
          this.#denormalizedColumn.trader
        );
      }

      if (this.#denormalizedColumn?.extraTrader) {
        this.extraTrader = await ppp.getOrCreateTrader(
          this.#denormalizedColumn.extraTrader
        );
      }
    } catch (e) {
      return this.widget.catchException(e);
    }
  }

  async subscribeFields({ source, fieldDatumPairs }) {
    for (const trader of [this.defaultTrader, this.trader, this.extraTrader]) {
      if (trader) {
        await trader.subscribeFields?.({
          source,
          fieldDatumPairs
        });
      }
    }
  }

  async unsubscribeFields({ source, fieldDatumPairs }) {
    for (const trader of [this.defaultTrader, this.trader, this.extraTrader]) {
      if (trader) {
        await trader.unsubscribeFields?.({
          source,
          fieldDatumPairs
        });
      }
    }
  }
}

export { Column };
