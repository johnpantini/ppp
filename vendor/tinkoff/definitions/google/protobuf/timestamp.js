import Long from '../../../../long.min.js';
import protobuf from '../../../../protobuf/minimal.js';

export const protobufPackage = 'google.protobuf';

function createBaseTimestamp() {
  return { seconds: 0, nanos: 0 };
}

export const Timestamp = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.seconds !== 0) {
      writer.uint32(8).int64(message.seconds);
    }

    if (message.nanos !== 0) {
      writer.uint32(16).int32(message.nanos);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : new protobuf.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimestamp();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.seconds = longToNumber(reader.int64());

          break;
        case 2:
          message.nanos = reader.int32();

          break;
        default:
          reader.skipType(tag & 7);

          break;
      }
    }

    return message;
  },
  fromJSON(object) {
    return {
      seconds: isSet(object.seconds) ? Number(object.seconds) : 0,
      nanos: isSet(object.nanos) ? Number(object.nanos) : 0
    };
  },
  toJSON(message) {
    const obj = {};

    message.seconds !== undefined &&
      (obj.seconds = Math.round(message.seconds));
    message.nanos !== undefined && (obj.nanos = Math.round(message.nanos));

    return obj;
  }
};

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
