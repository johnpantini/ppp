import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  orderbookWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/orderbook-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const orderbookWidgetStyles = (context, definition) => css`
    *,
    :after,
    :before {
      box-sizing: border-box;
    }

    .orderbook-table {
      min-width: 140px;
      width: 100%;
      padding: 0;
      user-select: none;
      border-collapse: collapse;
    }

    .orderbook-table th {
      position: sticky;
      top: 0;
      z-index: 1;
      width: 50%;
      height: 28px;
      padding: 4px 8px;
      font-weight: 500;
      font-size: 12px;
      line-height: 20px;
      white-space: nowrap;
      background: #fff;
    }

    .orderbook-table th::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      display: block;
      background-color: rgb(231, 238, 236);
    }

    .bid-title {
      left: 8px;
      text-align: left;
      position: absolute;
      top: 4px;
      color: rgb(19, 193, 123);
    }

    .ask-title {
      right: 8px;
      text-align: right;
      position: absolute;
      top: 4px;
      color: rgb(187, 51, 64);
    }

    .bid-title,
    .ask-title {
      font-weight: 500;
    }

    .spread {
      left: 50%;
      transform: translateX(-50%);
      font-weight: 400;
      color: rgba(90, 118, 143);
      position: absolute;
      top: 4px;
    }

    .orderbook-table td {
      --orderbook-ask-color: rgba(219, 48, 48, 0.3);
      --orderbook-bid-color: rgba(0, 163, 92, 0.3);
      width: 50%;
      padding: 0;
      border: none;
      border-bottom: 1px solid rgb(231, 238, 236);
      background: transparent;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      cursor: pointer;
      font-size: 12px;
    }

    .ask-line,
    .bid-line {
      width: 100%;
      display: flex;
      padding: 2px 4px;
      font-variant-numeric: tabular-nums;
    }

    .ask-line:hover,
    .bid-line:hover {
      background: rgba(223, 230, 237, 0.7);
    }

    .bid-line {
      flex-direction: row-reverse;
    }

    .volume {
      color: rgb(90, 118, 143);
    }

    .my-order {
      display: inline-block;
    }

    .ask-line .my-order {
      margin-left: 4px;
    }

    .bid-line .my-order {
      margin-right: 4px;
    }

    .my-order > span {
      cursor: pointer;
      background-color: rgb(51, 111, 238);
      color: #fff;
      border-radius: 24px;
      font-size: 11px;
      line-height: 16px;
      min-height: 16px;
      min-width: 16px;
      padding: 1px 4px;
    }

    .my-order > span > span {
      min-height: 16px;
      margin: 0 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-wrap: normal;
    }

    .spacer {
      width: 0;
      margin: 0 auto;
      user-select: none;
    }

    .price {
      margin-right: 8px;
      color: rgb(90, 118, 143);
    }

    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: orderbookWidgetTemplate,
    styles: orderbookWidgetStyles,
    shadowOptions: null
  });
}
