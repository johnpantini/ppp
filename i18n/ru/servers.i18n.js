import { SUPPORTED_SERVER_TYPES } from '../../lib/const.js';

i18n.extend({
  $pages: {
    servers: {
      toast: {
        title: 'Список серверов'
      }
    }
  },
  $serverType: {
    [SUPPORTED_SERVER_TYPES.PASSWORD]: 'Пароль',
    [SUPPORTED_SERVER_TYPES.KEY]: 'Приватный ключ'
  }
});
