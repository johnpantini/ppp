import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $traderPage: {
      searchPlaceholder: 'Search',
      continueButton: 'Continue',
      traderNameTitle: 'Trader name',
      runtimeTitle: 'Runtime',
      runtimeDescription: 'Choose a runtime environment for the trader.',
      runtimeChangeWarning:
        'If you change the runtime and then save, the old runtime environment will receive a command to stop the trader.',
      runtimeMainThread: 'Main thread, browser',
      runtimeSharedWorker: 'Shared worker, browser',
      runtimeUrlTemplateDescription:
        'Generate a link from the «Trader runtime» Aspirant Worker template:',
      insertUrlByTemplate: 'Insert a link from the template',
      ycApiDescription: 'Yandex Cloud API for storing trader data (Trinity):',
      addYcApi: 'Add Yandex Cloud API',
      traderCapsTitle: 'Trader capabilities',
      traderCapsDescription:
        'Flags that define the capabilities of the trader as a data provider and an executor of trading orders. The values may be overridden for known hosts or ports.',
      capsNotEditable: 'This trader does not support editing capabilities.',
      restoreDefaultCaps: 'Restore default values',
      fetchBucketListFailed:
        'Failed to fetch the bucket list. Check your access rights.',
      createTrinityBucketFailed:
        'Failed to create a bucket for Trinity documents.',
      uploadTrinityToCloudFailed:
        'Failed to upload the Trinity document to the cloud.',
      alorCardDescription:
        'Trading and market data via an Alor Open API V2 broker profile.',
      alpacaCardDescription:
        'Market data via a broker profile compatible with the Alpaca API.',
      ibCardDescription: 'Trading via Interactive Brokers.',
      utexCardTitle: 'UTEX Margin, stocks and ETFs',
      utexCardDescription: 'US stock trading via a UTEX broker profile.',
      tinkoffCardDescription:
        'Trading via a T‑Bank Invest API broker profile.',
      finamCardDescription: 'Trading via a Finam broker profile.',
      capitalcomCardDescription: 'Capital.com platform market data',
      bybitCardDescription:
        'Trading and market data via a Bybit broker profile.',
      binanceCardDescription: 'Market data via a Binance broker profile.',
      paperTradeCardDescription: 'Trading on a virtual account.',
      combinedL1CardDescription: 'Customizable L1 data source.',
      combinedOrderbookCardDescription:
        'A trader that combines order books.',
      customCardDescription:
        'Custom trader implementation loaded from a URL.'
    }
  });
}
