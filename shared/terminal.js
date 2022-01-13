import { FoundationElement } from './foundation-element.js';
import { html } from './template.js';
import { ref } from './element/templating/ref.js';

await import('../vendor/xterm.min.js');

export const terminalTemplate = html`
  <template>
    <div class="holder" ${ref('holder')}></div>
  </template>
`;

export class Terminal extends FoundationElement {
  /**
   * @internal
   */
  connectedCallback() {
    super.connectedCallback();

    if (!this.holder.childElementCount) {
      // TODO - refactor
      this.terminal = new window.Terminal({
        fontFamily:
          'Menlo, Consolas, "Liberation Mono", "Courier New", monospace',
        theme: {
          foreground: '#F8F8F8',
          background: '#21313c',
          selection: '#5DA5D533',
          black: '#1E1E1D',
          brightBlack: '#262625',
          red: '#ff6f44',
          brightRed: '#ff6f44',
          green: '#35de7b',
          brightGreen: '#35de7b',
          yellow: '#CCCC5B',
          brightYellow: '#FFFF72',
          blue: '#5D5DD3',
          brightBlue: '#7279FF',
          magenta: '#BC5ED1',
          brightMagenta: '#E572FF',
          cyan: '#5DA5D5',
          brightCyan: '#72F0FF',
          white: '#F8F8F8',
          brightWhite: '#FFFFFF'
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
