/**
 * Registers the i18n/en/lib/order-card phrases, including shared dictionaries when required.
 * @param {import('../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $conditionalOrder: {
      status: {
        inactive: 'Inactive',
        working: 'Working',
        executing: 'Executing',
        executed: 'Executed',
        failed: 'Failed',
        unknown: 'Unknown',
        paused: 'Paused',
        panic: 'Panic',
        pending: 'Pending'
      }
    }
  });
}
