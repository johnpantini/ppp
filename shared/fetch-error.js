import { CustomError } from './custom-error.js';

export class FetchError extends CustomError {
  constructor({ message = 'Fetch failed.', status = 400, richMessage }) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;
    this.richMessage = richMessage;
  }
}

export async function maybeFetchError(r, richMessage) {
  if (!r.ok) {
    // noinspection ExceptionCaughtLocallyJS
    throw new FetchError({
      ...r,
      ...{ message: await r.text(), richMessage }
    });
  }
}
