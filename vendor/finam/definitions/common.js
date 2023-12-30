import Long from '../../long.min.js';
import protobuf from '../../protobuf/minimal.js';
import { Timestamp } from '../../tinkoff/definitions/google/protobuf/timestamp.js';

export const protobufPackage = 'proto.tradeapi.v1';

/**
 * Market.
 * Рынок.
 */
export var Market;
(function (Market) {
  /**
   * MARKET_UNSPECIFIED - Value is not specified. Do not use.
   * Значение не указано. Не использовать.
   */
  Market[(Market['MARKET_UNSPECIFIED'] = 0)] = 'MARKET_UNSPECIFIED';
  /**
   * MARKET_STOCK - Moscow Exchange Stock market.
   * Фондовый рынок Московской Биржи.
   */
  Market[(Market['MARKET_STOCK'] = 1)] = 'MARKET_STOCK';
  /**
   * MARKET_FORTS - Moscow Exchange Derivative market.
   * Срочный рынок Московской Биржи.
   */
  Market[(Market['MARKET_FORTS'] = 4)] = 'MARKET_FORTS';
  /**
   * MARKET_SPBEX - Saint-Petersburg Exchange.
   * Санкт-Петербургская биржа.
   */
  Market[(Market['MARKET_SPBEX'] = 7)] = 'MARKET_SPBEX';
  /**
   * MARKET_MMA - US Stock market.
   * Фондовый рынок США.
   */
  Market[(Market['MARKET_MMA'] = 14)] = 'MARKET_MMA';
  /**
   * MARKET_ETS - Moscow Exchange Currency market.
   * Валютный рынок Московской Биржи.
   */
  Market[(Market['MARKET_ETS'] = 15)] = 'MARKET_ETS';
  /**
   * MARKET_BONDS - Moscow Exchange Bond market.
   * Долговой рынок Московской Биржи.
   */
  Market[(Market['MARKET_BONDS'] = 20)] = 'MARKET_BONDS';
  /**
   * MARKET_OPTIONS - Moscow Exchange option market.
   * Рынок опционов Московской Биржи.
   */
  Market[(Market['MARKET_OPTIONS'] = 21)] = 'MARKET_OPTIONS';
  Market[(Market['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(Market || (Market = {}));
export function marketFromJSON(object) {
  switch (object) {
    case 0:
    case 'MARKET_UNSPECIFIED':
      return Market.MARKET_UNSPECIFIED;
    case 1:
    case 'MARKET_STOCK':
      return Market.MARKET_STOCK;
    case 4:
    case 'MARKET_FORTS':
      return Market.MARKET_FORTS;
    case 7:
    case 'MARKET_SPBEX':
      return Market.MARKET_SPBEX;
    case 14:
    case 'MARKET_MMA':
      return Market.MARKET_MMA;
    case 15:
    case 'MARKET_ETS':
      return Market.MARKET_ETS;
    case 20:
    case 'MARKET_BONDS':
      return Market.MARKET_BONDS;
    case 21:
    case 'MARKET_OPTIONS':
      return Market.MARKET_OPTIONS;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return Market.UNRECOGNIZED;
  }
}
export function marketToJSON(object) {
  switch (object) {
    case Market.MARKET_UNSPECIFIED:
      return 'MARKET_UNSPECIFIED';
    case Market.MARKET_STOCK:
      return 'MARKET_STOCK';
    case Market.MARKET_FORTS:
      return 'MARKET_FORTS';
    case Market.MARKET_SPBEX:
      return 'MARKET_SPBEX';
    case Market.MARKET_MMA:
      return 'MARKET_MMA';
    case Market.MARKET_ETS:
      return 'MARKET_ETS';
    case Market.MARKET_BONDS:
      return 'MARKET_BONDS';
    case Market.MARKET_OPTIONS:
      return 'MARKET_OPTIONS';
    case Market.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/**
 * Transaction direction.
 * Направление сделки.
 */
export var BuySell;
(function (BuySell) {
  /**
   * BUY_SELL_UNSPECIFIED - Value is not specified. Do not use.
   * Значение не указано. Не использовать.
   */
  BuySell[(BuySell['BUY_SELL_UNSPECIFIED'] = 0)] = 'BUY_SELL_UNSPECIFIED';
  /**
   * BUY_SELL_SELL - Sell.
   * Продажа.
   */
  BuySell[(BuySell['BUY_SELL_SELL'] = 1)] = 'BUY_SELL_SELL';
  /**
   * BUY_SELL_BUY - Buy.
   * Покупка.
   */
  BuySell[(BuySell['BUY_SELL_BUY'] = 2)] = 'BUY_SELL_BUY';
  BuySell[(BuySell['UNRECOGNIZED'] = -1)] = 'UNRECOGNIZED';
})(BuySell || (BuySell = {}));

export function buySellFromJSON(object) {
  switch (object) {
    case 0:
    case 'BUY_SELL_UNSPECIFIED':
      return BuySell.BUY_SELL_UNSPECIFIED;
    case 1:
    case 'BUY_SELL_SELL':
      return BuySell.BUY_SELL_SELL;
    case 2:
    case 'BUY_SELL_BUY':
      return BuySell.BUY_SELL_BUY;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return BuySell.UNRECOGNIZED;
  }
}
export function buySellToJSON(object) {
  switch (object) {
    case BuySell.BUY_SELL_UNSPECIFIED:
      return 'BUY_SELL_UNSPECIFIED';
    case BuySell.BUY_SELL_SELL:
      return 'BUY_SELL_SELL';
    case BuySell.BUY_SELL_BUY:
      return 'BUY_SELL_BUY';
    case BuySell.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/**
 * Time validation for order.
 * Установка временных рамок действия заявки.
 */
export var OrderValidBeforeType;
(function (OrderValidBeforeType) {
  /**
   * ORDER_VALID_BEFORE_TYPE_UNSPECIFIED - Value is not specified. Do not use.
   * Значение не указано. Не использовать.
   */
  OrderValidBeforeType[
    (OrderValidBeforeType['ORDER_VALID_BEFORE_TYPE_UNSPECIFIED'] = 0)
  ] = 'ORDER_VALID_BEFORE_TYPE_UNSPECIFIED';
  /**
   * ORDER_VALID_BEFORE_TYPE_TILL_END_SESSION - Order is valid till the end of the current session.
   * Заявка действует до конца сессии.
   */
  OrderValidBeforeType[
    (OrderValidBeforeType['ORDER_VALID_BEFORE_TYPE_TILL_END_SESSION'] = 1)
  ] = 'ORDER_VALID_BEFORE_TYPE_TILL_END_SESSION';
  /**
   * ORDER_VALID_BEFORE_TYPE_TILL_CANCELLED - Order is valid till cancellation.
   * Заявка действует, пока не будет отменена.
   */
  OrderValidBeforeType[
    (OrderValidBeforeType['ORDER_VALID_BEFORE_TYPE_TILL_CANCELLED'] = 2)
  ] = 'ORDER_VALID_BEFORE_TYPE_TILL_CANCELLED';
  /**
   * ORDER_VALID_BEFORE_TYPE_EXACT_TIME - Order is valid till specified moment. OrderValidBefore.time parameter must be set.
   * Заявка действует до указанного времени. Параметр OrderValidBefore.time должно быть установлен.
   */
  OrderValidBeforeType[
    (OrderValidBeforeType['ORDER_VALID_BEFORE_TYPE_EXACT_TIME'] = 3)
  ] = 'ORDER_VALID_BEFORE_TYPE_EXACT_TIME';
  OrderValidBeforeType[(OrderValidBeforeType['UNRECOGNIZED'] = -1)] =
    'UNRECOGNIZED';
})(OrderValidBeforeType || (OrderValidBeforeType = {}));
export function orderValidBeforeTypeFromJSON(object) {
  switch (object) {
    case 0:
    case 'ORDER_VALID_BEFORE_TYPE_UNSPECIFIED':
      return OrderValidBeforeType.ORDER_VALID_BEFORE_TYPE_UNSPECIFIED;
    case 1:
    case 'ORDER_VALID_BEFORE_TYPE_TILL_END_SESSION':
      return OrderValidBeforeType.ORDER_VALID_BEFORE_TYPE_TILL_END_SESSION;
    case 2:
    case 'ORDER_VALID_BEFORE_TYPE_TILL_CANCELLED':
      return OrderValidBeforeType.ORDER_VALID_BEFORE_TYPE_TILL_CANCELLED;
    case 3:
    case 'ORDER_VALID_BEFORE_TYPE_EXACT_TIME':
      return OrderValidBeforeType.ORDER_VALID_BEFORE_TYPE_EXACT_TIME;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return OrderValidBeforeType.UNRECOGNIZED;
  }
}
export function orderValidBeforeTypeToJSON(object) {
  switch (object) {
    case OrderValidBeforeType.ORDER_VALID_BEFORE_TYPE_UNSPECIFIED:
      return 'ORDER_VALID_BEFORE_TYPE_UNSPECIFIED';
    case OrderValidBeforeType.ORDER_VALID_BEFORE_TYPE_TILL_END_SESSION:
      return 'ORDER_VALID_BEFORE_TYPE_TILL_END_SESSION';
    case OrderValidBeforeType.ORDER_VALID_BEFORE_TYPE_TILL_CANCELLED:
      return 'ORDER_VALID_BEFORE_TYPE_TILL_CANCELLED';
    case OrderValidBeforeType.ORDER_VALID_BEFORE_TYPE_EXACT_TIME:
      return 'ORDER_VALID_BEFORE_TYPE_EXACT_TIME';
    case OrderValidBeforeType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

function createBaseResponseEvent() {
  return { requestId: '', success: false, errors: [] };
}

export const ResponseEvent = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.requestId !== '') {
      writer.uint32(10).string(message.requestId);
    }

    if (message.success === true) {
      writer.uint32(16).bool(message.success);
    }

    for (const v of message.errors) {
      Error.encode(v, writer.uint32(26).fork()).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseEvent();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.requestId = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.success = reader.bool();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.errors.push(Error.decode(reader, reader.uint32()));
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
      requestId: isSet(object.requestId)
        ? globalThis.String(object.requestId)
        : '',
      success: isSet(object.success)
        ? globalThis.Boolean(object.success)
        : false,
      errors: globalThis.Array.isArray(object?.errors)
        ? object.errors.map((e) => Error.fromJSON(e))
        : []
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.requestId !== '') {
      obj.requestId = message.requestId;
    }

    if (message.success === true) {
      obj.success = message.success;
    }

    if (message.errors?.length) {
      obj.errors = message.errors.map((e) => Error.toJSON(e));
    }

    return obj;
  },
  create(base) {
    return ResponseEvent.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseResponseEvent();

    message.requestId = object.requestId ?? '';
    message.success = object.success ?? false;
    message.errors = object.errors?.map((e) => Error.fromPartial(e)) || [];

    return message;
  }
};

function createBaseError() {
  return { code: '', message: '' };
}

export const Error = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.code !== '') {
      writer.uint32(10).string(message.code);
    }

    if (message.message !== '') {
      writer.uint32(18).string(message.message);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseError();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.code = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.message = reader.string();
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
      code: isSet(object.code) ? globalThis.String(object.code) : '',
      message: isSet(object.message) ? globalThis.String(object.message) : ''
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.code !== '') {
      obj.code = message.code;
    }

    if (message.message !== '') {
      obj.message = message.message;
    }

    return obj;
  },
  create(base) {
    return Error.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseError();

    message.code = object.code ?? '';
    message.message = object.message ?? '';

    return message;
  }
};

function createBaseOrderValidBefore() {
  return { type: 0, time: undefined };
}

export const OrderValidBefore = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }

    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(18).fork()
      ).ldelim();
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderValidBefore();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.type = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.time = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
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
      type: isSet(object.type) ? orderValidBeforeTypeFromJSON(object.type) : 0,
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.type !== 0) {
      obj.type = orderValidBeforeTypeToJSON(message.type);
    }

    if (message.time !== undefined) {
      obj.time = message.time.toISOString();
    }

    return obj;
  },
  create(base) {
    return OrderValidBefore.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOrderValidBefore();

    message.type = object.type ?? 0;
    message.time = object.time ?? undefined;

    return message;
  }
};

function createBaseDecimal() {
  return { num: 0, scale: 0 };
}

export const Decimal = {
  encode(message, writer = protobuf.Writer.create()) {
    if (message.num !== 0) {
      writer.uint32(8).int64(message.num);
    }

    if (message.scale !== 0) {
      writer.uint32(16).uint32(message.scale);
    }

    return writer;
  },
  decode(input, length) {
    const reader =
      input instanceof protobuf.Reader ? input : protobuf.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDecimal();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.num = longToNumber(reader.int64());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.scale = reader.uint32();
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
      num: isSet(object.num) ? globalThis.Number(object.num) : 0,
      scale: isSet(object.scale) ? globalThis.Number(object.scale) : 0
    };
  },
  toJSON(message) {
    const obj = {};

    if (message.num !== 0) {
      obj.num = Math.round(message.num);
    }

    if (message.scale !== 0) {
      obj.scale = Math.round(message.scale);
    }

    return obj;
  },
  create(base) {
    return Decimal.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseDecimal();

    message.num = object.num ?? 0;
    message.scale = object.scale ?? 0;

    return message;
  }
};

function toTimestamp(date) {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;

  return { seconds, nanos };
}

function fromTimestamp(t) {
  let millis = (t.seconds || 0) * 1_000;

  millis += (t.nanos || 0) / 1_000_000;

  return new globalThis.Date(millis);
}

function fromJsonTimestamp(o) {
  if (o instanceof globalThis.Date) {
    return o;
  } else if (typeof o === 'string') {
    return new globalThis.Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
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
