import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  timelineWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/timeline-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const timelineWidgetStyles = (context, definition) => css`
    .timeline-widget-item-list {
      height: 100%;
      width: 100%;
      position: relative;
      overflow-x: hidden;
      scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
      scrollbar-width: thin;
    }

    .timeline-widget-item-list::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    .timeline-widget-item-list::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .timeline-widget-item-list::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
    }

    .timeline-widget-item-list-inner {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
    }

    .timeline-item-holder {
      padding-top: 6px;
      margin: 0 8px;
      box-sizing: border-box;
    }

    .timeline-item-holder:first-child {
      padding-top: 0;
    }

    .timeline-item-holder:last-child {
      padding-bottom: 8px;
    }

    .timeline-item-holder-inner {
      cursor: default;
    }

    .timeline-item-headline {
      width: 100%;
      margin: 0 8px;
      word-wrap: break-word;
      font-size: 12px;
      line-height: 20px;
      font-weight: 500;
      letter-spacing: 0;
      color: #323e4a;
      padding-top: 8px;
    }

    .timeline-item-headline:has(+ .timeline-item-headline) {
      display: none;
    }

    .timeline-item-card {
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

    .timeline-item-card.positive {
      background-color: rgba(0, 163, 92, 0.3);
    }

    .timeline-item-card.negative {
      background-color: rgba(219, 48, 48, 0.3);
    }

    .timeline-item-card.expandable {
      cursor: pointer;
    }

    .timeline-item-card.expandable:hover {
      cursor: pointer;
      background: rgb(223, 230, 237);
    }

    .timeline-item-card-side-indicator {
      height: 100%;
      border-radius: 8px 0 0 8px;
      position: absolute;
      width: 4px;
      left: 0;
      top: 0;
    }

    .timeline-item-card[side='buy'] .timeline-item-card-side-indicator {
      background: linear-gradient(90deg, rgb(11, 176, 109) 50%, transparent 0);
    }

    .timeline-item-card[side='sell'] .timeline-item-card-side-indicator {
      background: linear-gradient(90deg, rgb(213, 54, 69) 50%, transparent 0);
    }

    .timeline-item-card-payload {
      width: 100%;
      padding: 8px 0;
      display: flex;
      align-items: center;
    }

    .timeline-item-card-logo {
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

    .timeline-item-card-logo div {
      width: 28px;
      height: 28px;
      left: 0;
      top: 0;
      position: absolute;
      border-radius: 50%;
      background-size: 100%;
      text-transform: capitalize;
    }

    .timeline-item-card-text {
      overflow: hidden;
      flex: 1;
    }

    .timeline-item-card-text-name-price,
    .timeline-item-card-text-side-rest {
      display: flex;
      white-space: nowrap;
      justify-content: space-between;
      word-wrap: break-word;
      font-size: 12px;
      letter-spacing: 0;
    }

    .timeline-item-card-text-name-price {
      font-weight: 500;
      color: #323e4a;
    }

    .timeline-item-card-text-name {
      display: flex;
      align-items: center;
      margin-right: 20px;
      overflow: hidden;
    }

    .timeline-item-card-text-name > span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .timeline-item-card-text-name > span > div {
      word-wrap: break-word;
      font-size: 12px;
      line-height: 20px;
      font-weight: 500;
      letter-spacing: 0;
      color: #323e4a;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .timeline-item-card-text-side-rest {
      font-weight: 400;
      color: rgb(90, 118, 143);
    }

    .timeline-item-card-text-side {
      flex: 1;
      overflow: hidden;
      margin-right: 20px;
      text-overflow: ellipsis;
    }

    .timeline-item-card-dot-divider {
      margin: 0 4px;
    }

    .timeline-item-card-text-side.positive {
      color: rgb(0, 163, 92);
    }

    .timeline-item-card-text-side.negative {
      color: rgb(219, 48, 48);
    }

    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: timelineWidgetTemplate,
    styles: timelineWidgetStyles,
    shadowOptions: null
  });
}
