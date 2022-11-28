/**
 * Apply mixins to a constructor.
 * @public
 */
export function applyMixins(derivedCtor, ...baseCtors) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      if (name !== 'constructor') {
        const deepValue = derivedCtor.prototype[name];
        const existingDescriptor = Object.getOwnPropertyDescriptor(
          derivedCtor.prototype,
          name
        );

        const newDescriptor = Object.getOwnPropertyDescriptor(
          baseCtor.prototype,
          name
        );

        // Fresh property/method
        if (!existingDescriptor && !deepValue) {
          Object.defineProperty(derivedCtor.prototype, name, newDescriptor);
        } else if (typeof existingDescriptor?.value === 'function') {
          // Own property
          const _ = newDescriptor.value;

          newDescriptor.value = function () {
            existingDescriptor.value.apply(this, arguments);

            return _.apply(this, arguments);
          };

          Object.defineProperty(derivedCtor.prototype, name, newDescriptor);
        } else if (typeof deepValue === 'function') {
          // Deep property somewhere in the prototype chain
          const _ = newDescriptor.value;

          derivedCtor.prototype[name] = function () {
            deepValue.apply(this, arguments);

            return _.apply(this, arguments);
          };
        }
      }
    });

    if (baseCtor.attributes) {
      const existing = derivedCtor.attributes || [];

      derivedCtor.attributes = existing.concat(baseCtor.attributes);
    }
  });

  return derivedCtor;
}
