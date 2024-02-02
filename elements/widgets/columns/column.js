/** @decorator */

import { PPPElement } from '../../../lib/ppp-element.js';
import {
  Observable,
  css,
  observable
} from '../../../vendor/fast-element.min.js';
import { widgetColumns } from '../../../design/styles.js';
import { widgetStyles } from '../../widget.js';
import { display } from '../../../vendor/fast-utilities.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
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

    this.sourceID = uuidv4();
    this.widget = this.getRootNode().host;
    this.payload = this.parentNode.payload;
    this.column = this.parentNode.column;
    this.isBalance = this.hasAttribute('balance');

    if (!this.parentNode.trader) {
      this.defaultTrader = this.widget?.instrumentTrader;
    } else if (this.parentNode.trader instanceof TraderRuntime) {
      this.defaultTrader = this.parentNode.trader;
    } else if (typeof this.parentNode.trader === 'string') {
      // Trader ID.
      this.column.defaultTraderId = this.parentNode.trader;
    }

    const column = await this.widget?.container.denormalization.denormalize(
      this.column
    );

    try {
      if (column?.defaultTraderId) {
        this.defaultTrader = await ppp.getOrCreateTrader(column.defaultTrader);
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

      if (column?.trader) {
        this.trader = await ppp.getOrCreateTrader(column.trader);
      }

      if (column?.extraTrader) {
        this.extraTrader = await ppp.getOrCreateTrader(column.extraTrader);
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
