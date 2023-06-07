import $const from '../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $collection: {
      apis: 'API',
      brokers: 'Брокеры',
      extensions: 'Дополнения',
      instruments: 'Инструменты',
      services: 'Сервисы',
      settings: 'Параметры',
      bots: 'Боты',
      traders: 'Трейдеры',
      widgets: 'Виджеты',
      workspaces: 'Терминалы'
    },
    $sideNav: {
      newWorkspace: 'Новый терминал'
    }
  });
}
