import { Badge } from '../../../lib/badge/badge.js';
import { css } from '../../../lib/element/styles/css.js';
import { ref } from '../../../lib/element/templating/ref.js';
import { html } from '../../../lib/template.js';
import { appearanceBehavior } from '../../../lib/utilities/behaviors.js';
import { when } from '../../../lib/element/templating/when.js';
import { display } from '../../../lib/utilities/style/display.js';

import { bodyFont } from '../design-tokens.js';

export const badgeTemplate = (context, definition) => html`
  <template><slot></slot></template>
`;

export const lightgrayBadgeStyles = (context, definition) => css`
  :host([appearance='lightgray']) {
    border: 1px solid rgb(231, 238, 236);
    background-color: rgb(249, 251, 250);
    color: rgb(93, 108, 116);
  }
`;

export const greenBadgeStyles = (context, definition) => css`
  :host([appearance='green']) {
    border: 1px solid rgb(195, 231, 202);
    background-color: rgb(228, 244, 228);
    color: rgb(17, 97, 73);
  }
`;

// TODO - design tokens
export const badgeStyles = (context, definition) =>
  css`
    ${display('inline-flex')}
    :host {
      font-family: ${bodyFont};
      -webkit-box-align: center;
      align-items: center;
      font-weight: bold;
      font-size: 11px;
      line-height: 20px;
      border-radius: 50px;
      height: 20px;
      padding-left: 9px;
      padding-right: 9px;
      text-transform: uppercase;
    }
  `.withBehaviors(
    appearanceBehavior('lightgray', lightgrayBadgeStyles(context, definition)),
    appearanceBehavior('green', greenBadgeStyles(context, definition))
  );

export const badge = Badge.compose({
  baseName: 'badge',
  template: badgeTemplate,
  styles: badgeStyles
});
