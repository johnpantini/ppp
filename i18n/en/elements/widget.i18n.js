import $g from '../lib/general.i18n.js';

export default function (i18n) {
  $g(i18n);

  i18n.extend({
    $widget: {
      emptyState: {
        loading: 'Loading widget...',
        noActiveOrders: 'No active orders.',
        noBalancesToDisplay: 'No balances to display.',
        noDataToDisplay: 'No data to display.',
        noOperationsToDisplay: 'No operations to display.',
        noResultsToDisplay: 'No results to display.',
        noTradesToDisplay: 'No trades to display.',
        selectInstrument: 'Select an instrument.',
        unsupportedInstrument: 'Unsupported instrument.'
      },
      tabs: {
        allOrdersText: 'All',
        realOrdersText: 'Real',
        conditionalOrdersText: 'Conditional'
      },
      unsupportedInstrumentFullName: 'Unsupported instrument',
      noInstrumentsImportLink: 'Import',
      noInstrumentsOr: 'or',
      noInstrumentsSyncLink: 'synchronize',
      noInstrumentsTail: 'trading instruments, then reload the page.',
      staleInstrumentsPrefix: 'Local instruments are out of date, please run a',
      staleInstrumentsSyncLink: 'synchronization',
      authorizationError: 'Data source authorization error.',
      connectionLimitExceeded: 'Available connection limit exceeded.',
      connectionError: 'Data source connection error.',
      traderTrinityError: 'The trader fails to load (check the URL).',
      validationError: 'Data validation error.',
      fetchError: 'Network request error.',
      internalServerError: 'Server-side error.',
      unknownError: 'Unknown error, see console for details.',
      noInstrumentTrader: 'No trader assigned to handle the instrument.',
      searchPlaceholder: 'Search by ticker or instrument name',
      menu: {
        stocks: 'Stocks',
        bonds: 'Bonds',
        etfs: 'ETFs',
        futures: 'Futures',
        currencyPairs: 'Currency pairs',
        cryptoPairs: 'Cryptocurrency pairs',
        indices: 'Indices',
        commodities: 'Commodities',
        special: 'Special instruments'
      },
      importInstrumentsTitle: 'Import instruments',
      widgetFallbackTitle: 'Widget',
      ensembleNotSupported: 'This widget does not support ensembles.',
      clipboardWidgetMovedToEnsemble:
        'The widget from the clipboard has been removed and placed into an ensemble of another widget.',
      widgetSettingsTitle: 'Widget - %{name}',
      applyTemplateSettingsTitle: 'Apply template settings',
      applyTemplateSettingsText:
        'The current widget settings will be replaced with those specified in the parent template. Confirm this action.',
      widgetSaved: 'The widget has been saved.',
      widgetSavingTitle: 'Widget saving',
      widgetClosingTitle: 'Widget closing',
      closeWidgetConfirm: 'Close the widget "%{name}"?',
      inPercents: 'In percent',
      inPriceSteps: 'In price steps',
      inCurrency: 'In currency',
      marketPricePlaceholder: 'Market',
      highlightChanges: 'Highlight changes with color',
      orderTemplate: 'Order template',
      traderL1: 'L1 trader',
      symbolNotFoundInDictionary: 'The symbol was not found in the dictionary',
      traderNoTimeframes:
        '// The trader is not set or does not support timeframes.',
      supportedTimeframes: '// Supported timeframes:',
      valueMustBePositive: 'The value must be positive',
      hidden: 'Hidden'
    }
  });
}
