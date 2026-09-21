/**
 * Registers the i18n/ru/elements/pages/api-pusher phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiPusherPage: {
      appId: 'Id приложения',
      appIdDescription: 'Смотрите раздел App Keys панели управления Pusher.',
      appKey: 'Ключ приложения',
      appSecret: 'Секрет приложения',
      cluster: 'Кластер',
      clusterDescription: 'Датацентр, где размещено приложение.',
      invalidCredentials: 'Неверные учётные данные'
    }
  });
}
