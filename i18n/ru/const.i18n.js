import {
  SUPPORTED_APIS,
  SUPPORTED_BROKERS,
  SUPPORTED_SERVICES,
  SUPPORTED_SERVER_TYPES
} from '../../shared/const.js';

export default function (i18n) {
  i18n.extend({
    $const: {
      api: {
        [SUPPORTED_APIS.SUPABASE]: 'Supabase',
        [SUPPORTED_APIS.PUSHER]: 'Pusher',
        [SUPPORTED_APIS.ASTRADB]: 'AstraDB',
        [SUPPORTED_APIS.SEATABLE]: 'Seatable'
      },
      broker: {
        [SUPPORTED_BROKERS.ALOR_OPENAPI_V2]: 'Alor Open API V2'
      },
      server: {
        [SUPPORTED_SERVER_TYPES.PASSWORD]: 'Вход по паролю',
        [SUPPORTED_SERVER_TYPES.KEY]: 'Вход по приватному ключу'
      },
      serverState: {
        ok: 'В работе',
        failed: 'Неисправен'
      },
      serviceState: {
        active: 'В работе',
        stopped: 'Остановлен',
        failed: 'Неисправен'
      },
      service: {
        [SUPPORTED_SERVICES.SPBEX_HALTS]: 'Торговые паузы SPBEX',
        [SUPPORTED_SERVICES.NYSE_NSDQ_HALTS]: 'Торговые паузы NYSE/NSDQ',
        [SUPPORTED_SERVICES.SUPABASE_PARSER]: 'Парсер с персистентностью'
      }
    }
  });
}
