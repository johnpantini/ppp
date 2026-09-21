/**
 * @typedef {object} EJSONOptions
 * @property {boolean} [relaxed=false] Keep ordinary numbers and in-range ISO dates.
 */

// INT32 boundaries
const BSON_INT32_MAX = 0x7fffffff;
const BSON_INT32_MIN = -0x80000000;
// INT64 boundaries
const BSON_INT64_MAX = 0x7fffffffffffffff;
const BSON_INT64_MIN = -0x8000000000000000;

/**
 * @param {Date} date Valid date.
 * @returns {string} ISO timestamp omitting zero milliseconds.
 */
export function getISOString(date) {
  const isoStr = date.toISOString();

  // We should only show milliseconds in timestamp if they're non-zero
  return date.getUTCMilliseconds() !== 0 ? isoStr : isoStr.slice(0, -5) + 'Z';
}

/**
 * @param {unknown[]} array Values to serialize recursively.
 * @param {EJSONOptions} options Numeric/date encoding mode.
 * @returns {unknown[]} New array of EJSON-compatible values.
 */
export function serializeArray(array, options) {
  return array.map((v) => serializeValue(v, options));
}

/**
 * Serializes a PPP document. String _id and *Id properties become $oid values,
 * except reserved identifiers beginning with @. Inherited enumerable keys remain.
 * @param {Record<string, any>} doc Source document; not mutated.
 * @param {EJSONOptions} options Numeric/date encoding mode.
 * @returns {Record<string, unknown>} EJSON-compatible document.
 * @throws {Error} When the input is not an object or carries unsupported _bsontype.
 */
export function serializeDocument(doc, options) {
  if (doc == null || typeof doc !== 'object')
    throw new Error('not an object instance');

  const bsontype = doc._bsontype;

  if (typeof bsontype === 'undefined') {
    const _doc = {};

    for (const name in doc) {
      if (
        (name === '_id' || name.endsWith('Id')) &&
        typeof doc[name] === 'string' &&
        !doc[name].startsWith('@')
      )
        _doc[name] = {
          $oid: doc[name]
        };
      else _doc[name] = serializeValue(doc[name], options);
    }

    return _doc;
  } else {
    throw new Error('_bsontype must be a string, but was: ' + typeof bsontype);
  }
}

/**
 * @param {unknown} value Value to encode; undefined becomes null.
 * @param {EJSONOptions} options Numeric/date encoding mode.
 * @returns {unknown} EJSON-compatible value.
 */
export function serializeValue(value, options) {
  if (Array.isArray(value)) return serializeArray(value, options);

  if (value === undefined) return null;

  if (value instanceof Date) {
    const dateNum = value.getTime(),
      // Is it in year range 1970-9999?
      inRange = dateNum > -1 && dateNum < 253402318800000;

    return options.relaxed && inRange
      ? { $date: getISOString(value) }
      : { $date: { $numberLong: value.getTime().toString() } };
  }

  if (typeof value === 'number' && !options.relaxed) {
    // It's an integer
    if (Math.floor(value) === value) {
      const int32Range = value >= BSON_INT32_MIN && value <= BSON_INT32_MAX,
        int64Range = value >= BSON_INT64_MIN && value <= BSON_INT64_MAX;

      // Interpret as being of the smallest BSON integer type that can represent the number exactly
      if (int32Range) return { $numberInt: value.toString() };

      if (int64Range) return { $numberLong: value.toString() };
    }

    return { $numberDouble: value.toString() };
  }

  if (value != null && typeof value === 'object')
    return serializeDocument(value, options);

  return value;
}

const keysToCodecs = {
  $oid: {
    fromExtendedJSON(doc, options) {
      return doc.$oid;
    }
  },
  $numberInt: {
    fromExtendedJSON(doc, options) {
      return parseInt(doc.$numberInt, 10);
    }
  },
  $numberDouble: {
    fromExtendedJSON(doc, options) {
      return parseFloat(doc.$numberDouble);
    }
  },
  $numberLong: {
    fromExtendedJSON(doc, options) {
      return +doc.$numberLong;
    }
  },
  $undefined: {
    fromExtendedJSON(doc, options) {
      return void 0;
    }
  }
};

/**
 * Decodes a single EJSON wrapper; recursive traversal is supplied by deserialize.
 * Large $numberLong values use JavaScript numbers and their precision limits.
 * @param {any} value Parsed JSON value.
 * @param {EJSONOptions} [options] Reserved codec options.
 * @returns {any} Decoded value, or the original value for unknown wrappers.
 */
export function deserializeValue(value, options = {}) {
  // From here on out we're looking for bson types, so bail if its not an object
  if (value == null || typeof value !== 'object') return value;

  const keys = Object.keys(value).filter(
    (k) => k.startsWith('$') && value[k] != null
  );

  for (let i = 0; i < keys.length; i++) {
    const c = keysToCodecs[keys[i]];

    if (c) return c.fromExtendedJSON(value, options);
  }

  if (value.$date != null) {
    const d = value.$date;
    const date = new Date();

    if (typeof d === 'string') date.setTime(Date.parse(d));
    else date.setTime(+d);

    return date;
  }

  return value;
}

/**
 * @param {string} text JSON-encoded EJSON document.
 * @param {EJSONOptions} [options] Codec options.
 * @returns {any} Recursively decoded value.
 */
function parse(text, options = {}) {
  return JSON.parse(text, (_key, value) => deserializeValue(value, options));
}

/**
 * @param {unknown} value Value to serialize.
 * @param {Function | (string | number)[] | EJSONOptions} [replacer] JSON replacer or options.
 * @param {string | number | EJSONOptions} [space] JSON indentation or options.
 * @param {EJSONOptions} [options] Codec options.
 * @returns {string} JSON-encoded EJSON.
 */
function stringify(value, replacer, space, options = {}) {
  if (space != null && typeof space === 'object') {
    options = space;
    space = 0;
  }

  if (
    replacer != null &&
    typeof replacer === 'object' &&
    !Array.isArray(replacer)
  ) {
    options = replacer;
    replacer = void 0;
    space = 0;
  }

  const doc = serializeValue(value, options);

  return JSON.stringify(doc, replacer, space);
}

/**
 * @param {unknown} value Source value; objects and arrays are not mutated.
 * @param {EJSONOptions} [options] Canonical encoding unless relaxed is true.
 * @returns {any} A JSON-compatible EJSON value (not a JSON string).
 */
export function serialize(value, options = {}) {
  return JSON.parse(stringify(value, options));
}

/**
 * @param {unknown} ejson JSON-compatible EJSON structure (not a JSON string).
 * @param {EJSONOptions} [options] Codec options.
 * @returns {any} New recursively decoded structure with native Date and number values.
 */
export function deserialize(ejson, options = {}) {
  return parse(JSON.stringify(ejson), options);
}
