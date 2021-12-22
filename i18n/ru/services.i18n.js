import { SUPPORTED_SERVICES } from '../../lib/const.js';

i18n.extend({
  $pages: {
    services: {
      toast: {
        title: 'Список сервисов'
      }
    }
  },
  $serviceType: {
    [SUPPORTED_SERVICES.HTTPS_WEBSOCKET]: 'HTTPS/WebSocket',
    [SUPPORTED_SERVICES.TG_UPDATER]: 'Обновление сообщения TG',
  }
});
