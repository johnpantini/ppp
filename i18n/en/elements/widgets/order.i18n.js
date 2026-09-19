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
      executionPrice: 'Price',
      noConditionalOrdersText: 'Conditional orders are not set up.',
      openWidgetSettingsText: 'Open the settings.',
      selectConditionalOrderText: 'Select a conditional order.',
      displaySizeLabel: 'Display size',
      displaySizePlaceholder: 'Show the entire volume',
      destinationLabel: 'Destination',
      totalAmountText: 'Value',
      atTradeExecutionText: 'upon execution',
      availableText: 'Available',
      withMarginText: 'On margin',
      placeOrderButtonText: 'Place order',
      noOrdersTraderText: 'No trader available to place orders.',
      ordersCancelledTitle: 'Orders cancelled',
      cancelOrdersFailedText: 'Failed to cancel orders.',
      estimateFailedText: 'Failed to calculate the available balances.',
      sizeUnitsSuffix: 'pcs.',
      sizeLotsSuffix: 'lots',
      orderErrorTitle: 'Order error',
      validationErrorTitle: 'Validation error',
      orderPlacedTitle: 'Order placed',
      limitOrdersNotSupportedText:
        'The trader does not support placing limit orders.',
      marketOrdersNotSupportedText:
        'The trader does not support placing market orders.',
      quantityMustBePositiveText: 'Quantity must be positive.',
      buySellHotkeysMustDiffer: 'Buy/Sell hotkeys must be different',
      cancelSearchHotkeysMustDiffer:
        'Order cancellation and search hotkeys must be different',
      widgetDescriptionPrefix: 'The',
      widgetDescriptionSuffix:
        'widget is used to place market, limit and conditional orders.',
      connectionsTabText: 'Connections',
      hotkeysTabText: 'Hotkeys',
      conditionalOrdersText: 'Conditional orders',
      ordersTraderHeader: 'Instruments and orders trader',
      ordersTraderDescription:
        'The trader that will place orders and filter instruments in the search.',
      level1TraderDescription:
        'The trader that serves as the L1 data source for the widget.',
      extraLevel1TraderHeader: 'Extra L1 trader #%{n}',
      extraLevel1TraderDescription:
        'The trader that serves as an extra L1 data source for the widget.',
      pusherIntegrationHeader: 'Pusher integration',
      pusherIntegrationDescription:
        'For controlling the widget from external systems.',
      fastVolumeButtonsHeader: 'Fast volume buttons',
      fastVolumeButtonsDescription:
        'List values separated by semicolons. Clicking a button fills the quantity field with the nominal. Put ~ before a value to specify the volume in currency units.',
      doNotLockFastVolumeText:
        'Do not lock the volume by double-clicking the buttons',
      interfaceHeader: 'Interface',
      displaySizeInUnitsText: 'Show the position size in units',
      changePriceQuantityViaMouseWheelText:
        'Change price and quantity with the mouse wheel',
      setPriceShouldShowLimitTabText:
        'Setting the price externally always activates the Limit tab',
      onlyShowErrorNotificationsText: 'Show error notifications only',
      contentHeader: 'Content',
      showLastPriceInHeaderText: 'Show the last price in the header',
      showAbsoluteChangeInHeaderText:
        'Show the absolute price change in the header',
      showRelativeChangeInHeaderText:
        'Show the relative price change in the header',
      showOrderTypeTabsText: 'Show order type tabs',
      showCompanyCardText: 'Show the instrument name with the price',
      showBestPricesText: 'Show the best',
      andText: 'and',
      showConditionalOrderToolbarText: 'Show the conditional order toolbar',
      showAmountSectionText: 'Show the commission and value section',
      showEstimateSectionText: 'Show the "Available/On margin" section',
      showShortButtonText: 'Show the "Short" button',
      buyShortcutHeader: 'Buy hotkey',
      buyShortcutDescription:
        'The buy action triggers when the input focus is in the price or quantity field. Press Backspace to cancel this function.',
      notSetPlaceholder: 'Not set',
      sellShortcutHeader: 'Sell hotkey',
      sellShortcutDescription:
        'The sell action triggers when the input focus is in any text field. Press Backspace to cancel this function.',
      searchShortcutHeader: 'Instrument search hotkey',
      searchShortcutDescription:
        'When the input focus is in any text field, the instrument search window will open. Press Backspace to cancel this function.',
      cancelAllOrdersShortcutHeader: 'Cancel all active orders hotkey',
      cancelAllOrdersShortcutDescription:
        'When the input focus is in any text field, active orders (limit or conditional, depending on the tab) for the current widget instrument will be cancelled. Press Backspace to cancel this function.',
      conditionalsBannerText:
        'This section configures conditional orders that will be available on the corresponding widget tab.'
    }
  });
}
