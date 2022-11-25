import { TopLoader } from '../../shared/top-loader.js';
import { css } from '../../shared/element/styles/css.js';
import { ref } from '../../shared/element/templating/ref.js';
import { html } from '../../shared/template.js';

export const topLoaderTemplate = (context, definition) => html`
  <template>
    <div
      class="bar"
      style="transform: translate(-100%, 0)"
      ${ref('bar')}
    ></div>
  </template>
`;

export const topLoaderStyles = (context, definition) =>
  css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 5px;
      z-index: 999999;
      transition: opacity 0.4s;
      opacity: 0;
    }

    :host(.visible) {
      opacity: 1;
      transition: none;
    }

    .bar {
      background: rgb(11, 176, 109);
      width: 100%;
      height: 100%;
      transition: transform 0.2s;
      will-change: transform;
      transform: translate(-100%, 0);
    }
  `;

export default TopLoader.compose({
  template: topLoaderTemplate,
  styles: topLoaderStyles
});
