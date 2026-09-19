export default function (i18n) {
  i18n.extend({
    $newExtensionModalPage: {
      manifest: 'Манифест',
      manifestDescription: 'Введите URL манифеста (адрес файла ppp.json).',
      templateUrlPlaceholder: 'Здесь можно выбрать ссылку по шаблону',
      liquidEquities: 'Маржинальные инструменты',
      titleDescription:
        'Название для отображения в боковой панели в разделе дополнений.',
      installExtension: 'Установить дополнение',
      extensionAlreadyInstalled: 'Это дополнение уже установлено',
      invalidManifestUrl: 'Неверный URL манифеста',
      manifestCannotBeRead: 'Этот манифест не может быть прочитан',
      manifestContainsErrors:
        'Манифест содержит ошибки и не может быть использован'
    }
  });
}
