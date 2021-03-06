export function classNames(...args) {
  return args.reduce((accum, value) => {
    const leadingChar = accum.length ? ' ' : '';
    const normalizedValue =
      Array.isArray(value) && value[1]
        ? classNames.call(null, value[0])
        : typeof value === 'function'
        ? value()
        : typeof value === 'string'
        ? value
        : '';

    return !normalizedValue.length
      ? accum
      : accum + leadingChar + normalizedValue;
  }, '');
}
