export default function (i18n) {
  i18n.extend({
    $pppErrors: {
      E_REQUIRED_FIELD: 'Это поле обязательно',
      E_DOCUMENT_CONFLICT: 'Документ не может быть записан',
      E_DOCUMENT_NOT_FOUND: 'Документ не найден',
      E_FETCH_FAILED: 'Ошибка сетевого запроса',
      E_BAD_FORM: 'Форма заполнена с ошибками или не полностью',
      E_UNKNOWN: 'Неизвестная ошибка'
    },
    $exceptions: {
      EndpointDuplicateKey:
        'Конечная точка с таким методом и маршрутом уже существует',
      FunctionDuplicateName: 'Функция с таким именем уже существует',
      InvalidParameter: 'Неверный параметр облачной функции MongoDB Realm',
      FunctionExecutionError:
        'Ошибка выполнения облачной функции MongoDB Realm',
      OperationError: 'Не удалось дешифровать данные, проверьте мастер-пароль',
      MongoDBError: 'Ошибка MongoDB Realm, подробности в консоли браузера',
      InvalidCharacterError: 'Данные для декодирования содержат ошибки',
      SyntaxError: 'Синтаксическая ошибка в коде или данных',
      TypeError: 'Значение имеет не ожидаемый тип. Свяжитесь с разработчиками',
      ReferenceError:
        'Обращение к несуществующей переменной. Свяжитесь с разработчиками'
    }
  });
}
