/** @decorator */

import { PPPElement } from '../lib/ppp-element.js';
import { html, css, observable, Updates } from '../vendor/fast-element.min.js';
import { drag, plus, trash } from '../static/svg/sprite.js';
import {
  paletteGrayBase,
  paletteGrayLight1,
  themeConditional
} from '../design/design-tokens.js';
import './checkbox.js';
import './draggable-stack.js';

export function defaultDragEndHandler(x) {
  const value = structuredClone(x.value);

  x.list = [];

  // Draggable stack changes DOM order, we do need to rebuild repeat() source.
  Updates.enqueue(() => {
    x.list = value;
  });
}

export const dragControlsTemplate = () => html`
  <div class="control-stack" style="align-items: center;">
    <span class="drag-handle">${html.partial(drag)}</span>
    <ppp-checkbox
      standalone
      visibility-toggle
      ?checked="${(x) => !x.hidden}"
      @change="${(x, c) => {
        c.parent.list = structuredClone(c.parent.value);
      }}"
    ></ppp-checkbox>
    <span
      class="line-control-icon add"
      @click="${(x, c) => {
        if (typeof c.parent.stencil !== 'object') {
          throw new TypeError('Stencil must be an object.');
        }

        const controlLine = c.event.composedPath()[0].closest('.control-line');
        const index = Array.from(controlLine.parentNode.children).indexOf(
          controlLine
        );
        const value = c.parent.value;

        value.splice(index + 1, 0, c.parent.stencil);

        Updates.enqueue(() => {
          c.parent.list = value;

          // Apply modifications upon this event.
          c.parent.$emit('ppplistitemadd', {
            source: c.parent,
            index
          });
        });
      }}"
    >
      ${html.partial(plus)}
    </span>
    <span
      class="line-control-icon remove"
      ?hidden="${(x, c) => c.parent.list?.length <= 1}"
      @click="${(x, c) => {
        const cp = c.event.composedPath();
        const controlLine = cp[0].closest('.control-line');
        const index = Array.from(controlLine.parentNode.children).indexOf(
          controlLine
        );

        controlLine.remove();
        c.parent.list.splice(index, 1);

        Array.from(
          c.parent.shadowRoot.querySelectorAll('.line-control-icon.remove')
        ).forEach((icon) => {
          if (c.parent.list.length <= 1) {
            icon.setAttribute('hidden', '');
          } else {
            icon.removeAttribute('hidden');
          }
        });

        c.parent.$emit('ppplistitemremove', {
          source: c.parent,
          index
        });
      }}"
    >
      ${html.partial(trash)}
    </span>
  </div>
`;

export const clonableListStyles = css`
  ppp-draggable-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .control-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .control-line {
    display: flex;
    flex-direction: row;
    gap: 0 16px;
  }

  .line-control-icon,
  .drag-handle {
    display: flex;
    cursor: pointer;
    width: 16px;
    height: 16px;
    color: ${themeConditional(paletteGrayBase, paletteGrayLight1)};
  }

  .drag-handle {
    cursor: grab;
  }

  .dragging.drag-handle,
  .dragging .drag-handle {
    cursor: grabbing !important;
  }

  .filler {
    height: 0;
  }

  [hidden] {
    display: none !important;
  }
`;

export class ClonableList extends PPPElement {
  @observable
  list;

  constructor() {
    super();

    this.list = [];
  }
}
