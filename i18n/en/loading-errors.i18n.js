export default function (i18n) {
  i18n.extend({
    $loadingErrors: {
      E_NO_PROXY_CONNECTION: 'No connection to proxy',
      E_NO_MONGODB_CONNECTION: 'No connection to the alternative database',
      E_BROKEN_ATLAS_REALM_LINK:
        'Missing link between the database and MongoDB application',
      E_OFFLINE_REALM:
        'MongoDB application is offline or disabled due to inactivity',
      E_CLOUD_SERVICES_MISCONFIGURATION_PLEASE_WAIT:
        'Cloud services configuration failure, please wait...',
      E_UNKNOWN:
        'Loading error. See browser developer tools console for details'
    }
  });
}
