import ppp from '../ppp.js';

/**
 * Denormalizes a PPP document.
 */
export class Denormalization {
  decrypted = new Map();

  refs = {};

  fillRefs(document = {}) {
    document.apis?.forEach((d) => d._id && (this.refs[d._id] = d));
    document.bots?.forEach((d) => d._id && (this.refs[d._id] = d));
    document.brokers?.forEach((d) => d._id && (this.refs[d._id] = d));
    document.traders?.forEach((d) => d._id && (this.refs[d._id] = d));
    document.services?.forEach((d) => d._id && (this.refs[d._id] = d));
    document.instruments?.forEach((d) => d._id && (this.refs[d._id] = d));
  }

  async denormalize(document = {}) {
    const result = {};
    const keysToClear = [];

    for (const [k, v] of Object.entries(document)) {
      if (k.endsWith('Id') && typeof v === 'string') {
        const newKey = k.substring(0, k.length - 2);

        result[newKey] = void 0;

        const ref = this.refs[v];

        result[k] = v;

        if (ref) {
          result[newKey] = ref;

          if (ref.iv) {
            if (this.decrypted.has(v)) {
              result[newKey] = this.decrypted.get(v);
            } else {
              result[newKey] = await ppp.decrypt(result[newKey]);
              result[newKey] = await this.denormalize(result[newKey]);

              this.decrypted.set(v, result[newKey]);
            }
          } else {
            result[newKey] = await this.denormalize(result[newKey]);
          }
        } else {
          result[k] = v;
        }
      } else if (k.endsWith('Id') && typeof v === 'undefined') {
        keysToClear.push(k.substring(0, k.length - 2));
      } else {
        result[k] = v;
      }
    }

    for (const k of keysToClear) {
      result[k] = void 0;
    }

    return result;
  }
}
