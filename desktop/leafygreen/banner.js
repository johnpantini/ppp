/** @decorator */

import { FoundationElement } from '../../shared/foundation-element.js';
import { css } from '../../shared/element/styles/css.js';
import { attr } from '../../shared/element/components/attributes.js';
import { display } from '../../shared/utilities/style/display.js';
import { html } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';
import { appearanceBehavior } from '../../shared/utilities/behaviors.js';

import { infoWithCircle } from './icons/info-with-circle.js';
import { importantWithCircle } from './icons/important-with-circle.js';

// TODO - aria attributes
export const bannerTemplate = (context, definition) => html`
  <template role="alert">
    ${when((x) => x.appearance === 'info', infoWithCircle({}))}
    ${when((x) => x.appearance === 'warning', importantWithCircle({}))}
    <div class="content">
      <slot></slot>
    </div>
  </template>
`;

export const infoBannerStyles = (context, definition) => css`
  :host([appearance='info']) {
    color: rgb(26, 86, 126);
    border-color: rgb(197, 228, 242) rgb(197, 228, 242) rgb(197, 228, 242)
      rgb(0, 124, 173);
    background-color: rgb(225, 242, 246);
  }

  :host([appearance='info'])::before {
    background-color: rgb(0, 124, 173);
  }

  :host([appearance='info'])::after {
    border-color: rgb(197, 228, 242);
    background-color: rgb(225, 242, 246);
  }
`;

export const warningBannerStyles = (context, definition) => css`
  :host([appearance='warning']) {
    color: rgb(134, 104, 29);
    border-color: rgb(254, 242, 200) rgb(254, 242, 200) rgb(254, 242, 200)
      rgb(255, 221, 73);
    background-color: rgb(254, 247, 227);
  }

  :host([appearance='warning'])::before {
    background-color: rgb(255, 221, 73);
  }

  :host([appearance='warning'])::after {
    border-color: rgb(254, 242, 200);
    background-color: rgb(254, 247, 227);
  }
`;

// TODO - design tokens
export const bannerStyles = (context, definition) =>
  css`
    ${display('flex')}
    :host {
      position: relative;
      min-height: 40px;
      padding: 9px 12px 9px 20px;
      border-width: 1px 1px 1px 0;
      border-style: solid;
      border-radius: 6px;
      font-size: 14px;
      line-height: 20px;
      box-sizing: border-box;
    }

    :host(.inline) {
      display: inline-flex;
    }

    :host::before {
      content: '';
      position: absolute;
      width: 6px;
      top: -1px;
      bottom: -1px;
      left: 0;
      border-radius: 6px 0 0 6px;
    }

    :host::after {
      content: '';
      position: absolute;
      left: 4px;
      top: -1px;
      bottom: -1px;
      width: 2px;
      border-top: 1px solid;
      border-bottom: 1px solid;
      border-radius: 0.5px 0 0 0.5px;
    }

    svg {
      flex-shrink: 0;
      margin-top: 1px;
    }

    .content {
      align-self: center;
      -webkit-box-flex: 1;
      flex-grow: 1;
      margin-left: 15px;
      margin-right: 10px;
    }
  `.withBehaviors(
    appearanceBehavior('info', infoBannerStyles(context, definition)),
    appearanceBehavior('warning', warningBannerStyles(context, definition))
  );

export class Banner extends FoundationElement {
  @attr
  appearance;

  appearanceChanged(oldValue, newValue) {
    if (oldValue !== newValue) {
      this.classList.add(newValue);
      this.classList.remove(oldValue);
    }
  }

  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();

    if (!this.appearance) {
      this.appearance = 'info';
    }
  }
}

export const banner = Banner.compose({
  baseName: 'banner',
  template: bannerTemplate,
  styles: bannerStyles
});
