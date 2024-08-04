import { OrderElement } from '../../order-element.js';
import { html, css, ref } from '../../../vendor/fast-element.min.js';
import { widgetCommonContentStyles } from '../../../elements/widget.js';
import { uuidv4 } from '../../ppp-crypto.js';
import { normalize } from '../../../design/styles.js';
import '../../../elements/widget-controls.js';

export const marketDataRecorderOrderElementTemplate = html`
  <div class="widget-section">
    <div class="widget-subsection">
      <div class="widget-subsection-item">
        <div class="widget-text-label">Флаги</div>
        <ppp-widget-checkbox
          ${ref('autoStartFlag')}
          ?checked="${(x) => x.order?.autoStart ?? x.order?.order?.autoStart}"
        >
          Запускать запись сразу
        </ppp-widget-checkbox>
      </div>
    </div>
  </div>
`;

export const marketDataRecorderOrderElementStyles = css`
  ${normalize()}
  ${widgetCommonContentStyles()}
`;

export class MarketDataRecorderOrderElement extends OrderElement {
  serialize() {
    return {
      autoStart: this.autoStartFlag.checked
    };
  }
}

export default MarketDataRecorderOrderElement.compose({
  name: `ppp-${uuidv4()}`,
  template: marketDataRecorderOrderElementTemplate,
  styles: marketDataRecorderOrderElementStyles
}).define();
