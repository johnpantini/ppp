export default function (i18n) {
  i18n.extend({
    $importKeysModalPage: {
      masterPassword: 'Master password',
      masterPasswordDescription:
        'It was set during the initial application setup.',
      enterPasswordPlaceholder: 'Enter the password',
      compactRepresentation: 'Compact representation',
      compactRepresentationDescription:
        'Base64 format. Copy it from a previously configured application.',
      pasteRepresentationPlaceholder: 'Paste the representation',
      importKeys: 'Import keys',
      importedKeysAreStale:
        'The imported keys are out of date. Reload the page and enter them again. Then set up cloud functions and triggers.',
      importedKeysAreOk:
        'Everything is fine. Reload the page to start using the application.'
    }
  });
}
