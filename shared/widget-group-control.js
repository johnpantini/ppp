/** @decorator */

import { OffClickElement } from './off-click-element.js';
import { attr } from './element/components/attributes.js';

export class WidgetGroupControl extends OffClickElement {
  @attr({ mode: 'boolean' })
  open;

  @attr
  selection;

  handleClick({ event }) {
    if (event.composedPath().find((n) => n.classList?.contains('toggle'))) {
      this.open = !this.open;
    }
  }

  documentOffClickHandler() {
    this.open = false;
  }

  documentKeydownHandler(event) {
    if (event.key === 'Escape') {
      this.open = false;
    }
  }

  setGroup(group) {
    this.selection = group?.toString();
    this.open = false;

    if (this.selection && !this.widget.preview) {
      const sourceWidget = Array.from(
        this.widget.container.shadowRoot.querySelectorAll('.widget')
      )
        .filter((w) => w !== this.widget)
        .find(
          (w) => w?.groupControl.selection === this.selection && w.instrument
        );

      if (
        sourceWidget?.instrument &&
        sourceWidget?.instrument?._id !== this.widget?.instrument?._id
      ) {
        this.widget.isolated = true;
        this.widget.instrument = sourceWidget.instrument;
        this.widget.isolated = false;

        void this.widget.applyChanges({
          $set: {
            'widgets.$.instrumentId': this.widget.instrument._id
          }
        });
      }

      void this.widget.applyChanges({
        $set: {
          'widgets.$.group': group?.toString()
        }
      });
    } else if (!this.selection) {
      void this.widget.applyChanges({
        $set: {
          'widgets.$.group': null
        }
      });
    }
  }
}
