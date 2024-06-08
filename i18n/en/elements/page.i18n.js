import $const from '../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $operations: {
      operationInProgress: 'Операция выполняется',
      operationSucceeded: 'Операция успешно выполнена',
      operationFailedDetailsInConsole:
        'Операция не выполнена, подробности в консоли браузера'
    }
  });
}
