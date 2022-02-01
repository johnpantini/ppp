/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { observable } from './element/observation/observable.js';
import { html } from './template.js';
import { repeat } from './element/templating/repeat.js';
import { when } from './element/templating/when.js';

const datumTemplate = repeat(
  (x) => x.cells,
  html`
    <td class="cell">
      <div class="cell-container">
        <span class="cell-text">${(x) => x}</span>
      </div>
    </td>
  `
);

// TODO - aria attributes
export const tableTemplate = (context, definition) => html`
  <template class="${(x) => (x.rows.length >= 10 ? 'long' : '')}">
    <table>
      <thead>
        <tr>
          ${repeat(
            (x) => x.columns,
            html`
              <th role="columnheader" scope="col">
                <div class="column-header">
                  <span class="column-header-text">${(x) => x.label}</span>
                </div>
              </th>
            `
          )}
        </tr>
      </thead>
      <tbody>
        ${repeat(
          (x) => x.sort(x.rows),
          html` <tr role="row" class="row">
            ${datumTemplate}
          </tr>`
        )}
      </tbody>
    </table>
    ${when(
      (x) => !x.rows.length,
      html` <div class="empty-message">Нет записей для отображения.</div>`
    )}
  </template>
`;

export class Table extends FoundationElement {
  @observable
  columns;

  @observable
  rows;

  sort(data) {
    return data;
  }

  constructor() {
    super(...arguments);

    this.columns = [];
    this.rows = [];
  }
}
