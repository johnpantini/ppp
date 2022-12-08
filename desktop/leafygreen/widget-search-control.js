import { WidgetSearchControl } from '../../shared/widget-search-control.js';
import { css } from '../../shared/element/styles/css.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { when } from '../../shared/element/templating/when.js';
import { repeat } from '../../shared/element/templating/repeat.js';
import { bodyFont } from './design-tokens.js';
import { search } from './icons/search.js';
import { circleNotch } from './icons/circle-notch.js';

export const widgetSearchControlTemplate = (context, definition) => html`
  <template @click="${(x, c) => x.handleClick(c)}">
    <input
      readonly
      class="popup-trigger"
      type="text"
      placeholder="Тикер"
      maxlength="20"
      autocomplete="off"
      value="${(x) => x.widget?.instrument?.symbol ?? ''}"
    />
    <div class="popup">
      <div class="suggest-area">
        ${when((x) => !x.searching, search({ cls: 'search-icon' }))}
        ${when((x) => x.searching, circleNotch({ cls: 'spinner' }))}
        <input
          ${ref('suggestInput')}
          spellcheck="false"
          placeholder="Поиск по тикеру или названию инструмента"
          class="suggest-input"
          @input="${(x, c) => {
            x.search(c.event.target.value);
          }}"
        />
      </div>
      <div class="divider"></div>
      ${when(
        (x) => x.widget?.instrument,
        html`
          <div class="menu-item-holder">
            <div
              class="menu-item"
              @click="${(x) => x.selectInstrument(x.widget?.instrument)}"
            >
              <div class="menu-item-icon-holder">
                <div class="menu-item-icon-fallback">
                  <div
                    class="menu-item-icon-logo"
                    style="${(x) =>
                      `background-image:url(${
                        'static/instruments/' +
                        x.widget?.instrument.isin +
                        '.svg'
                      })`}"
                  ></div>
                  ${(x) => x.widget?.instrument.fullName[0]}
                </div>
              </div>
              <div class="menu-item-text">
                ${(x) => x.widget?.instrument.fullName}
              </div>
              <div class="menu-item-controls">
                <div class="menu-item-tag">
                  <span>${(x) => x.widget?.instrument.symbol}</span>
                </div>
                <div
                  @click="${(x) => x.selectInstrument()}"
                  class="menu-item-close"
                ></div>
              </div>
            </div>
          </div>
          <div class="divider"></div>
        `
      )}
      <div class="menu-holder" ${ref('menuHolder')}>
        <div class="menu">
          ${when(
            (x) => !x.ticker && !x.stocks.length && !x.bonds.length,
            html`
              <div class="empty-state-holder">
                <img draggable="false" src="static/empty-widget-state.svg" />
                <span>Нет результатов для отображения.</span>
              </div>
            `
          )}
          ${when(
            (x) => x.ticker,
            html`
              <div class="menu-title">Тикер</div>
              <div
                class="menu-item"
                @click="${(x) => x.selectInstrument(x.ticker)}"
              >
                <div class="menu-item-icon-holder">
                  <div class="menu-item-icon-fallback">
                    <div
                      class="menu-item-icon-logo"
                      style="${(x) =>
                        `background-image:url(${
                          'static/instruments/' + x.ticker?.isin + '.svg'
                        })`}"
                    ></div>
                    ${(x) => x.ticker?.fullName[0]}
                  </div>
                </div>
                <div class="menu-item-text">${(x) => x.ticker?.fullName}</div>
                <div class="menu-item-tag">
                  <span>${(x) => x.ticker?.symbol}</span>
                </div>
              </div>
            `
          )}
          ${when(
            (x) => x.stocks.length,
            html`
              <div class="menu-title">Акции</div>
              ${repeat(
                (x) => x.stocks,
                html`
                  <div
                    class="menu-item"
                    @click="${(x, c) => c.parent.selectInstrument(x)}"
                  >
                    <div class="menu-item-icon-holder">
                      <div class="menu-item-icon-fallback">
                        <div
                          class="menu-item-icon-logo"
                          style="${(x) =>
                            `background-image:url(${
                              'static/instruments/' + x.isin + '.svg'
                            })`}"
                        ></div>
                        ${(x) => x.fullName[0]}
                      </div>
                    </div>
                    <div class="menu-item-text">${(x) => x.fullName}</div>
                    <div class="menu-item-tag">
                      <span>${(x) => x.symbol}</span>
                    </div>
                  </div>
                `
              )}
            `
          )}
        </div>
      </div>
    </div>
  </template>
`;

export const widgetSearchControlStyles = (context, definition) => css`
  :host {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    position: relative;
    cursor: default;
  }

  .popup-trigger {
    font-family: ${bodyFont};
    color: #09132c;
    border: 1px solid #d9dae0;
    padding: 0 10px;
    font-size: 12px;
    background: transparent;
    text-align: left;
    caret-color: #007cff;
    text-overflow: ellipsis;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 2px;
  }

  .popup-trigger:focus-visible {
    outline: none;
  }

  .popup-trigger:hover {
    border-color: #c0c3c8;
  }

  .popup {
    top: 0;
    left: 0;
    width: 330px;
    z-index: 1000;
    position: absolute;
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 7px 20px 0 rgb(0 0 0 / 20%);
    transform: translate(0px, -6px);
    display: none;
  }

  :host([open]) .popup {
    display: initial;
  }

  .suggest-area {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 12px 4px;
    box-sizing: border-box;
  }

  .search-icon {
    color: rgba(9, 19, 44, 0.5);
  }

  .spinner {
    animation: spin 2s linear infinite;
    color: #168b46;
  }

  @keyframes spin {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(359deg);
    }
  }

  .divider {
    border-top: 1px solid #dfe6ed;
    display: block;
    margin: 6px 12px;
  }

  .suggest-input {
    font-family: ${bodyFont};
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    height: 16px;
    margin-left: 8px;
    color: rgb(33, 49, 60);
    appearance: none;
    word-wrap: break-word;
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
    letter-spacing: 0;
  }

  .menu-holder {
    height: 256px;
    padding: 4px 0;
    min-width: 100%;
    border-radius: 4px;
    position: relative;
  }

  .menu-item-holder {
    padding: 0;
    border-radius: 4px;
    color: rgb(33, 49, 60);
    list-style: none;
    margin: 0;
    min-width: 100%;
    height: 100%;
    text-align: left;
  }

  .menu {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .menu::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .menu::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .menu::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .menu-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: rgb(112, 139, 164);
    padding: 8px 12px;
    cursor: default;
    word-wrap: break-word;
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
    letter-spacing: 0;
  }

  .menu-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: inherit;
    padding: 8px 12px;
    text-decoration: none;
    user-select: none;
    cursor: pointer;
  }

  .menu-item.active,
  .menu-item:hover {
    background-color: rgb(243, 245, 248);
  }

  .menu-item-icon-holder {
    display: flex;
    align-items: center;
    margin-right: 12px;
  }

  .menu-item-icon-holder > * {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .menu-item-icon-fallback {
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgb(140, 167, 190);
    background-color: rgb(223, 230, 237);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    position: relative;
    word-wrap: break-word;
    font-size: 12px;
    line-height: 16px;
    font-weight: 500;
    letter-spacing: 0;
    box-sizing: border-box;
    text-transform: uppercase;
  }

  .menu-item-icon-logo {
    width: 20px;
    height: 20px;
    left: 0;
    top: 0;
    position: absolute;
    border-radius: 50%;
    background-size: 100%;
  }

  .menu-item-text {
    word-break: break-word;
    flex-grow: 1;
    flex-shrink: 1;
    margin-right: 12px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: normal;
  }

  .menu-item-controls {
    display: flex;
    align-items: center;
  }

  .menu-item-tag {
    box-sizing: border-box;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    background-color: rgb(206, 216, 225);
    border: none;
    border-radius: 4px;
    box-shadow: none;
    color: rgb(90, 118, 143);
    font-size: 12px;
    line-height: 16px;
    padding: 2px;
    position: relative;
  }

  .menu-item-tag span {
    margin: 0 4px;
    flex-grow: 1;
    flex-shrink: 1;
  }

  .menu-item-close {
    background-image: url('static/widgets/menu-item-close.svg');
    font-size: 16px;
    margin-left: 8px;
    cursor: pointer;
    width: 16px;
    height: 16px;
  }

  .empty-state-holder {
    width: 100%;
    height: 90%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }

  .empty-state-holder img {
    width: 80px;
    height: 80px;
    margin-left: 16px;
  }

  .empty-state-holder span {
    color: rgba(9, 19, 44, 0.5);
    font-size: 12px;
    margin-top: 4px;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default WidgetSearchControl.compose({
  template: widgetSearchControlTemplate,
  styles: widgetSearchControlStyles
});
