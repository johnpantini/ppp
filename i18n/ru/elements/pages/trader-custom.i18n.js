/**
 * Registers the i18n/ru/elements/pages/trader-custom phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderCustomPage: {
      urlTitle: 'Ссылка на реализацию трейдера',
      continueButton: 'Продолжить',
      urlCannotBeLoaded: 'Этот URL не может быть загружен',
      loadTraderByUrl: 'Загрузка трейдера по ссылке'
    }
  });
}
