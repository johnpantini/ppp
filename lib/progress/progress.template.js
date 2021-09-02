import { html } from '../element/templating/template.js';
import { when } from '../element/templating/when.js';

export const progressTemplate = (context, definition) => html`
  <template
    role="progressbar"
    aria-valuenow="${(x) => x.value}"
    aria-valuemin="${(x) => x.min}"
    aria-valuemax="${(x) => x.max}"
    class="${(x) => (x.paused ? 'paused' : '')}"
  >
    ${when(
      (x) => typeof x.value === 'number',
      html`
        <div class="progress" part="progress" slot="determinate">
          <div
            class="determinate"
            part="determinate"
            style="width: ${(x) => x.value}%"
          ></div>
        </div>
      `
    )}
    ${when(
      (x) => typeof x.value !== 'number',
      html`
        <div class="progress" part="progress" slot="indeterminate">
          <slot class="indeterminate" name="indeterminate">
            ${definition.indeterminateIndicator1 || ''}
            ${definition.indeterminateIndicator2 || ''}
          </slot>
        </div>
      `
    )}
  </template>
`;
