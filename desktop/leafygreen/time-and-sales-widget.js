import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  timeAndSalesWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/time-and-sales-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const timeAndSalesWidgetStyles = (context, definition) => css`
    *,
    :after,
    :before {
      box-sizing: border-box;
    }

    .trades-table {
      text-align: left;
      min-width: 140px;
      width: 100%;
      padding: 0;
      user-select: none;
      border-collapse: collapse;
    }

    .trades-table th {
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

    .trades-table th::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      display: block;
      background-color: rgb(231, 238, 236);
    }

    .trades-table .cell {
      padding: 2px 4px;
      font-variant-numeric: tabular-nums;
    }

    .trades-table tr[side='buy'] {
      background-color: rgba(0, 163, 92, 0.3);
    }

    .trades-table tr[side='sell'] {
      background-color: rgba(219, 48, 48, 0.3);
    }

    .trades-table tr:hover {
      background: rgba(223, 230, 237, 0.7);
    }

    .trades-table td {
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

    .trades-table .cell:last-child {
      margin-right: 8px;
      color: rgb(90, 118, 143);
    }

    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: timeAndSalesWidgetTemplate,
    styles: timeAndSalesWidgetStyles,
    shadowOptions: null
  });
}
