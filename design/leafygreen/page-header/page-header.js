import { PageHeader } from '../../../lib/page-header/page-header.js';
import { css } from '../../../lib/element/styles/css.js';
import { display } from '../../../lib/utilities/style/display.js';
import { html } from '../../../lib/template.js';

// TODO - aria attributes
export const pageHeaderTemplate = (context, definition) => html`
  <template>
    <div class="title">
      <slot></slot>
    </div>
    <div class="controls">
      <slot name="controls"></slot>
    </div>
  </template>
`;

// TODO - design tokens
export const pageHeaderStyles = (context, definition) => css`
  ${display('flex')}

  :host {
    align-items: center;
    border-bottom: 3px solid #ebebed;
    flex: 2;
    flex-direction: row;
    font-size: inherit;
    justify-content: flex-start;
    margin: 0;
    padding-bottom: 15px;
    padding-top: 0;
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    margin-right: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .controls {
    align-items: center;
    display: flex;
    margin-left: auto;
  }

  .controls ::slotted(*) {
    margin-left: 14px;
  }
`;

export const pageHeader = PageHeader.compose({
  baseName: 'page-header',
  template: pageHeaderTemplate,
  styles: pageHeaderStyles
});
