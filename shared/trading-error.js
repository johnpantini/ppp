import { CustomError } from './custom-error.js';

export class TradingError extends CustomError {
  constructor({ message } = {}) {
    super(message);

    this.name = this.constructor.name;
  }
}
