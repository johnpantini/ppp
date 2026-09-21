/**
 * Registers the i18n/ru/elements/pages/settings phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $settingsPage: {
      themeAndColors: 'Тема и цвета',
      workspace: 'Терминал'
    }
  });
}
