/** @decorator */

import { attr } from './element/components/attributes.js';
import { observable } from './element/observation/observable.js';
import {
  keyCodeArrowDown,
  keyCodeArrowLeft,
  keyCodeArrowRight,
  keyCodeArrowUp,
  keyCodeEnd,
  keyCodeHome
} from './web-utilities/key-codes.js';
import { wrapInBounds } from './web-utilities/numbers.js';
import { StartEnd } from './patterns/start-end.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { FoundationElement } from './foundation-element.js';
import { html } from './element/templating/template.js';
import { slotted } from './element/templating/slotted.js';
import { endSlotTemplate, startSlotTemplate } from './patterns/start-end.js';

/**
 * The template for the Tabs component.
 * @public
 */
export const tabsTemplate = (context, definition) => html`
  <template class="${(x) => x.orientation}">
    ${startSlotTemplate(context, definition)}
    <div class="tablist" part="tablist" role="tablist">
      <slot class="tab" name="tab" part="tab" ${slotted('tabs')}></slot>
    </div>
    ${endSlotTemplate(context, definition)}
    <div class="tabpanel">
      <slot name="tabpanel" part="tabpanel" ${slotted('tabpanels')}></slot>
    </div>
  </template>
`;

/**
 * The template for the TabPanel component.
 * @public
 */
export const tabPanelTemplate = (context, definition) => html`
  <template slot="tabpanel" role="tabpanel">
    <slot></slot>
  </template>
`;

/**
 * The template for the Tab component.
 * @public
 */
export const tabTemplate = (context, definition) => html`
  <template slot="tab" role="tab" aria-disabled="${(x) => x.disabled}">
    <slot></slot>
  </template>
`;

/**
 * The orientation of the Tabs component
 * @public
 */
export let TabsOrientation;
(function (TabsOrientation) {
  TabsOrientation['vertical'] = 'vertical';
  TabsOrientation['horizontal'] = 'horizontal';
})(TabsOrientation || (TabsOrientation = {}));

/**
 * A Tabs Custom HTML Element.
 * Implements the {@link https://www.w3.org/TR/wai-aria-1.1/#tablist | ARIA tablist }.
 *
 * @public
 */
export class Tabs extends FoundationElement {
  /**
   * The orientation
   * @public
   * @remarks
   * HTML Attribute: orientation
   */
  @attr
  orientation;

  /**
   * The id of the active tab
   *
   * @public
   * @remarks
   * HTML Attribute: activeid
   */
  @attr
  activeid;

  /**
   * @internal
   */
  @observable
  tabs;

  /**
   * @internal
   */
  @observable
  tabpanels;

  constructor() {
    super(...arguments);
    /**
     * The orientation
     * @public
     * @remarks
     * HTML Attribute: orientation
     */
    this.orientation = TabsOrientation.horizontal;
    /**
     * Whether or not to show the active indicator
     * @public
     * @remarks
     * HTML Attribute: activeindicator
     */
    this.activeindicator = false;
    /**
     * @internal
     */
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
      const gridProperty = this.isHorizontal() ? 'gridColumn' : 'gridRow';

      this.tabIds = this.getTabIds();
      this.tabpanelIds = this.getTabPanelIds();
      this.activeTabIndex = this.getActiveIndex();
      this.tabs.forEach((tab, index) => {
        if (tab.slot === 'tab' && this.isFocusableElement(tab)) {
          if (this.activeindicator) {
            this.showActiveIndicator = true;
          }

          const tabId = this.tabIds[index];
          const tabpanelId = this.tabpanelIds[index];

          tab.setAttribute(
            'id',
            typeof tabId !== 'string' ? `tab-${index + 1}` : tabId
          );
          tab.setAttribute(
            'aria-selected',
            this.activeTabIndex === index ? 'true' : 'false'
          );
          tab.setAttribute(
            'aria-controls',
            typeof tabpanelId !== 'string' ? `panel-${index + 1}` : tabpanelId
          );
          tab.addEventListener('click', this.handleTabClick);
          tab.addEventListener('keydown', this.handleTabKeyDown);
          tab.setAttribute(
            'tabindex',
            this.activeTabIndex === index ? '0' : '-1'
          );

          if (this.activeTabIndex === index) {
            this.activetab = tab;
          }
        }

        tab.style[gridProperty] = `${index + 1}`;
        !this.isHorizontal()
          ? tab.classList.add('vertical')
          : tab.classList.remove('vertical');
      });
    };
    this.setTabPanels = () => {
      this.tabIds = this.getTabIds();
      this.tabpanelIds = this.getTabPanelIds();
      this.tabpanels.forEach((tabpanel, index) => {
        const tabId = this.tabIds[index];
        const tabpanelId = this.tabpanelIds[index];

        tabpanel.setAttribute(
          'id',
          typeof tabpanelId !== 'string' ? `panel-${index + 1}` : tabpanelId
        );
        tabpanel.setAttribute(
          'aria-labelledby',
          typeof tabId !== 'string' ? `tab-${index + 1}` : tabId
        );
        this.activeTabIndex !== index
          ? tabpanel.setAttribute('hidden', '')
          : tabpanel.removeAttribute('hidden');
      });
    };
    this.handleTabClick = (event) => {
      const selectedTab = event.currentTarget;

      if (selectedTab.nodeType === 1) {
        this.prevActiveTabIndex = this.activeTabIndex;
        this.activeTabIndex = this.tabs.indexOf(selectedTab);
        this.setComponent();
      }
    };
    this.handleTabKeyDown = (event) => {
      const keyCode = event.keyCode;

      if (this.isHorizontal()) {
        switch (keyCode) {
          case keyCodeArrowLeft:
            event.preventDefault();
            this.adjustBackward(event);

            break;
          case keyCodeArrowRight:
            event.preventDefault();
            this.adjustForward(event);

            break;
        }
      } else {
        switch (keyCode) {
          case keyCodeArrowUp:
            event.preventDefault();
            this.adjustBackward(event);

            break;
          case keyCodeArrowDown:
            event.preventDefault();
            this.adjustForward(event);

            break;
        }
      }

      switch (keyCode) {
        case keyCodeHome:
          event.preventDefault();
          this.adjust(-this.activeTabIndex);

          break;
        case keyCodeEnd:
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
      if (this.disabled)
        return;

      const tab = group[index];

      this.activetab = tab;
      this.prevActiveTabIndex = this.activeTabIndex;
      this.activeTabIndex = index;
      tab.focus();
      this.setComponent();
    };
  }

  /**
   * @internal
   */
  activeidChanged() {
    if (
      this.$pppController.isConnected &&
      this.tabs.length <= this.tabpanels.length
    ) {
      this.setTabs();
      this.setTabPanels();
    }
  }

  /**
   * @internal
   */
  tabsChanged() {
    if (
      this.$pppController.isConnected &&
      this.tabs.length <= this.tabpanels.length
    ) {
      this.setTabs();
      this.setTabPanels();
    }
  }

  /**
   * @internal
   */
  tabpanelsChanged() {
    if (
      this.$pppController.isConnected &&
      this.tabpanels.length <= this.tabs.length
    ) {
      this.setTabs();
      this.setTabPanels();
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
      return tab.getAttribute('id');
    });
  }

  getTabPanelIds() {
    return this.tabpanels.map((tabPanel) => {
      return tabPanel.getAttribute('id');
    });
  }

  setComponent() {
    if (this.activeTabIndex !== this.prevActiveTabIndex) {
      this.activeid = this.tabIds[this.activeTabIndex];
      this.setTabs();
      this.setTabPanels();
      this.focusTab();
      this.change();
    }
  }

  isHorizontal() {
    return this.orientation === TabsOrientation.horizontal;
  }

  /**
   * The adjust method for Tabs
   * @public
   * @remarks
   * This method allows the active index to be adjusted by numerical increments
   */
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

  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();
    this.tabIds = this.getTabIds();
    this.tabpanelIds = this.getTabPanelIds();
    this.activeTabIndex = this.getActiveIndex();
  }
}

/**
 * A TabPanel Component to be used with Tabs
 * @public
 */
export class TabPanel extends FoundationElement {}

/**
 * A Tab Component to be used with Tabs
 * @public
 */
export class Tab extends FoundationElement {
  @attr({ mode: 'boolean' })
  disabled;
}

applyMixins(Tabs, StartEnd);
