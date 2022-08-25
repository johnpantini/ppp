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
  UTEX_AURORA: 'utex-aurora'
};

export const TRADERS = {
  ALOR_OPENAPI_V2_LOCAL: 'alor-openapi-v2-local',
  ALOR_OPENAPI_V2_REMOTE: 'alor-openapi-v2-remote'
};

export const WIDGET_TYPES = {
  ORDER: 'order',
  ACTIVE_ORDERS: 'active-orders',
  LIGHT_CHART: 'light-chart',
  CHART: 'chart',
  ORDERBOOK: 'orderbook',
  ORDERBOOK_WITH_POOL: 'orderbook-with-pool',
  TIME_AND_SALES: 'time-and-sales',
  CALENDAR: 'calendar',
  TRADES: 'trades',
  POSITIONS: 'positions',
  TRADE_HISTORY: 'trade-history',
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
  OTHER: 'other'
};
