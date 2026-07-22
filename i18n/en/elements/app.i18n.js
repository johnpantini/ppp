import $const from '../lib/const.i18n.js';
import $g from '../lib/general.i18n.js';

export default function (i18n) {
  $const(i18n);
  $g(i18n);

  i18n.extend({
    $collection: {
      apis: 'API',
      brokers: 'Brokers',
      endpoints: 'Endpoints',
      extensions: 'Extensions',
      instruments: 'Instruments',
      servers: 'Servers',
      services: 'Services',
      settings: 'Settings',
      bots: 'Bots',
      traders: 'Traders',
      widgets: 'Widget Templates',
      orders: 'Order Templates',
      workspaces: 'Workspaces'
    },
    $sideNav: {
      newWorkspace: 'New Workspace',
      trading: 'Trading',
      connections: 'Connections',
      configuration: 'Configuration',
      update: 'Update',
      cloudServices: 'Cloud Services',
      updatesCenter: 'Update Center'
    },
    $app: {
      confirmActionTitle: 'Confirm this action',
      confirmationNeeded: 'Confirmation is required to proceed.',
      componentsSetupTitle: 'Application components setup',
      updateReadyTitle: 'Update ready',
      newVersionReady:
        'A new version of the app (%{version}) is ready to use.',
      clickToUpdate: 'Click to update.',
      updateInProgressTitle: 'Updating',
      pageWillReloadAutomatically: 'The page will reload automatically.',
      placeWidgetTitle: 'Place a widget'
    }
  });
}
