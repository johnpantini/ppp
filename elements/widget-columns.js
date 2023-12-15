import ppp from '../ppp.js';
import { html } from '../vendor/fast-element.min.js';
import { COLUMN_SOURCE } from '../lib/const.js';
import { staticallyCompose } from '../vendor/fast-utilities.js';

class WidgetColumns {
  #columns = [];

  #registeredColumns = [];

  constructor({ columns = [] } = {}) {
    this.#columns = columns;
  }

  async registerColumns() {
    let index = 0;

    for (const column of this.#columns) {
      column.index = index++;

      if (column.hidden) {
        continue;
      }

      try {
        let url = `${ppp.rootUrl}/elements/widgets/columns/${column.source}.js`;

        if (column.source === COLUMN_SOURCE.CLOUDFLARE_WORKER) {
          // TODO: add support for cloudflare workers
        } else if (column.source === COLUMN_SOURCE.URL) {
          url = column.url;
        }

        if (typeof column.name !== 'string') {
          column.name = ppp.t(`$const.columnSource.${column.source}`);
        }

        if (column.source === COLUMN_SOURCE.URL && !column.url) {
          continue;
        }

        const module = await import(url);

        this.#registeredColumns.push({
          ...column,
          definition: module.default
        });
      } catch (e) {
        console.error(e);

        this.#registeredColumns.push({
          name: column.name,
          source: column.source,
          index: column.index,
          content: '<span>—</span>'
        });
      }
    }
  }

  columnElement(column, balanceSymbol) {
    let balanceAttr = '';

    if (balanceSymbol) {
      balanceAttr = `balance=${balanceSymbol}`;
    }

    if (typeof column?.content === 'string') {
      return html`${staticallyCompose(column.content)}`;
    } else {
      return html`${staticallyCompose(
        `<${column.definition.name} ${balanceAttr}></${column.definition.name}>`
      )}`;
    }
  }

  get array() {
    return this.#registeredColumns;
  }
}

export { WidgetColumns };
