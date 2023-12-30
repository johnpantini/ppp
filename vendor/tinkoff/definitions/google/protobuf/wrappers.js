import Long from '../../../../long.min.js';
import protobuf from '../../../../protobuf/minimal.js';

export const protobufPackage = 'google.protobuf';

function createBaseDoubleValue() {
  return { value: 0 };
}

export const DoubleValue = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.value !== 0) {
      writer.uint32(9).double(message.value);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDoubleValue();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 9) {
            break;
          }

          message.value = reader.double();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return { value: isSet(object.value) ? globalThis.Number(object.value) : 0 };
  },
  toJSON(message) {
    const obj = {};

    if (message.value !== 0) {
      obj.value = message.value;
    }

    return obj;
  },
  create(base) {
    return DoubleValue.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseDoubleValue();

    message.value = object.value ?? 0;

    return message;
  }
};

function createBaseFloatValue() {
  return { value: 0 };
}

export const FloatValue = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.value !== 0) {
      writer.uint32(13).float(message.value);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFloatValue();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.value = reader.float();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return { value: isSet(object.value) ? globalThis.Number(object.value) : 0 };
  },
  toJSON(message) {
    const obj = {};

    if (message.value !== 0) {
      obj.value = message.value;
    }

    return obj;
  },
  create(base) {
    return FloatValue.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFloatValue();

    message.value = object.value ?? 0;

    return message;
  }
};

function createBaseInt64Value() {
  return { value: 0 };
}

export const Int64Value = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.value !== 0) {
      writer.uint32(8).int64(message.value);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInt64Value();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.value = longToNumber(reader.int64());
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return { value: isSet(object.value) ? globalThis.Number(object.value) : 0 };
  },
  toJSON(message) {
    const obj = {};

    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }

    return obj;
  },
  create(base) {
    return Int64Value.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseInt64Value();

    message.value = object.value ?? 0;

    return message;
  }
};

function createBaseUInt64Value() {
  return { value: 0 };
}

export const UInt64Value = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.value !== 0) {
      writer.uint32(8).uint64(message.value);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUInt64Value();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.value = longToNumber(reader.uint64());
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return { value: isSet(object.value) ? globalThis.Number(object.value) : 0 };
  },
  toJSON(message) {
    const obj = {};

    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }

    return obj;
  },
  create(base) {
    return UInt64Value.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseUInt64Value();

    message.value = object.value ?? 0;

    return message;
  }
};

function createBaseInt32Value() {
  return { value: 0 };
}

export const Int32Value = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.value !== 0) {
      writer.uint32(8).int32(message.value);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInt32Value();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.value = reader.int32();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return { value: isSet(object.value) ? globalThis.Number(object.value) : 0 };
  },
  toJSON(message) {
    const obj = {};

    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }

    return obj;
  },
  create(base) {
    return Int32Value.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseInt32Value();

    message.value = object.value ?? 0;

    return message;
  }
};

function createBaseUInt32Value() {
  return { value: 0 };
}

export const UInt32Value = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.value !== 0) {
      writer.uint32(8).uint32(message.value);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUInt32Value();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.value = reader.uint32();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return { value: isSet(object.value) ? globalThis.Number(object.value) : 0 };
  },
  toJSON(message) {
    const obj = {};

    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }

    return obj;
  },
  create(base) {
    return UInt32Value.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseUInt32Value();

    message.value = object.value ?? 0;

    return message;
  }
};

function createBaseBoolValue() {
  return { value: false };
}

export const BoolValue = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.value === true) {
      writer.uint32(8).bool(message.value);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBoolValue();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.value = reader.bool();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      value: isSet(object.value) ? globalThis.Boolean(object.value) : false
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.value === true) {
      obj.value = message.value;
    }

    return obj;
  },
  create(base) {
    return BoolValue.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseBoolValue();

    message.value = object.value ?? false;

    return message;
  }
};

function createBaseStringValue() {
  return { value: '' };
}

export const StringValue = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.value !== '') {
      writer.uint32(10).string(message.value);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStringValue();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.value = reader.string();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      value: isSet(object.value) ? globalThis.String(object.value) : ''
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.value !== '') {
      obj.value = message.value;
    }

    return obj;
  },
  create(base) {
    return StringValue.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseStringValue();

    message.value = object.value ?? '';

    return message;
  }
};

function createBaseBytesValue() {
  return { value: new Uint8Array(0) };
}

export const BytesValue = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.value.length !== 0) {
      writer.uint32(10).bytes(message.value);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBytesValue();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.value = reader.bytes();
          continue;
      }

      if ((tag & 7) === 4 || tag === 0) {
        break;
      }

      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(object) {
    return {
      value: isSet(object.value)
        ? bytesFromBase64(object.value)
        : new Uint8Array(0)
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.value.length !== 0) {
      obj.value = base64FromBytes(message.value);
    }

    return obj;
  },
  create(base) {
    return BytesValue.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseBytesValue();

    message.value = object.value ?? new Uint8Array(0);

    return message;
  }
};

function bytesFromBase64(b64) {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, 'base64'));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);

    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }

    return arr;
  }
}

function base64FromBytes(arr) {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString('base64');
  } else {
    const bin = [];

    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });

    return globalThis.btoa(bin.join(''));
  }
}

function longToNumber(long) {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Value is larger than Number.MAX_SAFE_INTEGER');
  }

  return long.toNumber();
}

if (protobuf.util.Long !== Long) {
  protobuf.util.Long = Long;
  protobuf.configure();
}

function isSet(value) {
  return value !== null && value !== undefined;
}
