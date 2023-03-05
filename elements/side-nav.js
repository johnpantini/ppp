/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import {
  attr,
  css,
  when,
  observable,
  slotted,
  html,
  repeat,
  ref,
  Updates
} from '../vendor/fast-element.min.js';
import { startSlotTemplate, endSlotTemplate } from '../vendor/fast-patterns.js';
import { notDefined, display } from '../vendor/fast-utilities.js';
import { ellipsis, normalize, scrollbars } from '../design/styles.js';
import {
  bodyFont,
  fontSizeBody1,
  paletteGrayDark2,
  paletteGrayDark4,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenDark2,
  paletteGreenLight1,
  paletteWhite,
  sideNavExpandedWidth,
  sideNavCollapsedWidth,
  themeConditional,
  spacing2,
  spacing3,
  fontWeightBody1,
  lineHeightBody1,
  spacing1,
  paletteBlack,
  paletteGrayBase,
  toColorComponents,
  paletteGrayDark3,
  paletteGreenLight3,
  paletteGreenDark3,
  paletteGreenDark1,
  paletteGreenBase
} from '../design/design-tokens.js';

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

export const sideNavGroupTemplate = html`
  <template>
    <div class="title">
      <div class="title-container">
        ${startSlotTemplate()}
        <span class="ellipsis" ${ref('ellipsisTitle')}>
          <slot name="title"></slot>
        </span>
        ${endSlotTemplate()}
      </div>
    </div>
    <ul class="items-container">
      <slot name="items"></slot>
    </ul>
  </template>
`;

export const sideNavGroupStyles = css`
  ${display('flex')}
  ${normalize()}
  :host {
    display: flex;
    position: relative;
    flex-direction: column;
  }

  ::slotted(span[slot='start']),
  ::slotted(span[slot='end']) {
    display: inline-flex;
    align-items: center;
    width: 16px;
    height: 16px;
  }

  .title {
    display: flex;
    position: relative;
    font-family: ${bodyFont};
    font-size: calc(${fontSizeBody1} - 1px);
    font-weight: bold;
    padding: ${spacing3} ${spacing3} ${spacing2};
    align-items: center;
    letter-spacing: 0.4px;
    justify-content: space-between;
    text-transform: uppercase;
    color: ${themeConditional(paletteGreenDark2, paletteGreenLight1)};
    margin: unset;
  }

  .ellipsis {
    ${ellipsis()};
  }

  .title-container {
    display: inline-flex;
    align-items: center;
    gap: ${spacing2};
    ${ellipsis()};
  }

  .items-container {
    margin-block: 0;
    padding-inline-start: 0;
    padding: 0;
    list-style-type: none;
  }
`;

export class SideNavGroup extends PPPElement {
  connectedCallback() {
    super.connectedCallback();

    Updates.enqueue(() => {
      if (this.ellipsisTitle.offsetWidth < this.ellipsisTitle.scrollWidth) {
        this.ellipsisTitle.setAttribute(
          'title',
          this.ellipsisTitle.firstElementChild?.assignedNodes?.()?.[0]
            ?.textContent
        );
      } else {
        this.ellipsisTitle.removeAttribute('title');
      }
    });
  }
}

export const sideNavItemTemplate = html`
  <template>
    ${startSlotTemplate()}
    <li class="content" part="content" ${ref('content')}>
      <slot name="title"></slot>
    </li>
    ${endSlotTemplate()}
  </template>
`;

export const sideNavItemStyles = css`
  ${display('flex')}
  ${normalize()}
  :host {
    position: relative;
    gap: ${spacing2};
    font-family: ${bodyFont};
    font-size: ${fontSizeBody1};
    font-weight: ${fontWeightBody1};
    line-height: ${lineHeightBody1};
    margin: 0;
    appearance: none;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    min-height: 32px;
    padding: ${spacing1} ${spacing3};
    align-items: center;
    text-align: left;
    text-decoration: none;
    color: ${themeConditional(paletteBlack, paletteGrayLight2)};
  }

  :host(.ellipsis) .content {
    ${ellipsis()};
    max-width: 130px;
  }

  :host([disabled]) {
    color: ${paletteGrayBase};
    background-color: rgba(${toColorComponents(paletteGrayLight3)}, 0);
    pointer-events: none;
  }

  :host(:hover) {
    background-color: ${themeConditional(paletteGrayLight2, paletteGrayDark3)};
    text-decoration: none;
  }

  :host([active]:not([disabled])) {
    color: ${themeConditional(paletteGreenDark2, paletteWhite)};
    background-color: ${themeConditional(
      paletteGreenLight3,
      paletteGreenDark3
    )};
    font-weight: bold;
  }

  :host(:not([disabled])) .content::before {
    content: '';
    position: absolute;
    background-color: transparent;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 4px;
    border-radius: 0 6px 6px 0;
    transform: scaleY(0.3);
  }

  :host([active]:not([disabled])) .content::before {
    transform: scaleY(1);
    background-color: ${themeConditional(paletteGreenDark1, paletteGreenBase)};
  }

  :host([disabled]) slot[name='start']::slotted(.action-icon) {
    color: ${paletteGrayBase} !important;
  }

  .content {
    ${ellipsis()};
  }

  ::slotted(span[slot='start']),
  ::slotted(span[slot='end']) {
    display: inline-flex;
    align-items: center;
    width: 16px;
    height: 16px;
  }

  ::slotted(.action-icon) {
    color: ${themeConditional(paletteGreenDark2, paletteGreenLight1)};
  }
`;

export class SideNavItem extends PPPElement {
  @attr({ mode: 'boolean' })
  disabled;

  @attr({ mode: 'boolean' })
  active;

  connectedCallback() {
    super.connectedCallback();

    Updates.enqueue(() => {
      if (this.content.offsetWidth < this.content.scrollWidth) {
        this.setAttribute('title', this.textContent.trim());
      } else {
        this.removeAttribute('title');
      }
    });
  }
}

export default {
  SideNavGroupComposition: SideNavGroup.compose({
    template: sideNavGroupTemplate,
    styles: sideNavGroupStyles
  }).define(),
  SideNavComposition: SideNav.compose({
    template: sideNavTemplate,
    styles: sideNavStyles
  }).define(),
  SideNavItemComposition: SideNavItem.compose({
    template: sideNavItemTemplate,
    styles: sideNavItemStyles
  }).define()
};
