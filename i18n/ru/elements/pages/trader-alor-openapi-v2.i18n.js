/**
 * Registers the i18n/ru/elements/pages/trader-alor-openapi-v2 phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderAlorOpenapiV2Page: {
      brokerProfileTitle: 'Профиль брокера',
      brokerProfileDescription: 'Брокерский профиль Alor.',
      addBrokerProfile: 'Добавить профиль Alor',
      portfolioIdTitle: 'Идентификатор клиентского портфеля',
      portfolioIdDescription: 'Портфель Алор для требуемой торговой секции.',
      portfolioTypeTitle: 'Тип клиентского портфеля',
      portfolioTypeStock: 'Фондовый рынок',
      portfolioTypeFutures: 'Срочный рынок',
      portfolioTypeCurrency: 'Валютный рынок и рынок драг. металлов',
      exchangeTitle: 'Торговая площадка',
      orderbookDepthTitle: 'Глубина книги заявок',
      orderbookDepthDescription: 'По умолчанию 20 уровней.',
      flatCommissionTitle: 'Комиссия плоского тарифа',
      flatCommissionDescription:
        'Укажите в % комиссию вашего тарифа, если он отличается от стандартных, предлагаемых брокером.',
      reconnectTimeoutTitle: 'Тайм-аут восстановления соединения',
      reconnectTimeoutDescription:
        'Время, по истечении которого будет предпринята очередная попытка восстановить прерванное подключение к серверам брокера. Задаётся в миллисекундах, по умолчанию 1000 мс.',
      invalidAlorToken: 'Неверный токен Alor.',
      portfolioSummaryFailed: 'Не удаётся получить информацию о портфеле.'
    }
  });
}
