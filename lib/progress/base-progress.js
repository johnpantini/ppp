/** @decorator */

import {
  attr,
  nullableNumberConverter
} from '../element/components/attributes.js';
import { FoundationElement } from '../foundation-element/foundation-element.js';

/**
 * A Progress HTML Element.
 * Implements the {@link https://www.w3.org/TR/wai-aria-1.1/#progressbar | ARIA progressbar }.
 *
 * @public
 */
export class BaseProgress extends FoundationElement {
  /**
   * The value of the progress
   * @public
   * @remarks
   * HTML Attribute: value
   */
  @attr({ converter: nullableNumberConverter })
  value;

  /**
   * The minimum value
   * @public
   * @remarks
   * HTML Attribute: min
   */
  @attr({ converter: nullableNumberConverter })
  min;

  /**
   * The maximum value
   * @public
   * @remarks
   * HTML Attribute: max
   */
  @attr({ converter: nullableNumberConverter })
  max;

  /**
   * Indicates the progress is paused
   * @public
   * @remarks
   * HTML Attribute: paused
   */
  @attr({ mode: 'boolean' })
  paused;
}
