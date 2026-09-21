/**
 * Registers the i18n/ru/elements/pages/not-found phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $notFoundPage: {
      headline: 'Что-то пошло не так.',
      text: 'Страница не открывается. Убедитесь, что адрес введён правильно.',
      goToCloudServices: 'К настройкам облачных сервисов',
      copyright: '© PPP 2021-текущее время.'
    }
  });
}
