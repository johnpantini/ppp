import { css } from '../../../lib/element/styles/css.js';
import { display } from '../../../lib/utilities/style/display.js';
import { bodyFont } from '../design-tokens.js';

export const appStyles = (context, definition) =>
  css`
    ${display('flex')}

    :host {
      font-family: ${bodyFont};
      flex-direction: column;
      flex-grow: 1;
      position: relative;
      width: 100%;
    }

    .holder {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      position: relative;
      width: 100%;
    }

    .app-container,
    .page-content {
      display: flex;
      flex-grow: 1;
    }

    ppp-side-nav {
      flex-shrink: 0;
      z-index: 998;
    }
  `;
