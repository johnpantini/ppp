import { Tabs, Tab, TabPanel } from '../../../lib/tabs/tabs.js';
import { css } from '../../../lib/element/styles/css.js';
import {
  tabsTemplate,
  tabTemplate,
  tabPanelTemplate
} from '../../../lib/tabs/tabs.template.js';
import { display } from '../../../lib/utilities/style/display.js';
import { requireComponent} from '../../../lib/template.js';

import { bodyFont } from '../design-tokens.js';
import { SystemColors } from '../../../lib/web-utilities/system-colors.js';
import { forcedColorsStylesheetBehavior } from '../../../lib/utilities/match-media-stylesheet-behavior.js';
import { focusVisible } from '../../../lib/utilities/style/focus.js';

// TODO - design tokens
const tabsStyles = (context, definition) => css`
  ${display('grid')} :host {
    box-sizing: border-box;
    font-family: ${bodyFont};
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr;
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
    color: #a09f9e;
    display: inline-block;
    font-size: 15px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: -3px;
    padding: 8px 24px;
    fill: currentcolor;
    border-radius: 4px;
    border: 1px solid transparent;
    align-items: center;
    justify-content: center;
    grid-row: 1;
    cursor: pointer;
  }

  :host(:hover) {
    color: inherit;
    text-decoration: inherit;
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
    color: inherit;
    background-color: #fff;
    border-bottom: 3px solid #13aa52;
  }

  :host([aria-selected='true']:hover) {
    fill: currentcolor;
  }

  :host([aria-selected='true']:active) {
    fill: currentcolor;
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

export const tabPanel = TabPanel.compose({
  baseName: 'tab-panel',
  template: tabPanelTemplate,
  styles: tabPanelStyles
});

void requireComponent(
  'ppp-tab',
  import.meta.url
)

void requireComponent(
  'ppp-tab-panel',
  import.meta.url
)
