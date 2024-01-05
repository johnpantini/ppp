/** @decorator */

import { PPPElement } from './ppp-element.js';
import { Observable, observable } from '../vendor/fast-element.min.js';
import { debounce } from './ppp-decorators.js';
import { TextField } from '../elements/text-field.js';
import { Snippet } from '../elements/snippet.js';

export function makeDistance(value = 0, unit = '') {
  return {
    value,
    unit
  };
}

export class OrderElement extends PPPElement {
  @observable
  widget;

  // A reference to widget's currently selected conditionalOrder.
  @observable
  order;

  onInstrumentChanged = {
    handleChange() {
      return this.instrumentChanged?.();
    }
  };

  async save() {
    if (typeof this.serialize === 'function' && !this.widget.preview) {
      const serialized = this.serialize();

      if (serialized !== null && typeof serialized === 'object') {
        try {
          const $set = {};
          const index = this.widget.document.lastConditionalOrderIndex;

          for (const key in serialized) {
            $set[`widgets.$.conditionalOrders.${index}.${key}`] =
              serialized[key];

            this.widget.document.conditionalOrders[index][key] =
              serialized[key];
            this.order[key] = serialized[key];
          }

          return this.saveToDatabase($set);
        } catch (e) {
          return this.widget.catchException(e);
        }
      }
    }
  }

  @debounce(150)
  saveToDatabase($set) {
    return ppp.user.functions.updateOne(
      {
        collection: 'workspaces'
      },
      {
        _id: ppp.app.params().document,
        'widgets.uniqueID': this.widget.document.uniqueID
      },
      {
        $set
      },
      {
        upsert: true
      }
    );
  }

  onChange(event) {
    const cp = event.composedPath();

    const isTextFiled = cp.find(
      (n) => n instanceof TextField || n instanceof Snippet
    );

    // Discard input onChange
    if (event.type === 'change' && isTextFiled) return true;

    return this.save();
  }

  constructor() {
    super();

    this.onChange = this.onChange.bind(this);
    this.onInstrumentChanged.handleChange =
      this.onInstrumentChanged.handleChange.bind(this);
  }

  async connectedCallback() {
    super.connectedCallback();

    this.widget = this.getRootNode().host;
    this.order = this.widget.conditionalOrder;

    Observable.getNotifier(this.widget).subscribe(
      this.onInstrumentChanged,
      'instrument'
    );

    await this.load?.();

    this.addEventListener('change', this.onChange);
    this.addEventListener('input', this.onChange);
    this.addEventListener('ppplistitemadd', this.onChange);
    this.addEventListener('ppplistitemremove', this.onChange);
    this.addEventListener('pppdragend', this.onChange);
    this.addEventListener('pppstep', this.onChange);
    this.addEventListener('pppunitchange', this.onChange);
  }

  disconnectedCallback() {
    Observable.getNotifier(this.widget).unsubscribe(
      this.onInstrumentChanged,
      'instrument'
    );

    this.removeEventListener('change', this.onChange);
    this.removeEventListener('input', this.onChange);
    this.removeEventListener('ppplistitemadd', this.onChange);
    this.removeEventListener('ppplistitemremove', this.onChange);
    this.removeEventListener('pppdragend', this.onChange);
    this.removeEventListener('pppstep', this.onChange);
    this.removeEventListener('pppunitchange', this.onChange);

    super.disconnectedCallback();
  }
}
