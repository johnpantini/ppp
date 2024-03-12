import ppp from '../ppp.js';

/**
 * Denormalizes a PPP document.
 */
export class Denormalization {
  decrypted = new Map();

  refs = {};

  maxDepth = 5;

  fillRefs(document = {}) {
    document.apis?.forEach((d) => d._id && (this.refs[d._id] = d));
    document.bots?.forEach((d) => d._id && (this.refs[d._id] = d));
    document.brokers?.forEach((d) => d._id && (this.refs[d._id] = d));
    document.orders?.forEach((d) => d._id && (this.refs[d._id] = d));
    document.traders?.forEach((d) => d._id && (this.refs[d._id] = d));
    document.services?.forEach((d) => d._id && (this.refs[d._id] = d));
  }

  async denormalize(document = {}, depth = 0) {
    const result = {};
    const keysToClear = [];

    if (depth > this.maxDepth) {
      return document;
    }

    for (const [k, v] of Object.entries(document)) {
      if (k.endsWith('Id') && typeof v === 'string') {
        const keyWithoutId = k.substring(0, k.length - 2);

        result[keyWithoutId] = void 0;

        const ref = this.refs[v];

        result[k] = v;

        if (ref) {
          result[keyWithoutId] = ref;

          if (ref.iv) {
            if (this.decrypted.has(v)) {
              result[keyWithoutId] = this.decrypted.get(v);
            } else {
              result[keyWithoutId] = await ppp.decrypt(result[keyWithoutId]);
              result[keyWithoutId] = await this.denormalize(
                result[keyWithoutId],
                depth + 1
              );

              this.decrypted.set(v, result[keyWithoutId]);
            }
          } else {
            result[keyWithoutId] = await this.denormalize(
              result[keyWithoutId],
              depth + 1
            );
          }
        } else {
          result[k] = v;
        }
      } else if (k.endsWith('Id') && typeof v === 'undefined') {
        keysToClear.push(k.substring(0, k.length - 2));
      } else {
        // Consider keys 'ordersTrader' and 'ordersTraderId'.
        // The 'ordersTrader' key well be denormalized from 'ordersTraderId'.
        if (typeof result[`${k}Id`] === 'string') {
          continue;
        }

        result[k] = v;
      }
    }

    for (const k of keysToClear) {
      result[k] = void 0;
    }

    return result;
  }
}

export async function extractEverything() {
  const lines = ((context) => {
    return context.services
      .get('mongodb-atlas')
      .db('ppp')
      .collection('app')
      .aggregate([
        {
          $match: {
            _id: '@settings'
          }
        },
        {
          $lookup: {
            from: 'apis',
            pipeline: [
              {
                $match: {
                  isolated: { $ne: true }
                }
              },
              {
                $project: {
                  updatedAt: 0,
                  createdAt: 0,
                  version: 0
                }
              }
            ],
            as: 'apis'
          }
        },
        {
          $lookup: {
            from: 'traders',
            pipeline: [
              {
                $match: {
                  isolated: { $ne: true }
                }
              },
              {
                $project: {
                  updatedAt: 0,
                  createdAt: 0,
                  version: 0
                }
              }
            ],
            as: 'traders'
          }
        },
        {
          $lookup: {
            from: 'brokers',
            pipeline: [
              {
                $match: {
                  isolated: { $ne: true }
                }
              },
              {
                $project: {
                  updatedAt: 0,
                  createdAt: 0,
                  version: 0
                }
              }
            ],
            as: 'brokers'
          }
        },
        {
          $lookup: {
            from: 'bots',
            pipeline: [
              {
                $match: {
                  isolated: { $ne: true }
                }
              },
              {
                $project: {
                  updatedAt: 0,
                  createdAt: 0,
                  version: 0,
                  webhook: 0,
                  type: 0
                }
              }
            ],
            as: 'bots'
          }
        },
        {
          $lookup: {
            from: 'orders',
            pipeline: [
              {
                $match: {
                  isolated: { $ne: true }
                }
              },
              {
                $project: {
                  updatedAt: 0,
                  createdAt: 0,
                  version: 0
                }
              }
            ],
            as: 'orders'
          }
        },
        {
          $lookup: {
            from: 'services',
            pipeline: [
              {
                $match: {
                  isolated: { $ne: true }
                }
              },
              {
                $project: {
                  updatedAt: 0,
                  createdAt: 0,
                  version: 0,
                  constsCode: 0,
                  formatterCode: 0,
                  instrumentsCode: 0,
                  symbolsCode: 0,
                  environmentCode: 0,
                  environmentCodeSecret: 0,
                  sourceCode: 0,
                  parsingCode: 0,
                  versioningUrl: 0,
                  useVersioning: 0,
                  tableSchema: 0,
                  insertTriggerCode: 0,
                  deleteTriggerCode: 0
                }
              }
            ],
            as: 'services'
          }
        }
      ]);
  })
    .toString()
    .split(/\r?\n/);

  lines.pop();
  lines.shift();

  const [evalRequest] = await ppp.user.functions.eval(lines.join('\n'));

  return evalRequest;
}
