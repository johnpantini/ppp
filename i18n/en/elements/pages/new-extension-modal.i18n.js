export default function (i18n) {
  i18n.extend({
    $newExtensionModalPage: {
      manifest: 'Manifest',
      manifestDescription:
        'Enter the manifest URL (the address of the ppp.json file).',
      templateUrlPlaceholder: 'You can choose a template link here',
      liquidEquities: 'Margin instruments',
      titleDescription:
        'The name to display in the side navigation under the extensions section.',
      installExtension: 'Install the extension',
      extensionAlreadyInstalled: 'This extension is already installed',
      invalidManifestUrl: 'Invalid manifest URL',
      manifestCannotBeRead: 'This manifest cannot be read',
      manifestContainsErrors: 'The manifest contains errors and cannot be used'
    }
  });
}
