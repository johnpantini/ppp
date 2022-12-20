import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  orderWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/order-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const orderWidgetStyles = (context, definition) => css`
    .widget-company-card {
      width: 100%;
      padding: 10px 10px 0 10px;
      font-size: 12px;
      text-align: left;
      line-height: 1.5;
    }

    .widget-company-card-item {
      color: rgba(9, 19, 44, 0.7);
      display: flex;
      align-items: center;
      line-height: 20px;
      justify-content: space-between;
    }

    .widget-company-card-item:first-child {
      font-size: 16px;
      color: #09132c;
    }

    .company-name {
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 70%;
    }

    .company-last-price {
      white-space: nowrap;
      cursor: pointer;
    }

    .widget-nbbo-line {
      color: #09132c;
      width: 100%;
      display: flex;
      font-size: 13px;
      line-height: 22px;
      padding: 10px;
      font-weight: 500;
    }

    .widget-nbbo-line-bid {
      flex: 1 1 0;
      color: rgb(19, 193, 123);
      cursor: pointer;
      padding: 2px 10px;
      position: relative;
      background: rgba(0, 163, 92, 0.2);
      text-align: left;
      border-bottom-left-radius: 4px;
      border-top-left-radius: 4px;
    }

    .widget-nbbo-line-ask {
      flex: 1 1 0;
      color: rgb(187, 51, 64);
      cursor: pointer;
      padding: 2px 10px;
      background: rgba(219, 48, 48, 0.2);
      text-align: right;
      border-bottom-right-radius: 4px;
      border-top-right-radius: 4px;
    }

    .widget-nbbo-line-icon-holder {
      cursor: default;
      top: 0;
      color: #09132c;
      right: 0;
      bottom: 0;
      padding: 2px;
      position: absolute;
      transform: translate(50%, 0);
      background: #fcfcfc;
      border-radius: 50%;
      font-weight: 500;
    }

    .widget-nbbo-line-icon-fallback {
      display: flex;
      justify-content: center;
      align-items: center;
      color: rgb(140, 167, 190);
      background-color: rgb(223, 230, 237);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      position: relative;
      word-wrap: break-word;
      font-size: 13px;
      line-height: 16px;
      font-weight: 500;
      letter-spacing: 0;
      box-sizing: border-box;
      text-transform: uppercase;
    }

    .widget-nbbo-line-icon-logo {
      width: 22px;
      height: 22px;
      left: 0;
      top: 0;
      position: absolute;
      border-radius: 50%;
      background-size: 100%;
    }

    .price-placeholder {
      position: absolute;
      z-index: 2;
    }

    .order-widget-step-controls {
      display: inline-flex;
      flex-grow: 0;
      flex-shrink: 0;
      margin-left: 2px;
      border-radius: 0 4px 4px 0;
      align-items: stretch;
      flex-direction: column;
      vertical-align: top;
    }

    .order-widget-step-controls button {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      justify-content: center;
      text-align: left;
      vertical-align: middle;
      min-width: 24px;
      position: relative;
      flex: 1 1 15px;
      min-height: 0;
      padding: 0;
      width: 32px;
      background-color: rgb(255, 255, 255);
      border: 1px solid rgb(217, 218, 224);
    }

    .order-widget-step-controls button svg {
      color: rgb(123, 130, 136);
    }

    .order-widget-step-controls button:hover {
      border: 1px solid #c0c3c8;
    }

    .order-widget-step-controls button:first-child {
      border-radius: 0 4px 0 0;
      margin-bottom: 2px;
    }

    .order-widget-step-controls button:last-child {
      border-radius: 0 0 4px 0;
    }

    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: orderWidgetTemplate,
    styles: orderWidgetStyles,
    shadowOptions: null,
    incrementIcon:
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 7H5C4.63163 7 4 7.44771 4 8C4 8.55228 4.63163 9 5 9H11C11.3684 9 12 8.55228 12 8C12 7.44771 11.3684 7 11 7Z" fill="currentColor"></path><path d="M9 11L9 5C9 4.63163 8.55229 4 8 4C7.44772 4 7 4.63163 7 5L7 11C7 11.3684 7.44772 12 8 12C8.55229 12 9 11.3684 9 11Z" fill="currentColor"></path></svg>',
    decrementIcon:
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 7H5C4.63163 7 4 7.44771 4 8C4 8.55228 4.63163 9 5 9H11C11.3684 9 12 8.55228 12 8C12 7.44771 11.3684 7 11 7Z" fill="currentColor"></path></svg>'
  });
}
