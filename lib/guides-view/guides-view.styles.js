import { css } from '../element/styles/css.js';
import { notDefined } from '../utilities/style/display.js';

export const guidesViewStyles = (context, definition) =>
  css`
    ${notDefined}

    :host {
      width: 100%;
      height: 100%;
    }

    iframe {
      border: none;
      margin: 0;
      padding: 0;
    }
  `;
