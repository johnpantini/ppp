import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  activeOrdersWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/active-orders-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const activeOrdersWidgetStyles = (context, definition) => css`
    .active-orders-widget-controls {
      z-index: 1;
      display: flex;
      align-items: center;
      padding-right: 12px;
    }

    .active-orders-widget-tabs {
      padding: 8px;
    }

    .active-orders-widget-cancel-orders {
      opacity: 0.2;
      cursor: not-allowed;
      min-height: 24px;
      min-width: 24px;
      padding: 4px 8px;
      margin-right: 4px;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      text-align: left;
      vertical-align: middle;
      justify-content: center;
      background-color: rgb(243, 245, 248);
    }

    .active-orders-widget-cancel-orders span {
      margin: -2px -8px;
      display: inline-block;
      flex: 0 0 auto;
      vertical-align: text-bottom;
    }

    .active-orders-widget-order-list {
      height: 100%;
      width: 100%;
      position: relative;
      overflow-x: hidden;
      scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
      scrollbar-width: thin;
    }

    .active-orders-widget-order-list::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    .active-orders-widget-order-list::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .active-orders-widget-order-list::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
    }

    .active-orders-widget-order-list-inner {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
    }

    .active-order-holder {
      padding-top: 6px;
      margin: 0 8px;
      box-sizing: border-box;
    }

    .active-order-holder:first-child {
      padding-top: 0;
    }

    .active-order-holder-inner {
      cursor: default;
    }

    .active-order-card {
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
    }

    .active-order-card-side-indicator {
      height: 100%;
      border-radius: 8px 0 0 8px;
      position: absolute;
      width: 4px;
      left: 0;
      top: 0;
    }

    .active-order-card[side='buy'] .active-order-card-side-indicator {
      background: linear-gradient(90deg, rgb(11, 176, 109) 50%, transparent 0);
    }

    .active-order-card[side='sell'] .active-order-card-side-indicator {
      background: linear-gradient(90deg, rgb(213, 54, 69) 50%, transparent 0);
    }

    .active-order-card-payload {
      width: 100%;
      padding: 8px 0;
      display: flex;
      align-items: center;
    }

    .active-order-card-actions {
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

    .active-order-card-actions button {
      border-radius: 50%;
      min-height: 24px;
      min-width: 24px;
      background-color: rgb(232, 237, 243);
      color: rgb(90, 118, 143);
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      border: none;
      cursor: pointer;
      font-size: 12px;
      justify-content: center;
      text-align: left;
      vertical-align: middle;
      padding: 0 8px;
    }

    .active-order-card-actions button:hover {
      background-color: rgb(223, 230, 237);
    }

    .active-order-card-actions button span {
      margin: 0 -8px;
      color: rgb(140, 167, 190);
      display: inline-block;
      flex: 0 0 auto;
      vertical-align: text-bottom;
      box-sizing: border-box;
    }

    .active-order-card:hover .active-order-card-actions {
      opacity: 1;
      transition-timing-function: ease-out;
    }

    .active-order-card-logo {
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
    }

    .active-order-card-logo div {
      width: 28px;
      height: 28px;
      left: 0;
      top: 0;
      position: absolute;
      border-radius: 50%;
      background-size: 100%;
      text-transform: capitalize;
    }

    .active-order-card-text {
      overflow: hidden;
      flex: 1;
    }

    .active-order-card-text-name-price,
    .active-order-card-text-side-rest {
      display: flex;
      white-space: nowrap;
      justify-content: space-between;
      word-wrap: break-word;
      font-size: 12px;
      letter-spacing: 0;
    }

    .active-order-card-text-name-price {
      font-weight: 500;
      color: rgb(51, 70, 87);
    }

    .active-order-card-text-name {
      display: flex;
      align-items: center;
      margin-right: 20px;
      overflow: hidden;
    }

    .active-order-card-text-name > span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .active-order-card-text-name > span > div {
      word-wrap: break-word;
      font-size: 12px;
      line-height: 20px;
      font-weight: 500;
      letter-spacing: 0;
      color: rgb(51, 70, 87);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .active-order-card-text-side-rest {
      font-weight: 400;
      color: rgb(90, 118, 143);
    }

    .active-order-card-text-side {
      flex: 1;
      overflow: hidden;
      margin-right: 20px;
      text-overflow: ellipsis;
    }

    .active-order-card-dot-divider {
      margin: 0 4px;
    }

    .active-order-card-text-side.positive {
      color: rgb(0, 163, 92);
    }

    .active-order-card-text-side.negative {
      color: rgb(219, 48, 48);
    }

    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: activeOrdersWidgetTemplate,
    styles: activeOrdersWidgetStyles,
    shadowOptions: null
  });
}
