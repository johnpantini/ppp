import $const from '../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $collection: {
      apis: 'API',
      brokers: 'Брокеры',
      endpoints: 'Конечные точки',
      extensions: 'Дополнения',
      instruments: 'Инструменты',
      servers: 'Серверы',
      services: 'Сервисы',
      settings: 'Параметры',
      bots: 'Боты',
      traders: 'Трейдеры',
      widgets: 'Шаблоны виджетов',
      orders: 'Шаблоны заявок',
      workspaces: 'Терминалы'
    },
    $sideNav: {
      newWorkspace: 'Новый терминал'
    }
  });
}
