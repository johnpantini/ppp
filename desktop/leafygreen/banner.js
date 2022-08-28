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
    color: rgb(8, 60, 144);
    border-color: rgb(195, 231, 254) rgb(195, 231, 254) rgb(195, 231, 254)
      rgb(1, 107, 248);
    background-color: rgb(225, 247, 255);
  }

  :host([appearance='info'])::before {
    background: linear-gradient(to left, transparent 6px, rgb(1, 107, 248) 6px);
  }

  :host([appearance='info']) svg {
    color: rgb(1, 107, 248);
  }
`;

export const warningBannerStyles = (context, definition) => css`
  :host([appearance='warning']) {
    color: rgb(148, 79, 1);
    border-color: rgb(255, 236, 158) rgb(255, 236, 158) rgb(255, 236, 158)
      rgb(255, 192, 16);
    background-color: rgb(254, 247, 219);
  }

  :host([appearance='warning'])::before {
    background: linear-gradient(
      to left,
      transparent 6px,
      rgb(255, 192, 16) 6px
    );
  }

  :host([appearance='warning']) svg {
    color: rgb(148, 79, 1);
  }
`;

// TODO - design tokens
export const bannerStyles = (context, definition) =>
  css`
    ${display('flex')}
    :host {
      position: relative;
      min-height: 40px;
      padding: 10px 12px 10px 20px;
      border-width: 1px 1px 1px 0;
      border-style: solid;
      border-radius: 12px;
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
      width: 13px;
      top: -1px;
      bottom: -1px;
      left: 0;
      border-radius: 12px 0 0 12px;
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

export default Banner.compose({
  template: bannerTemplate,
  styles: bannerStyles
});
