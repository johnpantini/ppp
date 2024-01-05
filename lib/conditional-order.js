/** @decorator */

import { observable } from '../lib/fast/observable.js';
import { uuidv4 } from './ppp-crypto.js';

export class ConditionalOrder {
  mainTrader;

  instrument;

  direction;

  payload;

  @observable
  status;

  placedAt;

  orderId;

  constructor() {
    this.placedAt = new Date().toISOString();
    this.orderId = uuidv4();
    this.status = 'inactive';
    this.sourceID = uuidv4();
  }

  statusChanged() {
    return this.changed();
  }

  async changed() {
    return this.mainTrader?.conditionalOrderChanged?.(await this.serialize());
  }

  async place({ mainTrader, instrument, direction, payload }) {
    this.mainTrader = mainTrader;
    this.instrument = instrument;
    this.direction = direction;
    this.payload = payload;
  }

  async cancel() {
    this.status = 'canceled';
  }

  async serialize() {
    return {
      instrument: this.instrument,
      direction: this.direction,
      payload: this.payload,
      placedAt: this.placedAt,
      sourceID: this.sourceID,
      orderId: this.orderId
    };
  }
}
