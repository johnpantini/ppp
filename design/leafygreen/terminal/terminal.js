import { Terminal, terminalTemplate } from '../../../lib/terminal/terminal.js';
import { xtermStyles as terminalStyles } from '../styles/xterm.js';

export const terminal = Terminal.compose({
  baseName: 'terminal',
  template: terminalTemplate,
  styles: terminalStyles
});
