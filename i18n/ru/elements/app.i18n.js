import $const from '../lib/const.i18n.js';
import $g from '../lib/general.i18n.js';

export default function (i18n) {
  $const(i18n);
  $g(i18n);

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
      newWorkspace: 'Новый терминал',
      trading: 'Торговля',
      connections: 'Подключения',
      configuration: 'Конфигурация',
      update: 'Обновление',
      cloudServices: 'Облачные сервисы',
      updatesCenter: 'Центр обновлений'
    },
    $app: {
      confirmActionTitle: 'Подтвердите действие',
      confirmationNeeded: 'Необходимо подтверждение, чтобы продолжить.',
      componentsSetupTitle: 'Настройка компонентов приложения',
      updateReadyTitle: 'Обновление готово',
      newVersionReady:
        'Новая версия приложения (%{version}) готова к использованию.',
      clickToUpdate: 'Нажмите, чтобы обновиться.',
      updateInProgressTitle: 'Идёт обновление',
      pageWillReloadAutomatically:
        'Страница будет перезагружена автоматически.',
      placeWidgetTitle: 'Разместить виджет'
    }
  });
}
