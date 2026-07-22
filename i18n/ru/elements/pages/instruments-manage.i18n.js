import $const from '../../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $instrumentsManagePage: {
      binanceSpot: 'Binance (спот)',
      utexMarginStocks: 'UTEX Margin (акции и ETF, US)',
      ibStocks: 'Interactive Brokers (акции и ETF, US)',
      psinaStocks: 'Psina (акции и ETF, US)',
      alpacaStocks: 'Alpaca (акции и ETF, US)',
      alorSpbx: 'Alor (СПБ Биржа)',
      alorMoexSecurities: 'Alor (MOEX), фондовый рынок',
      alorForts: 'Alor (MOEX), срочный рынок',
      alorMoexFxMetals: 'Alor (MOEX), валюта и драг. металлы',
      dictionary: 'Словарь',
      dictionaryDescription:
        'Выберите словарь-источник. Инструменты добавляются и редактируются в рамках существующего словаря.',
      exchange: 'Торговая площадка',
      exchangeDescription:
        'Торговая площадка (биржа), на которой торгуется (листингован) инструмент.',
      symbolDescription: 'Введите тикер, чтобы найти инструмент в базе данных.',
      notFoundInDatabase: 'Инструмент не найден в базе данных.',
      fullName: 'Полное наименование',
      fullNameDescription: 'Полное наименование инструмента.',
      typeDescription: 'Тип торгуемого инструмента.',
      cryptocurrencyPair: 'Криптовалютная пара',
      currency: 'Валюта',
      currencyDescription: 'Валюта, в которой торгуется инструмент.',
      notApplicable: 'Не применимо',
      utexSymbolID: 'Идентификатор инструмента UTEX',
      identifier: 'Идентификатор',
      flags: 'Флаги',
      flagsDescription:
        'Параметры инструмента, принимающие значение Да или Нет.',
      forQualInvestorFlag: 'Только для квалифицированных инвесторов',
      amortizationFlag: 'Облигация с амортизацией',
      floatingCouponFlag: 'Плавающий купон',
      perpetualFlag: 'Бессрочная облигация',
      subordinatedFlag: 'Субординированная облигация',
      lot: 'Лотность',
      lotDescription: 'Минимальное количество, доступное для покупки.',
      minPriceIncrement: 'Шаг цены',
      minPriceIncrementDescription:
        'Если указать нулевое значение, шаг будет определяться автоматически по цене инструмента.',
      minQuantityIncrement: 'Шаг количества',
      minNotional: 'Минимальная сумма заявки',
      minNotionalDescription: 'Измеряется в единицах актива котировки.',
      isinDescription: 'Международный идентификационный код ценной бумаги.',
      figi: 'Идентификатор FIGI',
      classCodeTitle: 'Класс-код (секция торгов)',
      classCode: 'Класс-код',
      issueKind: 'Форма выпуска',
      documentary: 'Документарная',
      nonDocumentary: 'Бездокументарная',
      initialNominal: 'Начальный номинал',
      nominal: 'Текущий номинал',
      maturityDate: 'Дата погашения облигации',
      maturityDatePlaceholder: 'Дата погашения',
      couponQuantityPerYear: 'Количество выплат по купонам в год',
      couponQuantityPerYearPlaceholder: 'Купонов в год',
      baseAsset: 'Основной актив',
      expirationDate: 'Дата экспирации',
      quoteAsset: 'Актив котировки',
      userFlags: 'Пользовательские флаги',
      userFlagsDescription:
        'Принимают значение Да или Нет, не перезаписываются при импорте инструментов.',
      removedFlag: 'Скрыт из поиска виджетов',
      saveInstrument: 'Сохранить инструмент'
    }
  });
}
