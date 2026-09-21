/** @decorator */

import {
  ConditionalOrder,
  pppOrderInstanceForWorkerIs
} from '../../conditional-order.js';
import { observable } from '../../../lib/fast/observable.js';
import { TRADER_DATUM } from '../../const.js';
import { stringToFloat } from '../../intl.js';

/** Watches selected quotes and submits one market/limit order after activation. */
class StopLossTakeProfitOrder extends ConditionalOrder {
  /** @type {number | undefined} Latest regular-session trade price. */
  @observable
  lastPrice;

  /**
   * Rechecks activation after a regular-session quote.
   * @returns {unknown} Update result.
   */
  lastPriceChanged() {
    return this.update();
  }

  /** @type {number | undefined} Extended-session quote, preferred when both are watched. */
  @observable
  extendedLastPrice;

  /**
   * Rechecks activation after an extended-session quote.
   * @returns {unknown} Update result.
   */
  extendedLastPriceChanged() {
    return this.update();
  }

  /** @type {number | undefined} Best bid used directly or for midpoint activation. */
  @observable
  bestBid;

  /**
   * Rechecks activation after a bid quote.
   * @returns {unknown} Update result.
   */
  bestBidChanged() {
    return this.update();
  }

  /** @type {number | undefined} Best ask used directly or for midpoint activation. */
  @observable
  bestAsk;

  /**
   * Rechecks activation after an ask quote.
   * @returns {unknown} Update result.
   */
  bestAskChanged() {
    return this.update();
  }

  /** @type {string | undefined} ISO timestamp of the current activation delay. */
  delayStartedAt;

  @observable
  delayInProcess;

  /**
   * Publishes countdown state.
   * @returns {unknown} Delivery result.
   */
  delayInProcessChanged() {
    return this.changed();
  }

  @observable
  orderResult;

  /**
   * Publishes the real order's submission result.
   * @returns {unknown} Delivery result.
   */
  orderResultChanged() {
    return this.changed();
  }

  traders = [];

  fieldDatumPairs = {};

  #delayTimeout;

  /**
   * Submits the configured real order and records executed/failed status.
   * @returns {Promise<void>}
   */
  async #spawnRealOrder() {
    const limitPrice = stringToFloat(this.payload.limitPrice);
    const orderPayload = {
      instrument: this.instrument,
      quantity: stringToFloat(this.payload.quantity),
      direction: this.side
    };

    try {
      if (limitPrice === 0) {
        this.orderResult = await this.mainTrader.placeMarketOrder(orderPayload);
      } else {
        orderPayload.price = this.mainTrader.fixPrice(
          this.instrument,
          limitPrice
        );

        this.orderResult = await this.mainTrader.placeLimitOrder(orderPayload);
      }

      this.status = 'executed';
    } catch (e) {
      console.error(e);

      this.status = 'failed';
    }
  }

  /**
   * Starts or cancels the activation delay while working/pending. Once executing,
   * further quotes cannot submit the same order again.
   * @returns {false | undefined} False when the lifecycle state is not eligible.
   */
  update() {
    if (!['working', 'pending'].includes(this.status)) {
      return false;
    }

    const timeDelay = Math.trunc(
      Math.abs(stringToFloat(this.payload.timeDelay))
    );
    const conditionsAreMet = this.conditionsAreMet();

    if (timeDelay < 1) {
      if (conditionsAreMet) {
        this.status = 'executing';

        this.finish();
        this.#spawnRealOrder();
      }
    } else {
      if (this.delayInProcess) {
        if (!conditionsAreMet) {
          this.delayInProcess = false;
          this.delayStartedAt = void 0;
          this.status = 'working';

          clearTimeout(this.#delayTimeout);
        }
      } else {
        if (conditionsAreMet) {
          this.delayInProcess = true;
          this.delayStartedAt = new Date().toISOString();
          this.status = 'pending';

          this.#delayTimeout = setTimeout(() => {
            this.delayInProcess = false;
            this.delayStartedAt = void 0;

            if (this.conditionsAreMet()) {
              this.status = 'executing';

              this.finish();
              this.#spawnRealOrder();
            }
          }, timeDelay * 1000);
        }
      }
    }
  }

  /**
   * Tests stop-loss/take-profit boundaries inclusively for the selected side.
   * Missing/non-numeric prices do not activate the order.
   * @returns {boolean} Whether any selected quote satisfies the trigger.
   */
  conditionsAreMet() {
    const { watchPrices, orderType } = this.payload.order;
    const { stopPrice } = this.payload;
    const prices = watchPrices.map((p) => {
      switch (p) {
        case TRADER_DATUM.LAST_PRICE:
          return watchPrices.includes(TRADER_DATUM.EXTENDED_LAST_PRICE) &&
            typeof this.extendedLastPrice === 'number'
            ? null
            : this.lastPrice;
        case TRADER_DATUM.EXTENDED_LAST_PRICE:
          return this.extendedLastPrice;
        case TRADER_DATUM.BEST_BID:
          return this.bestBid;
        case TRADER_DATUM.BEST_ASK:
          return this.bestAsk;
        case TRADER_DATUM.MIDPOINT:
          if (
            !this.bestBid ||
            !this.bestAsk ||
            isNaN(this.bestBid) ||
            isNaN(this.bestAsk)
          ) {
            return null;
          }

          return (this.bestBid + this.bestAsk) / 2;
      }
    });

    const activationPrice = stringToFloat(stopPrice);

    for (const p of prices) {
      if (typeof p === 'number' && !isNaN(p)) {
        if (orderType === 'stop-loss') {
          if (this.side === 'sell') {
            if (p <= activationPrice) {
              return true;
            }
          } else {
            if (p >= activationPrice) {
              return true;
            }
          }
        } else {
          // Take Profit.
          if (this.side === 'sell') {
            if (p >= activationPrice) {
              return true;
            }
          } else {
            if (p <= activationPrice) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Initializes the base order and subscribes configured quote traders.
   * @param {object} options Placement parameters.
   * @param {import('../../types.js').Instrument} options.instrument Instrument to watch.
   * @param {'buy' | 'sell'} options.direction Real order direction.
   * @param {import('../../types.js').PPPDocument} options.payload Stop price, timing and quote sources.
   * @returns {Promise<false | undefined>} Initial trigger evaluation, if subscribed.
   */
  async place({ instrument, direction, payload }) {
    super.place({ instrument, direction, payload });

    if (
      payload.trader1 ||
      payload.trader2 ||
      payload.trader3 ||
      payload.trader4
    ) {
      this.payload.order.watchPrices.forEach((price) => {
        switch (price) {
          case TRADER_DATUM.LAST_PRICE:
            this.fieldDatumPairs.lastPrice = TRADER_DATUM.LAST_PRICE;

            break;
          case TRADER_DATUM.EXTENDED_LAST_PRICE:
            this.fieldDatumPairs.extendedLastPrice =
              TRADER_DATUM.EXTENDED_LAST_PRICE;

            break;
          case TRADER_DATUM.BEST_BID:
            this.fieldDatumPairs.bestBid = TRADER_DATUM.BEST_BID;

            break;
          case TRADER_DATUM.BEST_ASK:
            this.fieldDatumPairs.bestAsk = TRADER_DATUM.BEST_ASK;

            break;
          case TRADER_DATUM.MIDPOINT:
            this.fieldDatumPairs.bestBid = TRADER_DATUM.BEST_BID;
            this.fieldDatumPairs.bestAsk = TRADER_DATUM.BEST_ASK;

            break;
        }
      });

      this.status = 'working';

      for (const t of [
        payload.trader1,
        payload.trader2,
        payload.trader3,
        payload.trader4
      ]) {
        if (t) {
          const trader = await globalThis.ppp.getOrCreateTrader(t);

          this.traders.push(trader);

          await trader.subscribeFields?.({
            source: this,
            fieldDatumPairs: this.fieldDatumPairs
          });
        }
      }

      return this.update();
    }
  }

  /**
   * Clears the activation timer and detaches every quote subscription.
   * @returns {void}
   */
  finish() {
    clearTimeout(this.#delayTimeout);

    this.delayInProcess = false;

    for (const trader of this.traders) {
      if (trader) {
        trader.unsubscribeFields?.({
          source: this,
          fieldDatumPairs: this.fieldDatumPairs
        });
      }
    }
  }

  /**
   * Cancels this order and releases its timer/subscriptions.
   * @returns {void}
   */
  cancel() {
    super.cancel();

    return this.finish();
  }

  /** @returns {object} Base order state plus watched quotes, delay and submission result. */
  serialize() {
    return {
      ...super.serialize(),
      lastPrice: this.lastPrice,
      extendedLastPrice: this.extendedLastPrice,
      bestBid: this.bestBid,
      bestAsk: this.bestAsk,
      delayInProcess: this.delayInProcess,
      delayStartedAt: this.delayStartedAt,
      orderResult: this.orderResult
    };
  }
}

pppOrderInstanceForWorkerIs(StopLossTakeProfitOrder);

export default StopLossTakeProfitOrder;
