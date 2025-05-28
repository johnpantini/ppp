export default function (i18n) {
  i18n.extend({
    $conditionalOrder: {
      status: {
        inactive: 'Inactive',
        working: 'Active',
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
