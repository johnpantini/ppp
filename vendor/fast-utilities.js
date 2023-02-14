/**
 * Retrieves the "composed parent" element of a node, ignoring DOM tree boundaries.
 * When the parent of a node is a shadow-root, it will return the host
 * element of the shadow root. Otherwise, it will return the parent node or null if
 * no parent node exists.
 * @param element - The element for which to retrieve the composed parent
 *
 * @public
 */
export function composedParent(element) {
  const parentNode = element.parentElement;

  if (parentNode) {
    return parentNode;
  } else {
    const rootNode = element.getRootNode();

    if (rootNode.host instanceof HTMLElement) {
      // this is shadow-root
      return rootNode.host;
    }
  }

  return null;
}

/**
 * Determines if the reference element contains the test element in a "composed" DOM tree that
 * ignores shadow DOM boundaries.
 *
 * Returns true of the test element is a descendent of the reference, or exist in
 * a shadow DOM that is a logical descendent of the reference. Otherwise returns false.
 * @param reference - The element to test for containment against.
 * @param test - The element being tested for containment.
 *
 * @public
 */
export function composedContains(reference, test) {
  let current = test;

  while (current !== null) {
    if (current === reference) {
      return true;
    }

    current = composedParent(current);
  }

  return false;
}

import {
  AttributeConfiguration,
  InlineTemplateDirective
} from './fast-element.min.js';

/**
 * Apply mixins to a constructor.
 * @public
 */
export function applyMixins(derivedCtor, ...baseCtors) {
  const derivedAttributes = AttributeConfiguration.locate(derivedCtor);

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

    const baseAttributes = AttributeConfiguration.locate(baseCtor);

    baseAttributes.forEach((x) => derivedAttributes.push(x));
  });

  return derivedCtor;
}

/**
 * A CSS fragment to set `display: none;` when the host is hidden using the [hidden] attribute.
 * @public
 */
export const hidden = `:host([hidden]){display:none}`;

/**
 * A CSS fragment to set `visibility:hidden;` to all undefined children.
 * @public
 */
export const notDefined = '*:not(:defined){visibility:hidden;}';

/**
 * Applies a CSS display property.
 * Also adds CSS rules to not display the element when the [hidden] attribute is applied to the element.
 * @param displayValue - The CSS display property value
 * @public
 */
export function display(displayValue) {
  return `${notDefined}${hidden}:host{display:${displayValue}}`;
}

/**
 * A function to compose template options.
 * @public
 */
export function staticallyCompose(item) {
  if (!item) {
    return InlineTemplateDirective.empty;
  }

  if (typeof item === 'string') {
    return new InlineTemplateDirective(item);
  }

  if ('inline' in item) {
    return item.inline();
  }

  return item;
}
