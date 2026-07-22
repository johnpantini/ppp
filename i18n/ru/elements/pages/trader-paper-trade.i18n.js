export default function (i18n) {
  i18n.extend({
    $traderPaperTradePage: {
      initialDepositTitle: 'Начальный депозит',
      initialDepositDescription:
        'Значения сбрасываются при перезагрузке трейдера.',
      bookSourceTitle: 'Источник книги заявок',
      bookSourceDescription:
        'Трейдер будет использовать книгу заявок для исполнения виртуальных сделок.',
      dictionaryTitle: 'Словарь',
      dictionaryDescription:
        'Словарь инструментов, который будет назначен трейдеру.',
      marketOrderProtectionTitle: 'Защита рыночных заявок, %',
      marketOrderProtectionDescription:
        'Цена исполнения рыночной заявки не может быть хуже лучшей цены книги заявок, скорректированной на это значение.',
      commissionTitle: 'Комиссия за сделки',
      commissionDescription: 'Код расчёта комиссии на языке JavaScript.',
      sourceCodeInvalid: 'Исходный код не может быть использован.'
    }
  });
}
