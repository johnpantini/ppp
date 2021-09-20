import { CustomError } from './custom-error.js';

class ValidationError extends CustomError {
  constructor({ message = 'Validation failed.', element }) {
    super(message);

    this.name = 'ValidationError';
    this.element = element;
  }
}

async function validate(element, options) {
  if (typeof options === 'undefined')
    options = {
      hook: 'required'
    };
  else if (typeof options === 'string')
    options = {
      hook: options
    };

  switch (options.hook) {
    case 'required':
      const value = element?.value;

      element.errorMessage = void 0;
      element.state = 'default';

      if (value?.toString().replace(/\s*/g, '') === '') {
        element.errorMessage = 'Это поле обязательно';
        element.state = 'error';

        element?.focus();

        throw new ValidationError({ element });
      }

      break;
  }
}

export { validate };
