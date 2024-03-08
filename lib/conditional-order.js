/** @decorator */

import { observable } from '../lib/fast/observable.js';
import { TRADER_DATUM } from './const.js';
import { uuidv4 } from './ppp-crypto.js';

export class ConditionalOrder {
  mainTrader;

  instrument;

  side;

  payload;

  @observable
  status;

  placedAt;

  orderId;

  constructor() {
    this.orderId = uuidv4();
    this.status = 'inactive';
    this.sourceID = uuidv4();
  }

  statusChanged() {
    return this.changed();
  }

  changed() {
    return this.mainTrader?.datums?.[
      TRADER_DATUM.CONDITIONAL_ORDER
    ]?.dataArrived?.(this.serialize(), this.instrument);
  }

  place({ mainTrader, instrument, direction, payload }) {
    this.mainTrader = mainTrader;
    this.instrument = instrument;
    this.side = direction;
    this.payload = payload;
    this.placedAt = new Date().toISOString();
  }

  cancel() {
    this.status = 'canceled';
  }

  serialize() {
    return {
      instrument: this.instrument,
      side: this.side,
      payload: this.payload,
      placedAt: this.placedAt,
      sourceID: this.sourceID,
      orderId: this.orderId,
      status: this.status,
      isConditionalOrder: true
    };
  }
}

export function pppOrderInstanceForWorkerIs(instance) {
  if (typeof process !== 'undefined' && process.release.name === 'node') {
    // Aspirant Worker related section.
    globalThis.pppOrderInstanceForWorkerRecv?.(instance);
  }
}
