/**
 * @typedef {object} PPPErrorOptions
 * @property {string} [message] Technical error message.
 * @property {number} [status] HTTP status for request/validation errors.
 * @property {string} [pppMessage] Additional user-facing explanation.
 * @property {string} [href] Link to the conflicting resource.
 * @property {string} [documentId] Identifier of a missing document.
 * @property {object} [element] Form element associated with validation failure.
 * @property {any} [details] Structured broker or transport error details.
 * @property {object} [trader] Trader associated with an instrument-cache failure.
 * @property {number} [currentCacheVersion] Locally available dictionary version.
 * @property {number} [lastCacheVersion] Latest known dictionary version.
 */

/** Resource conflict with an optional link; defaults to HTTP 409. */
export class ConflictError extends Error {
  /** @param {PPPErrorOptions} [options] Conflict details. */
  constructor({ message = 'Conflict.', href, status = 409, pppMessage } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;
    this.href = href;
    this.pppMessage = pppMessage;
  }
}

/** Requested Aspirant allocation could not be located. */
export class AllocationNotFoundError extends Error {
  /** @param {PPPErrorOptions} [options] Failure message. */
  constructor({ message } = {}) {
    super(message);

    this.name = this.constructor.name;
  }
}

/** Requested persisted document could not be located. */
export class DocumentNotFoundError extends Error {
  /** @param {PPPErrorOptions} [options] Message and missing document identifier. */
  constructor({ message, documentId } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.documentId = documentId;
  }
}

/** Form validation failure carrying the offending element; defaults to HTTP 422. */
export class ValidationError extends Error {
  /** @param {PPPErrorOptions} [options] Validation message, status and element. */
  constructor({ message, status = 422, element } = {}) {
    super(message);

    this.name = 'ValidationError';
    this.element = element;
    this.status = status;
  }
}

/** Failed HTTP request with its status and user-facing context. */
export class FetchError extends Error {
  /** @param {PPPErrorOptions} [options] Response status and error messages. */
  constructor({ message = 'Fetch failed.', status = 400, pppMessage } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;
    this.pppMessage = pppMessage;
  }
}

/**
 * Returns a successful response without consuming its body, or throws an error
 * containing the failed response body and HTTP status.
 * @param {Response | (() => Promise<{ok: boolean, response: Response}>)} response
 * Response or factory supplying a separate success predicate.
 * @param {string} [pppMessage] User-facing explanation of the failed operation.
 * @returns {Promise<Response>} The original response when successful.
 * @throws {FetchError} When the response or factory reports failure.
 */
export async function maybeFetchError(response, pppMessage) {
  let ok;
  let res;

  if (typeof response === 'function') {
    const _ = await response();

    ok = _.ok;
    res = _.response;
  } else {
    ok = response.ok;
    res = response;
  }

  if (!ok) {
    // noinspection ExceptionCaughtLocallyJS
    throw new FetchError({
      ...res,
      status: res.status,
      message: await res.text(),
      pppMessage
    });
  } else return res;
}

/** Broker/execution failure that can be serialized across worker boundaries. */
export class TradingError extends Error {
  /** @param {PPPErrorOptions} [options] Message and structured broker details. */
  constructor({ message = 'Trading error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }

  /** @returns {{name: string, args: {message: string, details: any}}} Remote reconstruction data. */
  serialize() {
    return {
      name: this.name,
      args: {
        message: this.message,
        details: this.details
      }
    };
  }
}

/** Remote trader failure that can be serialized for another runtime. */
export class RemoteTraderError extends Error {
  /** @param {PPPErrorOptions} [options] Message and structured remote details. */
  constructor({ message = 'Trader error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }

  /** @returns {{name: string, args: {message: string, details: any}}} Remote reconstruction data. */
  serialize() {
    return {
      name: this.name,
      args: {
        message: this.message,
        details: this.details
      }
    };
  }
}

/** Authentication or authorization failure reported by an external service. */
export class AuthorizationError extends Error {
  /** @param {PPPErrorOptions} [options] Message and service details. */
  constructor({ message = 'Authorization error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }
}

/** Service refused another connection because its connection limit was reached. */
export class ConnectionLimitExceededError extends Error {
  /** @param {PPPErrorOptions} [options] Failure message. */
  constructor({ message = 'Connection limit exceeded.' } = {}) {
    super(message);

    this.name = this.constructor.name;
  }
}

/** Trader configuration/compatibility failure with structured context. */
export class TraderTrinityError extends Error {
  /** @param {PPPErrorOptions} [options] Message and configuration details. */
  constructor({ message = 'Trader trinity error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }
}

/** Transport connection failure with optional diagnostic details. */
export class ConnectionError extends Error {
  /** @param {PPPErrorOptions} [options] Message and transport details. */
  constructor({ message = 'Connection error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }
}

/** UTEX account or operation block reported by the broker. */
export class UTEXBlockError extends Error {
  /** @param {PPPErrorOptions} [options] Message and block details. */
  constructor({ message = 'UTEX block error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }
}

/** Trader has no instrument dictionary available locally. */
export class NoInstrumentsError extends Error {
  /** @param {PPPErrorOptions} [options] Trader and dictionary versions. */
  constructor({
    message = 'No instruments.',
    trader,
    currentCacheVersion,
    lastCacheVersion
  } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.trader = trader;
    this.currentCacheVersion = currentCacheVersion;
    this.lastCacheVersion = lastCacheVersion;
  }
}

/** Local instrument dictionary is older than the known server version. */
export class StaleInstrumentCacheError extends Error {
  /** @param {PPPErrorOptions} [options] Trader and dictionary versions. */
  constructor({
    message = 'Stale instrument cache.',
    trader,
    currentCacheVersion,
    lastCacheVersion
  } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.trader = trader;
    this.currentCacheVersion = currentCacheVersion;
    this.lastCacheVersion = lastCacheVersion;
  }
}
