import {
  Tabs,
  Tab,
  TabPanel,
  tabsTemplate,
  tabTemplate,
  tabPanelTemplate
} from '../../shared/tabs.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont } from './design-tokens.js';
import { focusVisible } from '../../shared/utilities/style/focus.js';

const widgetTabsStyles = (context, definition) => css`
  ${display('grid')} :host {
    box-sizing: border-box;
    font-family: ${bodyFont};
    border-bottom: 1px solid #e7eeec;
  }

  .tablist {
    align-items: center;
    border: none;
    display: flex;
    flex: 0 0 auto;
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
    box-sizing: border-box;
  }

  .start,
  .end {
    align-self: center;
  }
`;

const widgetTabStyles = (context, definition) => css`
  ${display('inline-flex')} :host {
    box-sizing: border-box;
    font-family: ${bodyFont};
    display: inline-block;
    margin-bottom: -1px;
    fill: currentcolor;
    align-items: center;
    justify-content: center;
    grid-row: 1;
    cursor: pointer;
    background-color: transparent;
    border: 0;
    padding: 5px 10px 7px;
    text-decoration: none;
    white-space: nowrap;
    transition: color 150ms ease-in-out 0s;
    font-size: 12px;
    position: relative;
    width: 100%;
    color: rgb(112, 139, 164);
    text-align: center;
  }

  :host:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    border-radius: 4px 4px 0 0;
    transform: scaleX(0.8);
  }

  :host(:hover) {
    color: rgb(51, 70, 87);
    text-decoration: inherit;
  }

  :host([aria-selected='false']:hover):after {
    transform: scaleX(1);
    background-color: rgb(231, 238, 236);
  }

  :host([aria-selected='true']:hover):after {
    transform: scaleX(0.97);
  }

  :host([aria-selected='true']):after {
    transform: scaleX(1);
    background-color: rgb(66, 139, 249);
  }

  :host(:focus) {
    color: inherit;
    text-decoration: inherit;
  }

  :host([disabled]) {
    color: rgb(184, 196, 194);
    cursor: not-allowed;
  }

  :host([aria-selected='true']) {
    fill: currentcolor;
    color: rgb(51, 70, 87);
  }

  :host(:${focusVisible}) {
    outline: none;
  }

  :host(:focus) {
    outline: none;
  }
`;

const widgetTabPanelStyles = (context, definition) => css`
  ${display('flex')} :host {
    box-sizing: border-box;
  }
`;

// noinspection JSUnusedGlobalSymbols
export const widgetTabs = Tabs.compose({
  baseName: 'widget-tabs',
  template: tabsTemplate,
  styles: widgetTabsStyles
});

// noinspection JSUnusedGlobalSymbols
export const widgetTab = Tab.compose({
  baseName: 'widget-tab',
  template: tabTemplate,
  styles: widgetTabStyles
});

// noinspection JSUnusedGlobalSymbols
export const widgetTabPanel = TabPanel.compose({
  baseName: 'widget-tab-panel',
  template: tabPanelTemplate,
  styles: widgetTabPanelStyles
});
