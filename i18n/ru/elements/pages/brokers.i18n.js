import $const from '../../lib/const.i18n.js';

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
