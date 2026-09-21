import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/ru/elements/pages/apis phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $apisPage: {
      listHeader: 'Список внешних API',
      connectApi: 'Подключить API',
      typeColumn: 'Тип',
      createdAtColumn: 'Дата создания',
      updatedAtColumn: 'Последнее изменение',
      versionColumn: 'Версия',
      actionsColumn: 'Действия'
    }
  });
}
