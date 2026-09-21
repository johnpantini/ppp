/**
 * Registers the i18n/ru/elements/pages/settings-ui phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $settingsUiPage: {
      appLanguage: 'Язык приложения',
      appLanguageDescription: 'Выберите язык приложения.',
      selectLanguage: 'Выберите язык',
      flags: 'Флаги',
      flagsDescription: 'Параметры, принимающие значение Да или Нет.',
      closeModalsOnEsc: 'Закрывать модальные окна клавишей Esc',
      saveSettings: 'Сохранить параметры'
    }
  });
}
