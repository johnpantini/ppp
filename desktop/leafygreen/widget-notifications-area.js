import { WidgetNotificationsArea } from '../../shared/widget-notifications-area.js';
import { css } from '../../shared/element/styles/css.js';
import { html } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';

export const widgetNotificationsAreaTemplate = (context, definition) => html`
  <template>
    <div class="widget-notification-ps">
      <div class="widget-notification-holder">
        ${when(
          (x) => x.visible && x.title,
          html`
            <div
              class="widget-notification"
              status="${(x) => x.status ?? 'success'}"
            >
              <div class="widget-notification-icon">
                <img
                  draggable="false"
                  alt="Ошибка"
                  src="${(x) =>
                    `static/widgets/notifications-${
                      x.status ?? 'success'
                    }.svg`}"
                />
              </div>
              <div class="widget-notification-text-container">
                <div class="widget-notification-title">
                  ${(x) => x.title ?? ''}
                </div>
                <div class="widget-notification-text">
                  ${(x) => x.text ?? ''}
                </div>
              </div>
              <div
                class="widget-notification-close-button"
                @click="${(x) => (x.visible = false)}"
              >
                <img
                  draggable="false"
                  alt="Закрыть"
                  src="static/widgets/close.svg"
                />
              </div>
            </div>
          `
        )}
      </div>
    </div>
  </template>
`;

const widgetNotificationsAreaStyles = (context, definition) => css`
  :host {
    width: 100%;
    position: absolute;
    bottom: 20px;
    left: 0;
    z-index: 20;
    will-change: contents;
  }

  .widget-notification-ps {
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
    width: 100%;
    contain: layout;
  }

  .widget-notification-holder {
    padding: 0 12px;
    max-width: 480px;
    margin: auto;
  }

  .widget-notification {
    box-shadow: rgb(0 0 0 / 20%) 0 7px 20px 0;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: flex-start;
    width: 100%;
    overflow: hidden;
    background-color: #fff;
    padding: 12px 16px;
    border-radius: 8px;
  }

  .widget-notification::before {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100%;
    width: 4px;
    content: '';
  }

  .widget-notification[status='error']::before {
    background: rgb(213, 54, 69);
  }

  .widget-notification[status='success']::before {
    background: rgb(11, 176, 109);
  }

  .widget-notification-icon img,
  .widget-notification-close-button img {
    color: #4f4f4f;
    font-size: 16px;
    margin-right: 2px;
    width: 16px;
    height: 16px;
  }

  .widget-notification-icon {
    margin-right: 8px;
  }

  .widget-notification-text-container {
    flex-grow: 1;
    font-size: 12px;
  }

  .widget-notification-title {
    font-weight: 500;
    color: rgb(51, 70, 87);
  }

  .widget-notification-text {
    margin-top: 4px;
    line-height: 20px;
    color: rgb(90, 118, 143);
  }

  .widget-notification-close-button {
    margin-left: 4px;
    cursor: pointer;
  }
`;

// noinspection JSUnusedGlobalSymbols
export default WidgetNotificationsArea.compose({
  template: widgetNotificationsAreaTemplate,
  styles: widgetNotificationsAreaStyles
});
