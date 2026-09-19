export default function (i18n) {
  i18n.extend({
    $timeLineWidget: {
      stockCount: '%{smart_count} share of |||| %{smart_count} shares of',
      bondCount: '%{smart_count} bond of |||| %{smart_count} bonds of',
      etfCount: '%{smart_count} unit of |||| %{smart_count} units of',
      futureCount: '%{smart_count} future of |||| %{smart_count} futures of',
      currencyCount:
        '%{smart_count} currency unit of |||| %{smart_count} currency units of',
      otherCount:
        '%{smart_count} security of |||| %{smart_count} securities of',
      lotCount: '%{smart_count} lot |||| %{smart_count} lots',
      lotAtPrice: '%{lotCount} @ %{price}',
      buyOperation: 'Bought %{tradedCount} %{instrumentFullName}',
      sellOperation: 'Sold %{tradedCount} %{instrumentFullName}',
      locateFeeOperation: 'Located %{tradedCount} %{instrumentFullName}',
      noTimelineTrader: 'The timeline trader is missing.',
      widgetDescriptionPrefix: 'The',
      widgetDescriptionSuffix:
        'widget displays the history of trades and other exchange events for one or more trading instruments.',
      timelineTrader: 'Timeline trader',
      timelineTraderDescription:
        'The trader that will be the source of the timeline.',
      operationsToDisplay: 'Number of operations to display',
      operationsToDisplayDescription:
        'The maximum number of operations shown in the timeline.',
      interface: 'Interface',
      highlightTrades: 'Highlight buys and sells with a background color',
      disableInstrumentFiltering:
        'Do not filter content by the selected instrument',
      showCommissions: 'Show commissions'
    }
  });
}
