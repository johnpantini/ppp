/**
 * Registers the i18n/en/elements/pages/trader-ib phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $traderIbPage: {
      brokerProfileTitle: 'Broker profile',
      brokerProfileDescription: 'Interactive Brokers broker profile.',
      addBrokerProfile: 'Add an IB profile',
      accountTitle: 'IB trading account',
      accountDescription: 'Can be found in the TWS window title.',
      gatewayConnectionFailed: 'No connection to the gateway.',
      gatewaySummaryFailed: 'The gateway failed to fetch portfolio information.'
    }
  });
}
