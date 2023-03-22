/** @decorator */

import { Listbox, ListboxElement } from './listbox.js';
import {
  attr,
  observable,
  css,
  slotted,
  html,
  ref,
  when
} from '../vendor/fast-element.min.js';
import {
  ellipsis,
  normalize,
  scrollbars,
  typography
} from '../design/styles.js';
import { startSlotTemplate } from '../vendor/fast-patterns.js';
import { caretDown, warning } from '../static/svg/sprite.js';
import {
  bodyFont,
  fontSizeBody1,
  fontWeightBody1,
  lineHeightBody1,
  paletteBlack,
  paletteBlueLight1,
  paletteGrayBase,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayDark3,
  paletteGrayDark4,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenBase,
  paletteGreenDark1,
  paletteRedBase,
  paletteRedLight1,
  paletteWhite,
  spacing1,
  themeConditional
} from '../design/design-tokens.js';
import { display } from '../vendor/fast-utilities.js';

export const selectTemplate = html`
  <template
    class="${(x) => (x.open ? 'open' : '')} ${(x) =>
      x.appearance ?? 'default'} ${(x) => (x.disabled ? 'disabled' : '')} ${(
      x
    ) => x.position}"
    role="${(x) => x.role}"
    tabindex="${(x) => (!x.disabled ? '0' : null)}"
    aria-disabled="${(x) => x.ariaDisabled}"
    aria-expanded="${(x) => x.ariaExpanded}"
    @click="${(x, c) => x.clickHandler(c.event)}"
    @focusout="${(x, c) => x.focusoutHandler(c.event)}"
    @keydown="${(x, c) => x.keydownHandler(c.event)}"
  >
    <label part="label" for="control" class="label">
      <slot name="label"></slot>
    </label>
    <p class="description">
      <slot name="description"></slot>
    </p>
    <div class="root" part="root">
      <div class="root-container">
        <div
          aria-activedescendant="${(x) =>
            x.open ? x.ariaActiveDescendant : null}"
          aria-controls="listbox"
          aria-expanded="${(x) => x.ariaExpanded}"
          aria-haspopup="listbox"
          class="control"
          part="control"
          role="button"
          ?disabled="${(x) => x.disabled}"
        >
          ${startSlotTemplate()}
          <slot name="button-container">
            <div class="selected-value" part="selected-value">
              <slot name="selected-value">${(x) => x.displayValue}</slot>
            </div>
            ${when(
              (x) => x.appearance === 'error' && x.errorMessage,
              html`
                <div class="indicator" part="indicator">
                  <slot name="indicator"> ${html.partial(warning)}</slot>
                </div>
              `
            )}
            ${when(
              (x) => x.appearance === 'default',
              html`
                <div class="indicator" part="indicator">
                  <slot name="indicator"> ${html.partial(caretDown)}</slot>
                </div>
              `
            )}
          </slot>
        </div>
        <div
          aria-disabled="${(x) => x.disabled}"
          class="listbox"
          id="listbox"
          part="listbox"
          role="listbox"
          ?disabled="${(x) => x.disabled}"
          ?hidden="${(x) => !x.open}"
          ${ref('listbox')}
        >
          <slot
            ${slotted({
              filter: Listbox.slottedOptionFilter,
              flatten: true,
              property: 'slottedOptions'
            })}
          ></slot>
        </div>
      </div>
    </div>
    ${when(
      (x) => x.appearance === 'error' && x.errorMessage,
      html` <div class="helper body1 error">
        <label>${(x) => x.errorMessage}</label>
      </div>`
    )}
  </template>
`;

export const selectStyles = css`
  ${normalize()}
  ${display('flex')}
  ${typography()}
  ${scrollbars('.listbox')}
  :host {
    flex-direction: column;
    position: relative;
    z-index: 2;
  }

  :host(.open) {
    z-index: 100;
  }

  :host(:focus-visible) {
    outline: none;
  }

  .label,
  .description {
    padding-bottom: ${spacing1};
  }

  .root {
    position: relative;
    display: flex;
    align-items: center;
    z-index: 0;
  }

  .root-container {
    display: inline-flex;
    align-items: stretch;
    position: relative;
    z-index: 0;
    width: 100%;
  }

  .control {
    display: flex;
    position: relative;
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    font-weight: ${fontWeightBody1};
    line-height: ${lineHeightBody1};
    width: 100%;
    height: 36px;
    border-radius: 4px;
    padding: 0 4px 0 12px;
    border: 1px solid ${paletteGrayBase};
    z-index: 1;
    outline: none;
    color: ${themeConditional(paletteBlack, paletteGrayLight3)};
    background-color: ${themeConditional(paletteWhite, paletteGrayDark4)};
    user-select: none;
    min-width: 250px;
    vertical-align: top;
    align-items: center;
    cursor: pointer;
  }

  :host(:hover:not([disabled])) .control:hover {
    border-color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  :host(:focus-visible) .control[part='control'] {
    border-color: ${paletteBlueLight1};
  }

  :host([disabled]) {
    cursor: not-allowed;
  }

  :host([disabled]) .control {
    color: ${themeConditional(paletteGrayBase, paletteGrayDark1)};
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark3)};
    border-color: ${themeConditional(paletteGrayLight1, paletteGrayDark2)};
    cursor: not-allowed;
  }

  .listbox {
    background-color: ${themeConditional(paletteWhite, paletteGrayDark3)};
    border: 1px solid ${paletteGrayBase};
    display: flex;
    position: absolute;
    flex-direction: column;
    border-radius: 2px;
    left: 0;
    min-height: 36px;
    max-height: calc(var(--max-height) - (36 * 4px));
    overflow-y: auto;
    width: 100%;
    z-index: 1;
  }

  .listbox[hidden] {
    display: none;
  }

  :host([disabled]) .control {
    cursor: not-allowed;
    user-select: none;
  }

  :host([open][position='above']) .listbox {
    bottom: 40px;
  }

  :host([open][position='below']) .listbox {
    top: 40px;
  }

  .selected-value {
    flex: 1 1 auto;
    font-family: inherit;
    text-align: start;
    ${ellipsis()};
  }

  .indicator {
    flex: 0 0 auto;
    margin-inline-start: 1em;
  }

  slot[name='listbox'] {
    display: none;
    width: 100%;
  }

  :host([open]) slot[name='listbox'] {
    display: flex;
    position: absolute;
  }

  .indicator {
    color: ${themeConditional(paletteGrayDark2, paletteGrayLight1)};
    height: 16px;
    width: 16px;
  }

  ::slotted([role='option']),
  ::slotted(option) {
    flex: 0 0 auto;
  }

  .helper {
    font-family: ${bodyFont};
    text-transform: none;
    min-height: 20px;
    padding-top: ${spacing1};
  }

  :host(.error) .helper,
  :host(.error) .indicator {
    color: ${themeConditional(paletteRedBase, paletteRedLight1)};
  }

  :host(.error:not([disabled])) .control {
    border-color: ${themeConditional(paletteRedBase, paletteRedLight1)};
    padding-right: 10px;
  }
`;

export let SelectPosition;
(function (SelectPosition) {
  SelectPosition['above'] = 'above';
  SelectPosition['below'] = 'below';
})(SelectPosition || (SelectPosition = {}));

export let SelectRole;
(function (SelectRole) {
  SelectRole['combobox'] = 'combobox';
})(SelectRole || (SelectRole = {}));

export class Select extends ListboxElement {
  @attr({ mode: 'boolean' })
  open;

  @observable
  errorMessage;

  @attr
  placeholder;

  @attr({ attribute: 'position' })
  positionAttribute;

  @attr
  value;

  @attr({ mode: 'boolean' })
  readOnly;

  @attr({ mode: 'boolean' })
  deselectable;

  @attr
  name;

  indexWhenOpened;

  forcedPosition;

  role;

  @observable
  position;

  @observable
  maxHeight;

  @observable
  displayValue;

  constructor() {
    super();

    this.open = false;
    this.forcedPosition = false;
    this.role = SelectRole.combobox;
    this.position = SelectPosition.below;
    this.maxHeight = 0;
    this.displayValue = '';
  }

  openChanged() {
    this.ariaExpanded = this.open ? 'true' : 'false';

    if (this.open) {
      this.setPositioning();
      this.focusAndScrollOptionIntoView();
      this.indexWhenOpened = this.selectedIndex;
    }

    this.$emit('openchange');
  }

  update() {
    if (Array.isArray(this.options)) {
      this.selectedIndex = this.options.findIndex(
        (el) => el.value === this.value
      );

      this.setSelectedOptions();

      this.displayValue = this.firstSelectedOption
        ? this.firstSelectedOption.textContent ?? this.firstSelectedOption.value
        : this.placeholder;
    }
  }

  valueChanged() {
    if (this.$fastController.isConnected && this.options) {
      this.update();

      this.$emit('change', this, {
        bubbles: true,
        composed: undefined
      });
    }
  }

  setPositioning() {
    const currentBox = this.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const availableBottom = viewportHeight - currentBox.bottom;

    this.position = this.forcedPosition
      ? this.positionAttribute
      : currentBox.top > availableBottom
      ? SelectPosition.above
      : SelectPosition.below;
    this.positionAttribute = this.forcedPosition
      ? this.positionAttribute
      : this.position;
    this.maxHeight =
      this.position === SelectPosition.above
        ? ~~currentBox.top
        : ~~availableBottom;
  }

  maxHeightChanged() {
    if (this.listbox) {
      this.listbox.style.setProperty('--max-height', `${this.maxHeight}px`);
    }
  }

  disabledChanged(prev, next) {
    if (super.disabledChanged) {
      super.disabledChanged(prev, next);
    }

    this.ariaDisabled = this.disabled ? 'true' : 'false';
  }

  clickHandler(e) {
    if (this.disabled) {
      return;
    }

    if (!this.slottedOptions.length) return;

    if (this.open) {
      const captured = e.target.closest(`option, [role=option]`);

      if (captured && captured.disabled) {
        return;
      }
    }

    super.clickHandler(e);
    this.open = !this.open;

    if (!this.open) {
      if (this.deselectable && this.value === this.firstSelectedOption?.value) {
        this.value = void 0;
      } else {
        this.value = this.firstSelectedOption
          ? this.firstSelectedOption.value
          : void 0;
      }
    }

    return true;
  }

  focusoutHandler(e) {
    if (!this.open) {
      return true;
    }

    const focusTarget = e.relatedTarget;

    if (this.isSameNode(focusTarget)) {
      this.focus();

      return;
    }

    if (!this.options?.includes(focusTarget)) {
      this.open = false;

      if (this.indexWhenOpened !== this.selectedIndex) {
        this.update();
      }
    }
  }

  selectedIndexChanged(prev, next) {
    super.selectedIndexChanged(prev, next);
  }

  slottedOptionsChanged(prev, next) {
    super.slottedOptionsChanged(prev, next);

    if (next) {
      this.update();
    }
  }

  keydownHandler(e) {
    super.keydownHandler(e);

    const key = e.key || e.key.charCodeAt(0);

    switch (key) {
      case ' ': {
        if (this.typeAheadExpired) {
          e.preventDefault();
          this.open = !this.open;
        }

        break;
      }
      case 'Enter': {
        e.preventDefault();
        this.open = !this.open;

        break;
      }
      case 'Escape': {
        if (this.open) {
          e.preventDefault();
          this.open = false;
        }

        break;
      }
      case 'Tab': {
        if (!this.open) {
          return true;
        }

        e.preventDefault();
        this.open = false;
      }
    }

    if (this.open) {
      if (this.selectedOptions)
        this.value = this.firstSelectedOption
          ? this.firstSelectedOption.value
          : void 0;
    } else this.update();

    return true;
  }

  connectedCallback() {
    super.connectedCallback();

    this.forcedPosition = !!this.positionAttribute;
  }
}

export default Select.compose({
  template: selectTemplate,
  styles: selectStyles
}).define();
