import { Tabs, Tab, TabPanel } from '../../../lib/tabs/tabs.js';
import { css } from '../../../lib/element/styles/css.js';
import {
  tabsTemplate,
  tabTemplate,
  tabPanelTemplate
} from '../../../lib/tabs/tabs.template.js';
import { display } from '../../../lib/utilities/style/display.js';

import { bodyFont } from '../design-tokens.js';
import { focusVisible } from '../../../lib/utilities/style/focus.js';

// TODO - design tokens
const tabsStyles = (context, definition) => css`
  ${display('grid')} :host {
    box-sizing: border-box;
    font-family: ${bodyFont};
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr;
    border-bottom: 1px solid #e7eeec;
  }

  .tablist {
    display: grid;
    grid-template-rows: auto auto;
    grid-template-columns: auto;
    position: relative;
    width: max-content;
    align-self: end;
    box-sizing: border-box;
  }

  .start,
  .end {
    align-self: center;
  }

  .tabpanel {
    grid-row: 2;
    grid-column-start: 1;
    grid-column-end: 4;
    position: relative;
  }
`;

const tabStyles = (context, definition) => css`
  ${display('inline-flex')} :host {
    box-sizing: border-box;
    font-family: ${bodyFont};
    display: inline-block;
    margin-bottom: -3px;
    fill: currentcolor;
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
    transition: color 150ms ease-in-out 0s;
    font-weight: 600;
    font-size: 16px;
    position: relative;
    color: rgb(93, 108, 116);
  }

  :host:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 4px;
    border-radius: 4px 4px 0 0;
    transition: all 150ms ease-in-out 0s;
    background-color: transparent;
    transform: scaleX(0.8);
  }

  :host(:hover) {
    color: rgb(17, 97, 73);
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
    background-color: rgb(19, 170, 82);
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
    color: rgb(17, 97, 73);
  }

  :host(:${focusVisible}) {
    outline: none;
  }

  :host(:focus) {
    outline: none;
  }
`;

const tabPanelStyles = (context, definition) => css`
  ${display('flex')} :host {
    box-sizing: border-box;
  }
`;

export const tabs = Tabs.compose({
  baseName: 'tabs',
  template: tabsTemplate,
  styles: tabsStyles
});

export const tab = Tab.compose({
  baseName: 'tab',
  template: tabTemplate,
  styles: tabStyles
});

// noinspection JSUnusedGlobalSymbols
export const tabPanel = TabPanel.compose({
  baseName: 'tab-panel',
  template: tabPanelTemplate,
  styles: tabPanelStyles
});
