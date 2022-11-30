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
    }

    .widget-close-button,
    .widget-notification-icon img,
    .widget-notification-close-button img {
      color: #4f4f4f;
      font-size: 16px;
      margin-right: 2px;
      width: 16px;
      height: 16px;
    }

    .widget-close-button {
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

    .widget-notifications-area {
      width: 100%;
      position: absolute;
      bottom: 55px;
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
      width: 100%;
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
