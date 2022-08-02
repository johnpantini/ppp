import { CustomError } from './custom-error.js';

export class NotFoundError extends CustomError {
  constructor({ message, documentId, status = 404, pppMessage } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;
    this.pppMessage = pppMessage;
    this.documentId = documentId;
  }
}

export class ConflictError extends CustomError {
  constructor({ message, href, status = 409, pppMessage } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;
    this.href = href;
    this.pppMessage = pppMessage;
  }
}
