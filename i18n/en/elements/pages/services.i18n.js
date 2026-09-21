import $const from '../../lib/const.i18n.js';

/**
 * Registers the i18n/en/elements/pages/services phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);

  i18n.extend({
    $servicesPage: {
      listHeader: 'Service list',
      installService: 'Install a service',
      or: 'Or',
      orByType: 'Or by type',
      allServices: 'All services',
      removedServices: 'Removed services',
      typeColumn: 'Type',
      createdAtColumn: 'Created',
      updatedAtColumn: 'Last modified',
      versionColumn: 'Version',
      actualVersionColumn: 'Latest version',
      stateColumn: 'State',
      isolationColumn: 'Isolation',
      actionsColumn: 'Actions',
      removedBadge: 'Removed',
      isolated: 'Isolated',
      update: 'Update'
    }
  });
}
