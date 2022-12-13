/** @decorator */

import { Widget } from './widget.js';
import { observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

export class WidgetWithInstrument extends Widget {
  @observable
  instrument;

  isolated;

  connectedCallback() {
    super.connectedCallback();

    if (!this.preview) {
      this.isolated = true;
      this.instrument = this.document.instrument;
      this.isolated = false;
    }
  }

  async findAndSelectSymbol(findClause = {}, selectOnThis = false) {
    const instrument = await ppp.user.functions.findOne(
      {
        collection: 'instruments'
      },
      findClause
    );

    if (instrument) {
      if (selectOnThis) {
        this.instrument = instrument;
      }

      Array.from(this.container.shadowRoot.querySelectorAll('.widget'))
        .filter(
          (w) =>
            w !== this &&
            w?.instrument?._id !== instrument._id &&
            w?.groupControl.selection === this.groupControl.selection
        )
        .forEach((w) => (w.instrument = instrument));
    }

    return instrument;
  }

  instrumentChanged() {
    if (this.preview) return;

    if (!this.isolated) {
      const bulkWritePayload = [];

      Array.from(this.container.shadowRoot.querySelectorAll('.widget')).forEach(
        (w) => {
          if (
            w instanceof WidgetWithInstrument &&
            w.groupControl &&
            w !== this
          ) {
            w.isolated = true;

            if (
              this.groupControl.selection &&
              w.groupControl.selection === this.groupControl.selection
            ) {
              w.instrument = this.instrument;

              bulkWritePayload.push({
                updateOne: {
                  filter: {
                    'widgets.uniqueID': w.document.uniqueID
                  },
                  update: {
                    $set: {
                      'widgets.$.instrumentId': w.instrument?._id
                    }
                  },
                  upsert: true
                }
              });
            }

            w.isolated = false;
          }
        }
      );

      bulkWritePayload.push({
        updateOne: {
          filter: {
            'widgets.uniqueID': this.document.uniqueID
          },
          update: {
            $set: {
              'widgets.$.instrumentId': this.instrument?._id
            }
          },
          upsert: true
        }
      });

      void ppp.user.functions.bulkWrite(
        {
          collection: 'workspaces'
        },
        bulkWritePayload,
        {
          ordered: false
        }
      );
    }
  }

  broadcastPrice(price) {
    if (price > 0 && !this.preview) {
      const widgets = Array.from(
        this.container.shadowRoot.querySelectorAll('.widget')
      ).filter(
        (w) =>
          w !== this.widget &&
          typeof w.setPrice === 'function' &&
          w?.groupControl.selection === this.groupControl.selection &&
          w.instrument
      );

      widgets.forEach((w) => w.setPrice(price));
    }

    return true;
  }
}
