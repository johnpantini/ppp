import { noop } from './interfaces.js';

const propConfig = {
  configurable: false,
  enumerable: false,
  writable: false
};

if (globalThis.FAST === void 0) {
  Reflect.defineProperty(globalThis, 'FAST', {
    value: Object.create(null),
    ...propConfig
  });
}

/**
 * The FAST global.
 * @public
 */
export const FAST = globalThis.FAST;

if (FAST.getById === void 0) {
  const storage = Object.create(null);

  Reflect.defineProperty(FAST, 'getById', {
    value(id, initialize) {
      let found = storage[id];

      if (found === void 0) {
        found = initialize ? (storage[id] = initialize()) : null;
      }

      return found;
    },
    ...propConfig
  });
}

if (FAST.error === void 0) {
  Object.assign(FAST, {
    warn() {},
    error(code) {
      return new Error(`Error ${code}`);
    },
    addMessages() {}
  });
}

/**
 * A readonly, empty array.
 * @remarks
 * Typically returned by APIs that return arrays when there are
 * no actual items to return.
 * @public
 */
export const emptyArray = Object.freeze([]);
/**
 * Do not change. Part of shared kernel contract.
 * @internal
 */
export function createTypeRegistry() {
  const typeToDefinition = new Map();

  return Object.freeze({
    register(definition) {
      if (typeToDefinition.has(definition.type)) {
        return false;
      }

      typeToDefinition.set(definition.type, definition);

      return true;
    },
    getByType(key) {
      return typeToDefinition.get(key);
    },
    getForInstance(object) {
      if (object === null || object === void 0) {
        return void 0;
      }

      return typeToDefinition.get(object.constructor);
    }
  });
}
/**
 * Creates a function capable of locating metadata associated with a type.
 * @returns A metadata locator function.
 * @internal
 */
export function createMetadataLocator() {
  const metadataLookup = new WeakMap();

  return function (target) {
    let metadata = metadataLookup.get(target);

    if (metadata === void 0) {
      let currentTarget = Reflect.getPrototypeOf(target);

      while (metadata === void 0 && currentTarget !== null) {
        metadata = metadataLookup.get(currentTarget);
        currentTarget = Reflect.getPrototypeOf(currentTarget);
      }

      metadata = metadata === void 0 ? [] : metadata.slice(0);
      metadataLookup.set(target, metadata);
    }

    return metadata;
  };
}
/**
 * Makes a type noop for JSON serialization.
 * @param type - The type to make noop for JSON serialization.
 * @internal
 */
export function makeSerializationNoop(type) {
  type.prototype.toJSON = noop;
}
