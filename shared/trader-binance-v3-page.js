import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { TRADER_CAPS, TRADERS } from './const.js';
import ppp from '../ppp.js';

export class TraderBinanceV3Page extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);
    await validate(this.brokerId);
    await validate(this.wsUrl);

    try {
      new URL(this.wsUrl.value);
    } catch (e) {
      invalidate(this.wsUrl, {
        errorMessage: 'Неверный или неполный URL',
        raiseException: true
      });
    }

    await validate(this.wsUrl, {
      hook: async (value) => {
        const url = new URL(value);

        return url.protocol === 'wss:';
      },
      errorMessage: 'Недопустимый протокол URL'
    });

    if (this.reconnectTimeout.value.trim()) {
      await validate(this.reconnectTimeout, {
        hook: async (value) => +value >= 100 && +value <= 10000,
        errorMessage: 'Введите значение в диапазоне от 100 до 10000'
      });
    }

    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(reject, 5000);
        const ws = new WebSocket(new URL('ws/btcusdt@trade', this.wsUrl.value));

        ws.onmessage = ({ data }) => {
          const payload = JSON.parse(data);

          if (payload.e === 'trade' && payload.s === 'BTCUSDT') {
            ws.close();
            clearTimeout(timer);
            resolve();
          } else {
            ws.close();
            clearTimeout(timer);
            reject();
          }
        };
        ws.onerror = () => {
          clearTimeout(timer);
          reject();
        };
      });
    } catch (e) {
      invalidate(this.wsUrl, {
        errorMessage: 'Не удалось соединиться',
        raiseException: true
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
              type: `[%#(await import('./const.js')).TRADERS.BINANCE_V3%]`
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

  async find() {
    return {
      type: TRADERS.BINANCE_V3,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async update() {
    return {
      $set: {
        name: this.name.value.trim(),
        brokerId: this.brokerId.value,
        wsUrl: this.wsUrl.value.trim(),
        reconnectTimeout: this.reconnectTimeout.value
          ? Math.abs(this.reconnectTimeout.value)
          : void 0,
        orderbookUpdateInterval: this.orderbookUpdateInterval.value,
        caps: [TRADER_CAPS.CAPS_ORDERBOOK, TRADER_CAPS.CAPS_TIME_AND_SALES],
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: TRADERS.BINANCE_V3,
        createdAt: new Date()
      }
    };
  }
}
