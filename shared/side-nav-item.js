/** @decorator */

import { attr } from './element/components/attributes.js';
import { FoundationElement } from './foundation-element.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { StartEnd } from './patterns/start-end.js';

export class SideNavItem extends FoundationElement {
  @attr({ mode: 'boolean' })
  disabled;

  @attr({ mode: 'boolean' })
  active;
}

applyMixins(SideNavItem, StartEnd);
