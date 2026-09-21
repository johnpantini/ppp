/**
 * Registers the i18n/en/elements/pages/settings-ui phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $settingsUiPage: {
      appLanguage: 'Application language',
      appLanguageDescription: 'Choose the application language.',
      selectLanguage: 'Select a language',
      flags: 'Flags',
      flagsDescription: 'Settings that take a Yes or No value.',
      closeModalsOnEsc: 'Close modal windows with the Esc key',
      saveSettings: 'Save settings'
    }
  });
}
