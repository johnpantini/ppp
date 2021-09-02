import { html } from '../../../lib/template.js';
import { slotted } from '../../../lib/element/templating/slotted.js';

import { chevronLeft } from '../icons/chervon-left.js';
import { chevronRight } from '../icons/chervon-right.js';

// TODO - aria attributes
export const sideNavTemplate = (context, definition) => html`
  <template>
    <div class="wrapper">
      <nav
        class="nav"
        ?data-expanded="${(x) => x.expanded}"
        aria-label="side-nav"
        @pointerenter="${(x) => x.handlePointerEnter()}"
        @pointerleave="${(x) => x.handlePointerLeave()}"
        @pointercancel="${(x) => x.handlePointerLeave()}"
      >
        <div class="expanded-content">
          <ul>
            <slot
              ${slotted({
                filter: (x) => {
                  return x.nodeType !== 3;
                },
                property: 'items'
              })}
            ></slot>
          </ul>
        </div>
        <div class="collapsed-content"></div>
      </nav>
      <button
        class="collapse-toggle"
        ?data-expanded="${(x) => x.expanded}"
        @click="${(x) => (x.expanded = !x.expanded)}"
      >
        <div class="icon-wrapper">
          ${(x) =>
            x.expanded
              ? chevronLeft({ role: 'presentation' })
              : chevronRight({ role: 'presentation' })}
        </div>
      </button>
    </div>
  </template>
`;
