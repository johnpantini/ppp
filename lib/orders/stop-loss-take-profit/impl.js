/** @decorator */

import { ConditionalOrder } from '../../conditional-order.js';
import { observable } from '../../../lib/fast/observable.js';
import { TRADER_DATUM } from '../../const.js';
import { stringToFloat } from '../../intl.js';

class StopLossTakeProfitOrder extends ConditionalOrder {
  @observable
  lastPrice;

  lastPriceChanged() {
    return this.update();
  }

  @observable
  extendedLastPrice;

  extendedLastPriceChanged() {
    return this.update();
  }

  @observable
  bestBid;

  bestBidChanged() {
    return this.update();
  }

  @observable
  bestAsk;

  bestAskChanged() {
    return this.update();
  }

  delayStartedAt;

  @observable
  delayInProcess;

  delayInProcessChanged() {
    return this.changed();
  }

  @observable
  orderResult;

  orderResultChanged() {
    return this.changed();
  }

  traders = [];

  fieldDatumPairs = {};

  #delayTimeout;

  async #spawnRealOrder() {
    const limitPrice = stringToFloat(this.payload.limitPrice);
    const orderPayload = {
      instrument: this.instrument,
      quantity: stringToFloat(this.payload.quantity),
      direction: this.direction
    };

    if (limitPrice === 0) {
      this.orderResult = await this.mainTrader.placeMarketOrder(orderPayload);
    } else {
      orderPayload.price = +this.mainTrader.fixPrice(
        this.instrument,
        limitPrice
      );

      this.orderResult = await this.mainTrader.placeLimitOrder(orderPayload);
    }

    this.update();
  }

  update() {
    if (this.status !== 'working') {
      return;
    }

    const timeDelay = Math.trunc(
      Math.abs(stringToFloat(this.payload.timeDelay))
    );

    const conditionsAreMet = this.conditionsAreMet();

    if (timeDelay < 1) {
      if (conditionsAreMet) {
        this.status = 'filled';

        this.#spawnRealOrder();
      }
    } else {
      if (this.delayInProcess) {
        if (!conditionsAreMet) {
          this.delayInProcess = false;
          this.delayStartedAt = void 0;

          clearTimeout(this.#delayTimeout);
        }
      } else {
        if (conditionsAreMet) {
          this.delayInProcess = true;
          this.delayStartedAt = new Date().toISOString();

          this.#delayTimeout = setTimeout(() => {
            this.delayInProcess = false;
            this.delayStartedAt = void 0;

            if (this.conditionsAreMet()) {
              this.status = 'filled';

              this.#spawnRealOrder();
            }
          }, timeDelay * 1000);
        }
      }
    }
  }

  conditionsAreMet() {
    if (this.status !== 'working') {
      return false;
    }

    const { watchPrices, orderType } = this.payload.order;
    const { stopPrice } = this.payload;
    const prices = watchPrices.map((p) => {
      switch (p) {
        case TRADER_DATUM.LAST_PRICE:
          return this.lastPrice;
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
          if (this.direction === 'sell') {
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
          if (this.direction === 'sell') {
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

  async place({ mainTrader, instrument, direction, payload }) {
    await super.place({ mainTrader, instrument, direction, payload });

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
          const trader = await ppp.getOrCreateTrader(t);

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

  async cancel() {
    await super.cancel();

    clearTimeout(this.#delayTimeout);

    this.delayInProcess = false;

    for (const trader of this.traders) {
      if (trader) {
        await trader.unsubscribeFields?.({
          source: this,
          fieldDatumPairs: this.fieldDatumPairs
        });
      }
    }
  }

  async serialize() {
    return {
      ...(await super.serialize()),
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

export default StopLossTakeProfitOrder;
