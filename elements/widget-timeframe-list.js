/** @decorator */

import {
  html,
  repeat,
  ref,
  css,
  observable
} from '../vendor/fast-element.min.js';
import { validate } from '../lib/ppp-errors.js';
import {
  ClonableList,
  clonableListStyles,
  defaultDragEndHandler,
  dragControlsTemplate
} from './clonable-list.js';
import { spacing } from '../design/styles.js';
import './snippet.js';
import './draggable-stack.js';
import './select.js';

export const widgetTimeframeListTemplate = html`
  <template>
    <ppp-snippet
      standalone
      readonly
      style="height: 205px"
      :code="${(x) => x.formatAllowedTimeframesHint()}"
      ${ref('ycPrivateKey')}
    ></ppp-snippet>
    <div class="spacing3"></div>
    <ppp-draggable-stack
      @pppdragend="${(x) => defaultDragEndHandler(x)}"
      ${ref('dragList')}
    >
      ${repeat(
        (x) => x.list,
        html`
          <div class="control-line draggable draggable-line">
            ${dragControlsTemplate()}
            <div class="control-stack">
              <ppp-select
                timeframe-unit
                standalone
                ?disabled="${(x) => x.hidden}"
                value="${(x) => x.unit ?? 'Day'}"
              >
                <ppp-option value="Sec">Секунда</ppp-option>
                <ppp-option value="Min">Минута</ppp-option>
                <ppp-option value="Hour">Час</ppp-option>
                <ppp-option value="Day">День</ppp-option>
                <ppp-option value="Week">Неделя</ppp-option>
                <ppp-option value="Month">Месяц</ppp-option>
              </ppp-select>
              <ppp-text-field
                timeframe-value
                type="number"
                standalone
                ?disabled="${(x) => x.hidden}"
                placeholder="Значение"
                value="${(item) => item.value ?? 1}"
              ></ppp-text-field>
            </div>
            <div class="control-stack">
              <ppp-text-field
                timeframe-name
                standalone
                ?disabled="${(x) => x.hidden}"
                placeholder="Название"
                value="${(item) => item.name}"
              ></ppp-text-field>
            </div>
          </div>
        `
      )}
    </ppp-draggable-stack>
  </template>
`;

export const widgetTimeframeListStyles = css`
  ${clonableListStyles}
  ${spacing()}
`;

export class WidgetTimeframeList extends ClonableList {
  @observable
  allowedTimeframeList;

  constructor() {
    super();
    this.allowedTimeframeList = [];
  }

  formatAllowedTimeframesHint() {
    if (!this.allowedTimeframeList?.length) {
      return '// Трейдер не задан или не поддерживает таймфреймы.';
    }

    let result = '// Поддерживаемые таймфреймы:\n{\n';

    this.allowedTimeframeList.forEach(({ name, values, interval }, i) => {
      let value = '1';

      if (Array.isArray(values)) {
        value = `[${values.join(', ')}]`;
      } else if (interval) {
        value = `[${interval[0]}-${interval[1]}]`;
      }

      result += `  ${ppp.t(`$const.timeframeLabel.${name}`)}: ${value}${
        i < this.allowedTimeframeList.length - 1 ? ',' : ''
      }\n`;
    });

    return result + '}';
  }

  async validate() {
    for (const line of Array.from(
      this.dragList.querySelectorAll('.draggable-line')
    )) {
      const name = line.querySelector('[timeframe-name]');

      await validate(name);

      const value = line.querySelector('[timeframe-value]');

      await validate(value, {
        hook: async (value) => +value > 0 && !isNaN(+value),
        errorMessage: 'Значение должно быть положительным'
      });
    }
  }

  get value() {
    const lines = [];

    for (const line of Array.from(
      this.dragList.querySelectorAll('.draggable-line')
    )) {
      lines.push({
        name: line.querySelector('[timeframe-name]').value.trim(),
        unit: line.querySelector('[timeframe-unit]').value,
        value: Math.abs(line.querySelector('[timeframe-value]').value),
        hidden: !line.querySelector('[visibility-toggle]').checked
      });
    }

    return lines;
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default WidgetTimeframeList.compose({
  template: widgetTimeframeListTemplate,
  styles: widgetTimeframeListStyles
}).define();
