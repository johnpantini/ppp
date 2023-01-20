import { css } from '../../shared/element/styles/css.js';

export const widgetStyles = (context, definition) =>
  css`
    :host {
      position: relative;
    }

    .widget-root {
      background: rgb(255, 255, 255);
      color: rgb(28, 45, 56);
      border: 1px solid rgb(231, 238, 236);
      width: 100%;
      height: 100%;
      position: relative;
      box-sizing: border-box;
      user-select: none;
    }

    .widget-area {
      scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
      scrollbar-width: thin;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 8px;
    }

    .widget-area::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    .widget-area::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .widget-area::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
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

    .widget-instrument-area ppp-widget-group-control {
      flex: 0 0 16px;
    }

    .instrument-search-holder {
      height: 20px;
      position: relative;
      line-height: 20px;
      flex: 0 0 64px;
      margin-left: 4px;
    }

    .instrument-quote-line,
    .widget-header-name {
      display: flex;
      align-items: center;
      overflow: hidden;
      margin-left: 8px;
      color: #09132c;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      flex-grow: 1;
      padding: 0 4px;
      margin-right: 6px;
    }

    .widget-header-name span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 8px;
    }

    .instrument-quote-line > span {
      margin: 0 3px;
    }

    span.positive {
      color: #0caf82;
    }

    span.negative {
      color: #fe3957;
    }

    .widget-header-controls {
      display: flex;
      align-items: center;
    }

    .widget-empty-state-holder {
      width: 100%;
      height: 95%;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
    }

    .widget-empty-state-holder img {
      width: 60%;
      height: 60%;
      min-width: 32px;
      min-height: 32px;
      max-width: 80px;
      max-height: 80px;
      margin-left: 16px;
    }

    .widget-empty-state-holder span {
      color: rgba(9, 19, 44, 0.5);
      font-size: 12px;
      margin-top: 4px;
      padding: 0 10px;
      text-align: center;
    }

    .widget-close-button {
      font-size: 16px;
      margin-right: 2px;
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .widget-body {
      display: flex;
      flex-direction: column;
      flex-shrink: 1;
      height: calc(100% - 30px);
      overflow: auto;
    }

    .widget-body::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    .widget-body::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .widget-body::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
    }

    .widget-section {
      width: 100%;
      padding: 0 10px;
      position: relative;
    }

    .widget-section-spacer {
      width: 100%;
      padding: 6px 0;
    }

    .widget-margin-spacer {
      width: 100%;
      position: relative;
      margin-top: 8px;
    }

    .widget-subsection {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .widget-text-label {
      color: rgba(9, 19, 44, 0.7);
      font-size: 12px;
      line-height: 12px;
      margin-bottom: 5px;
    }

    .widget-subsection ppp-widget-button {
      width: 100%;
    }

    .widget-subsection-item {
      width: 100%;
      position: relative;
    }

    .widget-subsection > :not(:first-child) {
      margin-left: 10px;
    }

    .widget-flex-line {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: stretch;
    }

    .widget-summary {
      color: #7b8288;
      width: 100%;
      display: flex;
      font-size: 12px;
      text-align: left;
      line-height: 14px;
      flex-direction: column;
    }

    .widget-summary-line {
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
    }

    .widget-summary-line-price {
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 120px;
    }

    .widget-summary-line::after {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      content: '';
      position: absolute;
      border-color: #d9dfe8;
      border-style: solid;
      border-width: 0;
      pointer-events: none;
    }

    .widget-summary-line + .widget-summary-line::after {
      border-top-width: 0.5px;
    }

    .widget-footer {
      padding: 8px 0;
      position: relative;
    }

    .widget-card-list {
      height: 100%;
      width: 100%;
      position: relative;
      overflow-x: hidden;
      scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
      scrollbar-width: thin;
    }

    .widget-card-list::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    .widget-card-list::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .widget-card-list::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
    }

    .widget-card-list-inner {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      display: flex;
      flex-direction: column;
      gap: 8px 0;
    }

    tr.table-group {
      word-wrap: break-word;
      font-size: 12px;
      line-height: 20px;
      font-weight: 500;
      letter-spacing: 0;
      color: rgb(90, 118, 143);
    }

    tr.table-group td {
      text-align: left;
      padding: 4px 8px;
      max-width: 134px;
      white-space: nowrap;
    }

    .ui-draggable-handle {
      touch-action: none;
    }

    .ui-helper-hidden {
      display: none;
    }

    .ui-helper-hidden-accessible {
      border: 0;
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
    }

    .ui-helper-reset {
      margin: 0;
      padding: 0;
      border: 0;
      outline: 0;
      line-height: 1.3;
      text-decoration: none;
      font-size: 100%;
      list-style: none;
    }

    .ui-helper-clearfix:before,
    .ui-helper-clearfix:after {
      content: '';
      display: table;
      border-collapse: collapse;
    }

    .ui-helper-clearfix:after {
      clear: both;
    }

    .ui-helper-zfix {
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      position: absolute;
      opacity: 0;
    }

    .ui-front {
      z-index: 100;
    }

    .ui-state-disabled {
      cursor: default !important;
      pointer-events: none;
    }

    .ui-icon {
      display: inline-block;
      vertical-align: middle;
      margin-top: -0.25em;
      position: relative;
      text-indent: -99999px;
      overflow: hidden;
      background-repeat: no-repeat;
    }

    .ui-widget-icon-block {
      left: 50%;
      margin-left: -8px;
      display: block;
    }

    .ui-widget-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .ui-resizable-handle {
      position: absolute;
      font-size: 0.1px;
      display: block;
      touch-action: none;
    }

    .ui-resizable-disabled .ui-resizable-handle,
    .ui-resizable-autohide .ui-resizable-handle {
      display: none;
    }

    .ui-resizable-n {
      cursor: n-resize;
      height: 7px;
      width: 100%;
      top: -5px;
      left: 0;
    }

    .ui-resizable-s {
      cursor: s-resize;
      height: 7px;
      width: 100%;
      bottom: -5px;
      left: 0;
    }

    .ui-resizable-e {
      cursor: e-resize;
      width: 7px;
      right: -5px;
      top: 0;
      height: 100%;
    }

    .ui-resizable-w {
      cursor: w-resize;
      width: 7px;
      left: -5px;
      top: 0;
      height: 100%;
    }

    .ui-resizable-se {
      cursor: se-resize;
      width: 12px;
      height: 12px;
      right: 1px;
      bottom: 1px;
    }

    .ui-resizable-sw {
      cursor: sw-resize;
      width: 9px;
      height: 9px;
      left: -5px;
      bottom: -5px;
    }

    .ui-resizable-nw {
      cursor: nw-resize;
      width: 9px;
      height: 9px;
      left: -5px;
      top: -5px;
    }

    .ui-resizable-ne {
      cursor: ne-resize;
      width: 9px;
      height: 9px;
      right: -5px;
      top: -5px;
    }
  `;
