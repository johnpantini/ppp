import { CustomError } from './custom-error.js';

export class FetchError extends CustomError {
  constructor({ message = 'Fetch failed.', status = 400 }) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;
  }
}
