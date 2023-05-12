import { PPPElement } from '../lib/ppp-element.js';
import { css, html, ref } from '../vendor/fast-element.min.js';
import { display } from '../vendor/fast-utilities.js';
import { normalize, scrollbars, typography } from '../design/styles.js';
import {
  fontSizeCode1,
  monospaceFont,
  paletteBlack,
  paletteBlueBase,
  paletteBlueLight3,
  paletteGrayBase,
  paletteGrayLight2,
  paletteGrayLight3,
  paletteGreenBase,
  paletteGreenLight3,
  palettePurpleBase,
  paletteRedBase,
  paletteRedLight1,
  paletteWhite,
  paletteYellowBase,
  paletteYellowDark2,
  paletteYellowLight2,
  spacing2,
  themeConditional
} from '../design/design-tokens.js';
import '../vendor/xterm.min.js';

export const terminalTemplate = html`
  <template>
    <div class="holder" ${ref('holder')}></div>
  </template>
`;

export const terminalStyles = css`
  ${normalize()}
  ${display('flex')}
  ${typography()}
  ${scrollbars('.xterm .xterm-viewport')}
  .xterm {
    cursor: text;
    position: relative;
    user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
    padding-right: ${spacing2};
  }

  .xterm.focus,
  .xterm:focus {
    outline: none;
  }

  .xterm .xterm-helpers {
    position: absolute;
    top: 0;
    /**
     * The z-index of the helpers must be higher than the canvases in order for
     * IMEs to appear on top.
     */
    z-index: 5;
  }

  .xterm .xterm-helper-textarea {
    padding: 0;
    border: 0;
    margin: 0;
    /* Move textarea out of the screen to the far left, so that the cursor is not visible */
    position: absolute;
    opacity: 0;
    left: -9999em;
    top: 0;
    width: 0;
    height: 0;
    z-index: -5;
    /** Prevent wrapping so the IME appears against the textarea at the correct position */
    white-space: nowrap;
    overflow: hidden;
    resize: none;
  }

  .xterm .composition-view {
    display: none;
    position: absolute;
    white-space: nowrap;
    z-index: 1;
  }

  .xterm .composition-view.active {
    display: block;
  }

  .xterm .xterm-viewport {
    overflow-y: scroll;
    cursor: default;
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
  }

  .xterm .xterm-screen {
    position: relative;
  }

  .xterm .xterm-screen canvas {
    position: absolute;
    left: 0;
    top: 0;
  }

  .xterm .xterm-scroll-area {
    visibility: hidden;
  }

  .xterm-char-measure-element {
    display: inline-block;
    visibility: hidden;
    position: absolute;
    top: 0;
    left: -9999em;
    line-height: normal;
  }

  .xterm.enable-mouse-events {
    /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
    cursor: default;
  }

  .xterm.xterm-cursor-pointer,
  .xterm .xterm-cursor-pointer {
    cursor: pointer;
  }

  .xterm.column-select.focus {
    /* Column selection mode */
    cursor: crosshair;
  }

  .xterm .xterm-accessibility,
  .xterm .xterm-message {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    color: transparent;
  }

  .xterm .live-region {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .xterm-dim {
    opacity: 0.5;
  }

  .xterm-underline-1 {
    text-decoration: underline;
  }

  .xterm-underline-2 {
    text-decoration: double underline;
  }

  .xterm-underline-3 {
    text-decoration: wavy underline;
  }

  .xterm-underline-4 {
    text-decoration: dotted underline;
  }

  .xterm-underline-5 {
    text-decoration: dashed underline;
  }

  .xterm-strikethrough {
    text-decoration: line-through;
  }

  .xterm-screen .xterm-decoration-container .xterm-decoration {
    z-index: 6;
    position: absolute;
  }

  .xterm-decoration-overview-ruler {
    z-index: 7;
    position: absolute;
    top: 0;
    right: 0;
    pointer-events: none;
  }

  .xterm-decoration-top {
    z-index: 2;
    position: relative;
  }
`;

export class Terminal extends PPPElement {
  connectedCallback() {
    super.connectedCallback();

    if (!this.holder.childElementCount) {
      this.terminal = new window.Terminal({
        fontFamily: monospaceFont.$value,
        fontSize: fontSizeCode1.$value,
        theme: {
          foreground: themeConditional(paletteBlack, paletteGrayLight2).$value,
          background: themeConditional(paletteWhite, paletteBlack).$value,
          selection: `${
            themeConditional(paletteGrayBase, paletteGrayLight3).$value
          }1A`,
          black: themeConditional(paletteBlack, paletteGrayLight3).$value,
          brightBlack: themeConditional(paletteBlack, paletteGrayLight3).$value,
          red: themeConditional(paletteRedBase, paletteRedLight1).$value,
          brightRed: themeConditional(paletteRedBase, paletteRedLight1).$value,
          green: themeConditional(paletteGreenBase, paletteGreenLight3).$value,
          brightGreen: themeConditional(paletteGreenBase, paletteGreenLight3)
            .$value,
          yellow: themeConditional(paletteYellowDark2, paletteYellowLight2)
            .$value,
          brightYellow: themeConditional(
            paletteYellowDark2,
            paletteYellowLight2
          ).$value,
          blue: themeConditional(paletteBlueBase, paletteBlueLight3).$value,
          brightBlue: themeConditional(paletteBlueBase, paletteBlueLight3)
            .$value,
          magenta: themeConditional(paletteRedLight1, palettePurpleBase).$value,
          brightMagenta: themeConditional(paletteRedLight1, palettePurpleBase)
            .$value,
          white: themeConditional(paletteWhite, paletteBlack).$value,
          brightWhite: themeConditional(paletteWhite, paletteBlack).$value
        },
        cols: 120,
        convertEol: true,
        allowTransparency: true,
        bellStyle: 'none'
      });
      this.terminal.open(this.holder);

      this.terminal.writeError = (e) => {
        return this.terminal.writeln(
          `\r\n\x1b[31;1m${e.toString()}\x1b[0m\r\n`
        );
      };

      this.terminal.writeInfo = (i, bold = false) => {
        return this.terminal.writeln(
          `\x1b[33${bold ? ';1' : ''}m${i.toString()}\x1b[0m`
        );
      };
    }
  }
}

export default Terminal.compose({
  template: terminalTemplate,
  styles: terminalStyles
}).define();
