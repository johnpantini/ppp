/** @decorator */

import ppp from '../ppp.js';
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
                <ppp-option value="Sec">
                  ${() => ppp.t('$const.timeframeLabel.Sec')}
                </ppp-option>
                <ppp-option value="Min">
                  ${() => ppp.t('$const.timeframeLabel.Min')}
                </ppp-option>
                <ppp-option value="Hour">
                  ${() => ppp.t('$const.timeframeLabel.Hour')}
                </ppp-option>
                <ppp-option value="Day">
                  ${() => ppp.t('$const.timeframeLabel.Day')}
                </ppp-option>
                <ppp-option value="Week">
                  ${() => ppp.t('$const.timeframeLabel.Week')}
                </ppp-option>
                <ppp-option value="Month">
                  ${() => ppp.t('$const.timeframeLabel.Month')}
                </ppp-option>
              </ppp-select>
              <ppp-text-field
                timeframe-value
                type="number"
                standalone
                ?disabled="${(x) => x.hidden}"
                placeholder="${() => ppp.t('$g.value')}"
                value="${(item) => item.value ?? 1}"
              ></ppp-text-field>
            </div>
            <div class="control-stack">
              <ppp-text-field
                timeframe-name
                standalone
                ?disabled="${(x) => x.hidden}"
                placeholder="${() => ppp.t('$g.name')}"
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
      return ppp.t('$widget.traderNoTimeframes');
    }

    let result = ppp.t('$widget.supportedTimeframes') + '\n{\n';

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
        errorMessage: ppp.t('$widget.valueMustBePositive')
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
