/** @decorator */

import { PPPAppearanceElement } from '../lib/ppp-element.js';
import {
  attr,
  observable,
  css,
  slotted,
  html,
  Observable,
  Updates
} from '../vendor/fast-element.min.js';
import {
  findLastIndex,
  keyArrowDown,
  keyArrowUp,
  keyEnd,
  keyEnter,
  keyEscape,
  keyHome,
  keySpace,
  keyTab,
  uniqueId,
  inRange
} from '../vendor/fast-utilities.js';
import { normalize } from '../design/styles.js';
import { applyMixins } from '../vendor/fast-utilities.js';
import { ARIAGlobalStatesAndProperties } from '../vendor/fast-patterns.js';
import { isListboxOption } from './listbox-option.js';

export class Listbox extends PPPAppearanceElement {
  #options;

  @attr({ mode: 'boolean' })
  disabled;

  @observable
  selectedIndex;

  @observable
  selectedOptions;

  @observable
  slottedOptions;

  @observable
  typeaheadBuffer;

  constructor() {
    super();

    this.#options = [];
    this.selectedIndex = -1;
    this.selectedOptions = [];
    this.shouldSkipFocus = false;
    this.typeaheadBuffer = '';
    this.typeaheadExpired = true;
    this.typeaheadTimeout = -1;
  }

  get firstSelectedOption() {
    return this.selectedOptions[0] ?? null;
  }

  get hasSelectableOptions() {
    return this.options.length > 0 && !this.options.every((o) => o.disabled);
  }

  get length() {
    return this.options?.length ?? 0;
  }

  get options() {
    Observable.track(this, 'options');

    return this.#options;
  }

  set options(value) {
    this.#options = value;
    Observable.notify(this, 'options');
  }

  get typeAheadExpired() {
    return this.typeaheadExpired;
  }

  set typeAheadExpired(value) {
    this.typeaheadExpired = value;
  }

  static {
    this.slottedOptionFilter = (n) => isListboxOption(n) && !n.hidden;
  }

  static {
    this.TYPE_AHEAD_TIMEOUT_MS = 1000;
  }

  clickHandler(e) {
    const captured = e.target.closest(`option,[role=option]`);

    if (captured && !captured.disabled) {
      this.selectedIndex = this.options.indexOf(captured);

      return true;
    }
  }

  focusAndScrollOptionIntoView(optionToFocus = this.firstSelectedOption) {
    if (this.contains(document.activeElement) && optionToFocus !== null) {
      optionToFocus.focus();
      requestAnimationFrame(() => {
        optionToFocus.scrollIntoView({ block: 'nearest' });
      });
    }
  }

  focusinHandler(e) {
    if (!this.shouldSkipFocus && e.target === e.currentTarget) {
      this.setSelectedOptions();
      this.focusAndScrollOptionIntoView();
    }

    this.shouldSkipFocus = false;
  }

  getTypeaheadMatches() {
    const pattern = this.typeaheadBuffer.replace(
      /[.*+\-?^${}()|[\]\\]/g,
      '\\$&'
    );
    const re = new RegExp(`^${pattern}`, 'gi');

    return this.options.filter((o) => o.text.trim().match(re));
  }

  getSelectableIndex(prev = this.selectedIndex, next) {
    const direction = prev > next ? -1 : prev < next ? 1 : 0;
    const potentialDirection = prev + direction;
    let nextSelectableOption = null;

    switch (direction) {
      case -1: {
        nextSelectableOption = this.options.reduceRight(
          (nextSelectableOption, thisOption, index) =>
            !nextSelectableOption &&
            !thisOption.disabled &&
            index < potentialDirection
              ? thisOption
              : nextSelectableOption,
          nextSelectableOption
        );

        break;
      }
      case 1: {
        nextSelectableOption = this.options.reduce(
          (nextSelectableOption, thisOption, index) =>
            !nextSelectableOption &&
            !thisOption.disabled &&
            index > potentialDirection
              ? thisOption
              : nextSelectableOption,
          nextSelectableOption
        );

        break;
      }
    }

    return this.options.indexOf(nextSelectableOption);
  }

  handleChange(source, propertyName) {
    switch (propertyName) {
      case 'selected': {
        if (Listbox.slottedOptionFilter(source)) {
          this.selectedIndex = this.options.indexOf(source);
        }

        this.setSelectedOptions();

        break;
      }
    }
  }

  handleTypeAhead(key) {
    if (this.typeaheadTimeout) {
      window.clearTimeout(this.typeaheadTimeout);
    }

    this.typeaheadTimeout = window.setTimeout(
      () => (this.typeaheadExpired = true),
      Listbox.TYPE_AHEAD_TIMEOUT_MS
    );

    if (key.length > 1) {
      return;
    }

    this.typeaheadBuffer = `${
      this.typeaheadExpired ? '' : this.typeaheadBuffer
    }${key}`;
  }

  keydownHandler(e) {
    if (this.disabled) {
      return true;
    }

    this.shouldSkipFocus = false;

    const key = e.key;

    // noinspection FallThroughInSwitchStatementJS
    switch (key) {
      case keyHome: {
        if (!e.shiftKey) {
          e.preventDefault();
          this.selectFirstOption();
        }

        break;
      }
      case keyArrowDown: {
        if (!e.shiftKey) {
          e.preventDefault();
          this.selectNextOption();
        }

        break;
      }
      case keyArrowUp: {
        if (!e.shiftKey) {
          e.preventDefault();
          this.selectPreviousOption();
        }

        break;
      }
      case keyEnd: {
        e.preventDefault();
        this.selectLastOption();

        break;
      }
      case keyTab: {
        this.focusAndScrollOptionIntoView();

        return true;
      }
      case keyEnter:
      case keyEscape: {
        return true;
      }
      case keySpace: {
        if (this.typeaheadExpired) {
          return true;
        }
      }
      default: {
        if (key.length === 1) {
          this.handleTypeAhead(`${key}`);
        }

        return true;
      }
    }
  }

  mousedownHandler(e) {
    this.shouldSkipFocus = !this.contains(document.activeElement);

    return true;
  }

  multipleChanged(prev, next) {
    this.ariaMultiSelectable = next ? 'true' : null;
  }

  selectedIndexChanged(prev, next) {
    if (!this.hasSelectableOptions) {
      this.selectedIndex = -1;

      return;
    }

    if (
      this.options[this.selectedIndex]?.disabled &&
      typeof prev === 'number'
    ) {
      const selectableIndex = this.getSelectableIndex(prev, next);
      const newNext = selectableIndex > -1 ? selectableIndex : prev;

      this.selectedIndex = newNext;

      if (next === newNext) {
        this.selectedIndexChanged(next, newNext);
      }

      return;
    }

    this.setSelectedOptions();
  }

  selectedOptionsChanged(prev, next) {
    const filteredNext = next.filter(Listbox.slottedOptionFilter);

    this.options?.forEach((o) => {
      const notifier = Observable.getNotifier(o);

      notifier.unsubscribe(this, 'selected');
      o.selected = filteredNext.includes(o);
      notifier.subscribe(this, 'selected');
    });
  }

  selectFirstOption() {
    if (!this.disabled) {
      this.selectedIndex = this.options?.findIndex((o) => !o.disabled) ?? -1;
    }
  }

  selectLastOption() {
    if (!this.disabled) {
      this.selectedIndex = findLastIndex(this.options, (o) => !o.disabled);
    }
  }

  selectNextOption() {
    if (!this.disabled && this.selectedIndex < this.options.length - 1) {
      this.selectedIndex += 1;
    }
  }

  selectPreviousOption() {
    if (!this.disabled && this.selectedIndex > 0) {
      this.selectedIndex = this.selectedIndex - 1;
    }
  }

  setDefaultSelectedOption() {
    this.selectedIndex =
      this.options?.findIndex((el) => el.defaultSelected) ?? -1;
  }

  setSelectedOptions() {
    if (this.options?.length) {
      this.selectedOptions = [this.options[this.selectedIndex]];
      this.ariaActiveDescendant = this.firstSelectedOption?.id ?? '';
      this.focusAndScrollOptionIntoView();
    }
  }

  slottedOptionsChanged(prev, next) {
    this.options = next.reduce((options, item) => {
      if (isListboxOption(item)) {
        options.push(item);
      }

      return options;
    }, []);

    const setSize = `${this.options.length}`;

    this.options.forEach((option, index) => {
      if (!option.id) {
        option.id = uniqueId('option-');
      }

      option.ariaPosInSet = `${index + 1}`;
      option.ariaSetSize = setSize;
    });

    if (this.$fastController.isConnected) {
      this.setSelectedOptions();
      this.setDefaultSelectedOption();
    }
  }

  typeaheadBufferChanged(prev, next) {
    if (this.$fastController.isConnected) {
      const typeaheadMatches = this.getTypeaheadMatches();

      if (typeaheadMatches.length) {
        const selectedIndex = this.options.indexOf(typeaheadMatches[0]);

        if (selectedIndex > -1) {
          this.selectedIndex = selectedIndex;
        }
      }

      this.typeaheadExpired = false;
    }
  }
}

export const listboxTemplate = html`
  <template
    aria-activedescendant="${(x) => x.ariaActiveDescendant}"
    aria-multiselectable="${(x) => x.ariaMultiSelectable}"
    role="listbox"
    tabindex="${(x) => (!x.disabled ? '0' : null)}"
    @click="${(x, c) => x.clickHandler(c.event)}"
    @focusin="${(x, c) => x.focusinHandler(c.event)}"
    @keydown="${(x, c) => x.keydownHandler(c.event)}"
    @mousedown="${(x, c) => x.mousedownHandler(c.event)}"
  >
    <slot
      ${slotted({
        filter: Listbox.slottedOptionFilter,
        flatten: true,
        property: 'slottedOptions'
      })}
    ></slot>
  </template>
`;

export const listboxStyles = css`
  ${normalize()}
`;

export class DelegatesARIAListbox {
  @observable
  ariaActiveDescendant;

  @observable
  ariaDisabled;

  @observable
  ariaExpanded;

  @observable
  ariaMultiSelectable;
}

applyMixins(Listbox, DelegatesARIAListbox, ARIAGlobalStatesAndProperties);

export class ListboxElement extends Listbox {
  constructor() {
    super();

    this.activeIndex = -1;
    this.rangeStartIndex = -1;
  }

  get activeOption() {
    return this.options[this.activeIndex];
  }

  get checkedOptions() {
    return this.options?.filter((o) => o.checked);
  }

  get firstSelectedOptionIndex() {
    return this.options.indexOf(this.firstSelectedOption);
  }

  activeIndexChanged(prev, next) {
    this.ariaActiveDescendant = this.options[next]?.id ?? '';
    this.focusAndScrollOptionIntoView();
  }

  checkActiveIndex() {
    if (!this.multiple) {
      return;
    }

    const activeItem = this.activeOption;

    if (activeItem) {
      activeItem.checked = true;
    }
  }

  checkFirstOption(preserveChecked = false) {
    if (preserveChecked) {
      if (this.rangeStartIndex === -1) {
        this.rangeStartIndex = this.activeIndex + 1;
      }

      this.options.forEach((o, i) => {
        o.checked = inRange(i, this.rangeStartIndex);
      });
    } else {
      this.uncheckAllOptions();
    }

    this.activeIndex = 0;
    this.checkActiveIndex();
  }

  checkLastOption(preserveChecked = false) {
    if (preserveChecked) {
      if (this.rangeStartIndex === -1) {
        this.rangeStartIndex = this.activeIndex;
      }

      this.options.forEach((o, i) => {
        o.checked = inRange(i, this.rangeStartIndex, this.options.length);
      });
    } else {
      this.uncheckAllOptions();
    }

    this.activeIndex = this.options.length - 1;
    this.checkActiveIndex();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('focusout', this.focusoutHandler);
  }

  disconnectedCallback() {
    this.removeEventListener('focusout', this.focusoutHandler);
    super.disconnectedCallback();
  }

  checkNextOption(preserveChecked = false) {
    if (preserveChecked) {
      if (this.rangeStartIndex === -1) {
        this.rangeStartIndex = this.activeIndex;
      }

      this.options.forEach((o, i) => {
        o.checked = inRange(i, this.rangeStartIndex, this.activeIndex + 1);
      });
    } else {
      this.uncheckAllOptions();
    }

    this.activeIndex += this.activeIndex < this.options.length - 1 ? 1 : 0;
    this.checkActiveIndex();
  }

  checkPreviousOption(preserveChecked = false) {
    if (preserveChecked) {
      if (this.rangeStartIndex === -1) {
        this.rangeStartIndex = this.activeIndex;
      }

      if (this.checkedOptions.length === 1) {
        this.rangeStartIndex += 1;
      }

      this.options.forEach((o, i) => {
        o.checked = inRange(i, this.activeIndex, this.rangeStartIndex);
      });
    } else {
      this.uncheckAllOptions();
    }

    this.activeIndex -= this.activeIndex > 0 ? 1 : 0;
    this.checkActiveIndex();
  }

  clickHandler(e) {
    if (!this.multiple) {
      return super.clickHandler(e);
    }

    const captured = e.target?.closest(`[role=option]`);

    if (!captured || captured.disabled) {
      return;
    }

    this.uncheckAllOptions();
    this.activeIndex = this.options.indexOf(captured);
    this.checkActiveIndex();
    this.toggleSelectedForAllCheckedOptions();

    return true;
  }

  focusAndScrollOptionIntoView() {
    super.focusAndScrollOptionIntoView(this.activeOption);
  }

  focusinHandler(e) {
    if (!this.multiple) {
      return super.focusinHandler(e);
    }

    if (!this.shouldSkipFocus && e.target === e.currentTarget) {
      this.uncheckAllOptions();

      if (this.activeIndex === -1) {
        this.activeIndex =
          this.firstSelectedOptionIndex !== -1
            ? this.firstSelectedOptionIndex
            : 0;
      }

      this.checkActiveIndex();
      this.setSelectedOptions();
      this.focusAndScrollOptionIntoView();
    }

    this.shouldSkipFocus = false;
  }

  focusoutHandler(e) {
    if (this.multiple) {
      this.uncheckAllOptions();
    }
  }

  keydownHandler(e) {
    if (!this.multiple) {
      return super.keydownHandler(e);
    }

    if (this.disabled) {
      return true;
    }

    const { key, shiftKey } = e;

    this.shouldSkipFocus = false;

    switch (key) {
      // Select the first available option
      case keyHome: {
        this.checkFirstOption(shiftKey);

        return;
      }
      // Select the next selectable option
      case keyArrowDown: {
        this.checkNextOption(shiftKey);

        return;
      }
      // Select the previous selectable option
      case keyArrowUp: {
        this.checkPreviousOption(shiftKey);

        return;
      }
      // Select the last available option
      case keyEnd: {
        this.checkLastOption(shiftKey);

        return;
      }
      case keyTab: {
        this.focusAndScrollOptionIntoView();

        return true;
      }
      case keyEscape: {
        this.uncheckAllOptions();
        this.checkActiveIndex();

        return true;
      }
      case keySpace: {
        e.preventDefault();

        if (this.typeAheadExpired) {
          this.toggleSelectedForAllCheckedOptions();

          return;
        }
      }
      // Send key to Typeahead handler
      default: {
        if (key.length === 1) {
          this.handleTypeAhead(`${key}`);
        }

        return true;
      }
    }
  }

  mousedownHandler(e) {
    if (e.offsetX >= 0 && e.offsetX <= this.scrollWidth) {
      return super.mousedownHandler(e);
    }
  }

  multipleChanged(prev, next) {
    this.ariaMultiSelectable = next ? 'true' : null;
    this.options?.forEach((o) => {
      o.checked = next ? false : undefined;
    });
    this.setSelectedOptions();
  }

  setSelectedOptions() {
    if (!this.multiple) {
      super.setSelectedOptions();

      return;
    }

    if (this.$fastController.isConnected && this.options) {
      this.selectedOptions = this.options.filter((o) => o.selected);
      this.focusAndScrollOptionIntoView();
    }
  }

  sizeChanged(prev, next) {
    const size = Math.max(0, parseInt(next?.toFixed() ?? '', 10));

    if (size !== next) {
      Updates.enqueue(() => {
        this.size = size;
      });
    }
  }

  toggleSelectedForAllCheckedOptions() {
    const enabledCheckedOptions = this.checkedOptions.filter(
      (o) => !o.disabled
    );
    const force = !enabledCheckedOptions.every((o) => o.selected);

    enabledCheckedOptions.forEach((o) => (o.selected = force));
    this.selectedIndex = this.options.indexOf(
      enabledCheckedOptions[enabledCheckedOptions.length - 1]
    );
    this.setSelectedOptions();
  }

  typeaheadBufferChanged(prev, next) {
    if (!this.multiple) {
      super.typeaheadBufferChanged(prev, next);

      return;
    }

    if (this.$fastController.isConnected) {
      const typeaheadMatches = this.getTypeaheadMatches();
      const activeIndex = this.options.indexOf(typeaheadMatches[0]);

      if (activeIndex > -1) {
        this.activeIndex = activeIndex;
        this.uncheckAllOptions();
        this.checkActiveIndex();
      }

      this.typeAheadExpired = false;
    }
  }

  uncheckAllOptions(preserveChecked = false) {
    this.options.forEach(
      (o) => (o.checked = this.multiple ? false : undefined)
    );

    if (!preserveChecked) {
      this.rangeStartIndex = -1;
    }
  }
}
