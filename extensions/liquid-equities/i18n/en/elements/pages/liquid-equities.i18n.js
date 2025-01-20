export default function (i18n) {
  i18n.extend({
    $extensions: {
      liquidEquities: {
        type: {
          stock: 'Stock',
          bond: 'Bond',
          currency: 'Currency',
          futures: 'Future',
          etf: 'ETF'
        }
      }
    }
  });
}
