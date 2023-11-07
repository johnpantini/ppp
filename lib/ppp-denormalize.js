import ppp from '../ppp.js';

/**
 * Denormalizes a PPP document.
 */
export class Denormalization {
  decrypted = new Map();

  refs = {};

  maxDepth = 7;

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
