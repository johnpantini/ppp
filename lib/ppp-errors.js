export class DocumentNotFoundError extends Error {
  constructor({ documentId } = {}) {
    super('Запись не найдена');

    this.name = this.constructor.name;
    this.documentId = documentId;
  }
}

export class ValidationError extends Error {
  constructor({ message = 'Validation failed.', status = 422, element }) {
    super(message);

    this.name = 'ValidationError';
    this.element = element;
    this.status = status;
  }
}

export class FetchError extends Error {
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
