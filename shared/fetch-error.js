import { CustomError } from './custom-error.js';

export class FetchError extends CustomError {
  constructor({ message = 'Fetch failed.', status = 400 }) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;
  }
}

export async function maybeFetchError(r) {
  if (!r.ok) {
    // noinspection ExceptionCaughtLocallyJS
    throw new FetchError({
      ...r,
      ...{ message: await r.text() }
    });
  }
}
