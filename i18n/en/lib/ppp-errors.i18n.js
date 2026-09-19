export default function (i18n) {
  i18n.extend({
    $pppErrors: {
      E_NO_PROXY_CONNECTION: 'No connection to proxy',
      E_NO_MONGODB_CONNECTION: 'No connection to the MongoDB database',
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
        'Unknown error. See browser developer tools console for details',
      E_UNKNOWN_ERROR: 'Unknown error',
      E_INVALID_VALUE: 'This value is not allowed',
      E_VALUE_MUST_BE_POSITIVE: 'The value must be positive'
    },
    $exceptions: {
      EndpointDuplicateKey:
        'An endpoint with this method and route already exists',
      FunctionDuplicateName: 'A function with this name already exists',
      InvalidParameter: 'Invalid MongoDB Realm cloud function parameter',
      FunctionExecutionError: 'MongoDB Realm cloud function execution error',
      OperationError: 'Failed to decrypt data, check your master password',
      MongoDBError: 'MongoDB Realm error, see browser console for details',
      InvalidCharacterError: 'The data to decode contains errors',
      SyntaxError: 'Syntax error in code or data',
      TypeError: 'A value has an unexpected type. Contact the developers',
      ReferenceError:
        'Reference to an undefined variable. Contact the developers'
    },
    $traderErrors: {
      E_UNKNOWN: 'Unknown trader error.',
      E_REQUEST_TIMEOUT: 'Request timeout.',
      E_TRADING_ACCOUNT_NOT_FOUND: 'Trading account not found.',
      E_NO_LOCATES_FOR_ACCOUNT_SYMBOL: 'No locates for account/symbol.',
      E_ALPACA_ONLY_DAY_ORDERS_ALLOWED_FOR_HTB:
        'Only day orders are allowed for HTB instruments.',
      E_NOT_AVAILABLE_FOR_SHORT:
        'The instrument is not available for short sale.',
      E_SIZE_CANT_BE_ZERO: 'The size value cannot be zero.',
      E_PRICE_MUST_BE_POSITIVE: 'Price must be positive.',
      E_INSUFFICIENT_FUNDS: 'Insufficient funds.',
      E_INSUFFICIENT_PRIVILEGES: 'Insufficient privileges.',
      E_NO_QUALIFICATION:
        'No required qualification to trade this instrument.',
      E_ROUTING_ERROR: 'Routing error.',
      E_INSTRUMENT_NOT_TRADEABLE: 'The instrument is not currently traded.',
      E_MARKET_ORDERS_NOT_SUPPORTED: 'Market orders are not supported.',
      E_LOCATE_FAILED: 'Stock locate request failed.',
      E_LIMIT_ORDERS_ONLY: 'Only limit orders are allowed at the moment.',
      E_COMMISSION_CALCULATION_ERROR: 'Failed to calculate commission.',
      E_AUTHORIZATION_ERROR: 'Authorization error.',
      E_UTEX_BLOCK_ERROR: 'An active UTEX block was found.',
      E_UTEX_LOW_AVERAGE_DAY_VOLUME_ON_INSTRUMENT:
        'Low-liquidity instrument, the order was rejected by UTEX.',
      E_INTERNAL_BROKER_ERROR: 'Internal broker error.',
      E_CLOSING_ORDERS_ONLY: 'Only position-closing orders are allowed now.',
      E_MARKET_IS_CLOSED: 'The market is closed now.',
      E_NO_API_AVAILABLE_FOR_INSTRUMENT:
        'API trading is not available for this instrument.',
      E_ACCOUNT_CLOSED: 'The trading account is closed.',
      E_ACCOUNT_BLOCKED: 'The trading account is blocked.',
      E_PRICE_OUT_OF_LIMITS:
        'The price is out of the instrument or trade limits.',
      E_WRONG_ORDER_TYPE: 'Wrong order type.',
      E_INACTIVE_TRADING_SESSION: 'The trading session is not active.',
      E_NO_ACCESS_TOKEN: 'Access token not found or inactive.',
      E_CONFIRMATION_NEEDED: 'Operation confirmation required.',
      E_OPERATION_IN_PROGRESS: 'The operation is still in progress.',
      E_RATE_LIMIT_EXCEEDED: 'Rate limit exceeded.',
      E_ORDER_BLOCKED_BY_EXCHANGE: 'Order blocked by the exchange',
      E_INCORRECT_PRICE: 'Invalid order price.',
      E_INCORRECT_QUANTITY: 'Invalid order quantity.',
      E_INCORRECT_PRICE_OR_QUANTITY: 'Invalid order price or quantity.',
      E_WRONG_ORDER_PARAMETERS: 'Invalid order parameters.',
      E_UNSUPPORTED_INSTRUMENT: 'The instrument is not supported.',
      E_ORDER_REJECTED_BY_EXCHANGE: 'Order rejected by exchange.',
      E_QUANTITY_MUST_BE_GE_$VALUE: 'Quantity must be at least %{value}.',
      E_QUANTITY_MUST_BE_DIVISIBLE_BY_$VALUE:
        'Quantity must be a multiple of %{value}.',
      E_PRICE_MUST_BE_GE_$VALUE: 'Price must be at least %{value}.',
      E_PRICE_MUST_BE_LE_$VALUE: 'Price must not exceed %{value}.',
      E_MIN_PRICE_STEP_MUST_BE_$VALUE: 'Minimum price step: %{value}.',
      E_TRADER_IS_CLOSED: 'Trader is out of service.',
      E_TRADER_IS_NOT_COMPATIBLE:
        'The trader is not compatible with this order.',
      E_ORDER_EXISTS: 'The order already exists.',
      E_ORDER_NOT_FOUND: 'Order not found.',
      E_MISSING_ORDER_CODE: 'Missing order code.'
    }
  });
}
