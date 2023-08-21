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
  SSH: 'ssh',
  SPBEX_HALTS: 'spbex-halts',
  NYSE_NSDQ_HALTS: 'nyse-nsdq-halts',
  SUPABASE_PARSER: 'supabase-parser',
  CLOUD_PPP_ASPIRANT: 'cloud-ppp-aspirant',
  DEPLOYED_PPP_ASPIRANT: 'deployed-ppp-aspirant',
  SYSTEMD_PPP_ASPIRANT: 'systemd-ppp-aspirant',
  PPP_ASPIRANT_WORKER: 'ppp-aspirant-worker',
  CLOUDFLARE_WORKER: 'cloudflare-worker'
};

export const SERVICE_STATE = {
  ACTIVE: 'active',
  STOPPED: 'stopped',
  FAILED: 'failed'
};

export const EXCHANGE = {
  BINANCE: 'BINANCE',
  MOEX: 'MOEX',
  SPBX: 'SPBX',
  US: 'US',
  UTEX_MARGIN_STOCKS: 'UTEX_MARGIN_STOCKS',
  RUS: 'RUS', // SPBX + MOEX
  CUSTOM: 'CUSTOM', // Special cases (Finam)
  MOEX_SECURITIES: 'MOEX_SECURITIES', // Moex Equity & Bond Market
  MOEX_FORTS: 'MOEX_FORTS',
  MOEX_CURRENCY: 'MOEX_CURRENCY'
};

export const BROKERS = {
  ALOR: 'alor',
  TINKOFF: 'tinkoff',
  UTEX: 'utex',
  PSINA: 'psina',
  BINANCE: 'binance',
  HUOBI: 'huobi',
  BYBIT: 'bybit',
  FINAM: 'finam',
  IB: 'ib'
};

export const INSTRUMENT_DICTIONARY = {
  BINANCE: 'BINANCE',
  UTEX_MARGIN_STOCKS: 'UTEX_MARGIN_STOCKS',
  PSINA_US_STOCKS: 'PSINA_US_STOCKS',
  ALOR_SPBX: 'ALOR_SPBX',
  ALOR_MOEX_SECURITIES: 'ALOR_MOEX_SECURITIES',
  ALOR_FORTS: 'ALOR_FORTS',
  TINKOFF: 'TINKOFF',
  FINAM: 'FINAM',
  IB: 'IB'
};

export const TRADERS = {
  ALOR_OPENAPI_V2: 'alor-openapi-v2',
  PSINA_ALOR_OPENAPI_V2: 'psina-alor-openapi-v2',
  TINKOFF_GRPC_WEB: 'tinkoff-grpc-web',
  ALPACA_V2_PLUS: 'alpaca-v2-plus',
  BINANCE_V3: 'binance-v3',
  UTEX_MARGIN_STOCKS: 'utex-margin-stocks',
  FINAM_TRADE_API: 'finam-trade-api',
  IB: 'ib',
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
  CAPS_CHARTS: 'caps-charts',
  CAPS_MIC: 'caps-mic',
  CAPS_ORDER_DESTINATION: 'caps-order-destination',
  CAPS_ORDER_TIF: 'caps-order-tif'
};

export const TRADER_DATUM = {
  // Trader-related events
  TRADER: 'trader',
  LAST_PRICE: 'last-price',
  LAST_PRICE_ABSOLUTE_CHANGE: 'last-price-absolute-change',
  LAST_PRICE_RELATIVE_CHANGE: 'last-price-relative-change',
  BEST_BID: 'best-bid',
  BEST_ASK: 'best-ask',
  ORDERBOOK: 'orderbook',
  MARKET_PRINT: 'market-print',
  POSITION: 'position',
  POSITION_SIZE: 'position-size',
  POSITION_AVERAGE: 'position-average',
  ACTIVE_ORDER: 'active-order',
  TIMELINE_ITEM: 'timeline-item',
  CANDLE: 'candle'
};

export const COLUMN_SOURCE = {
  INSTRUMENT: 'instrument',
  SYMBOL: 'symbol',
  POSITION_AVAILABLE: 'position-available',
  POSITION_AVERAGE: 'position-average',
  BEST_BID: 'best-bid',
  BEST_ASK: 'best-ask',
  LAST_PRICE: 'last-price',
  LAST_PRICE_ABSOLUTE_CHANGE: 'last-price-absolute-change',
  LAST_PRICE_RELATIVE_CHANGE: 'last-price-relative-change',
  PL_ABSOLUTE: 'pl-absolute',
  PL_RELATIVE: 'pl-relative'
};

export const WIDGET_TYPES = {
  ORDER: 'order',
  SCALPING_BUTTONS: 'scalping-buttons',
  ACTIVE_ORDERS: 'active-orders',
  LIGHT_CHART: 'light-chart',
  CHART: 'chart',
  ORDERBOOK: 'orderbook',
  TIME_AND_SALES: 'time-and-sales',
  CALENDAR: 'calendar',
  TRADES: 'trades',
  POSITIONS: 'positions',
  PORTFOLIO: 'portfolio',
  TIMELINE: 'timeline',
  NOTIFICATIONS: 'notifications',
  SUBSCRIPTIONS: 'subscription',
  RATINGS: 'ratings',
  INSIDER_TRADES: 'insider-trades',
  OPTIONS: 'options',
  INSTRUMENTS: 'instruments',
  SCANNER: 'scanner',
  SCREENER: 'screener',
  PARSER: 'parser',
  NEWS: 'news',
  FRAME: 'frame',
  NOII: 'noii',
  MIGRATION: 'migration',
  OTHER: 'other'
};
