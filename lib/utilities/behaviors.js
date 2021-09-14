import { PropertyStyleSheetBehavior } from './property-stylesheet-behavior.js';

/**
 * Behavior that will conditionally apply a stylesheet based on the elements
 * appearance property
 *
 * @param value - The value of the appearance property
 * @param styles - The styles to be applied when condition matches
 *
 * @public
 */
export function appearanceBehavior(value, styles) {
  return new PropertyStyleSheetBehavior('appearance', value, styles);
}
