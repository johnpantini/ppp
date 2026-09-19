export default function (i18n) {
  i18n.extend({
    $activeOrdersWidget: {
      conditionalOrdersFilter: 'Фильтр условных заявок',
      refreshRealOrders: 'Переставить биржевые заявки',
      cancelAllBuyOrders: 'Отменить все заявки на покупку',
      cancelAllSellOrders: 'Отменить все заявки на продажу',
      cancelAllOrders: 'Отменить все заявки',
      noOrdersTrader: 'Отсутствует трейдер активных заявок.',
      cancellationNotSupported: 'Трейдер не поддерживает отмену заявок.',
      orderCanceled: 'Заявка отменена',
      cancelOrderFailed: 'Не удалось отменить заявку.',
      conditionalOrderCanceled: 'Условная заявка отменена',
      cancelConditionalOrderFailed: 'Не удалось отменить условную заявку.',
      actionRequestSent: 'Запрос на действие отправлен',
      actionFailed: 'Не удалось выполнить действие.',
      onlyRealOrdersCanBeRefreshed: 'Переставлять можно только биржевые заявки.',
      realOrdersRefreshedForAllInstruments:
        'Биржевые заявки переставлены по всем инструментам',
      realOrdersRefreshedForInstrument:
        'Биржевые заявки переставлены по инструменту %{symbol}',
      refreshRealOrdersFailed: 'Не удалось переставить биржевые заявки.',
      ordersToCancel: {
        all: 'Все заявки',
        allBuy: 'Все заявки на покупку',
        allSell: 'Все заявки на продажу',
        real: 'Биржевые заявки',
        realBuy: 'Биржевые заявки на покупку',
        realSell: 'Биржевые заявки на продажу',
        conditional: 'Условные заявки',
        conditionalBuy: 'Условные заявки на покупку',
        conditionalSell: 'Условные заявки на продажу'
      },
      ordersCancelledForAllInstruments: '%{type} отменены по всем инструментам',
      ordersCancelledForInstrument:
        '%{type} отменены по инструменту %{symbol}',
      cancelAllOrdersFailed: 'Не удалось отменить все или некоторые заявки.',
      codeContainsErrors: 'Код содержит ошибки.',
      descriptionStart: 'Виджет',
      descriptionEnd:
        'отображает текущие рыночные, лимитные и условные заявки, которые ожидают исполнения и не отменены.',
      settings: {
        tabs: {
          main: 'Основные настройки',
          conditional: 'Условные заявки'
        },
        ordersTrader: 'Трейдер активных заявок',
        ordersTraderDescription:
          'Трейдер, который будет источником списка активных заявок.',
        orderProcessing: 'Обработка списка заявок',
        orderProcessingDescription: 'Тело функции для обработки списка заявок.',
        interface: 'Интерфейс',
        disableInstrumentFiltering:
          'Не фильтровать содержимое по выбранному инструменту',
        onlyShowErrorNotifications: 'Показывать только уведомления об ошибках',
        content: 'Наполнение',
        showAllTab: 'Показывать вкладку «Все»',
        showRealTab: 'Показывать вкладку «Биржевые»',
        showConditionalTab: 'Показывать вкладку «Условные»',
        showRefreshOrdersButton:
          'Показывать кнопку «Переставить все заявки»',
        showCancelAllBuyOrdersButton:
          'Показывать кнопку «Отменить все заявки на покупку»',
        showCancelAllSellOrdersButton:
          'Показывать кнопку «Отменить все заявки на продажу»',
        showCancelAllOrdersButton:
          'Показывать кнопку «Отменить все заявки»',
        showConditionalOrdersFilterButton:
          'Показывать кнопку фильтра условных заявок',
        enableFilter: 'Включить фильтр',
        allowedConditionalOrders: 'Разрешённые условные заявки',
        allowedConditionalOrdersDescription:
          'Список условных заявок, которые будут отображаться при активном фильтре.'
      }
    }
  });
}
