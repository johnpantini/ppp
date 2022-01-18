export function $throttle(
  callback,
  wait = 0,
  { start = true, middle = true, once = false } = {}
) {
  let last = 0;
  let timer;
  let cancelled = false;

  function fn(...args) {
    if (cancelled) return;

    const delta = Date.now() - last;

    last = Date.now();

    if (start) {
      start = false;
      callback.apply(this, args);

      if (once) fn.cancel();
    } else if ((middle && delta < wait) || !middle) {
      clearTimeout(timer);
      timer = setTimeout(
        () => {
          last = Date.now();
          callback.apply(this, args);

          if (once) fn.cancel();
        },
        !middle ? wait : wait - delta
      );
    }
  }

  fn.cancel = () => {
    clearTimeout(timer);
    cancelled = true;
  };

  return fn;
}

export function $debounce(
  callback,
  wait = 0,
  { start = false, middle = false, once = false } = {}
) {
  return $throttle(callback, wait, { start, middle, once });
}

export function throttle(wait = 0, opts = {}) {
  return (proto, name, descriptor) => {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('throttle can only decorate functions.');
    }

    const fn = descriptor.value;

    descriptor.value = $throttle(fn, wait, opts);
    Object.defineProperty(proto, name, descriptor);
  };
}

export function debounce(wait = 0, opts = {}) {
  return (proto, name, descriptor) => {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('debounce can only decorate functions.');
    }

    const fn = descriptor.value;

    descriptor.value = $debounce(fn, wait, opts);
    Object.defineProperty(proto, name, descriptor);
  };
}
