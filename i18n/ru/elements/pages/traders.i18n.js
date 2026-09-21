import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/ru/elements/pages/traders phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $tradersPage: {
      traderListTitle: 'Список трейдеров',
      addTrader: 'Добавить трейдера',
      or: 'Или',
      allTraders: 'Все трейдеры',
      removedTraders: 'Удалённые трейдеры',
      orByType: 'Или по типу',
      typeColumn: 'Тип',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      versionColumn: 'Версия',
      actionsColumn: 'Действия'
    }
  });
}
