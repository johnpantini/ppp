export class ConflictError extends Error {
  constructor({ message = 'Conflict.', href, status = 409, pppMessage } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;
    this.href = href;
    this.pppMessage = pppMessage;
  }
}

export class DocumentNotFoundError extends Error {
  constructor({ message, documentId } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.documentId = documentId;
  }
}

export class ValidationError extends Error {
  constructor({ message, status = 422, element } = {}) {
    super(message);

    this.name = 'ValidationError';
    this.element = element;
    this.status = status;
  }
}

export class FetchError extends Error {
  constructor({ message = 'Fetch failed.', status = 400, pppMessage } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;
    this.pppMessage = pppMessage;
  }
}

export class TradingError extends Error {
  constructor({ message = 'Trading error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }

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

export class AuthorizationError extends Error {
  constructor({ message = 'Authorization error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }
}

export class ConnectionLimitExceededError extends Error {
  constructor({ message = 'Connection limit exceeded.' } = {}) {
    super(message);

    this.name = this.constructor.name;
  }
}

export class SerializationError extends Error {
  constructor({ message = 'Serialization error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }
}

export class ConnectionError extends Error {
  constructor({ message = 'Connection error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }
}

export class UTEXBlockError extends Error {
  constructor({ message = 'UTEX block error.', details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }
}

export class NoInstrumentsError extends Error {
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

export class StaleInstrumentCacheError extends Error {
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
