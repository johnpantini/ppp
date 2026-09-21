/**
 * Registers the i18n/ru/elements/pages/order-custom phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $orderCustomPage: {
      templateNameHeader: 'Название шаблона',
      namePlaceholder: 'Заявка',
      baseUrlHeader: 'Базовая ссылка на директорию заявки',
      baseUrlDescription:
        'Ссылка на директорию на сервере, где находятся файлы реализации заявки.',
      continueButton: 'Продолжить',
      urlCannotBeLoaded: 'Этот URL не может быть загружен',
      loadOrderTemplateTitle: 'Загрузка шаблона заявки по ссылке'
    }
  });
}
