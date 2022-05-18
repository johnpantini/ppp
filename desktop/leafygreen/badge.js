import { Badge } from '../../shared/badge.js';
import { css } from '../../shared/element/styles/css.js';
import { html } from '../../shared/template.js';
import { appearanceBehavior } from '../../shared/utilities/behaviors.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont } from './design-tokens.js';

export const badgeTemplate = (context, definition) => html`
  <template>
    <slot></slot>
  </template>
`;

export const lightgrayBadgeStyles = (context, definition) => css`
  :host([appearance='lightgray']) {
    border: 1px solid rgb(232, 237, 235);
    background-color: rgb(249, 251, 250);
    color: rgb(92, 108, 117);
  }
`;

export const greenBadgeStyles = (context, definition) => css`
  :host([appearance='green']) {
    border: 1px solid rgb(192, 250, 230);
    background-color: rgb(227, 252, 247);
    color: rgb(0, 104, 74);
  }
`;

export const redBadgeStyles = (context, definition) => css`
  :host([appearance='red']) {
    border: 1px solid rgb(255, 205, 199);
    background-color: rgb(255, 234, 229);
    color: rgb(151, 6, 6);
  }
`;

export const blueBadgeStyles = (context, definition) => css`
  :host([appearance='blue']) {
    border: 1px solid rgb(195, 231, 254);
    background-color: rgb(225, 247, 255);
    color: rgb(18, 84, 183);
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
      font-weight: 700;
      font-size: 12px;
      line-height: 16px;
      border-radius: 5px;
      height: 18px;
      padding-left: 6px;
      padding-right: 6px;
      text-transform: uppercase;
    }
  `.withBehaviors(
    appearanceBehavior('lightgray', lightgrayBadgeStyles(context, definition)),
    appearanceBehavior('green', greenBadgeStyles(context, definition)),
    appearanceBehavior('red', redBadgeStyles(context, definition)),
    appearanceBehavior('blue', blueBadgeStyles(context, definition))
  );

// noinspection JSUnusedGlobalSymbols
export const badge = Badge.compose({
  baseName: 'badge',
  template: badgeTemplate,
  styles: badgeStyles
});
