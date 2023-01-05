import { getInstrumentPrecision } from '../intl.js';
import { TRADER_DATUM } from '../const.js';

export class Trader {
  caps() {
    return this.document.caps ?? [];
  }

  hasCap(cap) {
    const caps = this.caps();

    if (typeof cap === 'string') return caps.indexOf(cap) > -1;
    else if (Array.isArray(cap)) return cap.every((c) => caps.indexOf(c) > -1);
    else return false;
  }

  valueForEmptyDatum(datum) {
    switch (datum) {
      case TRADER_DATUM.POSITION_SIZE:
        return 0;
      case TRADER_DATUM.POSITION_AVERAGE:
        return 0;
    }

    return '—';
  }

  getDatumGlobalReferenceName(datum) {
    switch (datum) {
      case TRADER_DATUM.POSITION:
      case TRADER_DATUM.POSITION_SIZE:
      case TRADER_DATUM.POSITION_AVERAGE:
        return 'POSITIONS';
      case TRADER_DATUM.CURRENT_ORDER:
        return 'ORDERS';
      case TRADER_DATUM.TIMELINE_ITEM:
        return 'TIMELINE';
    }
  }

  fixPrice(instrument, price) {
    const precision = getInstrumentPrecision(instrument);

    price = parseFloat(price?.toString?.()?.replace(',', '.'));

    if (!price || isNaN(price)) price = 0;

    return price.toFixed(precision).toString();
  }

  async subscribeField({ source, field, datum }) {
    const [subs, refs] = this.subsAndRefs?.(datum) ?? [];

    if (subs) {
      const array = subs.get(source);

      if (Array.isArray(array)) {
        if (!array.find((e) => e.field === field)) array.push({ field, datum });
      } else {
        subs.set(source, [{ field, datum }]);
      }

      const globalRefName = this.getDatumGlobalReferenceName(datum);

      if (globalRefName) {
        await this.addRef(
          {
            _id: globalRefName
          },
          refs
        );
      } else {
        await this.addRef(source?.instrument, refs);
      }
    }
  }

  async subscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      await this.subscribeField({ source, field, datum });
    }
  }

  async unsubscribeField({ source, field, datum }) {
    const [subs, refs] = this.subsAndRefs?.(datum) ?? [];

    if (subs) {
      const array = subs.get(source);
      const index = array?.findIndex?.(
        (e) => e.field === field && e.datum === datum
      );

      if (index > -1) {
        array.splice(index, 1);

        if (!array.length) {
          subs.delete(source);
        }

        const globalRefName = this.getDatumGlobalReferenceName(datum);

        if (globalRefName) {
          await this.removeRef(
            {
              _id: globalRefName
            },
            refs
          );
        } else {
          await this.removeRef(source?.instrument, refs);
        }
      }
    }
  }

  async unsubscribeFields({ source, fieldDatumPairs = {} }) {
    for (const [field, datum] of Object.entries(fieldDatumPairs)) {
      await this.unsubscribeField({ source, field, datum });
    }
  }

  async addRef(instrument, refs) {
    if (instrument?._id && refs) {
      const ref = refs.get(instrument._id);

      if (typeof ref === 'undefined') {
        await this.addFirstRef?.(instrument, refs, ref);
      } else {
        ref.refCount++;
      }
    }
  }

  async removeRef(instrument, refs) {
    if (instrument?._id && refs) {
      const ref = refs.get(instrument._id);

      if (typeof ref !== 'undefined') {
        if (ref.refCount > 0) {
          ref.refCount--;
        }

        if (ref.refCount === 0) {
          await this.removeLastRef?.(instrument, refs, ref);
          refs.delete(instrument._id);
        }
      }
    }
  }

  async instrumentChanged(source, oldValue, newValue) {
    for (const key of Object.keys(this.subs)) {
      const sub = this.subs[key];

      if (sub.has(source)) {
        for (const { field, datum } of sub.get(source)) {
          source[field] = this.valueForEmptyDatum?.(datum) ?? '—';

          if (this.getDatumGlobalReferenceName(datum)) continue;

          if (oldValue) {
            await this.removeRef(oldValue, this.refs[key]);
          }

          if (newValue) {
            await this.addRef(newValue, this.refs[key]);
          }
        }
      }
    }
  }
}
