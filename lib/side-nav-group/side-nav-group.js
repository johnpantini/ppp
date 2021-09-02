/** @decorator */

import { observable } from '../element/observation/observable.js';
import { FoundationElement } from '../foundation-element/foundation-element.js';
import { applyMixins } from '../utilities/apply-mixins.js';
import { StartEnd } from '../patterns/start-end.js';

export class SideNavGroup extends FoundationElement {
  @observable
  items;
}

applyMixins(SideNavGroup, StartEnd);
