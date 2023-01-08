import { Page } from './page.js';
import { validate } from './validate.js';
import { TRADER_CAPS, TRADERS } from './const.js';
import ppp from '../ppp.js';

export class TraderTinkoffGrpcWebPage extends Page {
  collection = 'traders';

  async validate() {
    await validate(this.name);
    await validate(this.brokerId);
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
        caps: [

        ],
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        type: TRADERS.TINKOFF_GRPC_WEB,
        createdAt: new Date()
      }
    };
  }
}
