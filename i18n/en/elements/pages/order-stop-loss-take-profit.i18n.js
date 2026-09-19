export default function (i18n) {
  i18n.extend({
    $orderStopLossTakeProfitPage: {
      specificationHeader: 'Specification',
      specificationDescription:
        'Learn how traders are used by this conditional order. Traders are assigned in the order widget.',
      traderL1Source: 'Trader #%{n} - the L1 data source.',
      orderTypeHeader: 'Order type',
      orderTypeDescription:
        'A Stop Loss order limits losses, while Take Profit locks in profits.',
      watchPricesHeader: 'Prices to watch',
      watchPricesDescription:
        'You can select multiple prices at once. If nothing is selected, the last trade price will be watched. MidPoint triggers when both the bid and ask prices are positive at the same time.',
      lastPrice: 'Last trade price',
      extendedLastPrice: 'Last trade price (outside the regular session)',
      bestBid: 'Best bid price',
      bestAsk: 'Best ask price',
      midpointPrice: 'MidPoint price',
      distanceHeader: 'Distance between the trigger price and the execution price',
      distanceDescription:
        'For Stop Limit and Take Limit orders, you can set a distance that will be used to calculate the limit execution price relative to the trigger price when filling out the order form in the widget.',
      distanceBanner:
        'The price distance can be set in percent (add a % sign after the number) or in instrument price steps (add a + sign).',
      nonePlaceholder: 'None',
      timeDelayHeader: 'Protection time',
      timeDelayDescription:
        'The time during which the order trigger condition must hold. Set in seconds, between 1 and 3600.',
      workingHoursHeader: 'Working hours',
      workingHoursDescription:
        'Time intervals during which the order is allowed to trigger (inclusive). Local time.',
      fromHours: 'From (h)',
      fromMinutes: 'From (min)',
      toHours: 'To (h)',
      toMinutes: 'To (min)'
    }
  });
}
