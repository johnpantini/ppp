export default function (i18n) {
  i18n.extend({
    $pppErrors: {
      E_NO_PROXY_CONNECTION: 'Нет связи с прокси',
      E_NO_MONGODB_CONNECTION: 'Нет связи с альтернативной базой данных',
      E_BROKEN_ATLAS_REALM_LINK:
        'Отсутствует связь между базой данных и приложением MongoDB',
      E_OFFLINE_MONGODB_APP:
        'Приложение MongoDB не в сети или отключено за неактивность',
      E_CLOUD_SERVICES_MISCONFIGURATION_PLEASE_WAIT:
        'Сбой настройки облачных сервисов, пожалуйста, подождите...',
      E_REQUIRED_FIELD: 'Это поле обязательно',
      E_DOCUMENT_CONFLICT: 'Документ не может быть записан',
      E_DOCUMENT_NOT_FOUND: 'Документ не найден',
      E_FETCH_FAILED: 'Ошибка сетевого запроса, подробности в консоли браузера',
      E_BAD_FORM: 'Форма заполнена с ошибками или не полностью',
      E_BAD_URL: 'Этот URL не может быть использован',
      E_BAD_DATE: 'Неверный формат даты',
      E_UNKNOWN: 'Неизвестная ошибка. Подробности в консоли браузера'
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
    },
    $traderErrors: {
      E_UNKNOWN: 'Неизвестная ошибка трейдера.',
      E_REQUEST_TIMEOUT: 'Запрос превысил время ожидания.',
      E_TRADING_ACCOUNT_NOT_FOUND: 'Торговый счёт не найден.',
      E_NOT_AVAILABLE_FOR_SHORT:
        'Невозможно открыть короткую позицию по инструменту.',
      E_SIZE_CANT_BE_ZERO: 'Объём должен быть ненулевым.',
      E_PRICE_MUST_BE_POSITIVE: 'Цена должна быть положительной.',
      E_INSUFFICIENT_FUNDS: 'Недостаточно активов для совершения сделки.',
      E_INSUFFICIENT_PRIVILEGES: 'Недостаточно прав.',
      E_NO_QUALIFICATION:
        'Нет необходимой квалификации для торговли инструментом.',
      E_ROUTING_ERROR: 'Ошибка выбора маршрута исполнения.',
      E_INSTRUMENT_NOT_TRADEABLE: 'Инструмент сейчас не торгуется.',
      E_MARKET_ORDERS_NOT_SUPPORTED: 'Рыночные заявки не поддерживаются.',
      E_LOCATE_FAILED: 'Не удалось запросить акции в займ.',
      E_LIMIT_ORDERS_ONLY:
        'В настоящий момент возможно выставление только лимитных заявок.',
      E_COMMISSION_CALCULATION_ERROR: 'Не удалось рассчитать комиссию.',
      E_AUTHORIZATION_ERROR: 'Ошибка авторизации.',
      E_UTEX_BLOCK_ERROR: 'Найдена активная блокировка UTEX.',
      E_UTEX_LOW_AVERAGE_DAY_VOLUME_ON_INSTRUMENT:
        'Низколиквидный инструмент, заявка отклонена UTEX.',
      E_INTERNAL_BROKER_ERROR: 'Внутренняя ошибка на стороне брокера.',
      E_CLOSING_ORDERS_ONLY: 'Сейчас можно только сокращать позиции.',
      E_MARKET_IS_CLOSED: 'Рынок сейчас закрыт.',
      E_NO_API_AVAILABLE_FOR_INSTRUMENT:
        'Для данного инструмента недоступна торговля через API.',
      E_ACCOUNT_CLOSED: 'Торговый счёт закрыт.',
      E_ACCOUNT_BLOCKED: 'Торговый счёт заблокирован.',
      E_PRICE_OUT_OF_LIMITS:
        'Цена вне лимитов по инструменту или цена сделки вне лимита.',
      E_WRONG_ORDER_TYPE: 'Некорректный тип заявки.',
      E_INACTIVE_TRADING_SESSION: 'Торговая сессия не идёт.',
      E_NO_ACCESS_TOKEN: 'Токен доступа не найден или не активен.',
      E_CONFIRMATION_NEEDED: 'Требуется подтверждение операции.',
      E_RATE_LIMIT_EXCEEDED: 'Превышен лимит запросов.',
      E_ORDER_BLOCKED_BY_EXCHANGE: 'Заявка заблокирована биржей',
      E_INCORRECT_PRICE: 'Недопустимая цена в заявке.',
      E_INCORRECT_QUANTITY: 'Недопустимое количество в заявке.',
      E_INCORRECT_PRICE_OR_QUANTITY:
        'Недопустимая цена или количество в заявке.',
      E_WRONG_ORDER_PARAMETERS: 'Ошибка параметров заявки.',
      E_UNSUPPORTED_INSTRUMENT: 'Инструмент не поддерживается.',
      E_ORDER_REJECTED_BY_EXCHANGE: 'Заявка была отменена биржей.',
      E_QUANTITY_MUST_BE_GE_$VALUE: 'Количество должно быть не менее %{value}.',
      E_PRICE_MUST_BE_GE_$VALUE: 'Цена должна быть не ниже %{value}.',
      E_QUANTITY_MUST_BE_DIVISIBLE_BY_$VALUE:
        'Количество должно быть кратным %{value}.',
      E_PRICE_MUST_BE_LE_$VALUE: 'Цена должна быть не выше %{value}.',
      E_MIN_PRICE_STEP_MUST_BE_$VALUE: 'Минимальный шаг цены: %{value}.',
      E_TRADER_IS_CLOSED: 'Трейдер сейчас не работает.',
      E_TRADER_IS_NOT_COMPATIBLE: 'Трейдер не поддерживается для этой заявки.',
      E_ORDER_EXISTS: 'Заявка уже существует.',
      E_ORDER_NOT_FOUND: 'Заявка не найдена.',
      E_MISSING_ORDER_CODE: 'Код заявки отсутствует.'
    }
  });
}
