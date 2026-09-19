import $g from '../../lib/general.i18n.js';

export default function (i18n) {
  $g(i18n);

  i18n.extend({
    $orderWidget: {
      orderTypeTabs: {
        limit: 'Лимитная',
        market: 'Рыночная',
        conditional: 'Условная'
      },
      executionPrice: 'Цена исполнения',
      noConditionalOrdersText: 'Условные заявки не настроены.',
      openWidgetSettingsText: 'Открыть параметры.',
      selectConditionalOrderText: 'Выберите условную заявку.',
      displaySizeLabel: 'Отображаемый объём',
      displaySizePlaceholder: 'Показывать весь объём',
      destinationLabel: 'Назначение',
      totalAmountText: 'Стоимость',
      atTradeExecutionText: 'по факту сделки',
      availableText: 'Доступно',
      withMarginText: 'С плечом',
      placeOrderButtonText: 'Разместить заявку',
      noOrdersTraderText: 'Отсутствует трейдер для выставления заявок.',
      ordersCancelledTitle: 'Заявки отменены',
      cancelOrdersFailedText: 'Не удалось отменить заявки.',
      estimateFailedText: 'Не удалось рассчитать доступные остатки.',
      sizeUnitsSuffix: 'шт.',
      sizeLotsSuffix: 'л.',
      orderErrorTitle: 'Ошибка заявки',
      validationErrorTitle: 'Ошибка валидации',
      orderPlacedTitle: 'Заявка выставлена',
      limitOrdersNotSupportedText:
        'Трейдер не поддерживает выставление лимитных заявок.',
      marketOrdersNotSupportedText:
        'Трейдер не поддерживает выставление рыночных заявок.',
      quantityMustBePositiveText: 'Количество должно быть положительным.',
      buySellHotkeysMustDiffer: 'Горячие клавиши Buy/Sell должны различаться',
      cancelSearchHotkeysMustDiffer:
        'Горячие клавиши отмены заявок и поиска должны различаться',
      widgetDescriptionPrefix: 'Виджет',
      widgetDescriptionSuffix:
        'используется, чтобы выставлять рыночные, лимитные и условные заявки.',
      connectionsTabText: 'Подключения',
      hotkeysTabText: 'Горячие клавиши',
      conditionalOrdersText: 'Условные заявки',
      ordersTraderHeader: 'Трейдер инструментов и заявок',
      ordersTraderDescription:
        'Трейдер, который будет выставлять заявки, а также фильтровать инструменты в поиске.',
      level1TraderDescription:
        'Трейдер, выступающий источником L1-данных виджета.',
      extraLevel1TraderHeader: 'Дополнительный трейдер L1 #%{n}',
      extraLevel1TraderDescription:
        'Трейдер, выступающий дополнительным источником L1-данных виджета.',
      pusherIntegrationHeader: 'Интеграция с Pusher',
      pusherIntegrationDescription:
        'Для управления виджетом из внешних систем.',
      fastVolumeButtonsHeader: 'Кнопки быстрого объёма',
      fastVolumeButtonsDescription:
        'Перечислите значения через точку с запятой. Нажатие на кнопку подставляет номинал в поле количества. Поставьте ~ перед значением, чтобы указать объём в единицах валюты.',
      doNotLockFastVolumeText:
        'Не фиксировать объём двойным нажатием на кнопки',
      interfaceHeader: 'Интерфейс',
      displaySizeInUnitsText:
        'Показывать количество инструмента в портфеле в штуках',
      changePriceQuantityViaMouseWheelText:
        'Изменять цену и количество колесом мыши',
      setPriceShouldShowLimitTabText:
        'Подстановка цены извне всегда активирует вкладку «Лимитная»',
      onlyShowErrorNotificationsText:
        'Показывать только уведомления об ошибках',
      contentHeader: 'Наполнение',
      showLastPriceInHeaderText: 'Показывать последнюю цену в заголовке',
      showAbsoluteChangeInHeaderText:
        'Показывать абсолютное изменение цены в заголовке',
      showRelativeChangeInHeaderText:
        'Показывать относительное изменение цены в заголовке',
      showOrderTypeTabsText: 'Показывать вкладки с типом заявки',
      showCompanyCardText: 'Показывать наименование инструмента с ценой',
      showBestPricesText: 'Показывать лучшие цены',
      andText: 'и',
      showConditionalOrderToolbarText: 'Показывать панель условных заявок',
      showAmountSectionText: 'Показывать секцию с комиссией и стоимостью',
      showEstimateSectionText: 'Показывать секцию «Доступно/С плечом»',
      showShortButtonText: 'Показывать кнопку "Short"',
      buyShortcutHeader: 'Горячая клавиша для покупки',
      buyShortcutDescription:
        'Покупка сработает, если фокус ввода будет находиться в поле цены или количества. Нажмите Backspace, чтобы отменить эту функцию.',
      notSetPlaceholder: 'Не задана',
      sellShortcutHeader: 'Горячая клавиша для продажи',
      sellShortcutDescription:
        'Продажа сработает, если фокус ввода будет находиться в любом текстовом поле. Нажмите Backspace, чтобы отменить эту функцию.',
      searchShortcutHeader: 'Горячая клавиша для поиска инструментов',
      searchShortcutDescription:
        'Если фокус ввода будет находиться в любом текстовом поле, то откроется окно поиска инструмента. Нажмите Backspace, чтобы отменить эту функцию.',
      cancelAllOrdersShortcutHeader:
        'Горячая клавиша для отмены всех активных заявок',
      cancelAllOrdersShortcutDescription:
        'Если фокус ввода будет находиться в любом текстовом поле, то будут отменены активные заявки (лимитные или условные, в зависимости от вкладки) по текущему инструменту виджета. Нажмите Backspace, чтобы отменить эту функцию.',
      conditionalsBannerText:
        'В этом разделе настраиваются условные заявки, которые будут доступны на соответствующей вкладке виджета.'
    }
  });
}
