import $const from '../lib/const.i18n.js';
import $g from '../lib/general.i18n.js';
import $widget from './widget.i18n.js';

/**
 * Registers the i18n/ru/elements/widget-controls phrases, including shared dictionaries when required.
 * @param {import('../../../lib/types.js').LocalizationRegistry} i18n Registry to extend in place.
 * @returns {void}
 */
export default function (i18n) {
  $const(i18n);
  $g(i18n);
  $widget(i18n);
}
