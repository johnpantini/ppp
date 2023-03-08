/** @decorator */

import {
  html,
  slotted,
  attr,
  observable,
  when,
  ref,
  css
} from '../vendor/fast-element.min.js';
import { endSlotTemplate, startSlotTemplate } from '../vendor/fast-patterns.js';
import { PPPElement } from '../lib/ppp-element.js';
import {
  display,
  keyArrowDown,
  keyArrowLeft,
  keyArrowRight,
  keyArrowUp,
  keyEnd,
  keyHome,
  uniqueId,
  wrapInBounds
} from '../vendor/fast-utilities.js';
import { normalize } from '../design/styles.js';
import {
  bodyFont,
  fontSizeBody1,
  fontWeightBody1,
  lineHeightBody1,
  paletteBlueBase,
  paletteBlueLight1,
  paletteGrayDark1,
  paletteGrayDark2,
  paletteGrayDark3,
  paletteGrayLight1,
  paletteGrayLight2,
  paletteGreenBase,
  paletteGreenDark1,
  paletteGreenDark2,
  paletteWhite,
  themeConditional
} from '../design/design-tokens.js';

export const tabsTemplate = html`
  <template class="${(x) => x.orientation}">
    ${startSlotTemplate()}
    <div class="tablist" part="tablist" role="tablist">
      <slot name="tab" ${slotted('tabs')}></slot>
      ${when(
        (x) => x.showActiveIndicator,
        html`
          <div
            ${ref('activeIndicatorRef')}
            class="active-indicator"
            part="active-indicator"
          ></div>
        `
      )}
    </div>
    ${endSlotTemplate()}
    <div class="tabpanel">
      <slot name="tabpanel" ${slotted('tabpanels')}></slot>
    </div>
  </template>
`;

export const tabsStyles = css`
  ${normalize()}
  ${display('grid')}
  :host {
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr;
    border-bottom: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }

  .tablist {
    display: grid;
    position: relative;
    grid-template-rows: auto auto;
    grid-template-columns: auto;
    width: max-content;
    align-self: end;
  }

  .start,
  .end {
    align-self: center;
  }

  .tabpanel {
    position: relative;
    grid-row: 2;
    grid-column-start: 1;
    grid-column-end: 4;
  }
`;

export const tabPanelTemplate = html`
  <template slot="tabpanel" role="tabpanel">
    <slot></slot>
  </template>
`;

export const tabPanelStyles = css`
  ${normalize()}
  ${display('flex')}
`;

export const tabTemplate = html`
  <template slot="tab" role="tab" aria-disabled="${(x) => x.disabled}">
    ${startSlotTemplate()}
    <slot></slot>
    ${endSlotTemplate()}
  </template>
`;

export const tabStyles = css`
  ${normalize()}
  ${display('inline-flex')}
  :host {
    display: inline-block;
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    font-weight: 500;
    margin-bottom: -3px;
    border-radius: 4px;
    align-items: center;
    justify-content: center;
    grid-row: 1;
    cursor: pointer;
    background-color: transparent;
    border: 0;
    padding: 12px 16px;
    text-decoration: none;
    max-width: 300px;
    white-space: nowrap;
    position: relative;
    color: ${themeConditional(paletteGrayDark1, paletteGrayLight1)};
  }

  :host:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 4px;
    border-radius: 4px 4px 0 0;
    background-color: transparent;
  }

  :host(:hover) {
    color: ${themeConditional(paletteGrayDark3, paletteWhite)};
  }

  :host([aria-selected='false']:hover):after {
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }

  :host([aria-selected='true']):after {
    background-color: ${paletteGreenDark1};
  }

  :host(:focus) {
    text-decoration: inherit;
  }

  :host([aria-selected='true']) {
    color: ${themeConditional(paletteGreenDark2, paletteGreenBase)};
    cursor: default;
    font-weight: 700;
  }

  :host(:focus-visible) {
    outline: none;
    color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
  }

  :host(:focus) {
    outline: none;
  }

  :host(:focus-visible):after {
    background-color: ${themeConditional(paletteBlueBase, paletteBlueLight1)};
  }

  :host([disabled]) {
    color: ${themeConditional(paletteGrayLight1, paletteGrayDark2)};
    cursor: not-allowed;
  }
`;

export const TabsOrientation = {
  vertical: 'vertical',
  horizontal: 'horizontal'
};

export class Tabs extends PPPElement {
  @attr
  orientation;

  @attr
  activeid;

  @observable
  tabs;

  @observable
  tabpanels;

  @attr({ attribute: 'hide-active-indicator', mode: 'boolean' })
  hideActiveIndicator;

  @observable
  activeIndicatorRef;

  @observable
  showActiveIndicator;

  constructor() {
    super();

    this.orientation = TabsOrientation.horizontal;
    this.hideActiveIndicator = true;
    this.showActiveIndicator = false;
    this.prevActiveTabIndex = 0;
    this.activeTabIndex = 0;
    this.ticking = false;
    this.change = () => {
      this.$emit('change', this.activetab);
    };
    this.isDisabledElement = (el) => {
      return el.getAttribute('aria-disabled') === 'true';
    };
    this.isFocusableElement = (el) => {
      return !this.isDisabledElement(el);
    };
    this.setTabs = () => {
      const gridHorizontalProperty = 'gridColumn';
      const gridVerticalProperty = 'gridRow';
      const gridProperty = this.isHorizontal()
        ? gridHorizontalProperty
        : gridVerticalProperty;

      this.activeTabIndex = this.getActiveIndex();
      this.showActiveIndicator = false;
      this.tabs.forEach((tab, index) => {
        if (tab.slot === 'tab') {
          const isActiveTab =
            this.activeTabIndex === index && this.isFocusableElement(tab);

          if (!this.hideActiveIndicator && this.isFocusableElement(tab)) {
            this.showActiveIndicator = true;
          }

          const tabId = this.tabIds[index];
          const tabpanelId = this.tabpanelIds[index];

          tab.setAttribute('id', tabId);
          tab.setAttribute('aria-selected', isActiveTab ? 'true' : 'false');
          tab.setAttribute('aria-controls', tabpanelId);
          tab.addEventListener('click', this.handleTabClick);
          tab.addEventListener('keydown', this.handleTabKeyDown);
          tab.setAttribute('tabindex', isActiveTab ? '0' : '-1');

          if (isActiveTab) {
            this.activetab = tab;
          }
        }

        // If the original property isn't emptied out,
        // the next set will morph into a grid-area style setting that is not what we want
        tab.style[gridHorizontalProperty] = '';
        tab.style[gridVerticalProperty] = '';
        tab.style[gridProperty] = `${index + 1}`;
        !this.isHorizontal()
          ? tab.classList.add('vertical')
          : tab.classList.remove('vertical');
      });
    };
    this.setTabPanels = () => {
      this.tabpanels.forEach((tabpanel, index) => {
        const tabId = this.tabIds[index];
        const tabpanelId = this.tabpanelIds[index];

        tabpanel.setAttribute('id', tabpanelId);
        tabpanel.setAttribute('aria-labelledby', tabId);
        this.activeTabIndex !== index
          ? tabpanel.setAttribute('hidden', '')
          : tabpanel.removeAttribute('hidden');
      });
    };
    this.handleTabClick = (event) => {
      const selectedTab = event.currentTarget;

      if (selectedTab.nodeType === 1 && this.isFocusableElement(selectedTab)) {
        this.prevActiveTabIndex = this.activeTabIndex;
        this.activeTabIndex = this.tabs.indexOf(selectedTab);
        this.setComponent();
      }
    };
    this.handleTabKeyDown = (event) => {
      if (this.isHorizontal()) {
        switch (event.key) {
          case keyArrowLeft:
            event.preventDefault();
            this.adjustBackward(event);

            break;
          case keyArrowRight:
            event.preventDefault();
            this.adjustForward(event);

            break;
        }
      } else {
        switch (event.key) {
          case keyArrowUp:
            event.preventDefault();
            this.adjustBackward(event);

            break;
          case keyArrowDown:
            event.preventDefault();
            this.adjustForward(event);

            break;
        }
      }

      switch (event.key) {
        case keyHome:
          event.preventDefault();
          this.adjust(-this.activeTabIndex);

          break;
        case keyEnd:
          event.preventDefault();
          this.adjust(this.tabs.length - this.activeTabIndex - 1);

          break;
      }
    };
    this.adjustForward = (e) => {
      const group = this.tabs;
      let index = 0;

      index = this.activetab ? group.indexOf(this.activetab) + 1 : 1;

      if (index === group.length) {
        index = 0;
      }

      while (index < group.length && group.length > 1) {
        if (this.isFocusableElement(group[index])) {
          this.moveToTabByIndex(group, index);

          break;
        } else if (this.activetab && index === group.indexOf(this.activetab)) {
          break;
        } else if (index + 1 >= group.length) {
          index = 0;
        } else {
          index += 1;
        }
      }
    };
    this.adjustBackward = (e) => {
      const group = this.tabs;
      let index = 0;

      index = this.activetab ? group.indexOf(this.activetab) - 1 : 0;
      index = index < 0 ? group.length - 1 : index;

      while (index >= 0 && group.length > 1) {
        if (this.isFocusableElement(group[index])) {
          this.moveToTabByIndex(group, index);

          break;
        } else if (index - 1 < 0) {
          index = group.length - 1;
        } else {
          index -= 1;
        }
      }
    };
    this.moveToTabByIndex = (group, index) => {
      const tab = group[index];

      this.activetab = tab;
      this.prevActiveTabIndex = this.activeTabIndex;
      this.activeTabIndex = index;
      tab.focus();
      this.setComponent();
    };
  }

  orientationChanged() {
    if (this.$fastController.isConnected) {
      this.setTabs();
      this.setTabPanels();
      this.handleActiveIndicatorPosition();
    }
  }

  activeidChanged(oldValue, newValue) {
    if (
      this.$fastController.isConnected &&
      this.tabs.length <= this.tabpanels.length
    ) {
      this.prevActiveTabIndex = this.tabs.findIndex(
        (item) => item.id === oldValue
      );
      this.setTabs();
      this.setTabPanels();
      this.handleActiveIndicatorPosition();
    }
  }

  tabsChanged() {
    if (
      this.$fastController.isConnected &&
      this.tabs.length <= this.tabpanels.length
    ) {
      this.tabIds = this.getTabIds();
      this.tabpanelIds = this.getTabPanelIds();
      this.setTabs();
      this.setTabPanels();
      this.handleActiveIndicatorPosition();
    }
  }

  tabpanelsChanged() {
    if (
      this.$fastController.isConnected &&
      this.tabpanels.length <= this.tabs.length
    ) {
      this.tabIds = this.getTabIds();
      this.tabpanelIds = this.getTabPanelIds();
      this.setTabs();
      this.setTabPanels();
      this.handleActiveIndicatorPosition();
    }
  }

  getActiveIndex() {
    const id = this.activeid;

    if (id !== undefined) {
      return this.tabIds.indexOf(this.activeid) === -1
        ? 0
        : this.tabIds.indexOf(this.activeid);
    } else {
      return 0;
    }
  }

  getTabIds() {
    return this.tabs.map((tab) => {
      return tab.getAttribute('id') ?? `tab-${uniqueId()}`;
    });
  }

  getTabPanelIds() {
    return this.tabpanels.map((tabPanel) => {
      return tabPanel.getAttribute('id') ?? `panel-${uniqueId()}`;
    });
  }

  setComponent() {
    if (this.activeTabIndex !== this.prevActiveTabIndex) {
      this.activeid = this.tabIds[this.activeTabIndex];
      this.focusTab();
      this.change();
    }
  }

  isHorizontal() {
    return this.orientation === TabsOrientation.horizontal;
  }

  handleActiveIndicatorPosition() {
    // Ignore if we click twice on the same tab
    if (
      this.showActiveIndicator &&
      !this.hideActiveIndicator &&
      this.activeTabIndex !== this.prevActiveTabIndex
    ) {
      if (this.ticking) {
        this.ticking = false;
      } else {
        this.ticking = true;
        this.animateActiveIndicator();
      }
    }
  }

  animateActiveIndicator() {
    this.ticking = true;

    const gridProperty = this.isHorizontal() ? 'gridColumn' : 'gridRow';
    const translateProperty = this.isHorizontal() ? 'translateX' : 'translateY';
    const offsetProperty = this.isHorizontal() ? 'offsetLeft' : 'offsetTop';
    const prev = this.activeIndicatorRef[offsetProperty];

    this.activeIndicatorRef.style[gridProperty] = `${this.activeTabIndex + 1}`;

    const next = this.activeIndicatorRef[offsetProperty];

    this.activeIndicatorRef.style[gridProperty] = `${
      this.prevActiveTabIndex + 1
    }`;

    const dif = next - prev;

    this.activeIndicatorRef.style.transform = `${translateProperty}(${dif}px)`;
    this.activeIndicatorRef.classList.add('activeIndicatorTransition');
    this.activeIndicatorRef.addEventListener('transitionend', () => {
      this.ticking = false;
      this.activeIndicatorRef.style[gridProperty] = `${
        this.activeTabIndex + 1
      }`;
      this.activeIndicatorRef.style.transform = `${translateProperty}(0px)`;
      this.activeIndicatorRef.classList.remove('activeIndicatorTransition');
    });
  }

  adjust(adjustment) {
    this.prevActiveTabIndex = this.activeTabIndex;
    this.activeTabIndex = wrapInBounds(
      0,
      this.tabs.length - 1,
      this.activeTabIndex + adjustment
    );
    this.setComponent();
  }

  focusTab() {
    this.tabs[this.activeTabIndex].focus();
  }

  connectedCallback() {
    super.connectedCallback();

    this.tabIds = this.getTabIds();
    this.tabpanelIds = this.getTabPanelIds();
    this.activeTabIndex = this.getActiveIndex();
  }
}

export class TabPanel extends PPPElement {}

export class Tab extends PPPElement {
  @attr({ mode: 'boolean' })
  disabled;
}

export default {
  TabComposition: Tab.compose({
    template: tabTemplate,
    styles: tabStyles
  }).define(),
  TabPanelComposition: TabPanel.compose({
    template: tabPanelTemplate,
    styles: tabPanelStyles
  }).define(),
  TabsComposition: Tabs.compose({
    template: tabsTemplate,
    styles: tabsStyles
  }).define()
};
