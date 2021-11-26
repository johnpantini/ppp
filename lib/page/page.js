/** @decorator */

import { FoundationElement } from '../foundation-element/foundation-element.js';
import { Observable, observable } from '../element/observation/observable.js';

export class BasePage extends FoundationElement {
  @observable
  busy;

  @observable
  toastTitle;

  @observable
  toastText;

  outputText = '';

  toastTitleChanged() {
    Observable.notify(this.app.toast, 'source');
  }

  toastTextChanged() {
    Observable.notify(this.app.toast, 'source');
  }

  async readChunk(reader, decoder) {
    const result = await reader.read();
    const chunk = decoder.decode(result.value || new Uint8Array(), {
      stream: !result.done
    });

    if (chunk.length) {
      const string = chunk.toString();

      this.outputText += string;

      // Error message
      if (string.startsWith('{"e"'))
        try {
          this.terminalDom.terminal.write(
            '\x1b[31m' + JSON.parse(string).e.message + '\x1b[0m\r\n'
          );
        } catch (e) {
          this.terminalDom.terminal.write(string);
        }
      else this.terminalDom.terminal.write(string);
    }

    if (!result.done) {
      return this.readChunk(reader, decoder);
    }
  }

  async processChunkedResponse(response) {
    return this.readChunk(response.body.getReader(), new TextDecoder());
  }
}
