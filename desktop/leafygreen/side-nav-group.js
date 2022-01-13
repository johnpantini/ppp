import { SideNavGroup } from '../../shared/side-nav-group.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { html } from '../../shared/template.js';
import {
  endSlotTemplate,
  startSlotTemplate
} from '../../shared/patterns/start-end.js';

// TODO - aria attributes
export const sideNavGroupTemplate = (context, definition) => html`
  <template>
    <div class="title">
      <div class="title-container">
        ${startSlotTemplate}
        <slot name="title"></slot>
        ${endSlotTemplate}
      </div>
    </div>
    <ul class="items-container">
      <slot name="items"></slot>
    </ul>
  </template>
`;

// TODO - design tokens
export const sideNavGroupStyles = (context, definition) =>
  css`
    ${display('flex')}
    :host {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .start,
    .end {
      display: inline-flex;
      -webkit-box-align: center;
      align-items: center;
    }

    .start {
      margin-inline-end: 8px;
    }

    .end {
      margin-inline-start: 8px;
    }

    .title {
      padding: 16px 16px 8px;
      position: relative;
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: justify;
      justify-content: space-between;
      font-size: 12px;
      line-height: 1em;
      letter-spacing: 0.3px;
      font-weight: bold;
      text-transform: uppercase;
      color: rgb(17, 97, 73);
      min-height: 32px;
      margin-top: 0;
      margin-bottom: 0;
    }

    .title-container {
      display: inline-flex;
      -webkit-box-align: center;
      align-items: center;
    }

    .items-container {
      margin-block: 0;
      padding-inline-start: 0;
      padding: 0;
      list-style-type: none;
    }
  `;

export const sideNavGroup = SideNavGroup.compose({
  baseName: 'side-nav-group',
  template: sideNavGroupTemplate,
  styles: sideNavGroupStyles
});
