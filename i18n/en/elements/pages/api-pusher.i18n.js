/**
 * Registers the i18n/en/elements/pages/api-pusher phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $apiPusherPage: {
      appId: 'App ID',
      appIdDescription: 'See the App Keys section of the Pusher dashboard.',
      appKey: 'App key',
      appSecret: 'App secret',
      cluster: 'Cluster',
      clusterDescription: 'The data center where the app is hosted.',
      invalidCredentials: 'Invalid credentials'
    }
  });
}
