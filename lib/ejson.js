// INT32 boundaries
const BSON_INT32_MAX = 0x7fffffff;
const BSON_INT32_MIN = -0x80000000;
// INT64 boundaries
const BSON_INT64_MAX = 0x7fffffffffffffff;
const BSON_INT64_MIN = -0x8000000000000000;

export function getISOString(date) {
  const isoStr = date.toISOString();

  // we should only show milliseconds in timestamp if they're non-zero
  return date.getUTCMilliseconds() !== 0 ? isoStr : isoStr.slice(0, -5) + 'Z';
}

export function serializeArray(array, options) {
  return array.map((v) => serializeValue(v, options));
}

export function serializeDocument(doc, options) {
  if (doc == null || typeof doc !== 'object')
    throw new Error('not an object instance');

  const bsontype = doc._bsontype;

  if (typeof bsontype === 'undefined') {
    // It's a regular object. Recursively serialize its property values.
    const _doc = {};

    for (const name in doc) {
      _doc[name] = serializeValue(doc[name], options);
    }

    return _doc;
  } else {
    throw new Error('_bsontype must be a string, but was: ' + typeof bsontype);
  }
}

export function serializeValue(value, options) {
  if (Array.isArray(value)) return serializeArray(value, options);

  if (value === undefined) return null;

  if (value instanceof Date) {
    const dateNum = value.getTime(),
      // is it in year range 1970-9999?
      inRange = dateNum > -1 && dateNum < 253402318800000;

    return options.relaxed && inRange
      ? { $date: getISOString(value) }
      : { $date: { $numberLong: value.getTime().toString() } };
  }

  if (typeof value === 'number' && !options.relaxed) {
    // it's an integer
    if (Math.floor(value) === value) {
      const int32Range = value >= BSON_INT32_MIN && value <= BSON_INT32_MAX,
        int64Range = value >= BSON_INT64_MIN && value <= BSON_INT64_MAX;

      // interpret as being of the smallest BSON integer type that can represent the number exactly
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
  }
};

export function deserializeValue(value, options = {}) {
  // from here on out we're looking for bson types, so bail if its not an object
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

function parse(text, options = {}) {
  return JSON.parse(text, (_key, value) => deserializeValue(value, options));
}

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

export function serialize(value, options = {}) {
  return JSON.parse(stringify(value, options));
}

export function deserialize(ejson, options = {}) {
  return parse(JSON.stringify(ejson), options);
}
