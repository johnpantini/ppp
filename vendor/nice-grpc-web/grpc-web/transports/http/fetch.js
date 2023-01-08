import { Metadata } from '../../metadata.js';
import { debug } from '../../debug.js';

export function FetchReadableStreamTransport(init) {
  return (opts) => {
    return fetchRequest(opts, init);
  };
}

function fetchRequest(options, init) {
  options.debug && debug('fetchRequest', options);

  return new Fetch(options, init);
}

class Fetch {
  constructor(transportOptions, init) {
    this.cancelled = false;
    this.controller = self.AbortController && new AbortController();
    this.options = transportOptions;
    this.init = init;
  }

  pump(readerArg, res) {
    this.reader = readerArg;

    if (this.cancelled) {
      // If the request was cancelled before the first pump then cancel it here
      this.options.debug && debug('Fetch.pump.cancel at first pump');
      this.reader.cancel().catch((e) => {
        // This can be ignored. It will likely throw an exception due to the request being aborted
        this.options.debug && debug('Fetch.pump.reader.cancel exception', e);
      });

      return;
    }

    this.reader
      .read()
      .then((result) => {
        if (result.done) {
          this.options.onEnd();

          return res;
        }

        this.options.onChunk(result.value);
        this.pump(this.reader, res);
      })
      .catch((err) => {
        if (this.cancelled) {
          this.options.debug && debug('Fetch.catch - request cancelled');

          return;
        }

        this.cancelled = true;
        this.options.debug && debug('Fetch.catch', err.message);
        this.options.onEnd(err);
      });
  }

  send(msgBytes) {
    fetch(this.options.url, {
      ...this.init,
      headers: this.metadata.toHeaders(),
      method: 'POST',
      body: msgBytes,
      signal: this.controller && this.controller.signal
    })
      .then((res) => {
        this.options.debug && debug('Fetch.response', res);
        this.options.onHeaders(new Metadata(res.headers), res.status);

        if (res.body) {
          this.pump(res.body.getReader(), res);

          return;
        }

        return res;
      })
      .catch((err) => {
        if (this.cancelled) {
          this.options.debug && debug('Fetch.catch - request cancelled');

          return;
        }

        this.cancelled = true;
        this.options.debug && debug('Fetch.catch', err.message);
        this.options.onEnd(err);
      });
  }

  sendMessage(msgBytes) {
    this.send(msgBytes);
  }

  finishSend() {}

  start(metadata) {
    this.metadata = metadata;
  }

  cancel() {
    if (this.cancelled) {
      this.options.debug && debug('Fetch.cancel already cancelled');

      return;
    }

    this.cancelled = true;

    if (this.controller) {
      this.options.debug && debug('Fetch.cancel.controller.abort');
      this.controller.abort();
    } else {
      this.options.debug && debug('Fetch.cancel.missing abort controller');
    }

    if (this.reader) {
      // If the reader has already been received in the pump then it can be cancelled immediately
      this.options.debug && debug('Fetch.cancel.reader.cancel');
      this.reader.cancel().catch((e) => {
        // This can be ignored. It will likely throw an exception due to the request being aborted
        this.options.debug && debug('Fetch.cancel.reader.cancel exception', e);
      });
    } else {
      this.options.debug && debug('Fetch.cancel before reader');
    }
  }
}
