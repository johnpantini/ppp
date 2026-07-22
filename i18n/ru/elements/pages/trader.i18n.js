import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $traderPage: {
      searchPlaceholder: 'Поиск',
      continueButton: 'Продолжить',
      traderNameTitle: 'Название трейдера',
      runtimeTitle: 'Среда выполнения',
      runtimeDescription: 'Выберите среду выполнения для трейдера.',
      runtimeChangeWarning:
        'Если изменить среду, а затем сохраниться, то старая среда выполнения получит команду на остановку трейдера.',
      runtimeMainThread: 'Основной поток, браузер',
      runtimeSharedWorker: 'Разделяемый поток, браузер',
      runtimeUrlTemplateDescription:
        'Cформировать ссылку по шаблону Aspirant Worker «Среда выполнения трейдеров»:',
      insertUrlByTemplate: 'Вставить ссылку по шаблону',
      ycApiDescription:
        'API Yandex Cloud для хранения данных трейдера (Trinity):',
      addYcApi: 'Добавить API Yandex Cloud',
      traderCapsTitle: 'Возможности трейдера',
      traderCapsDescription:
        'Флаги, определяющие возможности трейдера как поставщика данных и исполнителя торговых поручений. Значения могут быть перекрыты для известных хостов или портов.',
      capsNotEditable:
        'Данный трейдер не поддерживает редактирование возможностей.',
      restoreDefaultCaps: 'Восстановить значения по умолчанию',
      fetchBucketListFailed:
        'Не удалось получить список бакетов. Проверьте права доступа.',
      createTrinityBucketFailed:
        'Не удалось создать бакет для документов Trinity.',
      uploadTrinityToCloudFailed:
        'Не удалось загрузить документ Trinity в облако.',
      alorCardDescription:
        'Торговля и рыночные данные через брокерский профиль Alor Open API V2.',
      alpacaCardDescription:
        'Рыночные данные через брокерский профиль, совместимый с Alpaca API.',
      ibCardDescription: 'Торговля через Interactive Brokers.',
      utexCardTitle: 'UTEX Margin, акции и ETF',
      utexCardDescription:
        'Торговля акциями США через брокерский профиль UTEX.',
      tinkoffCardDescription:
        'Торговля через брокерский профиль T‑Bank Invest API.',
      finamCardDescription: 'Торговля через брокерский профиль Finam.',
      capitalcomCardDescription: 'Рыночные данные платформы Capital.com',
      bybitCardDescription:
        'Торговля и рыночные данные через брокерский профиль Bybit.',
      binanceCardDescription:
        'Рыночные данные через брокерский профиль Binance.',
      paperTradeCardDescription: 'Торговля на виртуальном счёте.',
      combinedL1CardDescription: 'Настраиваемый источник данных L1.',
      combinedOrderbookCardDescription:
        'Трейдер, позволяющий комбинировать книги заявок.',
      customCardDescription:
        'Собственная реализация трейдера, загружаемая по ссылке.'
    }
  });
}
