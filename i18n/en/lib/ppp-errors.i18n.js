export default function (i18n) {
  i18n.extend({
    $pppErrors: {
      E_NO_PROXY_CONNECTION: 'No connection to proxy',
      E_NO_MONGODB_CONNECTION: 'No connection to the alternative database',
      E_BROKEN_ATLAS_REALM_LINK:
        'Missing link between the database and MongoDB application',
      E_OFFLINE_MONGODB_APP:
        'MongoDB application is offline or disabled due to inactivity',
      E_CLOUD_SERVICES_MISCONFIGURATION_PLEASE_WAIT:
        'Cloud services configuration failure, please wait...',
      E_REQUIRED_FIELD: 'This field is required',
      E_DOCUMENT_CONFLICT: 'The document cannot be saved',
      E_DOCUMENT_NOT_FOUND: 'Document not found',
      E_FETCH_FAILED: 'Failed to fetch, see browser developer tools console',
      E_BAD_FORM: 'Form filled with errors or not completely filled',
      E_BAD_URL: 'This URL cannot be used',
      E_BAD_DATE: 'Invalid date format',
      E_UNKNOWN:
        'Unknown error. See browser developer tools console for details'
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
      E_REQUEST_TIMEOUT: 'Request timeout.',
      E_TRADING_ACCOUNT_NOT_FOUND: 'Trading account not found.',
      E_NOT_AVAILABLE_FOR_SHORT:
        'The instrument is not available for short sale.',
      E_SIZE_CANT_BE_ZERO: 'The size value cannot be zero.',
      E_PRICE_MUST_BE_POSITIVE: 'Цена должна быть положительной.',
      E_INSUFFICIENT_FUNDS: 'Insufficient funds.',
      E_INSUFFICIENT_PRIVILEGES: 'Недостаточно прав.',
      E_NO_QUALIFICATION:
        'Нет необходимой квалификации для торговли инструментом.',
      E_ROUTING_ERROR: 'Routing error.',
      E_INSTRUMENT_NOT_TRADEABLE: 'Инструмент сейчас не торгуется.',
      E_MARKET_ORDERS_NOT_SUPPORTED: 'Market orders are not supported.',
      E_LOCATE_FAILED: 'Stock locate request failed.',
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
      E_WRONG_ORDER_TYPE: 'Wrong order type.',
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
      E_ORDER_REJECTED_BY_EXCHANGE: 'Order rejected by exchange.',
      E_QUANTITY_MUST_BE_GE_$VALUE: 'Количество должно быть не менее %{value}.',
      E_QUANTITY_MUST_BE_DIVISIBLE_BY_$VALUE:
        'Количество должно быть кратным %{value}.',
      E_PRICE_MUST_BE_GE_$VALUE: 'Цена должна быть не ниже %{value}.',
      E_PRICE_MUST_BE_LE_$VALUE: 'Цена должна быть не выше %{value}.',
      E_MIN_PRICE_STEP_MUST_BE_$VALUE: 'Минимальный шаг цены: %{value}.',
      E_TRADER_IS_CLOSED: 'Трейдер сейчас не работает.',
      E_TRADER_IS_NOT_COMPATIBLE: 'Трейдер не поддерживается для этой заявки.',
      E_ORDER_EXISTS: 'Заявка уже существует.'
    }
  });
}
