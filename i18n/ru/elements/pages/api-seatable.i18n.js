/**
 * Registers the i18n/ru/elements/pages/api-seatable phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiSeatablePage: {
      baseToken: 'Токен базы',
      baseTokenDescription:
        'API-токен базы Seatable. Можно получить в панели управления.'
    }
  });
}
