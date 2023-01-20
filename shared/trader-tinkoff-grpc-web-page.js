import { Page } from './page.js';
import { validate } from './validate.js';
import { TRADER_CAPS, TRADERS } from './const.js';
import ppp from '../ppp.js';

export class TraderTinkoffGrpcWebPage extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);
    await validate(this.brokerId);
    await validate(this.accountSelector);

    if (this.reconnectTimeout.value.trim()) {
      await validate(this.reconnectTimeout, {
        hook: async (value) => +value >= 100 && +value <= 10000,
        errorMessage: 'Введите значение в диапазоне от 100 до 10000'
      });
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]'),
              type: `[%#(await import('./const.js')).TRADERS.TINKOFF_GRPC_WEB%]`
            }
          },
          {
            $lookup: {
              from: 'brokers',
              localField: 'brokerId',
              foreignField: '_id',
              as: 'broker'
            }
          },
          {
            $unwind: '$broker'
          }
        ]);
    };
  }

  readyChanged(oldValue, newValue) {
    if (newValue) {
      this.scratchSet('brokerId', this.document.brokerId);
    }
  }

  async find() {
    return {
      type: TRADERS.TINKOFF_GRPC_WEB,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        brokerId: this.brokerId.value,
        account: this.accountSelector.value,
        accountName: this.accountSelector.datum().name,
        reconnectTimeout: this.reconnectTimeout.value
          ? Math.abs(this.reconnectTimeout.value)
          : void 0,
        version: 1,
        caps: [
          TRADER_CAPS.CAPS_LIMIT_ORDERS,
          TRADER_CAPS.CAPS_MARKET_ORDERS,
          TRADER_CAPS.CAPS_STOP_ORDERS,
          TRADER_CAPS.CAPS_ACTIVE_ORDERS,
          TRADER_CAPS.CAPS_ORDERBOOK,
          TRADER_CAPS.CAPS_TIME_AND_SALES,
          TRADER_CAPS.CAPS_POSITIONS,
          TRADER_CAPS.CAPS_TIMELINE,
          TRADER_CAPS.CAPS_LEVEL1,
          TRADER_CAPS.CAPS_CHARTS
        ],
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: TRADERS.TINKOFF_GRPC_WEB,
        createdAt: new Date()
      }
    };
  }
}
