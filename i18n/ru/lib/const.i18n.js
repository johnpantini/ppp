import {
  APIS,
  BROKERS,
  SERVICES,
  SERVER_TYPES,
  WIDGET_TYPES,
  SERVICE_STATE,
  TRADERS,
  SERVER_STATE,
  TRADER_CAPS,
  VERSIONING_STATUS
} from '../../../lib/const.js';

export default function (i18n) {
  i18n.extend({
    $const: {
      api: {
        [APIS.SUPABASE]: 'Supabase',
        [APIS.PUSHER]: 'Pusher',
        [APIS.ASTRADB]: 'AstraDB',
        [APIS.SEATABLE]: 'Seatable',
        [APIS.ALGOLIA]: 'Algolia',
        [APIS.NORTHFLANK]: 'Northflank',
        [APIS.REDIS]: 'Redis',
        [APIS.CLOUDFLARE]: 'Cloudflare'
      },
      broker: {
        [BROKERS.ALOR_OPENAPI_V2]: 'Alor Open API V2',
        [BROKERS.TINKOFF_INVEST_API]: 'Tinkoff Invest API',
        [BROKERS.UTEX_AURORA]: 'UTEX',
        [BROKERS.PSINA]: 'Psina',
        [BROKERS.BINANCE]: 'Binance'
      },
      trader: {
        [TRADERS.ALOR_OPENAPI_V2]: 'Alor Open API V2',
        [TRADERS.TINKOFF_GRPC_WEB]: 'Tinkoff gRPC-Web',
        [TRADERS.ALPACA_V2_PLUS]: 'Alpaca API V2',
        [TRADERS.BINANCE_V3]: 'Binance API V3',
        [TRADERS.UTEX_MARGIN_STOCKS]: 'UTEX Margin (акции)',
        [TRADERS.CUSTOM]: 'Произвольная реализация'
      },
      traderCaps: {
        [TRADER_CAPS.CAPS_LIMIT_ORDERS]: 'Лимитные заявки',
        [TRADER_CAPS.CAPS_MARKET_ORDERS]: 'Рыночные заявки',
        [TRADER_CAPS.CAPS_STOP_ORDERS]: 'Отложенные заявки',
        [TRADER_CAPS.CAPS_ACTIVE_ORDERS]: 'Активные заявки',
        [TRADER_CAPS.CAPS_ORDERBOOK]: 'Книга заявок',
        [TRADER_CAPS.CAPS_TIME_AND_SALES]: 'Лента всех сделок',
        [TRADER_CAPS.CAPS_POSITIONS]: 'Портфель',
        [TRADER_CAPS.CAPS_TIMELINE]: 'Лента операций',
        [TRADER_CAPS.CAPS_LEVEL1]: 'Данные L1',
        [TRADER_CAPS.CAPS_CHARTS]: 'Графики котировок',
        [TRADER_CAPS.CAPS_MIC]: 'Пулы ликвидности'
      },
      server: {
        [SERVER_TYPES.PASSWORD]: 'Вход по паролю',
        [SERVER_TYPES.KEY]: 'Вход по приватному ключу'
      },
      serverState: {
        [SERVER_STATE.OK]: 'Настроен',
        [SERVER_STATE.FAILED]: 'Неисправен'
      },
      serviceState: {
        [SERVICE_STATE.ACTIVE]: 'Активен',
        [SERVICE_STATE.STOPPED]: 'Остановлен',
        [SERVICE_STATE.FAILED]: 'Неисправен',
        'N/A': 'Нет данных'
      },
      service: {
        [SERVICES.SSH]: 'Команды SSH',
        [SERVICES.SPBEX_HALTS]: 'Торговые паузы SPBEX',
        [SERVICES.NYSE_NSDQ_HALTS]: 'Торговые паузы NYSE/NASDAQ',
        [SERVICES.SUPABASE_PARSER]: 'Парсер с персистентностью',
        [SERVICES.CLOUD_PPP_ASPIRANT]: 'PPP Aspirant (в облаке)',
        [SERVICES.SYSTEMD_PPP_ASPIRANT]: 'PPP Aspirant (systemd)',
        [SERVICES.DEPLOYED_PPP_ASPIRANT]: 'PPP Aspirant (по адресу)',
        [SERVICES.PPP_ASPIRANT_WORKER]: 'PPP Aspirant Worker'
      },
      versioningStatus: {
        [VERSIONING_STATUS.OLD]: 'Требуется обновление',
        [VERSIONING_STATUS.OFF]: 'Версия не отслеживается',
        [VERSIONING_STATUS.OK]: 'Последняя версия'
      },
      widget: {
        [WIDGET_TYPES.ORDER]: 'Заявка',
        [WIDGET_TYPES.SCALPING_BUTTONS]: 'Скальперские кнопки',
        [WIDGET_TYPES.ACTIVE_ORDERS]: 'Активные заявки',
        [WIDGET_TYPES.LIGHT_CHART]: 'Лёгкий график',
        [WIDGET_TYPES.CHART]: 'График',
        [WIDGET_TYPES.ORDERBOOK]: 'Книга заявок',
        [WIDGET_TYPES.TIME_AND_SALES]: 'Лента всех сделок',
        [WIDGET_TYPES.PORTFOLIO]: 'Портфель',
        [WIDGET_TYPES.TIMELINE]: 'Лента операций',
        [WIDGET_TYPES.TRADES]: 'Сделки',
        [WIDGET_TYPES.NOTIFICATIONS]: 'Уведомления',
        [WIDGET_TYPES.SUBSCRIPTIONS]: 'Подписки',
        [WIDGET_TYPES.RATINGS]: 'Рейтинги',
        [WIDGET_TYPES.INSIDER_TRADES]: 'Сделки инсайдеров',
        [WIDGET_TYPES.OPTIONS]: 'Опционы',
        [WIDGET_TYPES.INSTRUMENTS]: 'Инструменты',
        [WIDGET_TYPES.SCANNER]: 'Сканер',
        [WIDGET_TYPES.SCREENER]: 'Скринер',
        [WIDGET_TYPES.PARSER]: 'Парсер',
        [WIDGET_TYPES.FRAME]: 'Фрейм',
        [WIDGET_TYPES.NEWS]: 'Новости',
        [WIDGET_TYPES.OTHER]: 'Специальный виджет'
      }
    }
  });
}
