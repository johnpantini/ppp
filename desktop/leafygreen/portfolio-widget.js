import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  portfolioWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/portfolio-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const portfolioWidgetStyles = (context, definition) => css`
    .portfolio-header {
      display: none;
      flex-shrink: 0;
      margin: 4px 12px 8px;
      white-space: nowrap;
    }

    .portfolio-name-section {
      flex-shrink: 0;
      flex-grow: 1;
      margin-right: 32px;
      display: block;
    }

    .portfolio-metric-section:not(:last-of-type) {
      margin-right: 32px;
    }

    .portfolio-metric-section {
      display: flex;
      flex-shrink: 0;
      flex-direction: column;
      word-wrap: break-word;
      font-size: 13px;
      line-height: 20px;
      font-weight: 400;
      letter-spacing: 0;
      color: rgb(90, 118, 143);
    }

    .portfolio-name-section-header {
      display: flex;
      word-wrap: break-word;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0;
      line-height: 24px;
      color: rgb(9, 19, 44);
      justify-content: center;
    }

    .portfolio-table {
      text-align: left;
      min-width: 140px;
      width: 100%;
      padding: 0;
      user-select: none;
      border-collapse: collapse;
    }

    .portfolio-table th {
      text-align: right;
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
      background-color: rgb(249, 251, 250);
    }

    .portfolio-table th:first-of-type {
      text-align: left;
    }

    .portfolio-table th::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      display: block;
      background-color: rgb(231, 238, 236);
    }

    .portfolio-table .cell {
      text-align: right;
      max-width: 134px;
      padding: 4px 8px;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      color: rgb(90, 118, 143);
      font-size: 12px;
      white-space: nowrap;
    }

    .portfolio-table .cell.positive {
      color: #0caf82;
    }

    .portfolio-table .cell.negative {
      color: #fe3957;
    }

    .portfolio-table .cell:first-of-type {
      text-align: left;
    }

    .portfolio-table .cell.capitalize {
      text-transform: capitalize;
    }

    .portfolio-row:nth-of-type(2n) {
      background-color: rgb(249, 251, 250);
    }

    .portfolio-row:hover {
      background: rgb(243, 245, 248);
    }

    .portfolio-row-logo-with-name {
      word-wrap: break-word;
      font-size: 12px;
      line-height: 20px;
      font-weight: 400;
      display: flex;
      width: 100%;
      letter-spacing: 0;
    }

    .portfolio-row-logo {
      min-width: 20px;
      min-height: 20px;
      height: 20px;
      width: 20px;
      padding: 2px;
      border-radius: 50%;
      background-size: 100%;
      margin-right: 10px;
      background-color: #5c7080;
    }

    .portfolio-row-name {
      opacity: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      text-align: left;
    }

    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: portfolioWidgetTemplate,
    styles: portfolioWidgetStyles,
    shadowOptions: null
  });
}
