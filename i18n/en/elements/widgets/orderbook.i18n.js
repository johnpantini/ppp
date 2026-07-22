export default function (i18n) {
  i18n.extend({
    $orderbookWidget: {
      refreshManually: 'Refresh manually',
      pause: 'Pause',
      clearWidget: 'Clear widget',
      noBookTrader: 'The main orderbook trader is missing.',
      codeContainsErrors: 'The code contains errors.',
      tags: {
        orderbook: 'Market depth'
      },
      description:
        'displays a table of buy and sell limit orders for an instrument.',
      settings: {
        tabs: {
          traders: 'Traders'
        },
        bookTrader: 'Orderbook trader',
        bookTraderDescription:
          'The trader that will be the source of the orderbook.',
        ordersTrader: 'Limit orders trader',
        ordersTraderDescription:
          'The trader that will display your own limit orders (quantity) at price levels.',
        ownOrdersDisplay: 'Own orders display',
        ownOrdersNative: 'Only if the book trader has the price level',
        ownOrdersVirtual: 'Always on a virtual level',
        extraBookTrader: 'Extra orderbook trader #%{n}',
        bookProcessing: 'Orderbook processing',
        bookProcessingDescription:
          'The body of the function that processes orderbooks incoming from the widget traders.',
        displayMode: 'Display mode',
        displayModeCompact: 'Compact',
        displayModeOneColumn: '1 column',
        depth: 'Orderbook depth',
        depthDescriptionStart: 'The number of',
        depthDescriptionAnd: 'and',
        depthDescriptionEnd: 'rows to display.',
        headerInterface: 'Header interface',
        showResetButton: 'Show the clear button',
        showPauseButton: 'Show the pause button',
        content: 'Content',
        showSpread: 'Show the spread',
        showPools: 'Show liquidity pools in the orderbook',
        useMicsForPools: 'Show liquidity pools as MIC codes',
        priceLevels: 'Price levels',
        showBorders: 'Highlight price level borders',
        levelColoring: 'Price level coloring',
        levelColoringOff: 'None',
        levelColoringVolume: 'By relative volume',
        levelColoringOrdinal: 'By ordinal number',
        levelColoringBanner:
          'Settings from left to right: Dark theme, Light theme, Opacity.'
      }
    }
  });
}
