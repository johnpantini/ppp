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
  VERSIONING_STATUS,
  EXCHANGE,
  COLUMN_SOURCE
} from '../../../lib/const.js';

export default function (i18n) {
  i18n.extend({
    $const: {
      api: {
        [APIS.SUPABASE]: 'Supabase',
        [APIS.PUSHER]: 'Pusher',
        [APIS.ASTRADB]: 'AstraDB',
        [APIS.SEATABLE]: 'Seatable',
        [APIS.NORTHFLANK]: 'Northflank',
        [APIS.POSTGRESQL]: 'PostgreSQL',
        [APIS.RENDER]: 'Render',
        [APIS.REDIS]: 'Redis',
        [APIS.CLOUDFLARE]: 'Cloudflare',
        [APIS.BITIO]: 'bit.io',
        [APIS.YC]: 'Yandex Cloud'
      },
      broker: {
        [BROKERS.ALOR]: 'Alor',
        [BROKERS.TINKOFF]: 'Tinkoff',
        [BROKERS.FINAM]: 'Finam',
        [BROKERS.IB]: 'Interactive Brokers',
        [BROKERS.UTEX]: 'UTEX',
        [BROKERS.PSINA]: 'Psina',
        [BROKERS.BINANCE]: 'Binance',
        [BROKERS.HUOBI]: 'Huobi',
        [BROKERS.BYBIT]: 'Bybit'
      },
      columnSource: {
        [COLUMN_SOURCE.INSTRUMENT]: 'Инструмент',
        [COLUMN_SOURCE.SYMBOL]: 'Тикер',
        [COLUMN_SOURCE.BEST_BID]: 'Bid',
        [COLUMN_SOURCE.BEST_ASK]: 'Ask',
        [COLUMN_SOURCE.LAST_PRICE]: 'Цена',
        [COLUMN_SOURCE.LAST_PRICE_ABSOLUTE_CHANGE]: 'Изм. цены',
        [COLUMN_SOURCE.LAST_PRICE_RELATIVE_CHANGE]: 'Изм. цены, %',
        [COLUMN_SOURCE.PL_ABSOLUTE]: 'Доход',
        [COLUMN_SOURCE.PL_RELATIVE]: 'Доход, %',
        [COLUMN_SOURCE.POSITION_AVAILABLE]: 'Доступно',
        [COLUMN_SOURCE.POSITION_AVERAGE]: 'Средняя'
      },
      exchange: {
        [EXCHANGE.BINANCE]: 'Binance',
        [EXCHANGE.MOEX]: 'Московская биржа',
        [EXCHANGE.SPBX]: 'СПБ Биржа',
        [EXCHANGE.UTEX_MARGIN_STOCKS]: 'UTEX Margin (акции)',
        [EXCHANGE.US]: 'Биржи США'
      },
      trader: {
        [TRADERS.ALOR_OPENAPI_V2]: 'Alor Open API V2',
        [TRADERS.PSINA_ALOR_OPENAPI_V2]: 'Alor Open API V2 (Psina)',
        [TRADERS.TINKOFF_GRPC_WEB]: 'Tinkoff gRPC-Web',
        [TRADERS.ALPACA_V2_PLUS]: 'Alpaca API V2',
        [TRADERS.BINANCE_V3]: 'Binance API V3',
        [TRADERS.UTEX_MARGIN_STOCKS]: 'UTEX Margin (акции)',
        [TRADERS.FINAM_TRADE_API]: 'Finam Trade API',
        [TRADERS.IB]: 'Interactive Brokers',
        [TRADERS.CUSTOM]: 'По ссылке'
      },
      traderCaps: {
        [TRADER_CAPS.CAPS_LIMIT_ORDERS]: 'Лимитные заявки',
        [TRADER_CAPS.CAPS_MARKET_ORDERS]: 'Рыночные заявки',
        [TRADER_CAPS.CAPS_ACTIVE_ORDERS]: 'Активные заявки',
        [TRADER_CAPS.CAPS_ORDERBOOK]: 'Книга заявок',
        [TRADER_CAPS.CAPS_TIME_AND_SALES]: 'Лента всех сделок',
        [TRADER_CAPS.CAPS_TIME_AND_SALES_HISTORY]: 'История ленты сделок',
        [TRADER_CAPS.CAPS_POSITIONS]: 'Портфель',
        [TRADER_CAPS.CAPS_TIMELINE]: 'Лента операций',
        [TRADER_CAPS.CAPS_LEVEL1]: 'Данные L1',
        [TRADER_CAPS.CAPS_CHARTS]: 'Графики котировок',
        [TRADER_CAPS.CAPS_MIC]: 'Пулы ликвидности',
        [TRADER_CAPS.CAPS_ORDER_DESTINATION]: 'Выбор назначения заявки',
        [TRADER_CAPS.CAPS_ORDER_TIF]: 'Параметр заявки Time in Force',
        [TRADER_CAPS.CAPS_NOII]: 'Индикатор NOII',
        [TRADER_CAPS.CAPS_US_NBBO]: 'NBBO (США)',
        [TRADER_CAPS.CAPS_NSDQ_TOTALVIEW]: 'Nasdaq TotalView',
        [TRADER_CAPS.CAPS_ARCABOOK]: 'NYSE ArcaBook'
      },
      server: {
        [SERVER_TYPES.PASSWORD]: 'Вход по паролю',
        [SERVER_TYPES.KEY]: 'Вход по приватному ключу'
      },
      serverState: {
        [SERVER_STATE.OK]: 'Настроен',
        [SERVER_STATE.FAILED]: 'Проблемы с настройкой'
      },
      serviceState: {
        [SERVICE_STATE.ACTIVE]: 'Активен',
        [SERVICE_STATE.STOPPED]: 'Остановлен',
        [SERVICE_STATE.FAILED]: 'Проблемы с настройкой',
        'N/A': 'Нет данных'
      },
      service: {
        [SERVICES.SSH]: 'Команды SSH',
        [SERVICES.SPBEX_HALTS]: 'Торговые паузы SPBEX',
        [SERVICES.NYSE_NSDQ_HALTS]: 'Торговые паузы NYSE/NASDAQ',
        [SERVICES.SUPABASE_PARSER]: 'Парсер (Supabase)',
        [SERVICES.CLOUD_PPP_ASPIRANT]: 'Aspirant',
        [SERVICES.DEPLOYED_PPP_ASPIRANT]: 'Aspirant (по адресу)',
        [SERVICES.SYSTEMD_PPP_ASPIRANT]: 'Aspirant (systemd)',
        [SERVICES.PPP_ASPIRANT_WORKER]: 'Aspirant Worker',
        [SERVICES.CLOUDFLARE_WORKER]: 'Cloudflare Worker'
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
        [WIDGET_TYPES.LIST]: 'Список/таблица',
        [WIDGET_TYPES.SCANNER]: 'Сканер',
        [WIDGET_TYPES.SCREENER]: 'Скринер',
        [WIDGET_TYPES.PARSER]: 'Парсер',
        [WIDGET_TYPES.FRAME]: 'Фрейм',
        [WIDGET_TYPES.NEWS]: 'Новости',
        [WIDGET_TYPES.NOII]: 'NOII',
        [WIDGET_TYPES.OTHER]: 'Специальный виджет'
      }
    }
  });
}
