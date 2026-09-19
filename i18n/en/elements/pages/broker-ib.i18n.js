export default function (i18n) {
  i18n.extend({
    $brokerIbPage: {
      twsHost: 'TWS host',
      twsHostDescription: 'The Trader Workstation host.',
      twsPort: 'TWS port',
      twsPortDescription: 'The Trader Workstation port.',
      gatewayUrlTitle: 'TWS API gateway URL',
      gatewayUrlDescription:
        'The endpoint that will be used to interact with IB. It can be set from an Aspirant Worker service (the "TWS API Gateway" template):',
      gatewayLink: 'Gateway link',
      takeLinkFromService: 'Take the link from the service',
      noGatewayConnection: 'No connection to the gateway.',
      gatewayTimeRequestFailed:
        'The gateway failed to execute the time request.',
      gatewayTimeRequestError:
        'The gateway responded with an error to the time request.'
    }
  });
}
