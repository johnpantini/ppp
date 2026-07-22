import $const from '../lib/const.i18n.js';
import $g from '../lib/general.i18n.js';

export default function (i18n) {
  $const(i18n);
  $g(i18n);

  i18n.extend({
    $operations: {
      operationInProgress: 'Операция выполняется',
      operationSucceeded: 'Операция успешно выполнена',
      operationFailedDetailsInConsole:
        'Операция не выполнена, подробности в консоли браузера'
    },
    $page: {
      arbitraryDocumentName:
        'Произвольное имя, чтобы ссылаться на этот документ, когда потребуется.',
      arbitraryProfileName:
        'Произвольное имя, чтобы ссылаться на этот профиль, когда потребуется.',
      connectionName: 'Название подключения',
      serviceName: 'Название сервиса',
      enterValue: 'Введите значение',
      enterName: 'Введите название',
      valueInRange: 'Введите значение в диапазоне от %{min} до %{max}',
      saveToPPP: 'Сохранить в PPP',
      goToTheList: 'Перейти к списку',
      token: 'Токен',
      apiKey: 'Ключ API',
      secret: 'Секрет',
      accessToken: 'Токен доступа',
      invalidToken: 'Неверный токен',
      urlCannotBeUsed: 'Этот URL не может быть использован',
      codeContainsErrors: 'Код содержит ошибки.',
      documentRemovedBadge: 'Документ удалён',
      documentRemovalTitle: 'Удаление документа',
      confirmDocumentRemoval:
        'Подтвердите, что собираетесь удалить документ «%{name}».',
      irreversibleDocumentRemoval:
        'Документ будет удалён безвозвратно. Подтвердите действие.',
      documentRemovedToast: 'Документ удалён.',
      allocationNotFound: 'Размещение не найдено.',
      conflictPrefix: 'Документ с таким названием уже существует, перейдите по',
      conflictLink: 'ссылке',
      conflictSuffix: 'для редактирования.',
      couldNotReadVersion: 'Не удалось прочитать версию',
      couldNotTrackServiceVersion: 'Не удалось отследить версию сервиса.',
      serviceRestarted: 'Сервис перезапущен.',
      serviceRestartTitle: 'Перезапуск сервиса',
      serviceStopped: 'Сервис остановлен.',
      serviceStopTitle: 'Остановка сервиса',
      noConnector: 'Запрос невозможен: отсутствует соединитель.',
      functionExecutionFailed: 'Не удалось выполнить функцию.',
      sqlQueryFailed: 'SQL-запрос завершился с ошибкой.',
      terminalDatabaseQueryInProgress: 'Выполняется запрос к базе данных...',
      terminalServerSetupInProgress: 'Выполняется настройка сервера...',
      terminalDoneCanClose: 'Операция выполнена, это окно можно закрыть.',
      terminalOperationFailedWithStatus:
        'Операция завершилась с ошибкой %{status}'
    }
  });
}
