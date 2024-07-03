/** @decorator */

import {
  attr,
  observable,
  css,
  html,
  ref,
  when,
  repeat,
  Updates
} from '../vendor/fast-element.min.js';
import { normalize } from '../design/styles.js';
import {
  paletteGreenBase,
  paletteRedBase,
  paletteRedLight1,
  themeConditional
} from '../design/design-tokens.js';
import { PPPAppearanceElement } from '../lib/ppp-element.js';
import { invalidate } from '../lib/ppp-errors.js';
import { ListboxOption, listboxOptionTemplate } from './listbox-option.js';
import { Tmpl } from '../lib/tmpl.js';
import { caretDown, circleNotch, warning } from '../static/svg/sprite.js';
import './select.js';

ListboxOption.compose({
  name: 'ppp-loading-option',
  template: listboxOptionTemplate,
  styles: css`
    :host {
      pointer-events: none;
      display: none;
    }
  `
}).define();

export const querySelectTemplate = html`
  <template>
    <ppp-select
      variant="${(x) => x.variant}"
      ?standalone="${(x) => x.standalone}"
      ?deselectable="${(x) => x.deselectable}"
      ${ref('control')}
      ?disabled="${(x) => x.disabled}"
      placeholder="${(x) => x.placeholder ?? 'Нажмите для выбора'}"
    >
      <div class="indicator" slot="indicator">
        ${when(
          (x) => x.loading,
          html`<span class="spinner"> ${html.partial(circleNotch)} </span>`
        )}
        ${when(
          (x) => !x.loading && x.appearance === 'default',
          html`${html.partial(caretDown)}`
        )}
        ${when(
          (x) => !x.loading && x.appearance === 'error',
          html`<span class="error-icon">${html.partial(warning)}</span>`
        )}
      </div>
      <ppp-loading-option
        :value="${() => void 0}"
        :pppContent="${(x) =>
          html`<span class="placeholder"
            >${() => x.placeholder ?? 'Нажмите для выбора'}</span
          >`}"
      >
        ${(x) => x.placeholder ?? 'Нажмите для выбора'}
      </ppp-loading-option>
      ${repeat(
        (x) => x.options,
        html`
          <ppp-option
            title="${(x) => (x.removed ? 'Этот элемент был удалён' : null)}"
            ?removed="${(x) => x.removed}"
            :value="${(x) => x.value}"
            :displayValue="${(x) => x.displayValue}"
          >
            ${(x) => x.displayValue}
          </ppp-option>
        `
      )}
    </ppp-select>
  </template>
`;

export const querySelectStyles = css`
  ${normalize()}
  :host(:focus-visible) {
    position: relative;
    outline: none;
  }

  :host ppp-select {
    max-width: inherit;
    width: 100%;
  }

  .indicator svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  .spinner svg {
    animation: spin 2s linear infinite;
    color: ${themeConditional(paletteGreenBase)};
  }

  @keyframes spin {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(359deg);
    }
  }

  .error-icon {
    color: ${themeConditional(paletteRedBase, paletteRedLight1)};
  }
`;

export class QuerySelect extends PPPAppearanceElement {
  #code;

  @attr({ mode: 'boolean' })
  standalone;

  @observable
  errorMessage;

  @observable
  loading;

  @observable
  options;

  @observable
  formatter;

  @observable
  displayValueFormatter;

  @attr({ mode: 'boolean' })
  deselectable;

  @attr
  variant;

  @observable
  preloaded;

  @observable
  query;

  @attr
  value;

  @attr
  placeholder;

  @attr({ mode: 'boolean' })
  disabled;

  constructor() {
    super();

    this.loading = false;
    this.options = [];
  }

  #onControlChange() {
    this.value = this.control.value;

    if (this.value) this.appearance = 'default';

    this.$emit('change', this);
  }

  datum() {
    return this.options.find((o) => o.value === this.value)?.datum;
  }

  valueChanged(oldValue, newValue) {
    if (this.$fastController.isConnected) {
      this.control.value = newValue;

      // Apply empty select style on null value.
      if (this.value === null) {
        this.value = void 0;
      }
    }
  }

  #formatter() {
    return (
      this.formatter ??
      ((data) => {
        if (Array.isArray(data)) {
          return data.map((item) => {
            return {
              datum: item,
              value: item._id,
              displayValue:
                typeof this.displayValueFormatter == 'function'
                  ? this.displayValueFormatter(item)
                  : item.name,
              removed: item.removed
            };
          });
        } else {
          return {
            datum: data,
            value: data._id,
            displayValue:
              typeof this.displayValueFormatter == 'function'
                ? this.displayValueFormatter(data)
                : data.name,
            removed: data.removed
          };
        }
      })
    );
  }

  async #onControlOpenChanged() {
    if (this.options.length) {
      this.control.listboxHolder.removeAttribute('hidden');
    } else {
      this.control.listboxHolder.setAttribute('hidden', '');
    }

    if (this.control.open) {
      this.loading = true;

      try {
        let queryResult;

        if (typeof this.#code === 'string') {
          queryResult = await ppp.user.functions.eval(
            await new Tmpl().render(this.context, this.#code, {})
          );
        } else {
          queryResult = await this.#code(this);
        }

        if (typeof this.transform === 'function') {
          queryResult = await this.transform.call(this.context, queryResult);
        }

        this.options = this.#formatter().call(this, queryResult);

        if (this.options.length) {
          this.control.listboxHolder.removeAttribute('hidden');
        } else {
          this.control.listboxHolder.setAttribute('hidden', '');

          this.errorMessage = 'Нет вариантов для выбора';
          this.appearance = 'error';
        }
      } catch (e) {
        console.dir(e);

        this.control.open = false;

        invalidate(this, {
          errorMessage: 'Не удалось загрузить данные'
        });
      } finally {
        this.loading = false;
      }
    }
  }

  appearanceChanged(prev, next) {
    if (this.$fastController.isConnected) {
      this.control.appearance = next;
      this.control.errorMessage = this.errorMessage;
    }
  }

  preloadedChanged(prev, next) {
    Updates.enqueue(() => {
      if (typeof next === 'function') next = next.call(this);

      if (typeof next === 'object') {
        const formatted = this.#formatter().call(this, next);

        if (typeof formatted.value === 'undefined' || formatted.value === null)
          return;

        if (!this.options.find((o) => o.value === formatted.value)) {
          this.options.push(formatted);

          this.control.value = this.value;
        }
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this.control.addEventListener(
      'openchange',
      this.#onControlOpenChanged.bind(this)
    );

    this.control.addEventListener('change', this.#onControlChange.bind(this));

    if (this.query.constructor.name === 'AsyncFunction') {
      this.#code = this.query;
    } else if (typeof this.query === 'function') {
      this.#code = this.query.toString().split(/\r?\n/);

      this.#code.pop();
      this.#code.shift();
      this.#code = this.#code.join('\n');
    }
  }
}

export default QuerySelect.compose({
  template: querySelectTemplate,
  styles: querySelectStyles
}).define();
