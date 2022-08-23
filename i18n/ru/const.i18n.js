import {
  APIS,
  BROKERS,
  SERVICES,
  SERVER_TYPES,
  WIDGET_TYPES,
  SERVICE_STATE
} from '../../shared/const.js';

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
        [BROKERS.ALOR_OPENAPI_V2]: 'Alor Open API V2'
      },
      server: {
        [SERVER_TYPES.PASSWORD]: 'Вход по паролю',
        [SERVER_TYPES.KEY]: 'Вход по приватному ключу'
      },
      serverState: {
        ok: 'Активен',
        failed: 'Неисправен'
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
        [SERVICES.PPP_ASPIRANT]: 'PPP Aspirant',
        [SERVICES.DEPLOYED_PPP_ASPIRANT]: 'PPP Aspirant (по адресу)',
        [SERVICES.PPP_ASPIRANT_WORKER]: 'PPP Aspirant Worker'
      },
      widget: {
        [WIDGET_TYPES.ORDER]: 'Заявка',
        [WIDGET_TYPES.ACTIVE_ORDERS]: 'Активные заявки',
        [WIDGET_TYPES.ORDERBOOK]: 'Книга заявок'
      }
    }
  });
}
