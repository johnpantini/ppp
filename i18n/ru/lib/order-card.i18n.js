/**
 * Registers the i18n/ru/lib/order-card phrases, including shared dictionaries when required.
 * @param {import('../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  i18n.extend({
    $conditionalOrder: {
      status: {
        inactive: 'Не активна',
        working: 'Активна',
        executing: 'На исполнении',
        executed: 'Исполнена',
        failed: 'Не исполнена',
        unknown: 'Статус неизвестен',
        paused: 'Пауза',
        panic: 'Паника',
        pending: 'В ожидании'
      }
    }
  });
}
