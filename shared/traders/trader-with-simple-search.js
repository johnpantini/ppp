import { cyrillicToLatin } from '../intl.js';
import ppp from '../../ppp.js';

/**
 * @mixin
 */
export class TraderWithSimpleSearch {
  async search(searchText) {
    if (searchText?.trim()) {
      searchText = searchText.trim();

      const lines = ((context) => {
        const collection = context.services
          .get('mongodb-atlas')
          .db('ppp')
          .collection('instruments');

        const exactSymbolMatch = collection
          .find({
            $and: [
              { removed: { $ne: true } },
              {
                exchange: '$exchange'
              },
              {
                broker: '$broker'
              },
              {
                $or: [
                  {
                    symbol: '$text'
                  },
                  {
                    symbol: '$latin'
                  }
                ]
              }
            ]
          })
          .limit(1);

        const regexSymbolMatch = collection
          .find({
            $and: [
              { removed: { $ne: true } },
              {
                exchange: '$exchange'
              },
              {
                broker: '$broker'
              },
              {
                symbol: { $regex: '(^$text|^$latin)', $options: 'i' }
              }
            ]
          })
          .limit(20);

        const regexFullNameMatch = collection
          .find({
            $and: [
              { removed: { $ne: true } },
              {
                exchange: '$exchange'
              },
              {
                broker: '$broker'
              },
              {
                fullName: { $regex: '($text|$latin)', $options: 'i' }
              }
            ]
          })
          .limit(20);

        return { exactSymbolMatch, regexSymbolMatch, regexFullNameMatch };
      })
        .toString()
        .split(/\r?\n/);

      lines.pop();
      lines.shift();

      return ppp.user.functions.eval(
        lines
          .join('\n')
          .replaceAll('$exchange', this.getExchange?.() ?? '')
          .replaceAll('$broker', this.getBroker?.() ?? '')
          .replaceAll('$text', searchText.toUpperCase())
          .replaceAll('$latin', cyrillicToLatin(searchText).toUpperCase())
      );
    }
  }
}
