export default function (i18n) {
  i18n.extend({
    $importKeysModalPage: {
      masterPassword: 'Мастер-пароль',
      masterPasswordDescription: 'Задавался при первой настройке приложения.',
      enterPasswordPlaceholder: 'Введите пароль',
      compactRepresentation: 'Компактное представление',
      compactRepresentationDescription:
        'Формат Base64. Скопируйте из настроенного ранее приложения.',
      pasteRepresentationPlaceholder: 'Вставьте представление',
      importKeys: 'Импортировать ключи',
      importedKeysAreStale:
        'Импортированные ключи устарели. Обновите страницу и введите их заново. Затем настройте облачные функции и триггеры.',
      importedKeysAreOk:
        'Всё в порядке. Обновите страницу, чтобы пользоваться приложением.'
    }
  });
}
