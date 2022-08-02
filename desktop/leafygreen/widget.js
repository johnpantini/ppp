import { css } from '../../shared/element/styles/css.js';

export const widgetStyles = (context, definition) =>
  css`
    :host {
      position: relative;
    }

    .widget-root {
      background: rgb(255, 255, 255);
      color: rgb(28, 45, 56);
      border: 1px solid rgb(137, 151, 155);
      width: 360px;
      height: 480px;
      min-width: 100px;
      min-height: 80px;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
    }

    .widget-header {
      color: #09132c;
      cursor: move;
      height: 30px;
      display: flex;
      flex-shrink: 0;
      padding: 0 5px;
      position: relative;
      font-size: 12px;
      background: #f8fafc;
      box-shadow: inset 0 0 0 0 rgba(79, 79, 79, 0.5);
      align-items: center;
      justify-content: space-between;
    }

    .widget-header::after {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      content: '';
      position: absolute;
      border-bottom: 0.5px solid #e7eaef;
      pointer-events: none;
    }

    .widget-instrument-area {
      width: 100%;
      height: 30px;
      display: flex;
      align-items: center;
    }

    .instrument-search-holder {
      height: 20px;
      position: relative;
      line-height: 20px;
      flex: 0 0 100px;
    }

    .instrument-search-field {
      font-family: ${bodyFont};
      color: #09132c;
      border: 1px solid #d9dae0;
      padding: 0 10px;
      font-size: 12px;
      background: transparent;
      text-align: left;
      caret-color: #007cff;
      line-height: 24px;
      text-overflow: ellipsis;
      width: 100%;
      height: 100%;
      border-radius: 2px;
      box-sizing: border-box;
    }

    .instrument-quote-line {
      display: flex;
      align-items: center;
      overflow: hidden;
      margin-left: 8px;
      color: #09132c;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      flex-grow: 1;
    }

    .instrument-quote-line > span {
      margin: 0 3px;
    }

    span.positive {
      color: rgb(0, 163, 92);
    }

    span.negative {
      color: rgb(219, 48, 48);
    }

    span.price {
      cursor: pointer;
    }

    .widget-header-controls {
      display: flex;
      align-items: center;
    }

    .widget-group-selector {
      font-size: 16px;
      margin-right: 4px;
      width: 16px;
      cursor: pointer;
      height: 16px;
      display: inline-flex;
      position: relative;
      align-items: center;
      justify-content: center;
    }

    .widget-group-selector-button {
      position: relative;
      background: #d9dae0;
      color: #ffffff;
      width: 12px;
      height: 12px;
      font-size: 10px;
      text-align: center;
      line-height: 11px;
    }

    .widget-group-selector-button::before {
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

    .widget-close-button {
      color: #4f4f4f;
      font-size: 16px;
      margin-right: 2px;
      cursor: pointer;
      width: 16px;
      height: 16px;
    }

    .widget-body {
      display: flex;
      flex-direction: column;
      flex-shrink: 1;
      height: calc(100% - 30px);
    }

    .widget-nbbo-line {
      color: #09132c;
      width: 100%;
      display: flex;
      font-size: 12px;
      line-height: 18px;
      padding-top: 8px;
      font-weight: 500;
    }

    .widget-nbbo-line-bid {
      flex: 1 1 0;
      color: rgb(0, 163, 92);
      cursor: pointer;
      padding: 2px 10px;
      position: relative;
      background: rgba(0, 163, 92, 0.2);
      text-align: left;
    }

    .widget-nbbo-line-ask {
      flex: 1 1 0;
      color: rgb(219, 48, 48);
      cursor: pointer;
      padding: 2px 10px;
      background: rgba(219, 48, 48, 0.2);
      text-align: right;
    }

    .widget-nbbo-line-quantity {
      top: 0;
      color: #09132c;
      right: 0;
      bottom: 0;
      padding: 2px 10px;
      position: absolute;
      transform: translate(50%, 0);
      background: #fcfcfc;
      border-radius: 9px;
      font-weight: 500;
    }

    .widget-buy-sell-sections {
      display: flex;
      justify-content: space-evenly;
      min-height: 32px;
    }

    .widget-buy-section {
      flex: 1 1 0;
      min-width: 0;
      margin-right: 8px;
    }

    .widget-sell-section {
      flex: 1 1 0;
      min-width: 0;
    }
  `;
