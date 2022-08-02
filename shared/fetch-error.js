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
 * @param request - The request object.
 * @param pppMessage - Additional details message.
 */
export async function maybeFetchError(request, pppMessage) {
  if (!request.ok) {
    // noinspection ExceptionCaughtLocallyJS
    throw new FetchError({
      ...request,
      ...{ message: await request.text(), pppMessage }
    });
  } else
    return request;
}
