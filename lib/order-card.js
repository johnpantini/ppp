/** @decorator */

import ppp from '../ppp.js';
import { PPPElement } from './ppp-element.js';
import { observable } from '../vendor/fast-element.min.js';

await ppp.i18n(import.meta.url);

export class OrderCard extends PPPElement {
  @observable
  widget;

  @observable
  order;

  @observable
  payload;

  @observable
  instrument;

  constructor() {
    super();

    this.order = {};
    this.payload = {};
    this.instrument = {};
  }

  connectedCallback() {
    super.connectedCallback();

    this.widget = this.getRootNode().host;
    this.order = this.parentNode.order;
    this.instrument = this.order.instrument ?? {};
    this.payload = this.order.payload ?? {};
  }

  getIcon() {
    if (this.$fastController.isConnected) {
      return `background-image:url(${this.widget.searchControl.getInstrumentIconUrl(
        this.instrument
      )})`;
    }
  }

  getSide() {
    if (this.$fastController.isConnected) {
      return this.payload.order?.sideAgnostic ? 'earth' : this.order?.side;
    }
  }

  getStatusText() {
    return ppp.t(`$conditionalOrder.status.${this.order?.status ?? 'unknown'}`);
  }

  getStatusClass() {
    switch (this.order?.status) {
      case 'working':
        return 'positive';
      case 'inactive':
      case 'failed':
        return 'negative';
      case 'executing':
        return 'alien';
      case 'pending':
      case 'paused':
        return 'earth';
      case 'executed':
        return 'ocean';
      case 'unknown':
        return '';
      default:
        return '';
    }
  }
}
