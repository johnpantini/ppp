/**
 * Registers the i18n/ru/elements/pages/new-domain-modal phrases, including shared dictionaries when required.
 * @param {import('../../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $newDomainModalPage: {
      emailDescriptionPrefix: 'Адрес регистрации учётной записи',
      emailDescriptionSuffix:
        'для получения служебных уведомлений (например, при скором истечении сертификата).',
      domains: 'Домены',
      domainsDescription:
        'Список доменов, для которых нужно получить сертификаты. Можно ввести несколько через запятую.',
      addDomains: 'Добавить домены',
      cannotAddDomains: 'Не удалось добавить домены.',
      domainAdditionTitle: 'Добавление доменов'
    }
  });
}
