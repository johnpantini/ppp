import { Codeflask, codeflaskTemplate } from '../../shared/codeflask.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';

export const codeflaskStyles = (context, definition) => css`
  ${display('flex')}
  :host {
    position: relative;
    flex-direction: column;
  }

  :host(:focus-visible) {
    outline: none;
  }

  .label {
    font-size: 14px;
    font-weight: bold;
    line-height: 16px;
    padding-bottom: 4px;
    color: rgb(61, 79, 88);
  }

  .description {
    font-size: 14px;
    line-height: 16px;
    font-weight: normal;
    padding-bottom: 4px;
    margin-top: 0;
    margin-bottom: 0;
    color: rgb(93, 108, 116);
  }

  .root {
    position: relative;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    z-index: 0;
    height: 100%;
  }

  .root-container {
    display: inline-flex;
    -webkit-box-align: stretch;
    align-items: stretch;
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    border: 1px solid rgb(137, 151, 155);
    border-radius: 6px;
    background-color: rgb(249, 251, 250);
    transition: all 150ms ease-in-out 0s;
  }

  :host .root-container:hover {
    box-shadow: rgb(231 238 236) 0 0 0 3px;
  }

  :host([state='error']) .root-container {
    border-color: rgb(219, 48, 48);
  }

  :host([state='error']) .root-container:hover {
    border-color: rgb(219, 48, 48);
    box-shadow: rgb(255 205 199) 0 0 0 3px;
  }

  .control {
    box-sizing: border-box;
    padding: 10px;
    font-size: 15px;
    line-height: 24px;
    white-space: pre;
    position: absolute;
    top: 0;
    left: 0;
    overflow: auto;
    margin: 0 !important;
    outline: none;
    text-align: left;
    background: none;
    border: none;
    color: #fff;
    resize: none;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier,
      monospace;
    caret-color: #111;
    width: 100%;
    height: 100%;
    scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.3);
    scrollbar-width: thin;
  }

  textarea::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  textarea::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.2);
  }

  textarea::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .control::selection {
    background: rgba(1, 110, 233, 0.1);
  }

  .control::-moz-selection {
    background: rgba(1, 110, 233, 0.1);
  }

  .pre {
    padding: 10px;
    font-size: 15px;
    line-height: 24px;
    white-space: pre;
    position: absolute;
    top: 0;
    left: 0;
    overflow: auto;
    margin: 0 !important;
    outline: none;
    text-align: left;
    pointer-events: none;
    z-index: 3;
  }

  .code {
    display: block;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier,
      monospace;
    overflow: hidden;
  }

  .helper {
    font-size: 14px;
    min-height: 20px;
    padding-top: 4px;
    font-weight: normal;
  }

  .helper.error {
    color: rgb(207, 74, 34);
  }

  .token.punctuation {
    color: #4a4a4a;
  }

  .token.keyword {
    color: rgb(204, 56, 135);
  }

  .token.operator {
    color: #ff5598;
  }

  .token.string {
    color: rgb(18, 130, 77);
  }

  .token.comment {
    color: #9badb7;
  }

  .token.function {
    color: rgb(1, 110, 233);
  }

  .token.boolean {
    color: rgb(216, 55, 19);
  }

  .token.number {
    color: rgb(1, 110, 233);
  }

  .token.selector {
    color: rgb(216, 55, 19);
  }

  .token.property {
    color: rgb(216, 55, 19);
  }

  .token.tag {
    color: rgb(216, 55, 19);
  }

  .token.attr-value {
    color: rgb(216, 55, 19);
  }
`;

// noinspection JSUnusedGlobalSymbols
export const codeflask = Codeflask.compose({
  baseName: 'codeflask',
  template: codeflaskTemplate,
  styles: codeflaskStyles
});
