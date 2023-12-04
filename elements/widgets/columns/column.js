/** @decorator */

import { PPPElement } from '../../../lib/ppp-element.js';
import { css, observable } from '../../../vendor/fast-element.min.js';
import { widgetColumns } from '../../../design/styles.js';
import { widgetStyles } from '../../widget.js';
import { display } from '../../../vendor/fast-utilities.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';

export const columnStyles = css`
  ${widgetColumns()}
  ${widgetStyles()}
  ${display('inline')}
  :host {
    width: 100%;
  }

  .dot-line {
    align-items: center;
    justify-content: right;
  }
`;

class Column extends PPPElement {
  @observable
  instrument;

  @observable
  isBalance;

  @observable
  widget;

  // Instrument and symbol and any other column dynamic data.
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
    this.defaultTrader =
      this.parentNode.trader ?? this.widget?.instrumentTrader;

    if (this.payload?.instrument) {
      this.instrument = this.payload.instrument;
    }

    const column = await this.widget?.container.denormalization.denormalize(
      this.column
    );

    if (column?.trader) {
      this.trader = await ppp.getOrCreateTrader(column.trader);
    }

    if (column?.extraTrader) {
      this.extraTrader = await ppp.getOrCreateTrader(column.extraTrader);
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
