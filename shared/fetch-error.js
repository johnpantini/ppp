import { CustomError } from './custom-error.js';

export class FetchError extends CustomError {
  constructor({ message, status = 400, pppMessage } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;
    this.pppMessage = pppMessage;
  }
}

/**
 *
 * @param req - The request object or function.
 * @param pppMessage - Additional details message.
 */
export async function maybeFetchError(req, pppMessage) {
  let ok, request;

  if (typeof req === 'function') {
    const _ = await req();

    ok = _.ok;
    request = _.request;
  } else {
    ok = req.ok;
    request = req;
  }

  if (!ok) {
    // noinspection ExceptionCaughtLocallyJS
    throw new FetchError({
      ...request,
      ...{ message: await request.text(), pppMessage }
    });
  } else return request;
}
