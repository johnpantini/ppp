/** @decorator */

import { observable } from './element/observation/observable.js';

export class AlorOpenApiV2Trader {
  @observable
  orderbook;

  @observable
  level1;

  @observable
  timeAndSales;

  async syncAccessToken() {

  }

  async placeMarketOrder({ instrument } = {}) {}

  async placeLimitOrder({ instrument } = {}) {}

  constructor () {
  }
}
