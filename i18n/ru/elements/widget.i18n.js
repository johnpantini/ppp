import $g from '../lib/general.i18n.js';

export default function (i18n) {
  $g(i18n);

  i18n.extend({
    $widget: {
      emptyState: {
        loading: 'Виджет загружается...',
        noActiveOrders: 'Нет активных заявок.',
        noBalancesToDisplay: 'Нет балансов для отображения.',
        noDataToDisplay: 'Нет данных для отображения.',
        noOperationsToDisplay: 'Нет операций для отображения.',
        noResultsToDisplay: 'Нет результатов для отображения.',
        noTradesToDisplay: 'Нет сделок для отображения.',
        selectInstrument: 'Выберите инструмент.',
        unsupportedInstrument: 'Инструмент не поддерживается.'
      },
      tabs: {
        allOrdersText: 'Все',
        realOrdersText: 'Биржевые',
        conditionalOrdersText: 'Условные'
      },
      unsupportedInstrumentFullName: 'Инструмент не поддерживается',
      noInstrumentsImportLink: 'Импортируйте',
      noInstrumentsOr: 'или',
      noInstrumentsSyncLink: 'синхронизируйте',
      noInstrumentsTail: 'торговые инструменты, затем обновите страницу.',
      staleInstrumentsPrefix: 'Локальные инструменты устарели, необходима',
      staleInstrumentsSyncLink: 'синхронизация',
      authorizationError: 'Ошибка авторизации в источнике данных.',
      connectionLimitExceeded: 'Исчерпан лимит доступных соединений.',
      connectionError: 'Ошибка соединения с источником данных.',
      traderTrinityError: 'Трейдер не загружается (проверьте URL).',
      validationError: 'Ошибка валидации данных.',
      fetchError: 'Ошибка сетевого запроса.',
      internalServerError: 'Ошибка на стороне сервера.',
      unknownError: 'Неизвестная ошибка, подробности в консоли.',
      noInstrumentTrader: 'Не задан трейдер для работы с инструментом.',
      searchPlaceholder: 'Поиск по тикеру или названию инструмента',
      menu: {
        stocks: 'Акции',
        bonds: 'Облигации',
        etfs: 'Фонды',
        futures: 'Фьючерсы',
        currencyPairs: 'Валютные пары',
        cryptoPairs: 'Криптовалютные пары',
        indices: 'Индексы',
        commodities: 'Товары',
        special: 'Специальные инструменты'
      },
      importInstrumentsTitle: 'Импорт инструментов',
      widgetFallbackTitle: 'Виджет',
      ensembleNotSupported: 'Этот виджет не поддерживает создание ансамблей.',
      clipboardWidgetMovedToEnsemble:
        'Виджет из буфера обмена был удалён и помещён в ансамбль другого виджета.',
      widgetSettingsTitle: 'Виджет - %{name}',
      applyTemplateSettingsTitle: 'Подставить настройки из шаблона',
      applyTemplateSettingsText:
        'Текущие настройки виджета будут заменены на те, которые были указаны в родительском шаблоне. Подтвердите действие.',
      widgetSaved: 'Виджет сохранён.',
      widgetSavingTitle: 'Сохранение виджета',
      widgetClosingTitle: 'Закрытие виджета',
      closeWidgetConfirm: 'Закрыть виджет «%{name}» ?',
      inPercents: 'В процентах',
      inPriceSteps: 'В шагах цены',
      inCurrency: 'В валюте',
      marketPricePlaceholder: 'Рыночная',
      highlightChanges: 'Выделять изменения цветом',
      orderTemplate: 'Шаблон заявки',
      traderL1: 'Трейдер L1',
      symbolNotFoundInDictionary: 'Тикер не найден в словаре',
      traderNoTimeframes:
        '// Трейдер не задан или не поддерживает таймфреймы.',
      supportedTimeframes: '// Поддерживаемые таймфреймы:',
      valueMustBePositive: 'Значение должно быть положительным',
      hidden: 'Скрыто'
    }
  });
}
