/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { html, requireComponent } from './template.js';
import { observable } from './element/observation/observable.js';
import { attr } from './element/components/attributes.js';
import { ref } from './element/templating/ref.js';
import { when } from './element/templating/when.js';
import { repeat } from './element/templating/repeat.js';
import { invalidate } from './validate.js';
import { Tmpl } from './tmpl.js';
import ppp from '../ppp.js';

await requireComponent(
  'ppp-loading-option',
  `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/option.js`
);

export const collectionSelectTemplate = (context, definition) => html`
  <template>
    <${'ppp-select'}
      ${ref('control')}
      placeholder="${x => x.placeholder ?? 'Нажмите, чтобы выбрать'}"
    >
      <div slot="indicator">
        ${when((x) => x.loading, definition.spinner)}
        ${when((x) => !x.loading && x.state === 'default', definition.arrow)}
        ${when(
          (x) => !x.loading && x.state === 'error',
          definition.warningIndicator
        )}
      </div>
      <ppp-loading-option :value="${() => ' '}">
        ${x => x.placeholder ?? 'Нажмите, чтобы выбрать'}
      </ppp-loading-option>
      ${repeat(
        (x) => x.options,
        html`
          <ppp-option
            title="${(x) => (x.removed ? 'Этот элемент был удалён' : null)}"
            ?removed="${(x) => x.removed}"
            :value="${(x) => x.value}"
          >
            ${(x) => x.displayValue}
          </ppp-option>
        `
      )}
    </ppp-select>
  </template>
`;

export class CollectionSelect extends FoundationElement {
  /**
   *
   * @internal
   */
  #code;

  @attr
  state;

  @observable
  errorMessage;

  /**
   * The current loading status.
   * @type {boolean}
   */
  @observable
  loading;

  @observable
  options;

  /**
   * Preloaded options.
   */
  @observable
  preloaded;

  /**
   * The query to perform.
   */
  @observable
  query;

  /**
   * @public
   * @remarks
   * HTML Attribute: value
   */
  @attr
  value;

  constructor(props) {
    super(props);

    this.loading = false;
    this.options = [];
  }

  #onControlChange() {
    this.value = this.control.value;

    if (this.value) this.state = 'default';
  }

  datum() {
    return this.options.find((o) => o.value === this.value)?.datum;
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
              displayValue: item.name,
              removed: item.removed
            };
          });
        } else {
          return {
            datum: data,
            value: data._id,
            displayValue: data.name,
            removed: data.removed
          };
        }
      })
    );
  }

  async #onControlOpenChanged() {
    if (this.control.open) {
      this.loading = true;

      try {
        const code = await new Tmpl().render(this.context, this.#code, {});
        let queryResult = await ppp.user.functions.eval(code);

        if (typeof this.transform === 'function')
          queryResult = await this.transform.call(this.context, queryResult);

        this.options = this.#formatter().call(this, queryResult);
      } catch (e) {
        console.dir(e);

        invalidate(this, {
          errorMessage: 'Не удалось загрузить данные'
        });
      } finally {
        this.loading = false;
      }
    }
  }

  stateChanged(prev, next) {
    this.control.state = next;
    this.control.errorMessage = this.errorMessage;
  }

  preloadedChanged(prev, next) {
    if (typeof next === 'object') {
      const formatted = this.#formatter().call(this, next);

      if (!this.options.find((o) => o.value === formatted.value)) {
        this.options.push(formatted);

        this.control.value = this.value;
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.state) {
      this.state = 'default';
    }

    this.control.addEventListener(
      'openchange',
      this.#onControlOpenChanged.bind(this),
      {
        passive: true
      }
    );

    this.control.addEventListener('change', this.#onControlChange.bind(this), {
      passive: true
    });

    if (typeof this.query === 'function') {
      this.#code = this.query.toString().split(/\r?\n/);

      this.#code.pop();
      this.#code.shift();
      this.#code = this.#code.join('\n');
    }
  }
}
