import { CustomError } from './custom-error.js';

export class TradingError extends CustomError {
  constructor({ message, details } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;
  }
}
