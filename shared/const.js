export const SERVER_TYPES = {
  PASSWORD: 'password',
  KEY: 'key'
};

export const APIS = {
  SUPABASE: 'supabase',
  PUSHER: 'pusher',
  ASTRADB: 'astradb',
  SEATABLE: 'seatable',
  NORTHFLANK: 'northflank',
  ALPACA_REALTIME: 'alpaca-realtime',
  ALGOLIA: 'algolia',
  REDIS: 'redis',
  CLOUDFLARE: 'cloudflare'
};

export const SERVICES = {
  SSH: 'ssh',
  SPBEX_HALTS: 'spbex-halts',
  NYSE_NSDQ_HALTS: 'nyse-nsdq-halts',
  SUPABASE_PARSER: 'supabase-parser',
  PPP_ASPIRANT: 'ppp-aspirant',
  DEPLOYED_PPP_ASPIRANT: 'deployed-ppp-aspirant',
  PPP_ASPIRANT_WORKER: 'ppp-aspirant-worker'
};

export const SERVICE_STATE = {
  ACTIVE: 'active',
  STOPPED: 'stopped',
  FAILED: 'failed'
};

export const BROKERS = {
  ALOR_OPENAPI_V2: 'alor-openapi-v2',
  TINKOFF_INVEST_API: 'tinkoff-invest-api',
  UTEX_AURORA: 'utex-aurora'
};

export const TRADERS = {
  ALOR_OPENAPI_V2: 'alor-openapi-v2',
  TINKOFF_GRPC_WEB: 'tinkoff-grpc-web',
  CUSTOM: 'custom'
};

export const TRADER_DATUM = {
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
  CURRENT_ORDER: 'current-order'
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
  OTHER: 'other'
};
