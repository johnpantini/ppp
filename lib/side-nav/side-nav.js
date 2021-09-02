/** @decorator */

import { attr } from '../element/components/attributes.js';
import { observable } from '../element/observation/observable.js';
import { FoundationElement } from '../foundation-element/foundation-element.js';

export class SideNav extends FoundationElement {
  @attr({ attribute: 'data-expanded', mode: 'boolean' })
  expanded;

  @attr({ attribute: 'data-hovered', mode: 'boolean' })
  hovered;

  @observable
  items;

  constructor() {
    super(...arguments);

    this.expanded = true;
  }

  handlePointerEnter() {
    this.hovered = true;
  }

  handlePointerLeave() {
    this.hovered = false;
  }
}
