export default function (i18n) {
  i18n.extend({
    $activeOrdersWidget: {
      conditionalOrdersFilter: 'Conditional orders filter',
      refreshRealOrders: 'Reprice real orders',
      cancelAllBuyOrders: 'Cancel all buy orders',
      cancelAllSellOrders: 'Cancel all sell orders',
      cancelAllOrders: 'Cancel all orders',
      noOrdersTrader: 'The active orders trader is missing.',
      cancellationNotSupported: 'The trader does not support order cancellation.',
      orderCanceled: 'The order has been canceled',
      cancelOrderFailed: 'Failed to cancel the order.',
      conditionalOrderCanceled: 'The conditional order has been canceled',
      cancelConditionalOrderFailed: 'Failed to cancel the conditional order.',
      actionRequestSent: 'The action request has been sent',
      actionFailed: 'Failed to perform the action.',
      onlyRealOrdersCanBeRefreshed: 'Only real orders can be repriced.',
      realOrdersRefreshedForAllInstruments:
        'Real orders have been repriced for all instruments',
      realOrdersRefreshedForInstrument:
        'Real orders have been repriced for %{symbol}',
      refreshRealOrdersFailed: 'Failed to reprice real orders.',
      ordersToCancel: {
        all: 'All orders',
        allBuy: 'All buy orders',
        allSell: 'All sell orders',
        real: 'Real orders',
        realBuy: 'Real buy orders',
        realSell: 'Real sell orders',
        conditional: 'Conditional orders',
        conditionalBuy: 'Conditional buy orders',
        conditionalSell: 'Conditional sell orders'
      },
      ordersCancelledForAllInstruments:
        '%{type} have been canceled for all instruments',
      ordersCancelledForInstrument:
        '%{type} have been canceled for %{symbol}',
      cancelAllOrdersFailed: 'Failed to cancel all or some of the orders.',
      codeContainsErrors: 'The code contains errors.',
      descriptionStart: 'The',
      descriptionEnd:
        'widget displays current market, limit, and conditional orders that are awaiting execution and have not been canceled.',
      settings: {
        tabs: {
          main: 'Main settings',
          conditional: 'Conditional orders'
        },
        ordersTrader: 'Active orders trader',
        ordersTraderDescription:
          'The trader that will be the source of the active orders list.',
        orderProcessing: 'Order list processing',
        orderProcessingDescription:
          'The body of the function that processes the order list.',
        interface: 'Interface',
        disableInstrumentFiltering:
          'Do not filter content by the selected instrument',
        onlyShowErrorNotifications: 'Show error notifications only',
        content: 'Content',
        showAllTab: 'Show the "All" tab',
        showRealTab: 'Show the "Real" tab',
        showConditionalTab: 'Show the "Conditional" tab',
        showRefreshOrdersButton: 'Show the "Reprice all orders" button',
        showCancelAllBuyOrdersButton:
          'Show the "Cancel all buy orders" button',
        showCancelAllSellOrdersButton:
          'Show the "Cancel all sell orders" button',
        showCancelAllOrdersButton: 'Show the "Cancel all orders" button',
        showConditionalOrdersFilterButton:
          'Show the conditional orders filter button',
        enableFilter: 'Enable the filter',
        allowedConditionalOrders: 'Allowed conditional orders',
        allowedConditionalOrdersDescription:
          'The list of conditional orders that will be displayed while the filter is active.'
      }
    }
  });
}
