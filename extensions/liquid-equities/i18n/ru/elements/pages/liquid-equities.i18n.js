export default function (i18n) {
  i18n.extend({
    $extensions: {
      liquidEquities: {
        type: {
          stock: 'Акция',
          bond: 'Облигация',
          currency: 'Валюта',
          futures: 'Фьючерс',
          etf: 'ETF'
        }
      }
    }
  });
}
