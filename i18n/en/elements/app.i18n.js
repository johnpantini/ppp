import $const from '../lib/const.i18n.js';

export default function (i18n) {
  $const(i18n);

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
      newWorkspace: 'New Workspace'
    }
  });
}
