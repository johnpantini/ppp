import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/ru/elements/pages/orders phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $ordersPage: {
      listHeader: 'Список шаблонов заявок',
      addOrderTemplate: 'Добавить шаблон заявки',
      typeColumn: 'Тип',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      versionColumn: 'Версия',
      actionsColumn: 'Действия'
    }
  });
}
