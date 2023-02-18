/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import {
  attr,
  observable,
  css,
  elements,
  slotted,
  html
} from '../vendor/fast-element.min.js';
import {
  display,
  Orientation,
  getDirection,
  ArrowKeys,
  Direction,
  keyArrowDown,
  keyArrowLeft,
  keyArrowRight,
  keyArrowUp,
  keyEnter
} from '../vendor/fast-utilities.js';
import { normalize } from '../design/styles.js';
import { spacing1, spacing2 } from '../design/design-tokens.js';
import './radio.js';

export const radioGroupTemplate = html`
  <template
    role="radiogroup"
    tabindex="${(x) => (x.disabled ? -1 : void 0)}"
    aria-disabled="${(x) => x.disabled}"
    aria-readonly="${(x) => x.readOnly}"
    aria-orientation="${(x) => x.orientation}"
    @click="${(x, c) => x.clickHandler(c.event)}"
    @mousedown="${(x, c) => x.handleDisabledClick(c.event)}"
    @keydown="${(x, c) => x.keydownHandler(c.event)}"
    @focusout="${(x, c) => x.focusOutHandler(c.event)}"
  >
    <slot name="label"></slot>
    <div
      class="positioning-region ${(x) =>
        x.orientation === Orientation.horizontal ? 'horizontal' : 'vertical'}"
      part="positioning-region"
    >
      <slot
        ${slotted({
          property: 'slottedRadioButtons',
          filter: elements('[role=radio]')
        })}
      ></slot>
    </div>
  </template>
`;

export const radioGroupStyles = css`
  ${normalize()}
  ${display('flex')}
  :host {
    align-items: flex-start;
    margin: ${spacing1} 0;
    flex-direction: column;
  }

  .positioning-region {
    display: flex;
    flex-wrap: wrap;
    gap: ${spacing2};
  }

  :host([orientation='vertical']) .positioning-region {
    flex-direction: column;
  }

  :host([orientation='horizontal']) .positioning-region {
    flex-direction: row;
  }
`;

export class RadioGroup extends PPPElement {
  @attr({ attribute: 'readonly', mode: 'boolean' })
  readOnly;

  @attr({ attribute: 'disabled', mode: 'boolean' })
  disabled;

  @attr
  name;

  @attr
  value;

  @attr
  orientation;

  @observable
  childItems;

  @observable
  slottedRadioButtons;

  constructor() {
    super();

    this.orientation = Orientation.horizontal;

    this.radioChangeHandler = (e) => {
      const changedRadio = e.target;

      if (changedRadio.checked) {
        this.slottedRadioButtons.forEach((radio) => {
          if (radio !== changedRadio) {
            radio.checked = false;

            if (!this.isInsideFoundationToolbar) {
              radio.setAttribute('tabindex', '-1');
            }
          }
        });
        this.selectedRadio = changedRadio;
        this.value = changedRadio.value;
        changedRadio.setAttribute('tabindex', '0');
        this.focusedRadio = changedRadio;
      }

      e.stopPropagation();
    };

    this.moveToRadioByIndex = (group, index) => {
      const radio = group[index];

      if (!this.isInsideToolbar) {
        radio.setAttribute('tabindex', '0');

        if (radio.readOnly) {
          this.slottedRadioButtons.forEach((nextRadio) => {
            if (nextRadio !== radio) {
              nextRadio.setAttribute('tabindex', '-1');
            }
          });
        } else {
          radio.checked = true;
          this.selectedRadio = radio;
        }
      }

      this.focusedRadio = radio;
      radio.focus();
    };

    this.moveRightOffGroup = () => {
      this.nextElementSibling?.focus();
    };

    this.moveLeftOffGroup = () => {
      this.previousElementSibling?.focus();
    };

    this.focusOutHandler = (e) => {
      const group = this.slottedRadioButtons;
      const radio = e.target;
      const index = radio !== null ? group.indexOf(radio) : 0;
      const focusedIndex = this.focusedRadio
        ? group.indexOf(this.focusedRadio)
        : -1;

      if (
        (focusedIndex === 0 && index === focusedIndex) ||
        (focusedIndex === group.length - 1 && focusedIndex === index)
      ) {
        if (!this.selectedRadio) {
          this.focusedRadio = group[0];
          this.focusedRadio.setAttribute('tabindex', '0');
          group.forEach((nextRadio) => {
            if (nextRadio !== this.focusedRadio) {
              nextRadio.setAttribute('tabindex', '-1');
            }
          });
        } else {
          this.focusedRadio = this.selectedRadio;

          if (!this.isInsideFoundationToolbar) {
            this.selectedRadio.setAttribute('tabindex', '0');
            group.forEach((nextRadio) => {
              if (nextRadio !== this.selectedRadio) {
                nextRadio.setAttribute('tabindex', '-1');
              }
            });
          }
        }
      }

      return true;
    };

    this.handleDisabledClick = (e) => {
      if (this.disabled) {
        e.preventDefault();

        return;
      }

      return true;
    };

    this.clickHandler = (e) => {
      if (this.disabled) {
        return;
      }

      e.preventDefault();

      const radio = e.target;

      if (radio) {
        radio.checked = true;
        radio.setAttribute('tabindex', '0');
        this.selectedRadio = radio;
        this.focusedRadio = radio;
      }
    };

    this.shouldMoveOffGroupToTheRight = (index, group, key) => {
      return (
        index === group.length && this.isInsideToolbar && key === keyArrowRight
      );
    };

    this.shouldMoveOffGroupToTheLeft = (group, key) => {
      const index = this.focusedRadio
        ? group.indexOf(this.focusedRadio) - 1
        : 0;

      return index < 0 && this.isInsideToolbar && key === keyArrowLeft;
    };

    this.checkFocusedRadio = () => {
      if (
        this.focusedRadio !== null &&
        !this.focusedRadio.readOnly &&
        !this.focusedRadio.checked
      ) {
        this.focusedRadio.checked = true;
        this.focusedRadio.setAttribute('tabindex', '0');
        this.focusedRadio.focus();
        this.selectedRadio = this.focusedRadio;
      }
    };

    this.moveRight = (e) => {
      const group = this.slottedRadioButtons;
      let index = 0;

      index = this.focusedRadio ? group.indexOf(this.focusedRadio) + 1 : 1;

      if (this.shouldMoveOffGroupToTheRight(index, group, e.key)) {
        this.moveRightOffGroup();

        return;
      } else if (index === group.length) {
        index = 0;
      }

      while (index < group.length && group.length > 1) {
        if (!group[index].disabled) {
          this.moveToRadioByIndex(group, index);

          break;
        } else if (
          this.focusedRadio &&
          index === group.indexOf(this.focusedRadio)
        ) {
          break;
        } else if (index + 1 >= group.length) {
          if (this.isInsideToolbar) {
            break;
          } else {
            index = 0;
          }
        } else {
          index += 1;
        }
      }
    };

    this.moveLeft = (e) => {
      const group = this.slottedRadioButtons;
      let index = 0;

      index = this.focusedRadio ? group.indexOf(this.focusedRadio) - 1 : 0;
      index = index < 0 ? group.length - 1 : index;

      if (this.shouldMoveOffGroupToTheLeft(group, e.key)) {
        this.moveLeftOffGroup();

        return;
      }

      while (index >= 0 && group.length > 1) {
        if (!group[index].disabled) {
          this.moveToRadioByIndex(group, index);

          break;
        } else if (
          this.focusedRadio &&
          index === group.indexOf(this.focusedRadio)
        ) {
          break;
        } else if (index - 1 < 0) {
          index = group.length - 1;
        } else {
          index -= 1;
        }
      }
    };

    this.keydownHandler = (e) => {
      const key = e.key;

      if (key in ArrowKeys && this.isInsideFoundationToolbar) {
        return true;
      }

      switch (key) {
        case keyEnter: {
          this.checkFocusedRadio();

          break;
        }
        case keyArrowRight:
        case keyArrowDown: {
          if (this.direction === Direction.ltr) {
            this.moveRight(e);
          } else {
            this.moveLeft(e);
          }

          break;
        }
        case keyArrowLeft:
        case keyArrowUp: {
          if (this.direction === Direction.ltr) {
            this.moveLeft(e);
          } else {
            this.moveRight(e);
          }

          break;
        }
        default: {
          return true;
        }
      }
    };
  }

  readOnlyChanged() {
    if (this.slottedRadioButtons !== undefined) {
      this.slottedRadioButtons.forEach((radio) => {
        radio.readOnly = !!this.readOnly;
      });
    }
  }

  disabledChanged() {
    if (this.slottedRadioButtons !== undefined) {
      this.slottedRadioButtons.forEach((radio) => {
        radio.disabled = !!this.disabled;
      });
    }
  }

  nameChanged() {
    if (this.slottedRadioButtons) {
      this.slottedRadioButtons.forEach((radio) => {
        radio.setAttribute('name', this.name);
      });
    }
  }

  valueChanged() {
    if (this.slottedRadioButtons) {
      this.slottedRadioButtons.forEach((radio) => {
        if (radio.value === this.value) {
          radio.checked = true;
          this.selectedRadio = radio;
        }
      });
    }

    this.$emit('change');
  }

  slottedRadioButtonsChanged(oldValue, newValue) {
    if (this.slottedRadioButtons && this.slottedRadioButtons.length > 0) {
      this.setupRadioButtons();
    }
  }

  get parentToolbar() {
    return this.closest('[role="toolbar"]');
  }

  get isInsideToolbar() {
    return this.parentToolbar ?? false;
  }

  get isInsideFoundationToolbar() {
    return !!this.parentToolbar?.['$pppController'];
  }

  connectedCallback() {
    super.connectedCallback();
    this.direction = getDirection(this);
    this.setupRadioButtons();
  }

  disconnectedCallback() {
    this.slottedRadioButtons.forEach((radio) => {
      radio.removeEventListener('change', this.radioChangeHandler);
    });
  }

  setupRadioButtons() {
    const checkedRadios = this.slottedRadioButtons.filter((radio) => {
      return radio.hasAttribute('checked');
    });
    const numberOfCheckedRadios = checkedRadios ? checkedRadios.length : 0;

    if (numberOfCheckedRadios > 1) {
      const lastCheckedRadio = checkedRadios[numberOfCheckedRadios - 1];

      lastCheckedRadio.checked = true;
    }

    let foundMatchingVal = false;

    this.slottedRadioButtons.forEach((radio) => {
      if (this.name !== undefined) {
        radio.setAttribute('name', this.name);
      }

      if (this.disabled) {
        radio.disabled = true;
      }

      if (this.readOnly) {
        radio.readOnly = true;
      }

      if (this.value && this.value === radio.value) {
        this.selectedRadio = radio;
        this.focusedRadio = radio;
        radio.checked = true;
        radio.setAttribute('tabindex', '0');
        foundMatchingVal = true;
      } else {
        if (!this.isInsideFoundationToolbar) {
          radio.setAttribute('tabindex', '-1');
        }

        radio.checked = false;
      }

      radio.addEventListener('change', this.radioChangeHandler);
    });

    if (this.value === undefined && this.slottedRadioButtons.length > 0) {
      const checkedRadios = this.slottedRadioButtons.filter((radio) => {
        return radio.hasAttribute('checked');
      });
      const numberOfCheckedRadios =
        checkedRadios !== null ? checkedRadios.length : 0;

      if (numberOfCheckedRadios > 0 && !foundMatchingVal) {
        const lastCheckedRadio = checkedRadios[numberOfCheckedRadios - 1];

        lastCheckedRadio.checked = true;
        this.focusedRadio = lastCheckedRadio;
        lastCheckedRadio.setAttribute('tabindex', '0');
      } else {
        this.slottedRadioButtons[0].setAttribute('tabindex', '0');
        this.focusedRadio = this.slottedRadioButtons[0];
      }
    }
  }
}

export default RadioGroup.compose({
  template: radioGroupTemplate,
  styles: radioGroupStyles
}).define();
