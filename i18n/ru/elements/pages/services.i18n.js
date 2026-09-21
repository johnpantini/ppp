import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/ru/elements/pages/services phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $servicesPage: {
      listHeader: 'Список сервисов',
      installService: 'Установить сервис',
      or: 'Или',
      orByType: 'Или по типу',
      allServices: 'Все сервисы',
      removedServices: 'Удалённые сервисы',
      typeColumn: 'Тип',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      versionColumn: 'Версия',
      actualVersionColumn: 'Последняя версия',
      stateColumn: 'Состояние',
      isolationColumn: 'Изоляция',
      actionsColumn: 'Действия',
      removedBadge: 'Удалён',
      isolated: 'Изолирован',
      update: 'Обновить'
    }
  });
}
