import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/ru/elements/pages/brokers phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $brokersPage: {
      title: 'Список брокеров',
      addBroker: 'Добавить брокера',
      type: 'Тип',
      createdAt: 'Дата создания',
      updatedAt: 'Последнее изменение',
      version: 'Версия',
      actions: 'Действия'
    }
  });
}
