/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import {
  attr,
  css,
  when,
  observable,
  slotted,
  html,
  repeat
} from '../vendor/fast-element.min.js';
import { notDefined } from '../vendor/fast-utilities.js';
import { normalize, scrollbars } from '../design/styles.js';
import {
  paletteGrayDark2,
  paletteGrayDark4,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenDark2,
  paletteGreenLight1,
  paletteWhite,
  sideNavExpandedWidth,
  sideNavCollapsedWidth,
  themeConditional, spacing3,
} from '../design/design-tokens.js'

export const sideNavTemplate = html`
  <template>
    <div class="wrapper">
      <nav
        class="nav"
        aria-label="side-nav"
        ?expanded="${(x) => x.expanded}"
        @pointerover="${(x) => (x.hovered = true)}"
        @pointerout="${(x) => (x.hovered = false)}"
        @pointercancel="${(x) => (x.hovered = false)}"
      >
        <div class="expanded-content">
          <ul>
            <slot
              ${slotted({
                filter: (x) => {
                  return (
                    x.nodeType !== 3 && x.firstElementChild.slot === 'start'
                  );
                },
                property: 'topLevelItems'
              })}
            ></slot>
          </ul>
        </div>
        ${when(
          (x) => x.expandable,
          html`
            <div class="collapsed-content">
              <ul>
                ${repeat(
                  (x) => x.topLevelItems,
                  html`
                    <li>
                      ${(x) =>
                        html`${html.partial(x.firstElementChild.outerHTML)}`}
                    </li>
                  `
                )}
              </ul>
            </div>
          `
        )}
      </nav>
    </div>
  </template>
`;

export const sideNavStyles = css`
  ${notDefined}
  ${normalize()}
  ${scrollbars()}
  :host {
    position: relative;
    width: calc(${sideNavCollapsedWidth} * 1px);
    height: 100vh;
    user-select: none;
  }

  :host([expanded]) {
    width: calc(${sideNavExpandedWidth} * 1px);
  }

  .wrapper {
    display: flex;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
  }

  :host([inline]) .wrapper {
    position: absolute;
    width: calc(${sideNavExpandedWidth} * 1px);
    height: 100%;
  }

  .nav {
    position: relative;
    width: calc(${sideNavCollapsedWidth} * 1px);
    background-color: ${themeConditional(paletteGrayLight3, paletteGrayDark4)};
    border-right: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
    z-index: 0;
  }

  .nav[expanded] {
    width: calc(${sideNavExpandedWidth} * 1px);
  }

  :host([hovered]) .nav:not([expanded]) {
    width: calc(${sideNavExpandedWidth} * 1px);
    border-right: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }

  .expanded-content,
  .collapsed-content {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .expanded-content {
    opacity: 1;
  }

  .collapsed-content {
    opacity: 0;
  }

  .expanded-content > ul,
  .collapsed-content > ul {
    position: absolute;
    margin-block: 0;
    padding-inline-start: 0;
    padding: ${spacing3} 0;
    list-style-type: none;
    overflow: hidden auto;
    inset: 0;
  }

  :host([inline]) .expanded-content > ul {
    padding: 0;
  }

  .expanded-content > ul {
    width: calc(${sideNavExpandedWidth} * 1px);
  }

  .collapsed-content > ul li:first-of-type {
    border-top: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }

  .collapsed-content > ul li {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    border-bottom: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
    color: ${themeConditional(paletteGreenDark2, paletteWhite)};
  }

  .collapsed-content > ul li span[slot] {
    display: flex;
    width: 16px;
    height: 16px;
  }

  .action-icon {
    color: ${themeConditional(paletteGreenDark2, paletteGreenLight1)};
  }

  .nav:not([expanded]) .expanded-content {
    opacity: 0;
    pointer-events: none;
  }

  .nav:not([expanded]) .collapsed-content {
    opacity: 1;
    pointer-events: auto;
  }

  :host([hovered]) .expanded-content {
    opacity: 1;
    pointer-events: auto;
  }

  :host([hovered]) .collapsed-content {
    opacity: 0;
    pointer-events: none;
  }
`;

export class SideNav extends PPPElement {
  @attr({ mode: 'boolean' })
  expanded;

  @attr({ mode: 'boolean' })
  expandable;

  @attr({ mode: 'boolean' })
  inline;

  @attr({ mode: 'boolean' })
  hovered;

  @observable
  topLevelItems;
}

export default SideNav.compose({
  template: sideNavTemplate,
  styles: sideNavStyles
}).define();
