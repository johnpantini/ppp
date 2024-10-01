import ppp from '../ppp.js';
import { Updates } from '../vendor/fast-element.min.js';
import { ValidationError } from './ppp-exceptions.js';
import { parseDistance } from './intl.js';

await ppp.i18n(import.meta.url);

export function openTabOrFolding(element, options = {}) {
  const folding = element?.closest('.folding');

  if (folding) {
    folding.classList.add('folding-open');
  }

  let tabPanel = element?.closest('[role="tabpanel"]');

  if (!tabPanel && element) {
    tabPanel = element.getRootNode().host?.closest('[role="tabpanel"]');
  }

  if (tabPanel) {
    const tabs = tabPanel.parentNode;

    tabs.activeid = tabPanel.getAttribute('aria-labelledby');
  }

  Updates.enqueue(() => {
    !options.doNotScrollIntoView &&
      element?.scrollIntoView({ behavior: 'smooth' });
    element?.focus();
  });
}

export async function validate(element, options) {
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
    element.appearance = 'default';
  }

  if (typeof options.hook === 'function') {
    const predicateResult = await options.hook(value);

    if (!predicateResult) {
      if (element) {
        element.errorMessage = options.errorMessage;
        element.appearance = 'error';

        openTabOrFolding(element, options);
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
            element.errorMessage = ppp.t('$pppErrors.E_REQUIRED_FIELD');
            element.appearance = 'error';

            openTabOrFolding(element);
          }

          throw new ValidationError({
            element,
            message: ppp.t('$pppErrors.E_BAD_FORM')
          });
        }

        break;
      case 'url':
        try {
          const u = new URL(value);

          if (!u.hostname || u.origin === 'null') {
            throw new ValidationError({
              element,
              message: ppp.t('$pppErrors.E_BAD_URL')
            });
          }
        } catch (e) {
          if (element) {
            element.errorMessage = ppp.t('$pppErrors.E_BAD_URL');
            element.appearance = 'error';

            openTabOrFolding(element);
          }

          throw new ValidationError({
            element,
            message: ppp.t('$pppErrors.E_BAD_FORM')
          });
        }

        break;

      case 'date':
        try {
          const d = Date.parse(value);

          if (isNaN(d)) {
            throw new ValidationError({
              element,
              message: ppp.t('$pppErrors.E_BAD_DATE')
            });
          }
        } catch (e) {
          if (element) {
            element.errorMessage = ppp.t('$pppErrors.E_BAD_DATE');
            element.appearance = 'error';

            openTabOrFolding(element);
          }

          throw new ValidationError({
            element,
            message: ppp.t('$pppErrors.E_BAD_FORM')
          });
        }
    }
}

export async function validateDistanceElement(element) {
  if (element.value) {
    await validate(element, {
      hook: async (value) => typeof parseDistance(value).value !== 'undefined',
      errorMessage: 'Это значение недопустимо'
    });

    await validate(element, {
      hook: async (value) => parseDistance(value).value > 0,
      errorMessage: 'Значение должно быть положительным'
    });
  }
}

/**
 *
 * @param element
 * @param {Object} options
 * @param {boolean} options.raiseException
 * @param {boolean} options.skipScrollIntoView
 */
export function invalidate(element, options = {}) {
  const errorMessage = options.errorMessage ?? 'Неизвестная ошибка';

  if (element?.$fastController.definition.type.name === 'Toast') {
    element.appearance = 'warning';
    element.dismissible = true;

    if (!element.title) element.title = 'PPP';

    if (typeof errorMessage !== 'string') {
      element.text = errorMessage;
    } else {
      element.text = errorMessage.endsWith('.')
        ? errorMessage
        : `${errorMessage}.`;
    }

    element.removeAttribute('hidden');
  } else if (element) {
    element.errorMessage = errorMessage;
    element.appearance = 'error';

    const folding = element?.closest('.folding');

    if (folding) {
      folding.classList.add('folding-open');
    }

    if (!options.skipScrollIntoView) {
      element?.scrollIntoView({ behavior: 'smooth' });
    }

    element?.focus();
  }

  if (options.raiseException) {
    throw new ValidationError({
      message: errorMessage
    });
  }
}

export * from './ppp-exceptions.js';
