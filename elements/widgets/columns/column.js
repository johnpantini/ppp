/** @decorator */

import { PPPElement } from '../../../lib/ppp-element.js';
import { css, observable } from '../../../vendor/fast-element.min.js';
import { widgetColumns } from '../../../design/styles.js';
import { display } from '../../../vendor/fast-utilities.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';

export const columnStyles = css`
  ${widgetColumns()}
  ${display('inline')}
  :host {
    width: 100%;
  }
`;

class Column extends PPPElement {
  @observable
  instrument;

  @observable
  isBalance;

  @observable
  widget;

  // Instrument and symbol
  @observable
  datum;

  @observable
  column;

  @observable
  trader;

  @observable
  defaultTrader;

  @observable
  extraTrader;

  async connectedCallback() {
    super.connectedCallback();

    this.sourceID = uuidv4();
    this.widget = this.getRootNode().host;
    this.datum = this.parentNode.datum;
    this.column = this.parentNode.column;
    this.isBalance = this.hasAttribute('balance');
    this.defaultTrader = this.parentNode.trader ?? this.widget.instrumentTrader;

    if (this.datum?.instrument) {
      this.instrument = this.datum.instrument;
    }

    const { trader, extraTrader } =
      await this.widget.container.denormalization.denormalize(this.column);

    if (trader || extraTrader) {
      this.trader = await ppp.getOrCreateTrader(trader);
      this.extraTrader = await ppp.getOrCreateTrader(extraTrader);
    } else {
      this.trader = this.defaultTrader;
    }
  }
}

export { Column };
