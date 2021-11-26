import { cssPartial } from '../../../lib/element/styles/css.js';
import { baseHeightMultiplier, density, designUnit } from '../design-tokens.js';

/**
 * A formula to retrieve the control height.
 * Use this as the value of any CSS property that
 * accepts a pixel size.
 */
export const heightNumber = cssPartial`(${baseHeightMultiplier} + ${density}) * ${designUnit}`;
