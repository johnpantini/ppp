import $g from '../../lib/general.i18n.js';

export default function (i18n) {
  $g(i18n);

  i18n.extend({
    $orderWidget: {
      orderTypeTabs: {
        limit: 'Limit',
        market: 'Market',
        conditional: 'Conditional'
      },
      executionPrice: 'Price'
    }
  });
}
