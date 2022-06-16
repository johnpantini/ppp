import { CustomError } from './custom-error.js';

export class ValidationError extends CustomError {
  constructor({ message = 'Validation failed.', status = 422, element }) {
    super(message);

    this.name = 'ValidationError';
    this.element = element;
    this.status = status;
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

  const value = element?.value;

  if (element) {
    element.errorMessage = void 0;
    element.state = 'default';
  }

  if (typeof options.hook === 'function') {
    const predicateResult = await options.hook(value);

    if (!predicateResult) {
      if (element) {
        element.errorMessage = options.errorMessage;
        element.state = 'error';

        const folding = element?.closest('.folding');

        if (folding) {
          folding.classList.add('folding-open');
        }

        element?.scrollIntoView();
        element?.focus();
      }

      throw new ValidationError({
        element,
        message: options.errorMessage
      });
    }
  } else
    switch (options.hook) {
      case 'required':
        if (
          typeof value === 'undefined' ||
          value?.toString().replace(/\s*/g, '') === ''
        ) {
          if (element) {
            element.errorMessage = 'Это поле обязательно';
            element.state = 'error';

            const folding = element?.closest('.folding');

            if (folding) {
              folding.classList.add('folding-open');
            }

            element?.scrollIntoView();
            element?.focus();
          }

          throw new ValidationError({
            element,
            message: 'Форма заполнена некорректно или не полностью.'
          });
        }

        break;
    }
}

function invalidate(element, options = {}) {
  const errorMessage = options.errorMessage ?? 'Неизвестная ошибка';

  if (element.$pppController.definition.type.name === 'Toast') {
    element.appearance = 'warning';
    element.dismissible = true;

    if (!element.source.toastTitle) element.source.toastTitle = 'ppp';

    element.source.toastText = errorMessage;

    element.visible = true;
  } else if (element) {
    element.errorMessage = errorMessage;
    element.state = 'error';

    const folding = element?.closest('.folding');

    if (folding) {
      folding.classList.add('folding-open');
    }

    element?.scrollIntoView();
    element?.focus();
  }

  if (!options.silent)
    throw new ValidationError({
      message: errorMessage,
      element,
      status: options.status
    });
}

export { validate, invalidate };
