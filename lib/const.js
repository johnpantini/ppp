export const PAGE_STATUS = {
  NOT_READY: 'not-ready',
  READY: 'ready',
  OPERATION_STARTED: 'operation-started',
  OPERATION_ENDED: 'operation-ended',
  OPERATION_FAILED: 'operation-failed'
};

export const VERSIONING_STATUS = {
  OK: 'ok',
  OLD: 'old',
  OFF: 'off'
};

export const SERVER_TYPES = {
  PASSWORD: 'password',
  KEY: 'key'
};

export const SERVER_STATE = {
  OK: 'ok',
  FAILED: 'failed'
};

export const APIS = {
  SUPABASE: 'supabase',
  PUSHER: 'pusher',
  ASTRADB: 'astradb',
  SEATABLE: 'seatable',
  NORTHFLANK: 'northflank',
  RENDER: 'render',
  REDIS: 'redis',
  CLOUDFLARE: 'cloudflare',
  POSTGRESQL: 'postgresql',
  BITIO: 'bitio',
  YC: 'yc'
};

export const SERVICES = {
  PPP_ASPIRANT_WORKER: 'ppp-aspirant-worker',
  CLOUDFLARE_WORKER: 'cloudflare-worker',
  CLOUD_PPP_ASPIRANT: 'cloud-ppp-aspirant',
  DEPLOYED_PPP_ASPIRANT: 'deployed-ppp-aspirant',
  SYSTEMD_PPP_ASPIRANT: 'systemd-ppp-aspirant',
  SUPABASE_PARSER: 'supabase-parser',
  NYSE_NSDQ_HALTS: 'nyse-nsdq-halts'
};

export const SERVICE_STATE = {
  ACTIVE: 'active',
  STOPPED: 'stopped',
  FAILED: 'failed'
};

export const EXCHANGE = {
  BINANCE: 'BINANCE',
  BYBIT_LINEAR: 'BYBIT_LINEAR', // Derivatives
  BYBIT_SPOT: 'BYBIT_SPOT', // Spot
  MOEX: 'MOEX',
  SPBX: 'SPBX',
  US: 'US',
  UTEX_MARGIN_STOCKS: 'UTEX_MARGIN_STOCKS',
  RUS: 'RUS', // SPBX + MOEX
  CUSTOM: 'CUSTOM', // Special cases (Finam)
  MOEX_SECURITIES: 'MOEX_SECURITIES', // Moex Equity & Bond Market
  MOEX_FORTS: 'MOEX_FORTS',
  MOEX_CURRENCY: 'MOEX_CURRENCY',
  CAPITALCOM: 'CAPITALCOM'
};

export const CRYPTO_EXCHANGES = [
  EXCHANGE.BINANCE,
  EXCHANGE.BYBIT_SPOT,
  EXCHANGE.BYBIT_LINEAR
];

export const BROKERS = {
  ALOR: 'alor',
  TINKOFF: 'tinkoff',
  UTEX: 'utex',
  PSINA: 'psina',
  BINANCE: 'binance',
  HUOBI: 'huobi',
  BYBIT: 'bybit',
  MEXC: 'mexc',
  FINAM: 'finam',
  IB: 'ib',
  CAPITALCOM: 'capitalcom'
};

export const ORDERS = {
  STOP_LOSS_TAKE_PROFIT: 'stop-loss-take-profit',
  CUSTOM: 'custom'
};

export const INSTRUMENT_DICTIONARY = {
  BINANCE: 'BINANCE',
  BYBIT_LINEAR: 'BYBIT_LINEAR',
  BYBIT_SPOT: 'BYBIT_SPOT',
  UTEX_MARGIN_STOCKS: 'UTEX_MARGIN_STOCKS',
  PSINA_US_STOCKS: 'PSINA_US_STOCKS',
  ALOR_SPBX: 'ALOR_SPBX',
  ALOR_MOEX_SECURITIES: 'ALOR_MOEX_SECURITIES',
  ALOR_FORTS: 'ALOR_FORTS',
  TINKOFF: 'TINKOFF',
  FINAM: 'FINAM',
  IB: 'IB',
  CAPITALCOM: 'CAPITALCOM'
};

export const TIMEFRAME = {
  TICK: 'TICK',
  '1s': '1s',
  '5s': '5s',
  '15s': '15s',
  '30s': '30s',
  '1m': '1m',
  '2m': '2m',
  '3m': '3m',
  '5m': '5m',
  '10m': '10m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '1D': '1D',
  '1W': '1W',
  '1M': '1M',
  '1Q': '1Q',
  '1Y': '1Y'
};

export const TRADERS = {
  ALOR_OPENAPI_V2: 'alor-openapi-v2',
  ALPACA_V2_PLUS: 'alpaca-v2-plus',
  TINKOFF_GRPC_WEB: 'tinkoff-grpc-web',
  IB: 'ib',
  CAPITALCOM: 'capitalcom',
  UTEX_MARGIN_STOCKS: 'utex-margin-stocks',
  BINANCE_V3: 'binance-v3',
  MEXC_V3: 'mexc-v3',
  BYBIT_V5: 'bybit-v5',
  FINAM_TRADE_API: 'finam-trade-api',
  CUSTOM: 'custom'
};

export const TRADER_CAPS = {
  CAPS_LIMIT_ORDERS: 'caps-limit-orders',
  CAPS_MARKET_ORDERS: 'caps-marker-orders',
  CAPS_ACTIVE_ORDERS: 'caps-active-orders',
  CAPS_ORDERBOOK: 'caps-orderbook',
  CAPS_TIME_AND_SALES: 'caps-time-and-sales',
  CAPS_TIME_AND_SALES_HISTORY: 'caps-time-and-sales-history',
  CAPS_POSITIONS: 'caps-positions',
  CAPS_TIMELINE: 'caps-timeline',
  CAPS_LEVEL1: 'caps-level1',
  // Premarket & After Hours.
  CAPS_EXTENDED_LEVEL1: 'caps-extended-level1',
  CAPS_CHARTS: 'caps-charts',
  CAPS_MIC: 'caps-mic',
  CAPS_ORDER_DESTINATION: 'caps-order-destination',
  CAPS_ORDER_TIF: 'caps-order-tif',
  CAPS_ORDER_DISPLAY_SIZE: 'caps-order-display-size',
  CAPS_US_NBBO: 'caps-us-nbbo',
  CAPS_NSDQ_TOTALVIEW: 'caps-nsdq-totalview',
  CAPS_ARCABOOK: 'caps-arcabook',
  CAPS_BLUEATS: 'caps-blueats',
  CAPS_NYSE_OPENBOOK: 'caps-nyse-openbook',
  CAPS_DIRECTEDGE_BOOK: 'caps-directedge-book',
  CAPS_BZX_BOOK: 'caps-bzx-book',
  CAPS_NOII: 'caps-noii'
};

export const TRADER_DATUM = {
  // Trader-related events.
  TRADER: 'trader',
  DAY_VOLUME: 'day-volume',
  STATUS: 'status',
  TRADING_STATUS: 'trading-status',
  LAST_PRICE: 'last-price',
  LAST_PRICE_ABSOLUTE_CHANGE: 'last-price-absolute-change',
  LAST_PRICE_RELATIVE_CHANGE: 'last-price-relative-change',
  EXTENDED_LAST_PRICE: 'extended-last-price',
  EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE: 'extended-last-price-absolute-change',
  EXTENDED_LAST_PRICE_RELATIVE_CHANGE: 'extended-last-price-relative-change',
  BEST_BID: 'best-bid',
  BEST_ASK: 'best-ask',
  MIDPOINT: 'midpoint',
  ORDERBOOK: 'orderbook',
  MARKET_PRINT: 'market-print',
  POSITION: 'position',
  POSITION_SIZE: 'position-size',
  POSITION_AVERAGE: 'position-average',
  ACTIVE_ORDER: 'active-order',
  CONDITIONAL_ORDER: 'conditional-order',
  TIMELINE_ITEM: 'timeline-item',
  CANDLE: 'candle',
  NOII: 'noii'
};

export const COLUMN_SOURCE = {
  INSTRUMENT: 'instrument',
  SYMBOL: 'symbol',
  INSTRUMENT_TYPE: 'instrument-type',
  POSITION_AVAILABLE: 'position-available',
  POSITION_AVERAGE: 'position-average',
  TOTAL_AMOUNT: 'total-amount',
  EXTENDED_TOTAL_AMOUNT: 'extended-total-amount',
  BEST_BID: 'best-bid',
  BEST_ASK: 'best-ask',
  LAST_PRICE: 'last-price',
  LAST_PRICE_ABSOLUTE_CHANGE: 'last-price-absolute-change',
  LAST_PRICE_RELATIVE_CHANGE: 'last-price-relative-change',
  EXTENDED_LAST_PRICE: 'extended-last-price',
  EXTENDED_LAST_PRICE_ABSOLUTE_CHANGE: 'extended-last-price-absolute-change',
  EXTENDED_LAST_PRICE_RELATIVE_CHANGE: 'extended-last-price-relative-change',
  PL_ABSOLUTE: 'pl-absolute',
  PL_RELATIVE: 'pl-relative',
  EXTENDED_PL_ABSOLUTE: 'extended-pl-absolute',
  EXTENDED_PL_RELATIVE: 'extended-pl-relative',
  DAY_VOLUME: 'day-volume',
  TRADING_STATUS: 'trading-status',
  FORMATTED_VALUE: 'formatted-value'
};

export const WIDGET_TYPES = {
  ORDER: 'order',
  SCALPING_BUTTONS: 'scalping-buttons',
  ACTIVE_ORDERS: 'active-orders',
  LIGHT_CHART: 'light-chart',
  ORDERBOOK: 'orderbook',
  TIME_AND_SALES: 'time-and-sales',
  PORTFOLIO: 'portfolio',
  BALANCES: 'balances',
  LIST: 'list',
  TIMELINE: 'timeline',
  CLOCK: 'clock',
  MARQUEE: 'marquee',
  CHART: 'chart',
  CALENDAR: 'calendar',
  TRADES: 'trades',
  POSITIONS: 'positions',
  NOTIFICATIONS: 'notifications',
  SUBSCRIPTIONS: 'subscription',
  RATINGS: 'ratings',
  INSIDER_TRADES: 'insider-trades',
  OPTIONS: 'options',
  SCANNER: 'scanner',
  SCREENER: 'screener',
  PARSER: 'parser',
  NEWS: 'news',
  FRAME: 'frame',
  NOII: 'noii',
  MIGRATION: 'migration',
  OTHER: 'other'
};

// Tinkoff compatible.
export let OPERATION_TYPE;
(function (OPERATION_TYPE) {
  /** OPERATION_TYPE_UNSPECIFIED - Тип операции не определён. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_UNSPECIFIED'] = 0)] =
    'OPERATION_TYPE_UNSPECIFIED';
  /** OPERATION_TYPE_INPUT - Пополнение брокерского счёта. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_INPUT'] = 1)] =
    'OPERATION_TYPE_INPUT';
  /** OPERATION_TYPE_BOND_TAX - Удержание НДФЛ по купонам. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_BOND_TAX'] = 2)] =
    'OPERATION_TYPE_BOND_TAX';
  /** OPERATION_TYPE_OUTPUT_SECURITIES - Вывод ЦБ. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OUTPUT_SECURITIES'] = 3)] =
    'OPERATION_TYPE_OUTPUT_SECURITIES';
  /** OPERATION_TYPE_OVERNIGHT - Доход по сделке РЕПО овернайт. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OVERNIGHT'] = 4)] =
    'OPERATION_TYPE_OVERNIGHT';
  /** OPERATION_TYPE_TAX - Удержание налога. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TAX'] = 5)] =
    'OPERATION_TYPE_TAX';
  /** OPERATION_TYPE_BOND_REPAYMENT_FULL - Полное погашение облигаций. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_BOND_REPAYMENT_FULL'] = 6)] =
    'OPERATION_TYPE_BOND_REPAYMENT_FULL';
  /** OPERATION_TYPE_SELL_CARD - Продажа ЦБ с карты. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_SELL_CARD'] = 7)] =
    'OPERATION_TYPE_SELL_CARD';
  /** OPERATION_TYPE_DIVIDEND_TAX - Удержание налога по дивидендам. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_DIVIDEND_TAX'] = 8)] =
    'OPERATION_TYPE_DIVIDEND_TAX';
  /** OPERATION_TYPE_OUTPUT - Вывод денежных средств. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OUTPUT'] = 9)] =
    'OPERATION_TYPE_OUTPUT';
  /** OPERATION_TYPE_BOND_REPAYMENT - Частичное погашение облигаций. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_BOND_REPAYMENT'] = 10)] =
    'OPERATION_TYPE_BOND_REPAYMENT';
  /** OPERATION_TYPE_TAX_CORRECTION - Корректировка налога. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TAX_CORRECTION'] = 11)] =
    'OPERATION_TYPE_TAX_CORRECTION';
  /** OPERATION_TYPE_SERVICE_FEE - Удержание комиссии за обслуживание брокерского счёта. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_SERVICE_FEE'] = 12)] =
    'OPERATION_TYPE_SERVICE_FEE';
  /** OPERATION_TYPE_BENEFIT_TAX - Удержание налога за материальную выгоду. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_BENEFIT_TAX'] = 13)] =
    'OPERATION_TYPE_BENEFIT_TAX';
  /** OPERATION_TYPE_MARGIN_FEE - Удержание комиссии за непокрытую позицию. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_MARGIN_FEE'] = 14)] =
    'OPERATION_TYPE_MARGIN_FEE';
  /** OPERATION_TYPE_BUY - Покупка ЦБ. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_BUY'] = 15)] =
    'OPERATION_TYPE_BUY';
  /** OPERATION_TYPE_BUY_CARD - Покупка ЦБ с карты. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_BUY_CARD'] = 16)] =
    'OPERATION_TYPE_BUY_CARD';
  /** OPERATION_TYPE_INPUT_SECURITIES - Перевод ценных бумаг из другого депозитария. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_INPUT_SECURITIES'] = 17)] =
    'OPERATION_TYPE_INPUT_SECURITIES';
  /** OPERATION_TYPE_SELL_MARGIN - Продажа в результате Margin-call. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_SELL_MARGIN'] = 18)] =
    'OPERATION_TYPE_SELL_MARGIN';
  /** OPERATION_TYPE_BROKER_FEE - Удержание комиссии за операцию. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_BROKER_FEE'] = 19)] =
    'OPERATION_TYPE_BROKER_FEE';
  /** OPERATION_TYPE_BUY_MARGIN - Покупка в результате Margin-call. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_BUY_MARGIN'] = 20)] =
    'OPERATION_TYPE_BUY_MARGIN';
  /** OPERATION_TYPE_DIVIDEND - Выплата дивидендов. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_DIVIDEND'] = 21)] =
    'OPERATION_TYPE_DIVIDEND';
  /** OPERATION_TYPE_SELL - Продажа ЦБ. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_SELL'] = 22)] =
    'OPERATION_TYPE_SELL';
  /** OPERATION_TYPE_COUPON - Выплата купонов. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_COUPON'] = 23)] =
    'OPERATION_TYPE_COUPON';
  /** OPERATION_TYPE_SUCCESS_FEE - Удержание комиссии SuccessFee. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_SUCCESS_FEE'] = 24)] =
    'OPERATION_TYPE_SUCCESS_FEE';
  /** OPERATION_TYPE_DIVIDEND_TRANSFER - Передача дивидендного дохода. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_DIVIDEND_TRANSFER'] = 25)] =
    'OPERATION_TYPE_DIVIDEND_TRANSFER';
  /** OPERATION_TYPE_ACCRUING_VARMARGIN - Зачисление вариационной маржи. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_ACCRUING_VARMARGIN'] = 26)] =
    'OPERATION_TYPE_ACCRUING_VARMARGIN';
  /** OPERATION_TYPE_WRITING_OFF_VARMARGIN - Списание вариационной маржи. */
  OPERATION_TYPE[
    (OPERATION_TYPE['OPERATION_TYPE_WRITING_OFF_VARMARGIN'] = 27)
  ] = 'OPERATION_TYPE_WRITING_OFF_VARMARGIN';
  /** OPERATION_TYPE_DELIVERY_BUY - Покупка в рамках экспирации фьючерсного контракта. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_DELIVERY_BUY'] = 28)] =
    'OPERATION_TYPE_DELIVERY_BUY';
  /** OPERATION_TYPE_DELIVERY_SELL - Продажа в рамках экспирации фьючерсного контракта. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_DELIVERY_SELL'] = 29)] =
    'OPERATION_TYPE_DELIVERY_SELL';
  /** OPERATION_TYPE_TRACK_MFEE - Комиссия за управление по счёту автоследования. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TRACK_MFEE'] = 30)] =
    'OPERATION_TYPE_TRACK_MFEE';
  /** OPERATION_TYPE_TRACK_PFEE - Комиссия за результат по счёту автоследования. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TRACK_PFEE'] = 31)] =
    'OPERATION_TYPE_TRACK_PFEE';
  /** OPERATION_TYPE_TAX_PROGRESSIVE - Удержание налога по ставке 15%. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TAX_PROGRESSIVE'] = 32)] =
    'OPERATION_TYPE_TAX_PROGRESSIVE';
  /** OPERATION_TYPE_BOND_TAX_PROGRESSIVE - Удержание налога по купонам по ставке 15%. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_BOND_TAX_PROGRESSIVE'] = 33)] =
    'OPERATION_TYPE_BOND_TAX_PROGRESSIVE';
  /** OPERATION_TYPE_DIVIDEND_TAX_PROGRESSIVE - Удержание налога по дивидендам по ставке 15%. */
  OPERATION_TYPE[
    (OPERATION_TYPE['OPERATION_TYPE_DIVIDEND_TAX_PROGRESSIVE'] = 34)
  ] = 'OPERATION_TYPE_DIVIDEND_TAX_PROGRESSIVE';
  /** OPERATION_TYPE_BENEFIT_TAX_PROGRESSIVE - Удержание налога за материальную выгоду по ставке 15%. */
  OPERATION_TYPE[
    (OPERATION_TYPE['OPERATION_TYPE_BENEFIT_TAX_PROGRESSIVE'] = 35)
  ] = 'OPERATION_TYPE_BENEFIT_TAX_PROGRESSIVE';
  /** OPERATION_TYPE_TAX_CORRECTION_PROGRESSIVE - Корректировка налога по ставке 15%. */
  OPERATION_TYPE[
    (OPERATION_TYPE['OPERATION_TYPE_TAX_CORRECTION_PROGRESSIVE'] = 36)
  ] = 'OPERATION_TYPE_TAX_CORRECTION_PROGRESSIVE';
  /** OPERATION_TYPE_TAX_REPO_PROGRESSIVE - Удержание налога за возмещение по сделкам РЕПО по ставке 15%. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TAX_REPO_PROGRESSIVE'] = 37)] =
    'OPERATION_TYPE_TAX_REPO_PROGRESSIVE';
  /** OPERATION_TYPE_TAX_REPO - Удержание налога за возмещение по сделкам РЕПО. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TAX_REPO'] = 38)] =
    'OPERATION_TYPE_TAX_REPO';
  /** OPERATION_TYPE_TAX_REPO_HOLD - Удержание налога по сделкам РЕПО. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TAX_REPO_HOLD'] = 39)] =
    'OPERATION_TYPE_TAX_REPO_HOLD';
  /** OPERATION_TYPE_TAX_REPO_REFUND - Возврат налога по сделкам РЕПО. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TAX_REPO_REFUND'] = 40)] =
    'OPERATION_TYPE_TAX_REPO_REFUND';
  /** OPERATION_TYPE_TAX_REPO_HOLD_PROGRESSIVE - Удержание налога по сделкам РЕПО по ставке 15%. */
  OPERATION_TYPE[
    (OPERATION_TYPE['OPERATION_TYPE_TAX_REPO_HOLD_PROGRESSIVE'] = 41)
  ] = 'OPERATION_TYPE_TAX_REPO_HOLD_PROGRESSIVE';
  /** OPERATION_TYPE_TAX_REPO_REFUND_PROGRESSIVE - Возврат налога по сделкам РЕПО по ставке 15%. */
  OPERATION_TYPE[
    (OPERATION_TYPE['OPERATION_TYPE_TAX_REPO_REFUND_PROGRESSIVE'] = 42)
  ] = 'OPERATION_TYPE_TAX_REPO_REFUND_PROGRESSIVE';
  /** OPERATION_TYPE_DIV_EXT - Выплата дивидендов на карту. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_DIV_EXT'] = 43)] =
    'OPERATION_TYPE_DIV_EXT';
  /** OPERATION_TYPE_TAX_CORRECTION_COUPON - Корректировка налога по купонам. */
  OPERATION_TYPE[
    (OPERATION_TYPE['OPERATION_TYPE_TAX_CORRECTION_COUPON'] = 44)
  ] = 'OPERATION_TYPE_TAX_CORRECTION_COUPON';
  /** OPERATION_TYPE_CASH_FEE - Комиссия за валютный остаток. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_CASH_FEE'] = 45)] =
    'OPERATION_TYPE_CASH_FEE';
  /** OPERATION_TYPE_OUT_FEE - Комиссия за вывод валюты с брокерского счета. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OUT_FEE'] = 46)] =
    'OPERATION_TYPE_OUT_FEE';
  /** OPERATION_TYPE_OUT_STAMP_DUTY - Гербовый сбор. */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OUT_STAMP_DUTY'] = 47)] =
    'OPERATION_TYPE_OUT_STAMP_DUTY';
  /** OPERATION_TYPE_OUTPUT_SWIFT - SWIFT-перевод */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OUTPUT_SWIFT'] = 50)] =
    'OPERATION_TYPE_OUTPUT_SWIFT';
  /** OPERATION_TYPE_INPUT_SWIFT - SWIFT-перевод */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_INPUT_SWIFT'] = 51)] =
    'OPERATION_TYPE_INPUT_SWIFT';
  /** OPERATION_TYPE_OUTPUT_ACQUIRING - Перевод на карту */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OUTPUT_ACQUIRING'] = 53)] =
    'OPERATION_TYPE_OUTPUT_ACQUIRING';
  /** OPERATION_TYPE_INPUT_ACQUIRING - Перевод с карты */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_INPUT_ACQUIRING'] = 54)] =
    'OPERATION_TYPE_INPUT_ACQUIRING';
  /** OPERATION_TYPE_OUTPUT_PENALTY - Комиссия за вывод средств */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OUTPUT_PENALTY'] = 55)] =
    'OPERATION_TYPE_OUTPUT_PENALTY';
  /** OPERATION_TYPE_ADVICE_FEE - Списание оплаты за сервис Советов */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_ADVICE_FEE'] = 56)] =
    'OPERATION_TYPE_ADVICE_FEE';
  /** OPERATION_TYPE_TRANS_IIS_BS - Перевод ценных бумаг с ИИС на Брокерский счет */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TRANS_IIS_BS'] = 57)] =
    'OPERATION_TYPE_TRANS_IIS_BS';
  /** OPERATION_TYPE_TRANS_BS_BS - Перевод ценных бумаг с одного брокерского счета на другой */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_TRANS_BS_BS'] = 58)] =
    'OPERATION_TYPE_TRANS_BS_BS';
  /** OPERATION_TYPE_OUT_MULTI - Вывод денежных средств со счета */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OUT_MULTI'] = 59)] =
    'OPERATION_TYPE_OUT_MULTI';
  /** OPERATION_TYPE_INP_MULTI - Пополнение денежных средств со счета */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_INP_MULTI'] = 60)] =
    'OPERATION_TYPE_INP_MULTI';
  /** OPERATION_TYPE_OVER_PLACEMENT - Размещение биржевого овернайта */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OVER_PLACEMENT'] = 61)] =
    'OPERATION_TYPE_OVER_PLACEMENT';
  /** OPERATION_TYPE_OVER_COM - Списание комиссии */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OVER_COM'] = 62)] =
    'OPERATION_TYPE_OVER_COM';
  /** OPERATION_TYPE_OVER_INCOME - Доход от оверанайта */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OVER_INCOME'] = 63)] =
    'OPERATION_TYPE_OVER_INCOME';
  /** OPERATION_TYPE_OPTION_EXPIRATION - Экспирация */
  OPERATION_TYPE[(OPERATION_TYPE['OPERATION_TYPE_OPTION_EXPIRATION'] = 64)] =
    'OPERATION_TYPE_OPTION_EXPIRATION';
  OPERATION_TYPE[(OPERATION_TYPE['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(OPERATION_TYPE || (OPERATION_TYPE = {}));

export const TRADING_STATUS = {
  UNSPECIFIED: 'UNSPECIFIED',
  NOT_AVAILABLE_FOR_TRADING: 'NOT_AVAILABLE_FOR_TRADING',
  OPENING_PERIOD: 'OPENING_PERIOD',
  CLOSING_PERIOD: 'CLOSING_PERIOD',
  BREAK_IN_TRADING: 'BREAK_IN_TRADING',
  NORMAL_TRADING: 'NORMAL_TRADING',
  CLOSING_AUCTION: 'CLOSING_AUCTION',
  DARK_POOL_AUCTION: 'DARK_POOL_AUCTION',
  DISCRETE_AUCTION: 'DISCRETE_AUCTION',
  OPENING_AUCTION_PERIOD: 'OPENING_AUCTION_PERIOD',
  TRADING_AT_CLOSING_AUCTION_PRICE: 'TRADING_AT_CLOSING_AUCTION_PRICE',
  SESSION_ASSIGNED: 'SESSION_ASSIGNED',
  SESSION_CLOSE: 'SESSION_CLOSE',
  SESSION_OPEN: 'SESSION_OPEN',
  DEALER_NORMAL_TRADING: 'DEALER_NORMAL_TRADING',
  DEALER_BREAK_IN_TRADING: 'DEALER_BREAK_IN_TRADING',
  DEALER_NOT_AVAILABLE_FOR_TRADING: 'DEALER_NOT_AVAILABLE_FOR_TRADING',
  PREMARKET: 'PREMARKET',
  AFTER_HOURS: 'AFTER_HOURS',
  TRADING_SUSPENDED: 'TRADING_SUSPENDED',
  DELISTED: 'DELISTED',
  IPO_TODAY: 'IPO_TODAY'
};

export function isPredefinedWidgetType(widgetType) {
  return [
    WIDGET_TYPES.ORDER,
    WIDGET_TYPES.SCALPING_BUTTONS,
    WIDGET_TYPES.ACTIVE_ORDERS,
    WIDGET_TYPES.LIGHT_CHART,
    WIDGET_TYPES.ORDERBOOK,
    WIDGET_TYPES.TIME_AND_SALES,
    WIDGET_TYPES.PORTFOLIO,
    WIDGET_TYPES.BALANCES,
    WIDGET_TYPES.LIST,
    WIDGET_TYPES.TIMELINE,
    WIDGET_TYPES.CLOCK,
    WIDGET_TYPES.MARQUEE
  ].includes(widgetType);
}

export function getInstrumentDictionaryMeta(dictionary) {
  let exchange;
  let exchangeForDBRequest;
  let broker;
  let exchangeList;

  switch (dictionary) {
    case INSTRUMENT_DICTIONARY.BYBIT_LINEAR:
      exchange = EXCHANGE.BYBIT_LINEAR;
      exchangeForDBRequest = EXCHANGE.BYBIT_LINEAR;
      broker = BROKERS.BYBIT;
      exchangeList = [EXCHANGE.BYBIT_LINEAR];

      break;
    case INSTRUMENT_DICTIONARY.BYBIT_SPOT:
      exchange = EXCHANGE.BYBIT_SPOT;
      exchangeForDBRequest = EXCHANGE.BYBIT_SPOT;
      broker = BROKERS.BYBIT;
      exchangeList = [EXCHANGE.BYBIT_SPOT];

      break;
    case INSTRUMENT_DICTIONARY.BINANCE:
      exchange = EXCHANGE.BINANCE;
      exchangeForDBRequest = EXCHANGE.BINANCE;
      broker = BROKERS.BINANCE;
      exchangeList = [EXCHANGE.BINANCE];

      break;
    case INSTRUMENT_DICTIONARY.UTEX_MARGIN_STOCKS:
      exchange = EXCHANGE.UTEX_MARGIN_STOCKS;
      exchangeForDBRequest = EXCHANGE.UTEX_MARGIN_STOCKS;
      broker = BROKERS.UTEX;
      exchangeList = [EXCHANGE.UTEX_MARGIN_STOCKS];

      break;
    case INSTRUMENT_DICTIONARY.IB:
      exchange = EXCHANGE.CUSTOM;
      exchangeForDBRequest = EXCHANGE.US;
      broker = BROKERS.IB;
      exchangeList = [EXCHANGE.US];

      break;
    case INSTRUMENT_DICTIONARY.PSINA_US_STOCKS:
      exchange = EXCHANGE.US;
      exchangeForDBRequest = EXCHANGE.US;
      broker = BROKERS.PSINA;
      exchangeList = [EXCHANGE.US];

      break;
    case INSTRUMENT_DICTIONARY.ALOR_SPBX:
      exchange = EXCHANGE.SPBX;
      exchangeForDBRequest = EXCHANGE.SPBX;
      broker = BROKERS.ALOR;
      exchangeList = [EXCHANGE.SPBX];

      break;
    case INSTRUMENT_DICTIONARY.ALOR_MOEX_SECURITIES:
      exchange = EXCHANGE.MOEX_SECURITIES;
      exchangeForDBRequest = EXCHANGE.MOEX;
      broker = BROKERS.ALOR;
      exchangeList = [EXCHANGE.MOEX];

      break;

    case INSTRUMENT_DICTIONARY.ALOR_FORTS:
      exchange = EXCHANGE.MOEX_FORTS;
      exchangeForDBRequest = EXCHANGE.MOEX;
      broker = BROKERS.ALOR;
      exchangeList = [EXCHANGE.MOEX];

      break;
    case INSTRUMENT_DICTIONARY.TINKOFF:
      exchange = EXCHANGE.RUS;
      exchangeForDBRequest = {
        $in: [EXCHANGE.MOEX, EXCHANGE.SPBX]
      };
      broker = BROKERS.TINKOFF;
      exchangeList = [EXCHANGE.MOEX, EXCHANGE.SPBX];

      break;
    case INSTRUMENT_DICTIONARY.FINAM:
      exchange = EXCHANGE.CUSTOM;
      exchangeForDBRequest = {
        $in: [EXCHANGE.MOEX, EXCHANGE.US, EXCHANGE.SPBX]
      };
      broker = BROKERS.FINAM;
      exchangeList = [EXCHANGE.MOEX, EXCHANGE.US, EXCHANGE.SPBX];

      break;
    case INSTRUMENT_DICTIONARY.CAPITALCOM:
      exchange = EXCHANGE.CAPITALCOM;
      exchangeForDBRequest = EXCHANGE.CAPITALCOM;
      broker = BROKERS.CAPITALCOM;
      exchangeList = [EXCHANGE.CAPITALCOM];

      break;
  }

  return {
    exchange,
    exchangeForDBRequest,
    broker,
    exchangeList
  };
}
