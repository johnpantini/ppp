import {
  AttributeConfiguration,
  InlineTemplateDirective
} from './fast-element.min.js';

let uniqueIdCounter = 0;

/**
 * Generates a unique ID based on incrementing a counter.
 */
export function uniqueId(prefix = '') {
  return `${prefix}${uniqueIdCounter++}`;
}

/**
 * Determines if a number value is within a specified range.
 *
 * @param value - the value to check
 * @param min - the range start
 * @param max - the range end
 */
export function inRange(value, min, max = 0) {
  [min, max] = [min, max].sort((a, b) => a - b);

  return min <= value && value < max;
}

/**
 * This method keeps a given value within the bounds of a min and max value. If the value
 * is larger than the max, the minimum value will be returned. If the value is smaller than the minimum,
 * the maximum will be returned. Otherwise, the value is returned un-changed.
 */
export function wrapInBounds(min, max, value) {
  if (value < min) {
    return max;
  } else if (value > max) {
    return min;
  }

  return value;
}

/**
 * A test that ensures that all arguments are HTML Elements
 */
export function isHTMLElement(...args) {
  return args.every((arg) => arg instanceof HTMLElement);
}

/**
 * Retrieves the "composed parent" element of a node, ignoring DOM tree boundaries.
 * When the parent of a node is a shadow-root, it will return the host
 * element of the shadow root. Otherwise, it will return the parent node or null if
 * no parent node exists.
 * @param element - The element for which to retrieve the composed parent
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

/**
 * Apply mixins to a constructor.
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
 */
export const notDefined = '*:not(:defined){visibility:hidden;}';

/**
 * Applies a CSS display property.
 * Also adds CSS rules to not display the element when the [hidden] attribute is applied to the element.
 * @param displayValue - The CSS display property value
 */
export function display(displayValue) {
  return `${notDefined}${hidden}:host{display:${displayValue}}`;
}

/**
 * A function to compose template options.
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

/**
 * Standard orientation values
 */
export const Orientation = {
  horizontal: 'horizontal',
  vertical: 'vertical'
};

export var Direction;
(function (Direction) {
  Direction['ltr'] = 'ltr';
  Direction['rtl'] = 'rtl';
})(Direction || (Direction = {}));

/**
 * Determines the current localization direction of an element.
 *
 * @param rootNode - the HTMLElement to begin the query from, usually "this" when used in a component controller
 * @returns the localization direction of the element
 */
export const getDirection = (rootNode) => {
  return rootNode.closest('[dir]')?.dir === 'rtl'
    ? Direction.rtl
    : Direction.ltr;
};

/**
 * String values for use with KeyboardEvent.key
 */
export const keyAlt = 'Alt';
export const keyAltGraph = 'AltGraph';
export const keyCapsLock = 'CapsLock';
export const keyControl = 'Control';
export const keyArrowDown = 'ArrowDown';
export const keyArrowLeft = 'ArrowLeft';
export const keyArrowRight = 'ArrowRight';
export const keyArrowUp = 'ArrowUp';
export const keyBackspace = 'Backspace';
export const keyDelete = 'Delete';
export const keyEnd = 'End';
export const keyEnter = 'Enter';
export const keyEscape = 'Escape';
export const keyHome = 'Home';
export const keyFunction = 'Fn';
export const keyFunctionLock = 'FnLock';
export const keyFunction2 = 'F2';
export const keyFunction3 = 'F3';
export const keyFunction4 = 'F4';
export const keyFunction5 = 'F5';
export const keyFunction6 = 'F6';
export const keyFunction7 = 'F7';
export const keyFunction8 = 'F8';
export const keyFunction9 = 'F9';
export const keyFunction10 = 'F10';
export const keyFunction11 = 'F11';
export const keyFunction12 = 'F12';
export const keyFunction13 = 'F13';
export const keyFunction14 = 'F14';
export const keyFunction15 = 'F15';
export const keyNumLock = 'NumLock';
export const keyPageDown = 'PageDown';
export const keyPageUp = 'PageUp';
export const keyScrollLock = 'ScrollLock';
export const keyShift = 'Shift';
export const keySpace = ' ';
export const keyTab = 'Tab';
export const ArrowKeys = {
  ArrowDown: keyArrowDown,
  ArrowLeft: keyArrowLeft,
  ArrowRight: keyArrowRight,
  ArrowUp: keyArrowUp
};

/**
 * Filters out any whitespace-only nodes, to be used inside a template.
 *
 * @param value - The Node that is being inspected
 * @returns true if the node is not a whitespace-only node, false otherwise
 */
export const whitespaceFilter = (value) =>
  value.nodeType !== Node.TEXT_NODE || !!value.nodeValue?.trim().length;

/**
 * Returns the index of the last element in the array where predicate is true, and -1 otherwise.
 *
 * @param array - the array to test
 * @param predicate - find calls predicate once for each element of the array, in descending order, until it finds one where predicate returns true. If such an element is found, findLastIndex immediately returns that element index. Otherwise, findIndex returns -1.
 */
export function findLastIndex(array, predicate) {
  let k = array.length;

  while (k--) {
    if (predicate(array[k], k, array)) {
      return k;
    }
  }

  return -1;
}
