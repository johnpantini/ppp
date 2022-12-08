import { css } from '../../shared/element/styles/css.js';
import { widgetStyles } from './widget.js';
import {
  scalpingButtonsWidgetTemplate,
  widgetDefinition as baseWidgetDefinition
} from '../../shared/scalping-buttons-widget.js';

// noinspection JSUnusedGlobalSymbols
export async function widgetDefinition({ ppp, baseWidgetUrl }) {
  const scalpingButtonsWidgetStyles = (context, definition) => css`
    .scalping-buttons-widget-controls {
      z-index: 1;
      display: flex;
      align-items: center;
      padding-right: 12px;
    }

    .scalping-buttons-widget-tabs {
      padding: 8px;
    }

    .scalping-buttons-widget-holder {
      padding: 0 8px;
      margin-bottom: 8px;
      display: flex;
      height: 100%;
      width: 100%;
      position: relative;
      scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
      scrollbar-width: thin;
      gap: 0 8px;
    }

    .scalping-buttons-widget-holder::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    .scalping-buttons-widget-holder::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .scalping-buttons-widget-holder::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
    }

    .scalping-buttons-widget-holder-buy,
    .scalping-buttons-widget-holder-sell {
      width: 100%;
    }

    .scalping-buttons-widget-holder-buy > div,
    .scalping-buttons-widget-holder-sell > div {
      display: flex;
      width: 100%;
      margin-top: 8px;
      gap: 2px 5px;
    }

    .scalping-buttons-widget-holder-buy > div.empty,
    .scalping-buttons-widget-holder-sell > div.empty {
      margin-top: 0;
      height: 4px;
    }

    .scalping-buttons-widget-holder-buy > div > ppp-widget-button,
    .scalping-buttons-widget-holder-sell > div > ppp-widget-button {
      width: 100%;
    }

    ${widgetStyles}
  `;

  return baseWidgetDefinition({
    template: scalpingButtonsWidgetTemplate,
    styles: scalpingButtonsWidgetStyles,
    shadowOptions: null
  });
}
