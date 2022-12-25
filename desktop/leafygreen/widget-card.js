import { WidgetCard } from '../../shared/widget-card.js';
import { css } from '../../shared/element/styles/css.js';
import { slotted } from '../../shared/element/templating/slotted.js';
import { html } from '../../shared/template.js';

export const widgetCardTemplate = (context, definition) => html`
  <template>
    <div class="card">
      <slot name="indicator"></slot>
      <div class="payload">
        <div class="icon">
          <slot name="icon"></slot>
          <slot name="icon-fallback"></slot>
        </div>
        <div class="text-content">
          <div class="text-line first">
            <div class="text-line-inner">
              <span>
                <div>
                  <slot name="title-left"></slot>
                </div>
              </span>
            </div>
            <span>
              <slot name="title-right"></slot>
            </span>
          </div>
          <div class="text-line second">
            <div class="text-line-inner">
              <div>
                <slot name="subtitle-left"></slot>
              </div>
            </div>
            <span>
              <slot name="subtitle-right"></slot>
            </span>
          </div>
        </div>
      </div>
      <div
        class="actions"
        style="display: ${(x) => (x.slottedActions.length ? 'flex' : 'none')}"
      >
        <slot name="actions" ${slotted('slottedActions')}></slot>
      </div>
    </div>
  </template>
`;

export const widgetCardStyles = (context, definition) => css`
  :host {
    box-sizing: border-box;
    position: relative;
    padding: 0 8px;
  }

  .card {
    min-height: 36px;
    height: auto;
    background-color: rgb(243, 245, 248);
    color: #323e4a;
    padding: 0 12px;
    border-radius: 4px;
    user-select: none;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    align-items: center;
    position: relative;
    overflow: hidden;
    cursor: default;
  }

  :host(.new) .card {
    background-color: rgba(11, 144, 255, 0.2);
  }

  :host([clickable]) .card {
    cursor: pointer;
  }

  :host([clickable]) .card:hover {
    background-color: rgba(11, 144, 255, 0.2);
  }

  :host(:first-child) {
    padding-top: 8px;
  }

  :host(:last-child) {
    padding-bottom: 8px;
  }

  slot[name='indicator']::slotted(div) {
    height: 100%;
    border-radius: 8px 0 0 8px;
    position: absolute;
    width: 4px;
    left: 0;
    top: 0;
  }

  .actions {
    position: absolute;
    top: 0;
    right: 0;
    padding-right: 16px;
    width: 116px;
    height: 100%;
    opacity: 0;
    transition: opacity 0.15s ease-in;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: linear-gradient(
      90deg,
      rgba(243, 245, 248, 0) 0,
      rgb(243, 245, 248) 30%,
      rgb(243, 245, 248)
    );
  }

  .card:hover .actions {
    opacity: 1;
    transition-timing-function: ease-out;
  }

  .payload {
    width: 100%;
    padding: 8px 0;
    display: flex;
    align-items: center;
  }

  .icon {
    margin-right: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgb(140, 167, 190);
    background-color: rgb(223, 230, 237);
    min-width: 28px;
    min-height: 28px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    position: relative;
    word-wrap: break-word;
    font-size: 15px;
    line-height: 20px;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: capitalize;
  }

  slot[name='icon']::slotted(div) {
    width: 28px;
    height: 28px;
    left: 0;
    top: 0;
    position: absolute;
    border-radius: 50%;
    background-size: 100%;
  }

  .text-content {
    overflow: hidden;
    flex: 1;
  }

  .text-line {
    display: flex;
    white-space: nowrap;
    justify-content: space-between;
    align-items: center;
    word-wrap: break-word;
    font-size: 12px;
    letter-spacing: 0;
  }

  .text-line.first {
    font-weight: 500;
    color: rgb(51, 70, 87);
  }

  .text-line-inner {
    display: flex;
    align-items: center;
    margin-right: 20px;
    overflow: hidden;
  }

  .text-line-inner > span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .text-line-inner > span > div {
    word-wrap: break-word;
    font-size: 12px;
    line-height: 20px;
    font-weight: 500;
    letter-spacing: 0;
    color: rgb(51, 70, 87);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .text-line.second {
    font-weight: 400;
    color: rgb(90, 118, 143);
  }
`;

// noinspection JSUnusedGlobalSymbols
export default WidgetCard.compose({
  template: widgetCardTemplate,
  styles: widgetCardStyles
});
