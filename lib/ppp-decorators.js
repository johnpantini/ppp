export function $throttle(fn, wait) {
  let isThrottled = false,
    savedArgs,
    savedThis;

  function wrapper() {
    if (isThrottled) {
      savedArgs = arguments;
      savedThis = this;

      return;
    }

    fn.apply(this, arguments);

    isThrottled = true;

    setTimeout(function () {
      isThrottled = false;

      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, wait);
  }

  return wrapper;
}

export function $debounce(fn, wait) {
  let timeout;

  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, arguments), wait);
  };
}

export function throttle(wait = 0) {
  return (proto, name, descriptor) => {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('throttle can only decorate functions.');
    }

    const fn = descriptor.value;

    descriptor.value = $throttle(fn, wait);
    Object.defineProperty(proto, name, descriptor);
  };
}

export function debounce(wait = 0) {
  return (proto, name, descriptor) => {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('debounce can only decorate functions.');
    }

    const fn = descriptor.value;

    descriptor.value = $debounce(fn, wait);
    Object.defineProperty(proto, name, descriptor);
  };
}

export async function later(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}
