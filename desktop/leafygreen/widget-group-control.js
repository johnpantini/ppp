import { WidgetGroupControl } from '../../shared/widget-group-control.js';
import { css } from '../../shared/element/styles/css.js';
import { html } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';
import { display } from '../../shared/utilities/style/display.js';
import { bodyFont } from './design-tokens.js';

export const widgetGroupControlTemplate = (context, definition) => html`
  <template @click="${(x, c) => x.handleClick(c)}">
    <div class="toggle">${(x) => x.selection ?? ''}</div>
    ${when(
      (x) => x.open,
      html`
        <div class="popup">
          <div class="toolbar"></div>
          <div class="groups">
            <div class="group-line">
              <div
                class="group-icon-holder"
                ?selected="${(x) => !x.selection}"
                @click="${(x) => x.setGroup()}"
              >
                <div class="group-icon no-group"></div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '1'}"
                @click="${(x) => x.setGroup(1)}"
              >
                <div class="group-icon group-1">1</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '2'}"
                @click="${(x) => x.setGroup(2)}"
              >
                <div class="group-icon group-2">2</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '3'}"
                @click="${(x) => x.setGroup(3)}"
              >
                <div class="group-icon group-3">3</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '4'}"
                @click="${(x) => x.setGroup(4)}"
              >
                <div class="group-icon group-4">4</div>
              </div>
            </div>
            <div class="group-line">
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '5'}"
                @click="${(x) => x.setGroup(5)}"
              >
                <div class="group-icon group-5">5</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '6'}"
                @click="${(x) => x.setGroup(6)}"
              >
                <div class="group-icon group-6">6</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '7'}"
                @click="${(x) => x.setGroup(7)}"
              >
                <div class="group-icon group-7">7</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '8'}"
                @click="${(x) => x.setGroup(8)}"
              >
                <div class="group-icon group-8">8</div>
              </div>
              <div
                class="group-icon-holder"
                ?selected="${(x) => x.selection === '9'}"
                @click="${(x) => x.setGroup(9)}"
              >
                <div class="group-icon group-9">9</div>
              </div>
            </div>
          </div>
        </div>
      `
    )}
  </template>
`;

export const widgetGroupControlStyles = (context, definition) =>
  css`
    ${display('inline-flex')}
    :host {
      font-family: ${bodyFont};
      font-size: 16px;
      width: 16px;
      height: 16px;
      display: inline-flex;
      position: relative;
      align-items: center;
      justify-content: center;
    }

    .toggle {
      cursor: pointer;
      position: relative;
      background: #d9dae0;
      color: #ffffff;
      width: 12px;
      height: 12px;
      font-size: 10px;
      text-align: center;
      line-height: 11px;
    }

    :host(:not([selection])) .toggle::before {
      top: 50%;
      left: 50%;
      width: 6px;
      height: 2px;
      content: '';
      position: absolute;
      transform: translate(-50%, -50%);
      border-radius: 1px;
      background-color: rgba(9, 19, 44, 0.5);
      transform-origin: 50% 50%;
    }

    .popup {
      top: 100%;
      left: 50%;
      width: 122px;
      margin: 0 -23px;
      z-index: 1000;
      position: absolute;
      border-radius: 4px;
      transform: translate(10px, 12px);
      background: #ffffff;
      box-shadow: 0 7px 20px 0 rgb(0 0 0 / 20%);
    }

    .popup::after,
    .popup::before {
      left: 13px;
      width: 0;
      border: solid transparent;
      bottom: 100%;
      height: 0;
      content: '';
      position: absolute;
      transform: translate(-50%, 0);
    }

    .popup::before {
      border-width: 6px;
      border-bottom-color: #ffffff;
    }

    .popup::after {
      border-width: 5px;
      border-bottom-color: #ffffff;
    }

    .toolbar {
    }

    .groups {
      padding: 10px 8px;
      cursor: default;
    }

    .group-line {
      display: flex;
      justify-content: space-between;
    }

    .group-line + .group-line {
      margin-top: 8px;
    }

    .group-icon-holder {
      width: 16px;
      cursor: pointer;
      height: 16px;
      display: inline-flex;
      position: relative;
      align-items: center;
      justify-content: center;
    }

    .group-icon-holder[selected]::before {
      content: '';
      top: 0;
      left: 0;
      right: 0;
      border: 0.5px solid #d9dae0;
      bottom: 0;
      position: absolute;
    }

    .group-icon {
      color: #ffffff;
      width: 12px;
      height: 12px;
      font-size: 10px;
      text-align: center;
      line-height: 11px;
      border-radius: 2px;
    }

    .no-group {
      position: relative;
      background: #d9dae0;
    }

    .no-group::before {
      top: 50%;
      left: 50%;
      width: 6px;
      height: 2px;
      content: '';
      position: absolute;
      transform: translate(-50%, -50%);
      border-radius: 1px;
      background-color: rgba(9, 19, 44, 0.5);
      transform-origin: 50% 50%;
    }

    :host([selection='1']) .toggle,
    .group-1 {
      background-color: #ffd450;
    }

    :host([selection='2']) .toggle,
    .group-2 {
      background-color: #ff7b76;
    }

    :host([selection='3']) .toggle,
    .group-3 {
      background-color: #a381ff;
    }

    :host([selection='4']) .toggle,
    .group-4 {
      background-color: #4dc3f7;
    }

    :host([selection='5']) .toggle,
    .group-5 {
      background-color: #aed57f;
    }

    :host([selection='6']) .toggle,
    .group-6 {
      background-color: #4da197;
    }

    :host([selection='7']) .toggle,
    .group-7 {
      background-color: #ffb74c;
    }

    :host([selection='8']) .toggle,
    .group-8 {
      background-color: #f8a34d;
    }

    :host([selection='9']) .toggle,
    .group-9 {
      background-color: #ff8863;
    }
  `;

// noinspection JSUnusedGlobalSymbols
export default WidgetGroupControl.compose({
  template: widgetGroupControlTemplate,
  styles: widgetGroupControlStyles
});
